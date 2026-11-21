package com.aegisos.app.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.InetAddress
import java.nio.ByteBuffer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * VpnLogEntry:
 * Data model for DNS queries inspected by the local VPN firewall tunnel.
 */
data class VpnLogEntry(
    val timestamp: String,
    val action: String, // ALLOWED or BLOCKED
    val domain: String,
    val details: String
)

/**
 * VpnConnectionLogger:
 * Singleton logger recording DNS query activity, blocked domains, and operational metrics.
 */
object VpnConnectionLogger {
    private const val TAG = "AEGISOS_VPN_LOG"
    private val logs = mutableListOf<VpnLogEntry>()

    private val _isVpnActive = MutableStateFlow(false)
    val isVpnActive: StateFlow<Boolean> = _isVpnActive.asStateFlow()

    private val _blockedCount = MutableStateFlow(0)
    val blockedCount: StateFlow<Int> = _blockedCount.asStateFlow()

    private val _totalQueries = MutableStateFlow(0)
    val totalQueries: StateFlow<Int> = _totalQueries.asStateFlow()

    fun setVpnState(active: Boolean) {
        _isVpnActive.value = active
    }

    @Synchronized
    fun logEvent(action: String, domain: String, details: String) {
        val timestamp = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
        val entry = VpnLogEntry(timestamp, action, domain, details)
        logs.add(0, entry)
        if (logs.size > 200) {
            logs.removeAt(logs.size - 1)
        }

        _totalQueries.value += 1
        if (action == "BLOCKED") {
            _blockedCount.value += 1
            Log.w(TAG, "[THREAT BLOCKED] Domain: $domain - $details")
        } else {
            Log.d(TAG, "[ALLOWED] Domain: $domain - $details")
        }
    }

    @Synchronized
    fun getRecentLogs(): List<VpnLogEntry> = logs.toList()

    @Synchronized
    fun clearLogs() {
        logs.clear()
        _blockedCount.value = 0
        _totalQueries.value = 0
    }
}

/**
 * AegisosVpnService:
 * Local DNS inspection tunnel extending android.net.VpnService.
 * Intercepts outbound DNS requests, cross-references with threat intelligence blocklists,
 * blocks malicious domains locally, and emits real-time security alerts.
 *
 * Requirements:
 * - Extends android.net.VpnService
 * - Builder setup with addAddress, addRoute, addDnsServer
 * - Simple local tunnel that checks DNS queries against a blocklist
 * - Blocklist: hardcoded list of known malicious domains for demo
 * - Connection logging
 * - Start/stop via intent
 * - Notification for foreground service
 */
class AegisosVpnService : VpnService() {

    companion object {
        const val ACTION_START = "com.aegisos.app.action.START_VPN"
        const val ACTION_STOP = "com.aegisos.app.action.STOP_VPN"

        private const val CHANNEL_ID = "aegisos_vpn_channel"
        private const val NOTIFICATION_ID = 4040
        private const val TAG = "AegisosVpnService"

        /**
         * Hardcoded list of known malicious domains for demo & zero-day simulation.
         */
        val BLOCKLIST: Set<String> = setOf(
            "sbi-pan-update.xyz",
            "secure-login-paypal.com",
            "secure-login-pаypal.com",
            "refund-agent.okaxis",
            "bonus-telegram-claim.xyz",
            "kyc-verification-online.com",
            "claim-free-rewards-upi.net",
            "login-security-alert.top",
            "phishing-test-domain.net",
            "malware-traffic-analysis.net",
            "evil-tracker-analytics.org",
            "bank-update.xyz",
            "crypto-airdrop-claim.top",
            "account-verify-sbi.in"
        )
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var serviceScope: CoroutineScope? = null
    private var tunnelJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START
        when (action) {
            ACTION_START -> startVpn()
            ACTION_STOP -> stopVpn()
        }
        return START_STICKY
    }

    /**
     * Initializes VPN tun interface and launches packet processing loop.
     */
    private fun startVpn() {
        if (vpnInterface != null) {
            Log.d(TAG, "VPN already running.")
            return
        }

        try {
            startForeground(NOTIFICATION_ID, buildForegroundNotification("Active - Inspecting traffic"))

            // Builder setup with addAddress, addRoute, addDnsServer
            val builder = Builder()
                .setSession("AEGISOS Protection Tunnel")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("8.8.8.8")
                .setMtu(1500)
                .setBlocking(false)

            vpnInterface = builder.establish()

            if (vpnInterface == null) {
                Log.e(TAG, "Failed to establish VPN interface (null)")
                stopVpn()
                return
            }

            VpnConnectionLogger.setVpnState(true)
            serviceScope = CoroutineScope(Dispatchers.IO)
            startTunnelLoop()

            Log.i(TAG, "AEGISOS Protection Tunnel established successfully.")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN service", e)
            stopVpn()
        }
    }

