package com.impedyme.jazirehbot.bot

import android.os.SystemClock
import android.view.accessibility.AccessibilityNodeInfo
import com.impedyme.jazirehbot.ChallengeType
import com.impedyme.jazirehbot.FaText
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import com.impedyme.jazirehbot.Selectors
import kotlinx.coroutines.delay
import java.time.LocalDate

/** Everything that happens inside the Jazireh app. */
class JazirehFlow(private val ui: UiDriver, private val prefs: Prefs) {

    class Card(
        val title: String,
        val done: Int,
        val total: Int,
        val remaining: Int,
        val reward: String,
        val enabled: Boolean,
        val type: ChallengeType,
        val button: AccessibilityNodeInfo,
    ) {
        val key: String get() = "${LocalDate.now()}|${FaText.loose(title)}|${FaText.loose(reward)}|$total"
        fun sameAs(o: Card): Boolean = FaText.equalsLoose(title, o.title) && FaText.loose(reward) == FaText.loose(o.reward)
        override fun toString(): String =
            "'$title' $done/$total left=$remaining ${reward.ifEmpty { "-" }} type=$type" + (if (enabled) "" else " (disabled)")
    }

    private fun s(k: String) = Selectors.get(k)
    private val progressRe: Regex get() = Regex(Selectors.str("jazireh.progressPattern"))
    private val remainingRe: Regex get() = Regex(Selectors.str("jazireh.remainingPattern"))
    private val pkg: String get() = prefs.jazirehPackage ?: ""

    // ---------- navigation ----------

    suspend fun openChallengesList() {
        if (ui.currentPackage() != pkg) {
            if (!ui.launch(pkg)) throw RunAborted("Cannot launch Jazireh ($pkg)")
            if (ui.waitForPackage(listOf(pkg), 12_000) == null) throw RunAborted("Jazireh did not come to the front")
            delay(1200)
        }
        closeDialogIfOpen()
        if (!onChallengesScreen()) dismissPopups()
        if (!onChallengesScreen()) {
            val tab = ui.waitFor(6_000) { ui.byText(s("jazireh.challengesTab"), exact = true) }
            if (tab != null) {
                ui.click(tab, "challengesTab")
                delay(1000)
            } else {
                RunLog.w("Bottom tab «چالش‌ها» not found; assuming we are already there")
            }
        }
        val igTab = ui.waitFor(6_000) { ui.byText(s("jazireh.instagramTab"), exact = true) }
        if (igTab != null) {
            ui.click(igTab, "instagramTab")
            delay(1000)
        } else {
            RunLog.w("Tab «اینستاگرام» not found")
        }
        val ok = ui.waitFor(6_000) {
            ui.byText(s("jazireh.startChallenge"), exact = true) ?: ui.byText(s("jazireh.currentChallengesHeader"))
        }
        if (ok == null) RunLog.w("Challenge list did not appear (no cards and no header visible)")
    }

    fun onChallengesScreen(): Boolean =
        ui.byText(s("jazireh.currentChallengesHeader")) != null ||
            ui.byText(s("jazireh.startChallenge"), exact = true) != null

    fun dialogOpen(): Boolean =
        ui.byText(s("jazireh.sourcePageLabel")) != null &&
            (ui.byText(s("jazireh.done"), exact = true) != null || ui.byText(s("jazireh.doChallenge"), exact = true) != null)

    suspend fun closeDialogIfOpen() {
        if (!dialogOpen()) return
        RunLog.d("Closing the open challenge dialog")
        val x = ui.byText(s("jazireh.closeDialog"), exact = true, clickableOnly = true)
        if (x != null) ui.click(x, "closeDialog") else ui.back()
        delay(800)
    }

    /** Closes announcement / success popups that Jazireh shows on top of its screens. */
    suspend fun dismissPopups() {
        repeat(2) {
            if (dialogOpen()) return
            val n = ui.find {
                it.isVisibleToUser && it.packageName?.toString() == pkg && it.clickableAncestorOrSelf() != null &&
                    ui.matchText(it, s("jazireh.popupDismissTexts"), exact = true)
            } ?: return
            RunLog.i("Dismissing Jazireh popup: '${n.anyText}'")
            ui.click(n, "jazirehPopup")
            delay(900)
        }
    }

