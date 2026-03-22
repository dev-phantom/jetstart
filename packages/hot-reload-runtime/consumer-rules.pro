# Keep IncrementalChange interface
-keep interface com.jetstart.hotreload.IncrementalChange { *; }

# Keep $change fields
-keepclassmembers class * {
    public static com.jetstart.hotreload.IncrementalChange $change;
}

# Keep HotReloadRuntime
-keep class com.jetstart.hotreload.HotReloadRuntime { *; }
-keep class com.jetstart.hotreload.HotReloadClient { *; }
