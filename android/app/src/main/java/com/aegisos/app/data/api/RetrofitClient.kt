package com.aegisos.app.data.api

import android.content.Context
import com.aegisos.app.data.local.PreferencesKeys
import com.aegisos.app.data.local.dataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * RetrofitClient:
 * Singleton networking provider with dynamic baseUrl reconfiguration,
 * persistent DataStore token injection, and structured logging.
 *
 * Requirements:
 * - Singleton object with lazy Retrofit instance
 * - OkHttpClient with auth interceptor (reads token from DataStore)
 * - HttpLoggingInterceptor
 * - Base URL configurable, default "http://10.0.2.2:8000" (emulator localhost)
 */
object RetrofitClient {

    private const val DEFAULT_BASE_URL = "http://10.0.2.2:8000"

    @Volatile
    private var customBaseUrl: String = DEFAULT_BASE_URL

    @Volatile
    private var appContext: Context? = null

    @Volatile
    private var inMemoryToken: String? = null

    @Volatile
    private var retrofitInstance: Retrofit? = null

    @Volatile
    private var apiInstance: AegisosApi? = null

    /**
     * Initialize application context to enable reading credentials directly from DataStore.
     */
    fun initialize(context: Context) {
        this.appContext = context.applicationContext
    }

    /**
     * Set or update current in-memory token for immediate propagation without disk latency.
     */
    fun setAuthToken(token: String?) {
        this.inMemoryToken = token
    }

    /**
     * Reconfigures base URL at runtime.
     * Invalidates cached Retrofit and Api instances.
     */
    fun setBaseUrl(newUrl: String) {
        synchronized(this) {
            val sanitized = newUrl.trim()
            if (sanitized.isNotEmpty() && sanitized != customBaseUrl) {
                customBaseUrl = sanitized
                retrofitInstance = null
                apiInstance = null
            }
        }
    }

    /**
     * Resolves the current base URL, ensuring trailing slash and /api/v1/ prefix
     * so that Retrofit paths like "scan/url" resolve to "/api/v1/scan/url".
     */
    fun getFormattedBaseUrl(): String {
        var url = customBaseUrl.trim()
        if (!url.endsWith("/")) {
            url = "$url/"
        }
        if (!url.contains("/api/v1/")) {
            url = "${url}api/v1/"
        }
        return url
    }

    /**
     * Auth interceptor: reads token from in-memory cache or falls back to DataStore preferences.
     */
    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()

        val token = inMemoryToken ?: appContext?.let { ctx ->
            runBlocking {
                try {
                    ctx.dataStore.data.map { prefs ->
                        prefs[PreferencesKeys.AUTH_TOKEN]
                    }.first()
                } catch (e: Exception) {
                    null
                }
            }
        }

        val requestBuilder = originalRequest.newBuilder()
        if (!token.isNullOrBlank()) {
            requestBuilder.header("Authorization", "Bearer $token")
        }
        requestBuilder.header("Accept", "application/json")

        chain.proceed(requestBuilder.build())
    }

    /**
     * HttpLoggingInterceptor configured for debugging security telemetry payloads.
     */
    private val loggingInterceptor: HttpLoggingInterceptor by lazy {
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    /**
     * OkHttpClient instance with timeouts suitable for AI multi-agent orchestration.
     */
    val okHttpClient: OkHttpClient by lazy {
        buildOkHttpClient()
    }

    private fun buildOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    /**
     * Retrieves or creates the Retrofit instance.
     */
    fun getRetrofit(): Retrofit {
        return retrofitInstance ?: synchronized(this) {
            retrofitInstance ?: Retrofit.Builder()
                .baseUrl(getFormattedBaseUrl())
                .client(buildOkHttpClient())
                .addConverterFactory(GsonConverterFactory.create())
                .build().also {
                    retrofitInstance = it
                }
        }
    }

    /**
     * Lazy instance of AegisosApi.
     */
    val api: AegisosApi
        get() {
            return apiInstance ?: synchronized(this) {
                apiInstance ?: getRetrofit().create(AegisosApi::class.java).also {
                    apiInstance = it
                }
            }
        }
}
