package com.aegisos.app

import android.app.Application
import com.aegisos.app.data.api.RetrofitClient

class AegisosApp : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
        RetrofitClient.initialize(this)
    }

    companion object {
        lateinit var instance: AegisosApp
            private set
    }
}
