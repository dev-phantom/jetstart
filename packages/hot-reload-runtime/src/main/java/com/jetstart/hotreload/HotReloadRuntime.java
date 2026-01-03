package com.jetstart.hotreload;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import dalvik.system.DexClassLoader;

/**
 * Runtime component for JetStart Hot Reload.
 * Handles loading of updated dex files and registration of override implementations.
 */
public class HotReloadRuntime {
    private static final String TAG = "HotReloadRuntime";

    private static HotReloadRuntime instance;
    private Context context;
    private File dexCacheDir;
    private Map<String, Class<?>> loadedOverrides = new HashMap<>();
    private int dexCounter = 0;

    // Callback for when reload happens - used to trigger Compose recomposition
    private Runnable onReloadCallback;

    private HotReloadRuntime(Context context) {
        this.context = context.getApplicationContext();
        this.dexCacheDir = new File(context.getCacheDir(), "hot-reload-dex");
        if (!dexCacheDir.exists()) {
            dexCacheDir.mkdirs();
        }
        Log.d(TAG, "HotReloadRuntime initialized, cache dir: " + dexCacheDir.getAbsolutePath());
    }

    public static synchronized HotReloadRuntime getInstance(Context context) {
        if (instance == null) {
            instance = new HotReloadRuntime(context);
        }
        return instance;
    }

    public static HotReloadRuntime getInstance() {
        return instance;
    }

    /**
     * Set callback to be invoked after successful reload.
     * Use this to trigger Compose recomposition.
     */
    public void setOnReloadCallback(Runnable callback) {
        this.onReloadCallback = callback;
    }

    /**
     * Load a dex file containing updated class implementations.
     *
     * @param dexBytes The dex file content as byte array
     * @param classNames List of fully qualified class names in the dex
     * @return true if reload was successful
     */
    public boolean loadReloadDex(byte[] dexBytes, String[] classNames) {
        try {
            // Write dex to file
            File dexFile = new File(dexCacheDir, "reload_" + (++dexCounter) + ".dex");
            try (FileOutputStream fos = new FileOutputStream(dexFile)) {
                fos.write(dexBytes);
            }
            Log.d(TAG, "Wrote reload dex to: " + dexFile.getAbsolutePath() + " (" + dexBytes.length + " bytes)");

            // Create class loader for the dex
            DexClassLoader classLoader = new DexClassLoader(
                dexFile.getAbsolutePath(),
                dexCacheDir.getAbsolutePath(),
                null,
                context.getClassLoader()
            );

            // Load each override class and register it
            for (String className : classNames) {
                try {
                    // The override class name follows the pattern: OriginalClass$Override
                    String overrideClassName = className + "$Override";
                    Class<?> overrideClass = classLoader.loadClass(overrideClassName);

                    // Create instance of the override
                    IncrementalChange overrideInstance = (IncrementalChange) overrideClass.newInstance();

                    // Register with the original class
                    registerOverride(className, overrideInstance);

                    loadedOverrides.put(className, overrideClass);
                    Log.d(TAG, "Successfully loaded override for: " + className);
                } catch (ClassNotFoundException e) {
                    // Try loading as a direct class (for non-instrumented classes)
                    Log.w(TAG, "Override class not found for " + className + ", trying direct load");
                }
            }

            // Trigger recomposition callback
            if (onReloadCallback != null) {
                onReloadCallback.run();
            }

            // Clean up old dex files (keep last 5)
            cleanupOldDexFiles();

            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to load reload dex", e);
            return false;
        }
    }

    /**
     * Register an override implementation with the original class.
     * This sets the $change field on the original class to redirect method calls.
     */
    private void registerOverride(String className, IncrementalChange override) throws Exception {
        // Load the original class
        Class<?> originalClass = context.getClassLoader().loadClass(className);

        // Get the $change field
        Field changeField = originalClass.getDeclaredField("$change");
        changeField.setAccessible(true);

        // Set the override
        changeField.set(null, override);

        Log.d(TAG, "Registered override for " + className);
    }

    /**
     * Unregister all overrides (restore original implementations).
     */
    public void clearOverrides() {
        for (String className : loadedOverrides.keySet()) {
            try {
                Class<?> originalClass = context.getClassLoader().loadClass(className);
                Field changeField = originalClass.getDeclaredField("$change");
                changeField.setAccessible(true);
                changeField.set(null, null);
                Log.d(TAG, "Cleared override for " + className);
            } catch (Exception e) {
                Log.w(TAG, "Failed to clear override for " + className, e);
            }
        }
        loadedOverrides.clear();
    }

    private void cleanupOldDexFiles() {
        File[] files = dexCacheDir.listFiles();
        if (files != null && files.length > 10) {
            // Sort by modification time and delete oldest
            java.util.Arrays.sort(files, (a, b) -> Long.compare(a.lastModified(), b.lastModified()));
            for (int i = 0; i < files.length - 5; i++) {
                files[i].delete();
            }
        }
    }
}
