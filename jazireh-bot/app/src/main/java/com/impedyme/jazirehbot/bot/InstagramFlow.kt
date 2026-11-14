package com.impedyme.jazirehbot.bot

import android.view.accessibility.AccessibilityNodeInfo
import com.impedyme.jazirehbot.ChallengeType
import com.impedyme.jazirehbot.FaText
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import com.impedyme.jazirehbot.Selectors
import kotlinx.coroutines.delay

/** Everything that happens inside Instagram. */
class InstagramFlow(private val ui: UiDriver, private val prefs: Prefs) {

    private val pkg: String get() = prefs.instagramPackage
    private fun s(k: String) = Selectors.get(k)

    suspend fun open() {
        if (ui.currentPackage() != pkg) {
            if (!ui.launch(pkg)) throw RunAborted("Cannot launch Instagram ($pkg)")
            if (ui.waitForPackage(listOf(pkg), 12_000) == null) throw RunAborted("Instagram did not come to the front")
            delay(1500)
        }
        dismissPopups()
        checkNotBlocked()
    }

    // ---------- account switching ----------

    suspend fun ensureAccount(account: String) {
        open()
        for (attempt in 1..2) {
            val tab = goToMainScreen()
            ui.click(tab, "profileTab")
            delay(1800)
            dismissPopups()
            val current = currentProfileUsername()
            RunLog.i("Instagram active account: ${current ?: "unknown"}")
            if (current != null && FaText.equalsLoose(current, account)) return
            if (attempt == 2) throw StepFailed("Could not switch Instagram to @$account (active: ${current ?: "unknown"})")
            switchTo(account, tab)
        }
    }

    private suspend fun switchTo(account: String, profileTab: AccessibilityNodeInfo) {
        val title = profileTitleNode()
        var option: AccessibilityNodeInfo? = null
        if (title != null) {
            ui.click(title, "accountSwitcher")
            delay(1300)
            option = ui.waitFor(4_000) { switcherRow(account) }
        }
        if (option == null) {
            RunLog.i("Trying a long-press on the profile tab to open the account switcher")
            if (title != null) { ui.back(); delay(700) }
            val r = profileTab.bounds()
            ui.longPress(r.exactCenterX(), r.exactCenterY())
            delay(1300)
            option = ui.waitFor(4_000) { switcherRow(account) }
        }
        if (option == null) {
            ui.back()
            delay(600)
            throw StepFailed("@$account is not in Instagram's account switcher – log into it inside Instagram first")
        }
        ui.click(option, "switchTo:$account")
        delay(3000)
        dismissPopups()
    }

    private fun profileTab(): AccessibilityNodeInfo? {
        ui.byIdOrText(s("ig.profileTabIds"), s("ig.profileTabDesc"), exact = true)?.let { return it }
        val h = ui.screenSize().y
        return ui.find { n ->
            n.isVisibleToUser && n.clickableAncestorOrSelf() != null && n.bounds().top > h * 0.8 &&
                ui.matchText(n, s("ig.profileTabDesc"), exact = false)
        }
    }

    /** Gets Instagram to a screen where the bottom tab bar is visible and returns the profile tab. */
    private suspend fun goToMainScreen(): AccessibilityNodeInfo {
        for (i in 0 until 4) {
            val tab = ui.waitFor(if (i == 0) 7_000 else 2_500) { profileTab() }
            if (tab != null) return tab
            dismissPopups()
            if (profileTab() != null) continue
            RunLog.d("No Instagram tab bar visible – pressing back")
            ui.back()
            delay(900)
            if (ui.currentPackage() != pkg) {
                ui.launch(pkg)
                ui.waitForPackage(listOf(pkg), 8_000)
                delay(1200)
            }
        }
        throw StepFailed("Instagram profile tab not found – is Instagram logged in and showing its main screen?")
    }

    private fun switcherRow(account: String): AccessibilityNodeInfo? =
        ui.find { it.isVisibleToUser && FaText.equalsLoose(it.textStr, account) && it.clickableAncestorOrSelf() != null }

    private fun profileTitleNode(): AccessibilityNodeInfo? {
        val byId = ui.byId(s("ig.titleIds"))
        if (byId != null && FaText.looksLikeUsername(byId.textStr)) return byId
        val h = ui.screenSize().y
        return ui.findAll { n ->
            n.isVisibleToUser && FaText.looksLikeUsername(n.textStr) && n.textStr.any { it.isLetter() } &&
                n.bounds().top < h / 5 && n.bounds().height() > 0
        }.minByOrNull { it.bounds().top }
    }