    /** Re-focus Jazireh and make sure the challenge dialog for [card]/[account] is open. */
    suspend fun bringToFrontWithDialog(card: Card, account: String) {
        if (ui.currentPackage() != pkg) {
            ui.launch(pkg)
            if (ui.waitForPackage(listOf(pkg), 10_000) == null) throw StepFailed("Jazireh did not return to the front")
            delay(900)
        }
        if (dialogOpen()) return
        RunLog.w("Challenge dialog is gone – re-opening '${card.title}'")
        openChallengesList()
        val fresh = readCards().firstOrNull { it.sameAs(card) }
            ?: throw StepFailed("Card '${card.title}' is no longer in the list")
        openCard(fresh)
        selectSourcePage(account)
    }

    // ---------- reading the list ----------

    fun readCards(): List<Card> {
        val startTexts = s("jazireh.startChallenge")
        val ignore = s("jazireh.ignoreTexts") + s("jazireh.instagramTab") + s("jazireh.challengesTab") +
            s("jazireh.currentChallengesHeader") + s("jazireh.guideHeader") + startTexts
        val buttons = ui.findAll { it.isVisibleToUser && ui.matchText(it, startTexts, exact = true) }
        val out = ArrayList<Card>()
        for (b in buttons) {
            val container = cardContainer(b, startTexts) ?: continue
            val text = container.subtreeText()
            val norm = FaText.norm(text)
            val prog = progressRe.find(norm)
            val done = prog?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0
            val total = prog?.groupValues?.getOrNull(2)?.toIntOrNull() ?: 0
            val remaining = remainingRe.find(norm)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: -1
            val lines = text.split('\n', '•', '|').map { it.trim() }.filter { it.isNotEmpty() }
            val rewardWord = Selectors.str("jazireh.rewardPattern")
            val reward = lines.firstOrNull { FaText.containsLoose(it, rewardWord) } ?: ""
            val title = lines.firstOrNull { l ->
                val n = FaText.norm(l)
                ignore.none { FaText.equalsLoose(l, it) } &&
                    !progressRe.containsMatchIn(n) && !remainingRe.containsMatchIn(n) &&
                    l != reward && !FaText.containsLoose(l, "تومان") &&
                    FaText.loose(l).any { it.isLetter() } && l.length <= 40
            } ?: continue
            if (out.any { FaText.equalsLoose(it.title, title) && FaText.loose(it.reward) == FaText.loose(reward) }) continue
            out.add(Card(title, done, total, remaining, reward, b.isEnabled, ChallengeType.classify(title), b))
        }
        return out
    }

    /** Walks up from a «شروع چالش» button to the node that holds exactly that one card. */
    private fun cardContainer(button: AccessibilityNodeInfo, startTexts: List<String>): AccessibilityNodeInfo? {
        val stopTexts = s("jazireh.currentChallengesHeader") + s("jazireh.instagramTab")
        var best: AccessibilityNodeInfo? = null
        var node = button.safeParent()
        var depth = 0
        while (node != null && depth < 10) {
            if (node.isScrollable) break
            var starts = 0
            var hitStop = false
            for (n in node.walk(20, 1500)) {
                if (ui.matchText(n, startTexts, exact = true)) starts++
                if (n.textStr.isNotEmpty() && stopTexts.any { FaText.containsLoose(n.textStr, it) }) hitStop = true
                if (starts > 1 || hitStop) break
            }
            if (starts > 1 || hitStop) break
            best = node
            node = node.safeParent()
            depth++
        }
        return best
    }

    // ---------- the challenge dialog ----------

    suspend fun openCard(card: Card) {
        var btn = findStartButton(card)
        if (btn == null) {
            ui.scrollForward()
            btn = findStartButton(card)
        }
        if (btn == null) throw StepFailed("«شروع چالش» button for '${card.title}' not found")
        ui.click(btn, "startChallenge:${card.title}")
        if (!ui.waitUntil(8_000) { dialogOpen() }) throw StepFailed("Challenge dialog did not open for '${card.title}'")
        delay(700)
    }

    private fun findStartButton(card: Card): AccessibilityNodeInfo? =
        readCards().firstOrNull { it.sameAs(card) }?.button

