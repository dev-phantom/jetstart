# JetStart default ProGuard/R8 rules
# Add your project-specific rules at the bottom.
# Kotlin
-keep class kotlin.** { *; }
-keepclassmembers class **$WhenMappings { <fields>; }
-dontwarn kotlin.**
# Jetpack Compose
-keep class androidx.compose.** { *; }
-keepclassmembers class androidx.compose.** { *; }
-dontwarn androidx.compose.**
# Room
-keep class * extends androidx.room.RoomDatabase { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }
-dontwarn androidx.room.**
# Gson (JSON serialization)
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class * implements com.google.gson.TypeAdapterFactory { *; }
# OkHttp + WebSocket
# Only used by HotReload (debug only). R8 strips the entire
# HotReload code path in release builds via BuildConfig.DEBUG = false.
-dontwarn okhttp3.**
-dontwarn okio.**
# DivKit
-keep class com.yandex.div.** { *; }
-dontwarn com.yandex.div.**
# Enum names (required for serialization)
-keepclassmembers enum * { *; }
# App data classes used by Room
-keep class {{PACKAGE_NAME}}.data.** { *; }
# Add your own keep rules below this line