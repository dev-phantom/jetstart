package com.jetstart.client.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.content.FileProvider
import java.io.File

class ApkInstaller(private val context: Context) {
    
    private val tag = "ApkInstaller"

    fun installApk(apkFile: File) {
        try {
            val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    apkFile
                )
            } else {
                Uri.fromFile(apkFile)
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(intent)
            Log.d(tag, "Installation intent started")
        } catch (e: Exception) {
            Log.e(tag, "Failed to install APK: ${e.message}")
        }
    }

    fun saveApkToCache(apkData: ByteArray, filename: String): File? {
        return try {
            val cacheDir = context.cacheDir
            val apkFile = File(cacheDir, filename)
            
            apkFile.outputStream().use { output ->
                output.write(apkData)
            }
            
            Log.d(tag, "APK saved to cache: ${apkFile.absolutePath}")
            apkFile
        } catch (e: Exception) {
            Log.e(tag, "Failed to save APK: ${e.message}")
            null
        }
    }
}