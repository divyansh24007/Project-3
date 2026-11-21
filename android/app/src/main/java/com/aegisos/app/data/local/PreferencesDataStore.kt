package com.aegisos.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "aegisos_preferences")

object PreferencesKeys {
    val AUTH_TOKEN = stringPreferencesKey("auth_token")
    val REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    val USER_ID = stringPreferencesKey("user_id")
    val USER_EMAIL = stringPreferencesKey("user_email")
    val USER_ROLE = stringPreferencesKey("user_role")
    val BASE_URL = stringPreferencesKey("api_base_url")
}
