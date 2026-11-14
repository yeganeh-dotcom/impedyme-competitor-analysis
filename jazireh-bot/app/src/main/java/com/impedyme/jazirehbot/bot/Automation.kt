package com.impedyme.jazirehbot.bot

import com.impedyme.jazirehbot.AppFinder
import com.impedyme.jazirehbot.ChallengeType
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import com.impedyme.jazirehbot.ScreenWaker
import com.impedyme.jazirehbot.Selectors
import kotlinx.coroutines.delay

/**
 * One complete run:
 *   open Jazireh → challenges → Instagram tab → for every (challenge card, account):
 *   open card → choose «پیج مبدأ» → switch Instagram to that account → «انجام چالش» →
 *   like/follow/comment/repost → screenshot → back to Jazireh → attach screenshot → «انجام شد».
 */
class Automation(private val svc: BotService, private val ui: UiDriver) {

    private val prefs = Prefs(svc)
    private val jz = JazirehFlow(ui, prefs)
    private val ig = InstagramFlow(ui, prefs)
    private val picker = PickerFlow(ui, prefs)

    /** Returns a one-line summary for the notification. */
    suspend fun runOnce(reason: String): String {
        RunLog.i("================ run start ($reason) ================")
        Selectors.load(svc)
        val jazirehPkg = prefs.jazirehPackage
            ?: AppFinder.findJazireh(svc)?.also { prefs.jazirehPackage = it }
            ?: throw RunAborted("Jazireh app not found – open Jazireh Bot and pick it under 'Jazireh app'")
        if (!AppFinder.isInstalled(svc, jazirehPkg)) throw RunAborted("Jazireh package $jazirehPkg is not installed")
        if (!AppFinder.isInstalled(svc, prefs.instagramPackage)) throw RunAborted("Instagram (${prefs.instagramPackage}) is not installed")
        val accounts = prefs.accounts
        if (accounts.isEmpty()) throw RunAborted("No Instagram accounts configured in Jazireh Bot")
        if (!ScreenWaker.ensureAwake(svc)) throw RunAborted("Screen is locked – the bot needs an unlocked screen")

        var done = 0
        var failed = 0
        var consecutiveFailures = 0
        val attempted = HashSet<String>()
        var guard = 0
        while (done + failed < prefs.maxItemsPerRun && guard++ < 60) {
            jz.openChallengesList()
            val cards = jz.readCards()
            if (guard == 1) RunLog.i("Challenge cards: ${if (cards.isEmpty()) "none" else cards.joinToString(" ; ")}")
            val work = pickNext(cards, accounts, attempted)
            if (work == null) {
                RunLog.i("Nothing (more) to do")
                break
            }
            val (card, account) = work
            val key = "${card.key}|$account"
            attempted.add(key)
            try {
                doItem(card, account)
                prefs.ledgerAdd(key)
                done++
                consecutiveFailures = 0
            } catch (e: StepFailed) {
                failed++
                consecutiveFailures++
                RunLog.e("✖ '${card.title}' with @$account failed: ${e.message}")
                recover()
                if (consecutiveFailures >= 3) throw RunAborted("3 items failed in a row – stopping this run (see log)")
            }
            ui.humanDelay()
        }
        val summary = "$done submitted, $failed failed"
        RunLog.i("================ run end: $summary ================")
        if (prefs.goHomeAfterRun) {
            try { jz.closeDialogIfOpen() } catch (_: Exception) {}
            ui.home()
        }
        return summary
    }

    private fun pickNext(
        cards: List<JazirehFlow.Card>, accounts: List<String>, attempted: Set<String>
    ): Pair<JazirehFlow.Card, String>? {
        for (card in cards) {
            if (card.type == ChallengeType.UNKNOWN) {
                RunLog.w("Skipping '${card.title}': unknown challenge type")
                continue
            }
            if (!card.enabled) continue
            if (card.total > 0 && card.done >= card.total) continue
            if (card.remaining == 0) continue
            for (acc in accounts) {
                val key = "${card.key}|$acc"
                if (key in attempted) continue
                if (prefs.ledgerContains(key)) continue
                return card to acc
            }
        }
        return null
    }

    private suspend fun doItem(card: JazirehFlow.Card, account: String) {
        RunLog.i("---- '${card.title}' (${card.type}) with @$account ----")
        // 1) open the card, choose the source page, read the instructions
        jz.openCard(card)
        jz.selectSourcePage(account)
        val guide = jz.readGuide()
        if (guide.isNotBlank()) RunLog.i("Guide: ${guide.replace('\n', ' ').take(220)}")
        val type = ChallengeType.classify(card.title, guide)
        if (type == ChallengeType.UNKNOWN) throw StepFailed("Cannot tell what to do from the title/guide")

        // 2) switch Instagram to the right account before the deep link opens
        ig.ensureAccount(account)

        // 3) back to Jazireh → «انجام چالش» → Instagram shows the target
        jz.bringToFrontWithDialog(card, account)
        jz.pressDoChallengeAndOpenInstagram()

        // 4) do the thing
        ig.perform(type, guide)
        ui.humanDelay(1500)

        // 5) proof
        val shot = ScreenshotSaver.capture(svc, prefs.screenshotFolder) ?: throw StepFailed("Screenshot failed")
        RunLog.i("Screenshot saved: $shot")
        delay(1000)

        // 6) back to Jazireh → attach → «انجام شد»
        jz.bringToFrontWithDialog(card, account)
        jz.pressAddScreenshot()
        picker.pickNewest(prefs.jazirehPackage ?: "")
        jz.confirmScreenshotAttached()
        jz.pressDone()
        RunLog.i("✔ Submitted '${card.title}' for @$account")
    }

    private suspend fun recover() {
        try {
            val pkg = prefs.jazirehPackage ?: return
            if (ui.currentPackage() != pkg) {
                ui.launch(pkg)
                ui.waitForPackage(listOf(pkg), 8_000)
                delay(800)
            }
            jz.closeDialogIfOpen()
        } catch (e: Exception) {
            RunLog.w("recover(): ${e.message}")
        }
    }
}