    private fun currentProfileUsername(): String? = profileTitleNode()?.textStr?.trim()?.trimStart('@')

    // ---------- generic ----------

    suspend fun dismissPopups() {
        repeat(2) {
            val n = ui.find {
                it.isVisibleToUser && it.clickableAncestorOrSelf() != null && ui.matchText(it, s("ig.dismissTexts"), exact = true)
            } ?: return
            RunLog.i("Dismissing Instagram popup: '${n.anyText}'")
            ui.click(n, "dismiss")
            delay(900)
        }
    }

    fun checkNotBlocked() {
        val n = ui.byText(s("ig.blockedTexts")) ?: return
        throw RunAborted("Instagram is limiting this account ('${n.anyText.take(80)}'). Stopping – wait a few hours before trying again.")
    }

    suspend fun perform(type: ChallengeType, guide: String) {
        waitForContent()
        when (type) {
            ChallengeType.LIKE -> like()
            ChallengeType.FOLLOW -> follow()
            ChallengeType.COMMENT -> comment(pickComment(guide))
            ChallengeType.REPOST -> repost(guide)
            ChallengeType.SAVE -> save()
            ChallengeType.VISIT -> delay(3000)
            ChallengeType.UNKNOWN -> throw StepFailed("Unknown challenge type")
        }
        checkNotBlocked()
    }

    private suspend fun waitForContent() {
        val ids = s("ig.likeIds") + s("ig.followIds") + s("ig.commentIds")
        val texts = s("ig.likeDesc") + s("ig.unlikeDesc") + s("ig.followText") + s("ig.followingText")
        if (ui.waitFor(12_000) { ui.byId(ids) ?: ui.byText(texts, exact = true) } == null) {
            RunLog.w("No like/follow controls visible after 12s – continuing anyway")
        }
        delay(1000)
        dismissPopups()
        checkNotBlocked()
    }

    // ---------- actions ----------

    private fun likeButton(): AccessibilityNodeInfo? {
        ui.byId(s("ig.likeIds"))?.let { return it }
        val all = s("ig.likeDesc") + s("ig.unlikeDesc")
        return ui.findAll { it.isVisibleToUser && ui.matchText(it, all, exact = true) && it.clickableAncestorOrSelf() != null }
            .maxByOrNull { it.bounds().width() * it.bounds().height() }
    }

    private fun isLiked(n: AccessibilityNodeInfo): Boolean =
        ui.matchText(n, s("ig.unlikeDesc"), exact = true) || n.isSelected

    suspend fun like() {
        val btn = likeButton() ?: throw StepFailed("Like button not found on this screen")
        if (isLiked(btn)) {
            RunLog.i("Post is already liked")
            return
        }
        ui.click(btn, "like")
        delay(1800)
        val after = likeButton()
        if (after != null && isLiked(after)) {
            RunLog.i("Liked ✔")
            return
        }
        RunLog.w("Like not confirmed by the button state – double-tapping the media")
        val media = ui.byId(s("ig.mediaIds"))
        if (media != null) {
            val r = media.bounds()
            ui.tap(r.exactCenterX(), r.exactCenterY())
            delay(90)
            ui.tap(r.exactCenterX(), r.exactCenterY())
            delay(1800)
        }
        val again = likeButton()
        if (again != null && !isLiked(again)) RunLog.w("Like still not confirmed – check the screenshot")
    }

    suspend fun follow() {
        val already = ui.byText(s("ig.followingText"), exact = true)
        if (already != null) {
            RunLog.i("Already following")
            return
        }
        val btn = ui.byId(s("ig.followIds")) ?: ui.byText(s("ig.followText"), exact = true, clickableOnly = true)
            ?: throw StepFailed("Follow button not found on this screen")
        if (ui.matchText(btn, s("ig.followingText"), exact = true)) {
            RunLog.i("Already following")
            return
        }
        ui.click(btn, "follow")
        delay(2200)
        dismissPopups()
        if (ui.byText(s("ig.followingText"), exact = true) != null) RunLog.i("Followed ✔")
        else RunLog.w("Follow not confirmed (button text did not change) – check the screenshot")
    }

