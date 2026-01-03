package com.jetstart.client.utils

import android.content.Context
import android.os.Build
import android.util.DisplayMetrics
import android.view.WindowManager

object DeviceInfo {
    
    fun getDeviceInfo(context: Context): Map<String, Any> {
        val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val displayMetrics = DisplayMetrics()
        
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getMetrics(displayMetrics)
        
        return mapOf(
            "id" to getDeviceId(),
            "name" to getDeviceName(),
            "model" to Build.MODEL,
            "manufacturer" to Build.MANUFACTURER,
            "platform" to "android",
            "osVersion" to Build.VERSION.RELEASE,
            "apiLevel" to Build.VERSION.SDK_INT,
            "screenResolution" to mapOf(
                "width" to displayMetrics.widthPixels,
                "height" to displayMetrics.heightPixels
            ),
            "density" to displayMetrics.density,
            "isEmulator" to isEmulator(),
            "architecture" to Build.SUPPORTED_ABIS[0],
            "locale" to java.util.Locale.getDefault().toString(),
            "timezone" to java.util.TimeZone.getDefault().id
        )
    }
    
    private fun getDeviceId(): String {
        // In production, use a proper unique ID
        return "${Build.MANUFACTURER}-${Build.MODEL}-${Build.SERIAL}".hashCode().toString()
    }
    
    private fun getDeviceName(): String {
        return "${Build.MANUFACTURER} ${Build.MODEL}"
    }
    
    private fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")
                || "google_sdk" == Build.PRODUCT)
    }
}