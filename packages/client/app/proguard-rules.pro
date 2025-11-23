# Add project specific ProGuard rules here.

# Keep JetStart classes
-keep class com.jetstart.client.** { *; }

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# WebSocket
-keep class org.java_websocket.** { *; }

# Compose
-keep class androidx.compose.** { *; }