    suspend fun comment(text: String) {
        var input = commentInput()
        if (input == null) {
            val btn = ui.byId(s("ig.commentIds")) ?: ui.byText(s("ig.commentDesc"), exact = true, clickableOnly = true)
                ?: throw StepFailed("Comment button not found")
            ui.click(btn, "comment")
            delay(1800)
            input = ui.waitFor(6_000) { commentInput() ?: ui.find { it.isVisibleToUser && it.isEditable } }
                ?: throw StepFailed("Comment input not found")
        }
        ui.click(input, "commentInput")
        delay(600)
        if (!ui.setText(input, text)) throw StepFailed("Could not type the comment")
        delay(900)
        val post = ui.waitFor(5_000) {
            ui.byId(s("ig.postCommentIds")) ?: ui.byText(s("ig.postCommentText"), exact = true, clickableOnly = true)
        } ?: throw StepFailed("'Post' button for the comment not found")
        ui.click(post, "postComment")
        delay(3000)
        val shown = ui.find { it.isVisibleToUser && !it.isEditable && FaText.containsLoose(it.textStr, text.take(20)) }
        if (shown != null) RunLog.i("Comment posted ✔ ('${text.take(40)}')")
        else RunLog.w("Comment not visible after posting – check the screenshot")
    }

    private fun commentInput(): AccessibilityNodeInfo? {
        val n = ui.byId(s("ig.commentInputIds")) ?: ui.byText(s("ig.commentInputHint"))
        return if (n != null && n.isEditable) n else null
    }

    private fun pickComment(guide: String): String {
        val quoted = Regex("[«\"“「](.{2,200}?)[»\"”」]").find(guide)?.groupValues?.getOrNull(1)?.trim()
        if (!quoted.isNullOrBlank() && !FaText.containsLoose(quoted, "انجام شد")) return quoted
        val list = prefs.comments
        if (list.isEmpty()) throw StepFailed("No comment texts configured")
        return list.random()
    }

    /**
     * «ری پست»: Instagram's native Repost button when it exists, otherwise "Add to story".
     * Selector ig.repostMode = auto | native | story; a guide text mentioning «استوری» forces story.
     */
    suspend fun repost(guide: String) {
        val mode = Selectors.str("ig.repostMode").lowercase()
        val wantsStory = mode == "story" || (mode != "native" && FaText.containsLoose(guide, "استوری"))
        if (!wantsStory && nativeRepost()) return
        storyShare()
    }

    private suspend fun nativeRepost(): Boolean {
        val native = ui.byId(s("ig.repostIds")) ?: ui.byText(s("ig.repostDesc"), exact = true, clickableOnly = true)
            ?: return false
        ui.click(native, "repost")
        delay(1800)
        val confirm = ui.waitFor(4_000) { ui.byText(s("ig.repostConfirmTexts"), exact = true, clickableOnly = true) }
        if (confirm != null) {
            ui.click(confirm, "repostConfirm")
            delay(2500)
        }
        RunLog.i("Reposted ✔ (native repost)")
        return true
    }

    private suspend fun storyShare() {
        val share = ui.byId(s("ig.shareIds")) ?: ui.byText(s("ig.shareDesc"), exact = true, clickableOnly = true)
            ?: throw StepFailed("Neither a Repost nor a Share button was found")
        ui.click(share, "share")
        delay(2000)
        val addStory = ui.waitFor(6_000) { ui.byText(s("ig.addToStoryText"), clickableOnly = true) }
            ?: throw StepFailed("'Add to story' option not found in the share sheet")
        ui.click(addStory, "addToStory")
        delay(4000)
        val send = ui.waitFor(10_000) {
            ui.byId(s("ig.storyShareIds")) ?: ui.byText(s("ig.storyShareText"), exact = true, clickableOnly = true)
        } ?: throw StepFailed("Story share button not found in the story editor")
        ui.click(send, "storyShare")
        delay(2500)
        val confirm = ui.byText(s("ig.storyShareConfirm"), exact = true, clickableOnly = true)
        if (confirm != null) {
            ui.click(confirm, "storyShareConfirm")
            delay(3000)
        }
        RunLog.i("Shared to story ✔")
    }

    suspend fun save() {
        val b = ui.byId(s("ig.saveIds")) ?: ui.byText(s("ig.saveDesc"), exact = true, clickableOnly = true)
            ?: throw StepFailed("Save button not found")
        if (ui.matchText(b, s("ig.savedDesc"), exact = true)) {
            RunLog.i("Already saved")
            return
        }
        ui.click(b, "save")
        delay(1800)
        RunLog.i("Saved ✔")
    }
}