    suspend fun selectSourcePage(account: String) {
        val label = ui.waitFor(5_000) { ui.byText(s("jazireh.sourcePageLabel")) }
            ?: throw StepFailed("«پیج مبدأ» label not found in the dialog")
        val shown = currentSource(label)
        if (shown != null && FaText.containsLoose(shown, account)) {
            RunLog.i("Source page already @$account")
            return
        }
        val field = sourceField(label) ?: label
        RunLog.i("Selecting source page @$account (field shows '${shown ?: field.textStr}')")
        val fieldBounds = field.bounds()
        ui.click(field, "sourcePageField")
        delay(1000)
        val option = ui.waitFor(5_000) {
            ui.find { n -> n.isVisibleToUser && FaText.equalsLoose(n.textStr, account) && n.bounds() != fieldBounds }
                ?: ui.find { n ->
                    n.isVisibleToUser && n.clickableAncestorOrSelf() != null &&
                        FaText.containsLoose(n.textStr, account) && n.bounds() != fieldBounds
                }
        }
        if (option != null) {
            ui.click(option, "sourcePageOption")
            delay(900)
        } else {
            val edit = ui.find { it.isVisibleToUser && it.isEditable && it.isFocused }
                ?: ui.find { it.isVisibleToUser && it.isEditable }
            if (edit != null) {
                RunLog.i("«پیج مبدأ» looks like a text field – typing @$account")
                ui.setText(edit, account)
                delay(600)
            } else {
                ui.back()
                delay(600)
                throw StepFailed("@$account is not offered as «پیج مبدأ» – add this page in Jazireh > اکانت‌ها first")
            }
        }
        val label2 = ui.byText(s("jazireh.sourcePageLabel")) ?: label
        val now = currentSource(label2)
        if (now == null || !FaText.containsLoose(now, account)) {
            throw StepFailed("Could not select @$account as source page (field shows '${now ?: "?"}')")
        }
    }

    /** Text currently shown as the selected source page, or null. */
    private fun currentSource(label: AccessibilityNodeInfo): String? {
        val own = label.textStr
        val labelOnly = s("jazireh.sourcePageLabel").any { FaText.equalsLoose(own, it) }
        if (!labelOnly && own.isNotBlank()) return own // label and value merged into one node
        val field = sourceField(label) ?: return null
        val t = field.textStr.ifBlank { field.descStr }
        return t.ifBlank { null }
    }

    /** The control right below the «پیج مبدأ» label: username-looking text first, then editable, then clickable. */
    private fun sourceField(label: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val lb = label.bounds()
        val cands = ui.findAll { n ->
            val r = n.bounds()
            n.isVisibleToUser && r.top >= lb.bottom - 8 && r.top < lb.bottom + 400 && r.height() > 0 &&
                (n.isEditable || n.isClickable || FaText.looksLikeUsername(n.textStr))
        }
        return cands.minWithOrNull(compareBy({ rank(it) }, { it.bounds().top }))
    }

    private fun rank(n: AccessibilityNodeInfo): Int = when {
        FaText.looksLikeUsername(n.textStr) -> 0
        n.isEditable -> 1
        else -> 2
    }

    fun readGuide(): String {
        val heads = s("jazireh.guideHeader")
        val node = ui.find { n -> n.isVisibleToUser && heads.any { h -> FaText.containsLoose(n.textStr, h) } }
        if (node != null) {
            val own = node.textStr
            if (own.length > 40) return own
            val parent = node.safeParent()
            if (parent != null) {
                val t = parent.subtreeText()
                if (t.length > own.length) return t
            }
            return own
        }
        return ui.findAll { it.isVisibleToUser && it.textStr.length > 40 }.maxByOrNull { it.textStr.length }?.textStr ?: ""
    }

    /** Presses «انجام چالش» and returns once Instagram shows the target post/profile. */
    suspend fun pressDoChallengeAndOpenInstagram() {
        val btn = ui.byText(s("jazireh.doChallenge"), exact = true, clickableOnly = true)
            ?: ui.byText(s("jazireh.doChallenge"), exact = true)
            ?: throw StepFailed("«انجام چالش» button not found")
        val ig = prefs.instagramPackage
        ui.click(btn, "doChallenge")
        val changed = ui.waitUntil(12_000) {
            val p = ui.currentPackage()
            p != null && p != pkg
        }
        if (!changed) throw StepFailed("Nothing opened after «انجام چالش» (does the link open inside Jazireh itself?)")

        val deadline = SystemClock.uptimeMillis() + 25_000
        while (SystemClock.uptimeMillis() < deadline) {
            val p = ui.currentPackage()
            if (p == null) { delay(400); continue }
            if (p == ig) { delay(1500); return }
            if (p == pkg) { delay(500); continue }
            if (isResolver(p)) {
                RunLog.i("App chooser shown – choosing Instagram")
                val opt = ui.byText(s("resolver.instagramLabel"), exact = true) ?: ui.byText(s("resolver.instagramLabel"))
                if (opt != null) { ui.click(opt, "chooser:instagram"); delay(800) }
                val once = ui.byText(s("picker.onceTexts"), exact = true)
                if (once != null) { ui.click(once, "chooser:once"); delay(800) }
                delay(800)
                continue
            }
            if (isBrowser(p)) {
                delay(1500)
                val url = readBrowserUrl()
                if (url != null && url.contains("instagram.com")) {
                    if (!hasTargetPath(url)) throw StepFailed("Browser only shows '$url' – cannot tell which post/profile to open")
                    RunLog.i("Link opened in a browser ($p): $url – handing it to Instagram")
                    ui.openUrl(url, ig)
                    if (ui.waitForPackage(listOf(ig), 10_000) != null) { delay(1500); return }
                    throw StepFailed("Instagram did not open $url")
                }
                val open = ui.byText(s("browser.openInAppTexts"))
                if (open != null) {
                    ui.click(open, "browser:openInApp")
                    if (ui.waitForPackage(listOf(ig), 10_000) != null) { delay(1500); return }
                }
                throw StepFailed("Browser '$p' opened but its URL bar was not found – add its view id to selectors browser.urlBarIds")
            }
            RunLog.w("Unexpected app in front after «انجام چالش»: $p")
            if (ui.waitForPackage(listOf(ig), 5_000) != null) { delay(1500); return }
            throw StepFailed("Expected Instagram but '$p' is in front")
        }
        throw StepFailed("Timed out waiting for Instagram after «انجام چالش»")
    }

