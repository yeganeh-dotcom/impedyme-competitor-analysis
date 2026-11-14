package com.impedyme.jazirehbot.bot

/** The current challenge/account item failed; the run continues with the next one. */
class StepFailed(message: String) : Exception(message)

/** Something is wrong that makes the whole run pointless (app missing, Instagram blocked, …). */
class RunAborted(message: String) : Exception(message)
