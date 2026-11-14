package com.impedyme.jazirehbot

import android.app.Application

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        RunLog.init(this)
        Notifications.ensureChannel(this)
        Selectors.load(this)
    }
}