    private fun isResolver(p: String): Boolean =
        p in s("resolver.packages") || ui.byText(s("picker.chooserTexts")) != null

    private fun isBrowser(p: String): Boolean =
        p in s("browser.packages") || p.contains("browser", true) || p.contains("chrome", true)

    private fun hasTargetPath(url: String): Boolean {
        val path = url.substringAfter("instagram.com", "").substringBefore('?').substringBefore('#').trim('/')
        return path.isNotEmpty() && path !in setOf("explore", "accounts", "direct", "reels", "login")
    }

    private fun readBrowserUrl(): String? {
        val bar = ui.byId(s("browser.urlBarIds"))
            ?: ui.find { it.isVisibleToUser && it.textStr.contains("instagram.com") && (it.isEditable || it.isClickable) }
            ?: return null
        var u = bar.textStr.trim()
        if (u.isEmpty()) return null
        if (!u.startsWith("http")) u = "https://$u"
        return u
    }

    suspend fun pressAddScreenshot() {
        val b = ui.waitFor(5_000) { ui.byText(s("jazireh.addScreenshot")) }
            ?: throw StepFailed("«افزودن اسکرین‌شات» button not found")
        ui.click(b, "addScreenshot")
    }

    suspend fun confirmScreenshotAttached() {
        if (ui.waitForPackage(listOf(pkg), 10_000) == null) throw StepFailed("Did not return to Jazireh after picking the image")
        delay(1500)
        if (!dialogOpen()) {
            // Some apps show a crop / preview screen before returning to the dialog.
            val crop = ui.byId(s("jazireh.cropConfirmIds"))
                ?: ui.byText(s("jazireh.cropConfirmTexts"), exact = true, clickableOnly = true)
            if (crop != null) {
                RunLog.i("Confirming crop/preview screen: ${crop.describe()}")
                ui.click(crop, "cropConfirm")
                delay(1500)
                ui.waitUntil(6_000) { dialogOpen() }
            }
        }
        if (!dialogOpen()) throw StepFailed("Challenge dialog closed after picking the image")
        val attached = s("jazireh.screenshotAttachedTexts")
        if (attached.isNotEmpty() && ui.byText(attached) != null) {
            RunLog.i("Screenshot attached (confirmed by text)")
        } else {
            RunLog.i("Screenshot attached (not confirmed by text – continuing)")
        }
    }

    suspend fun pressDone() {
        val b = ui.byText(s("jazireh.done"), exact = true) ?: throw StepFailed("«انجام شد» button not found")
        if (!b.isEnabled) RunLog.w("«انجام شد» looks disabled – trying anyway")
        ui.click(b, "done")
        delay(1500)
        val confirm = ui.byText(s("jazireh.confirmTexts"), exact = true, clickableOnly = true)
        if (confirm != null) {
            ui.click(confirm, "confirm")
            delay(1200)
        }
        val err = ui.byText(s("jazireh.errorTexts"))
        if (err != null && dialogOpen()) {
            val msg = err.anyText
            closeDialogIfOpen()
            throw StepFailed("Jazireh showed an error after «انجام شد»: $msg")
        }
        if (!ui.waitUntil(8_000) { !dialogOpen() }) {
            RunLog.w("Dialog is still open after «انجام شد» – closing it")
            closeDialogIfOpen()
            throw StepFailed("Dialog did not close after «انجام شد» (screenshot probably not accepted)")
        }
        delay(800)
        dismissPopups()
    }
}