    /**
     * Packet processing loop that inspects UDP port 53 DNS queries.
     */
    private fun startTunnelLoop() {
        val pfd = vpnInterface ?: return

        tunnelJob = serviceScope?.launch {
            val inputStream = FileInputStream(pfd.fileDescriptor)
            val outputStream = FileOutputStream(pfd.fileDescriptor)
            val buffer = ByteBuffer.allocate(32767)

            while (isActive) {
                try {
                    buffer.clear()
                    val bytesRead = inputStream.read(buffer.array())

                    if (bytesRead > 0) {
                        buffer.limit(bytesRead)
                        inspectAndProcessPacket(buffer, bytesRead, outputStream)
                    } else {
                        kotlinx.coroutines.delay(10)
                    }
                } catch (e: Exception) {
                    if (isActive) {
                        Log.e(TAG, "Error in packet processing loop", e)
                        kotlinx.coroutines.delay(50)
                    }
                }
            }
        }
    }

    /**
     * Parses IP and UDP headers to extract and validate DNS query domain names.
     */
    private fun inspectAndProcessPacket(
        buffer: ByteBuffer,
        length: Int,
        outputStream: FileOutputStream
    ) {
        val data = buffer.array()
        if (length < 28) return // Minimum IPv4 + UDP header length

        // Check if IPv4 (version == 4)
        val versionAndIhl = data[0].toInt() and 0xFF
        val version = versionAndIhl shr 4
        if (version != 4) return

        val ihl = (versionAndIhl and 0x0F) * 4
        val protocol = data[9].toInt() and 0xFF

        // Protocol 17 = UDP
        if (protocol == 17 && length >= ihl + 8) {
            val destPort = ((data[ihl + 2].toInt() and 0xFF) shl 8) or (data[ihl + 3].toInt() and 0xFF)

            // DNS Query on Port 53
            if (destPort == 53) {
                val dnsOffset = ihl + 8
                val domain = parseDnsQuestionDomain(data, dnsOffset, length)

                if (domain.isNotEmpty()) {
                    val isBlocked = checkBlocklist(domain)
                    if (isBlocked) {
                        VpnConnectionLogger.logEvent(
                            action = "BLOCKED",
                            domain = domain,
                            details = "Matched AEGISOS threat blocklist rule"
                        )
                        updateNotification("Threat Blocked: $domain")
                        // Drop packet / do not forward
                        return
                    } else {
                        VpnConnectionLogger.logEvent(
                            action = "ALLOWED",
                            domain = domain,
                            details = "Verified clean"
                        )
                    }
                }
            }
        }
    }

    /**
     * Extracts QNAME domain string from raw DNS request payload.
     */
    private fun parseDnsQuestionDomain(data: ByteArray, offset: Int, length: Int): String {
        return try {
            // DNS header is 12 bytes; Question section follows
            var pointer = offset + 12
            val domainBuilder = StringBuilder()

            while (pointer < length) {
                val labelLen = data[pointer].toInt() and 0xFF
                if (labelLen == 0) break // End of QNAME

                pointer++
                if (pointer + labelLen > length) break

                if (domainBuilder.isNotEmpty()) {
                    domainBuilder.append(".")
                }

                val label = String(data, pointer, labelLen, Charsets.US_ASCII)
                domainBuilder.append(label)
                pointer += labelLen
            }

            domainBuilder.toString().lowercase()
        } catch (e: Exception) {
            ""
        }
    }

    /**
     * Checks if queried domain or parent domain matches threat blocklist.
     */
    private fun checkBlocklist(domain: String): Boolean {
        if (BLOCKLIST.contains(domain)) return true
        return BLOCKLIST.any { blocked -> domain.endsWith(".$blocked") }
    }

    /**
     * Shuts down tunnel, cleans up resources, and stops foreground notification.
     */
    private fun stopVpn() {
        try {
            tunnelJob?.cancel()
            serviceScope?.cancel()
            vpnInterface?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping VPN interface", e)
        } finally {
            vpnInterface = null
            serviceScope = null
            tunnelJob = null
            VpnConnectionLogger.setVpnState(false)
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            Log.i(TAG, "AEGISOS Protection Tunnel stopped.")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AEGISOS Threat Shield Tunnel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors real-time DNS queries against threat blocklists"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(statusText: String): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                this,
                0,
                launchIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        } else null

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("AEGISOS Protection Active")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun updateNotification(statusText: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildForegroundNotification(statusText))
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}
