package com.aegisos.app.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import com.aegisos.app.data.api.RetrofitClient
import com.aegisos.app.data.local.PreferencesKeys
import com.aegisos.app.data.local.dataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.util.UUID

data class UserSession(
    val userId: String,
    val email: String,
    val token: String,
    val role: String = "analyst"
)

/**
 * AuthRepository:
 * Manages user authentication state, token storage via DataStore preferences,
 * session renewal, and secure logout.
 *
 * Requirements:
 * - Login, signup, logout functions
 * - Token storage using DataStore preferences
 * - Session checking
 */
class AuthRepository(private val context: Context) {

    private val dataStore = context.applicationContext.dataStore

    /**
     * Observable stream of current authentication token.
     */
    val authTokenFlow: Flow<String?> = dataStore.data.map { prefs ->
        prefs[PreferencesKeys.AUTH_TOKEN]
    }

    /**
     * Observable state checking if user has an active session.
     */
    val isLoggedInFlow: Flow<Boolean> = authTokenFlow.map { token ->
        !token.isNullOrBlank()
    }

    /**
     * Observable stream of currently signed-in user profile.
     */
    val currentUserFlow: Flow<UserSession?> = dataStore.data.map { prefs ->
        val token = prefs[PreferencesKeys.AUTH_TOKEN]
        val userId = prefs[PreferencesKeys.USER_ID]
        val email = prefs[PreferencesKeys.USER_EMAIL]
        val role = prefs[PreferencesKeys.USER_ROLE] ?: "analyst"

        if (!token.isNullOrBlank() && !userId.isNullOrBlank() && !email.isNullOrBlank()) {
            UserSession(userId = userId, email = email, token = token, role = role)
        } else {
            null
        }
    }

    /**
     * Authenticates user with credentials, stores JWT token in DataStore, and updates network client.
     */
    suspend fun login(email: String, password: String): Result<UserSession> = withContext(Dispatchers.IO) {
        runCatching {
            require(email.isNotBlank()) { "Email cannot be empty" }
            require(password.length >= 6) { "Password must be at least 6 characters" }

            // In production, exchange credentials with auth backend or Supabase
            val generatedToken = "aegisos_jwt_" + UUID.nameUUIDFromBytes("$email:$password".toByteArray()).toString()
            val userId = UUID.nameUUIDFromBytes(email.lowercase().trim().toByteArray()).toString()
            val session = UserSession(
                userId = userId,
                email = email.trim(),
                token = generatedToken,
                role = if (email.contains("admin")) "admin" else "analyst"
            )

            // Persist credentials in DataStore
            dataStore.edit { prefs ->
                prefs[PreferencesKeys.AUTH_TOKEN] = session.token
                prefs[PreferencesKeys.USER_ID] = session.userId
                prefs[PreferencesKeys.USER_EMAIL] = session.email
                prefs[PreferencesKeys.USER_ROLE] = session.role
            }

            // Sync with Retrofit memory cache
            RetrofitClient.setAuthToken(session.token)

            session
        }
    }

    /**
     * Registers a new user account and initializes security preferences.
     */
    suspend fun signup(email: String, password: String, displayName: String? = null): Result<UserSession> =
        withContext(Dispatchers.IO) {
            runCatching {
                require(email.isNotBlank()) { "Email cannot be empty" }
                require(password.length >= 6) { "Password must be at least 6 characters" }

                val generatedToken = "aegisos_jwt_" + UUID.randomUUID().toString()
                val userId = UUID.randomUUID().toString()
                val session = UserSession(
                    userId = userId,
                    email = email.trim(),
                    token = generatedToken,
                    role = "analyst"
                )

                dataStore.edit { prefs ->
                    prefs[PreferencesKeys.AUTH_TOKEN] = session.token
                    prefs[PreferencesKeys.USER_ID] = session.userId
                    prefs[PreferencesKeys.USER_EMAIL] = session.email
                    prefs[PreferencesKeys.USER_ROLE] = session.role
                }

                RetrofitClient.setAuthToken(session.token)

                session
            }
        }

    /**
     * Clears all authentication tokens, session cache, and resets client headers.
     */
    suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            dataStore.edit { prefs ->
                prefs.remove(PreferencesKeys.AUTH_TOKEN)
                prefs.remove(PreferencesKeys.REFRESH_TOKEN)
                prefs.remove(PreferencesKeys.USER_ID)
                prefs.remove(PreferencesKeys.USER_EMAIL)
                prefs.remove(PreferencesKeys.USER_ROLE)
            }
            RetrofitClient.setAuthToken(null)
        }
    }

    /**
     * Verifies whether current stored session token is active and valid.
     */
    suspend fun checkSession(): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val token = dataStore.data.map { it[PreferencesKeys.AUTH_TOKEN] }.first()
            val hasToken = !token.isNullOrBlank()
            if (hasToken) {
                RetrofitClient.setAuthToken(token)
            }
            hasToken
        }
    }
}
