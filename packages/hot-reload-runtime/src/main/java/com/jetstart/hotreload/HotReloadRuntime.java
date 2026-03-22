package com.jetstart.hotreload;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Runtime component for JetStart Hot Reload.
 * Handles loading of updated DEX files and registration of override implementations
 * using the $change field + IncrementalChange pattern (Instant Run style).
 *
 * How it works:
 * 1. Classes in the APK have been instrumented with a static $change field
 * 2. When we load new DEX, we create IncrementalChange implementations
 * 3. We set $change on the original APK classes via reflection
 * 4. When methods are called, they check $change and delegate to new implementation
 * 5. Trigger recomposition to see the UI updates
 */
public class HotReloadRuntime {
    private static final String TAG = "HotReloadRuntime";

    private static HotReloadRuntime instance;
    private Context context;
    private Activity activity;
    private File dexCacheDir;
    private final Map<String, Class<?>> loadedClasses = new HashMap<>();
    private int dexCounter = 0;
    private final OkHttpClient httpClient = new OkHttpClient();

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
     * Set the activity reference for UI operations (toasts, APK install intents).
     */
    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    /**
     * Set callback to be invoked after successful reload.
     * Use this to trigger Compose recomposition.
     */
    public void setOnReloadCallback(Runnable callback) {
        this.onReloadCallback = callback;
    }

    /**
     * Load a DEX file and apply hot reload WITHOUT restarting the app.
     * This is TRUE hot reload using the $change field pattern.
     *
     * @param dexBase64  Base64-encoded DEX bytes
     * @param classNames List of fully qualified class names in the DEX
     * @return true if reload was successful
     */
    public boolean loadDexAndReload(String dexBase64, List<String> classNames) {
        try {
            // Decode and save DEX file
            byte[] dexBytes = Base64.decode(dexBase64, Base64.DEFAULT);

            // Use timestamp-based name to avoid conflicts with previous read-only files
            File dexFile = new File(dexCacheDir, "reload_" + System.currentTimeMillis() + ".dex");

            // Delete if exists (shouldn't happen with timestamp names)
            if (dexFile.exists()) {
                dexFile.setWritable(true);
                dexFile.delete();
            }

            FileOutputStream fos = new FileOutputStream(dexFile);
            fos.write(dexBytes);
            fos.close();

            // Make file read-only (required by Android security for DexClassLoader)
            dexFile.setReadOnly();

            Log.d(TAG, "🔥 Saved DEX to: " + dexFile.getAbsolutePath() + " (" + dexBytes.length + " bytes)");

            // Create Child-First ClassLoader to prioritize classes from DEX
            HotReloadClassLoader dexClassLoader = new HotReloadClassLoader(
                dexFile.getAbsolutePath(),
                dexCacheDir.getAbsolutePath(),
                null,
                context.getClassLoader()
            );

            // Load the new classes from DEX and apply $change to original classes
            int successCount = 0;
            for (String className : classNames) {
                try {
                    // Skip $override classes - they're just helpers, not original classes
                    if (className.endsWith("$override")) {
                        Log.d(TAG, "🔥 Skipping override class: " + className);
                        continue;
                    }

                    // Load the NEW class from DEX
                    Class<?> newClass = dexClassLoader.loadClass(className);
                    loadedClasses.put(className, newClass);
                    Log.d(TAG, "🔥 Loaded new class from DEX: " + className);

                    // Find the ORIGINAL class from APK (loaded by app's classloader)
                    try {
                        Class<?> originalClass = context.getClassLoader().loadClass(className);

                        if (applyChangeField(originalClass, newClass, dexClassLoader)) {
                            Log.d(TAG, "🔥 Applied $change (manual dispatch) to: " + className);
                        }

                        successCount++;
                    } catch (ClassNotFoundException e) {
                        // This is a new class, not an update - that's fine
                        Log.d(TAG, "🔥 New class (not update): " + className);
                        successCount++;
                    }
                } catch (Exception e) {
                    Log.w(TAG, "🔥 Failed to process class " + className + ": " + e.getMessage());
                }
            }

            Log.d(TAG, "🔥 Hot reload complete: " + successCount + "/" + classNames.size() + " classes updated");

            // Trigger recomposition callback
            if (onReloadCallback != null) {
                onReloadCallback.run();
            }

            // Show success toast
            if (activity != null) {
                final int finalSuccessCount = successCount;
                activity.runOnUiThread(() ->
                    Toast.makeText(activity, "🔥 Hot reload applied! (" + finalSuccessCount + " classes)", Toast.LENGTH_SHORT).show()
                );
            }

            // Clean up old dex files (keep last 5)
            cleanupOldDexFiles();

            return true;
        } catch (Exception e) {
            Log.e(TAG, "🔥 Failed to load DEX: " + e.getMessage(), e);
            if (activity != null) {
                activity.runOnUiThread(() ->
                    Toast.makeText(activity, "❌ Hot reload failed: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
            return false;
        }
    }

    /**
     * Legacy method for backward compatibility with raw byte arrays.
     */
    public boolean loadReloadDex(byte[] dexBytes, String[] classNames) {
        String dexBase64 = Base64.encodeToString(dexBytes, Base64.DEFAULT);
        List<String> names = new ArrayList<>(Arrays.asList(classNames));
        return loadDexAndReload(dexBase64, names);
    }

    /**
     * Apply $change field to the original class to redirect method calls to new implementation.
     */
    private boolean applyChangeField(Class<?> originalClass, Class<?> newClass, ClassLoader dexClassLoader) {
        try {
            // Find the $change field in the original class
            Field changeField;
            try {
                changeField = originalClass.getDeclaredField("$change");
            } catch (NoSuchFieldException e) {
                Log.w(TAG, "🔥 No $change field in " + originalClass.getName() + " - not instrumented");
                return false;
            }

            changeField.setAccessible(true);

            // Create an IncrementalChange implementation that delegates to the new class
            Object incrementalChange = createIncrementalChange(newClass, dexClassLoader);

            if (incrementalChange == null) {
                Log.e(TAG, "🔥 Failed to create IncrementalChange for " + originalClass.getName());
                return false;
            }

            // Set the $change field to our implementation
            changeField.set(null, incrementalChange);

            Log.d(TAG, "✔ Set $change field on " + originalClass.getName());
            return true;
        } catch (IllegalAccessException e) {
            Log.e(TAG, "🔥 Cannot access $change field in " + originalClass.getName() + ": " + e.getMessage());
            return false;
        } catch (Exception e) {
            Log.e(TAG, "🔥 Error applying $change field: " + e.getClass().getSimpleName() + ": " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Create an IncrementalChange implementation that delegates method calls
     * to the new class loaded from DEX.
     */
    private Object createIncrementalChange(Class<?> newClass, ClassLoader dexClassLoader) {
        // Load the IncrementalChange interface from the app's classloader
        Class<?> incrementalChangeInterface;
        try {
            incrementalChangeInterface = context.getClassLoader().loadClass("com.jetstart.hotreload.IncrementalChange");
        } catch (ClassNotFoundException e) {
            // Fallback: create using the interface directly
            Log.w(TAG, "🔥 IncrementalChange interface not found via classLoader, using direct reference");
            return createFallbackIncrementalChange(newClass);
        }

        // Create a dynamic proxy that implements IncrementalChange
        return Proxy.newProxyInstance(
            context.getClassLoader(),
            new Class[]{incrementalChangeInterface},
            (proxy, method, args) -> {
                if ("access$dispatch".equals(method.getName())) {
                    if (args == null || args.length < 2) {
                        Log.e(TAG, "🔥 ERROR: Invalid args to access$dispatch: " + (args == null ? "null" : args.length));
                        return null;
                    }

                    String signature = (String) args[0];
                    if (signature == null) {
                        Log.e(TAG, "🔥 ERROR: Signature is null");
                        return null;
                    }

                    Object[] methodArgs = (Object[]) args[1];
                    if (methodArgs == null) {
                        Log.e(TAG, "🔥 ERROR: Method args is null");
                        return null;
                    }

                    Log.d(TAG, "🔥 Dispatching: " + signature + " with " + methodArgs.length + " args");
                    return dispatchToNewClass(newClass, signature, methodArgs);
                }
                Log.e(TAG, "🔥 ERROR: Unknown method on IncrementalChange: " + method.getName());
                return null;
            }
        );
    }

    /**
     * Fallback IncrementalChange for when the interface can't be loaded via reflection.
     */
    private IncrementalChange createFallbackIncrementalChange(Class<?> newClass) {
        return (methodSignature, args) -> dispatchToNewClass(newClass, methodSignature, args);
    }

    /**
     * Dispatch a method call to the new class implementation.
     * DEX classes are NOT instrumented, so no recursion guard is needed.
     */
    private Object dispatchToNewClass(Class<?> newClass, String signature, Object[] args) {
        String methodName = signature.substring(0, signature.indexOf(".("));

        try {
            // Find methods with matching name
            Method[] allMethods = newClass.getDeclaredMethods();
            List<Method> candidates = new ArrayList<>();

            for (Method method : allMethods) {
                if (method.getName().equals(methodName)) {
                    candidates.add(method);
                }
            }

            if (candidates.isEmpty()) {
                Log.w(TAG, "🔥 Method not found: " + methodName + " in " + newClass.getName());
                return null;
            }

            // Determine if static based on first candidate
            Method representative = candidates.get(0);
            boolean isStatic = Modifier.isStatic(representative.getModifiers());

            // Prepare actual arguments
            // For instance methods, args[0] is 'this', drop it for invoke
            Object[] actualArgs;
            if (isStatic) {
                actualArgs = args;
            } else {
                if (args.length == 0) {
                    actualArgs = new Object[0];
                } else {
                    actualArgs = new Object[args.length - 1];
                    System.arraycopy(args, 1, actualArgs, 0, args.length - 1);
                }
            }

            Log.d(TAG, "🔥 Resolving " + methodName + ": static=" + isStatic + ", totalArgs=" + args.length + ", actualArgs=" + actualArgs.length);

            // STRICT MATCHING ONLY - no argument padding
            Method matchedMethod = null;
            for (Method m : candidates) {
                Class<?>[] params = m.getParameterTypes();
                if (params.length != actualArgs.length) {
                    Log.d(TAG, "🔥 Param count mismatch for " + m.getName() + ": expected " + params.length + ", got " + actualArgs.length);
                    continue;
                }

                boolean matches = true;
                for (int i = 0; i < params.length; i++) {
                    Object arg = actualArgs[i];
                    Class<?> paramType = params[i];

                    if (arg != null) {
                        if (!isAssignableFrom(paramType, arg.getClass())) {
                            Log.d(TAG, "🔥 Type mismatch for " + m.getName() + " param " + i);
                            matches = false;
                            break;
                        }
                    } else {
                        if (paramType.isPrimitive()) {
                            Log.d(TAG, "🔥 Null not allowed for primitive param " + i + " in " + m.getName());
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    matchedMethod = m;
                    Log.d(TAG, "🔥 Found matching method: " + m.getName() + " with " + m.getParameterTypes().length + " params");
                    break;
                }
            }

            if (matchedMethod != null) {
                matchedMethod.setAccessible(true);

                Object instance = null;
                if (!isStatic && args.length > 0) {
                    instance = args[0];
                }

                Log.d(TAG, "🔥 Invoking " + matchedMethod.getName() + " on " + (isStatic ? "class" : "instance"));

                try {
                    Object result = matchedMethod.invoke(instance, actualArgs);
                    Log.d(TAG, "✔ Dispatch succeeded: " + matchedMethod.getName());
                    return result;
                } catch (InvocationTargetException e) {
                    Log.e(TAG, "🔥 Method threw exception: " + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
                    if (e.getCause() != null) throw new RuntimeException(e.getCause());
                    throw new RuntimeException(e);
                }
            } else {
                Log.w(TAG, "🔥 Signature mismatch for " + methodName);

                // Inform user about mismatch
                if (activity != null) {
                    activity.runOnUiThread(() ->
                        Toast.makeText(activity, "⚠️ Restart needed: " + methodName + " signature changed", Toast.LENGTH_SHORT).show()
                    );
                }
                return getDefaultValue(signature);
            }

        } catch (Exception e) {
            Log.e(TAG, "🔥 Dispatch error: " + e.getMessage(), e);
            return getDefaultValue(signature);
        }
    }

    private Object getDefaultValue(String signature) {
        String returnTypeDesc = signature.substring(signature.lastIndexOf(')') + 1);
        switch (returnTypeDesc) {
            case "Z": return false;
            case "B": return (byte) 0;
            case "S": return (short) 0;
            case "C": return '\u0000';
            case "I": return 0;
            case "J": return 0L;
            case "F": return 0f;
            case "D": return 0.0;
            default:  return null; // Objects and void
        }
    }

    private boolean isAssignableFrom(Class<?> paramType, Class<?> argType) {
        if (paramType.isAssignableFrom(argType)) return true;
        // Handle primitive boxing
        if (paramType == int.class && argType == Integer.class) return true;
        if (paramType == boolean.class && argType == Boolean.class) return true;
        if (paramType == long.class && argType == Long.class) return true;
        if (paramType == float.class && argType == Float.class) return true;
        if (paramType == double.class && argType == Double.class) return true;
        if (paramType == byte.class && argType == Byte.class) return true;
        if (paramType == short.class && argType == Short.class) return true;
        if (paramType == char.class && argType == Character.class) return true;
        return false;
    }

    /**
     * Get a loaded override class by name.
     */
    public Class<?> getLoadedClass(String className) {
        return loadedClasses.get(className);
    }

    /**
     * Unregister all overrides (restore original implementations).
     */
    public void clearOverrides() {
        for (String className : loadedClasses.keySet()) {
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
        loadedClasses.clear();
    }

    // ========================================================================
    // APK Download & Install Fallback
    // ========================================================================

    /**
     * Download and install a full APK rebuild (fallback for non-UI structural changes).
     */
    public void downloadAndInstallApk(String downloadUrl) {
        Log.d(TAG, "Starting APK download from: " + downloadUrl);

        Request request = new Request.Builder()
            .url(downloadUrl)
            .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "APK download failed: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e(TAG, "APK download failed with code: " + response.code());
                    return;
                }

                try {
                    byte[] apkData = response.body() != null ? response.body().bytes() : null;
                    if (apkData == null) {
                        Log.e(TAG, "APK data is null");
                        return;
                    }

                    Log.d(TAG, "APK downloaded successfully (" + apkData.length + " bytes)");

                    File cacheDir = context.getCacheDir();
                    File apkFile = new File(cacheDir, "update.apk");
                    FileOutputStream fos = new FileOutputStream(apkFile);
                    fos.write(apkData);
                    fos.close();

                    Log.d(TAG, "APK saved to: " + apkFile.getAbsolutePath());

                    if (activity != null) {
                        activity.runOnUiThread(() -> installApk(apkFile));
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to save/install APK: " + e.getMessage());
                }
            }
        });
    }

    private void installApk(File apkFile) {
        try {
            if (activity == null) return;

            Uri uri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                uri = FileProvider.getUriForFile(
                    activity,
                    activity.getPackageName() + ".fileprovider",
                    apkFile
                );
            } else {
                uri = Uri.fromFile(apkFile);
            }

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Log.d(TAG, "Starting installation intent for: " + apkFile.getAbsolutePath());
            activity.startActivity(intent);
            Log.d(TAG, "Installation intent started");
        } catch (Exception e) {
            Log.e(TAG, "Failed to install APK: " + e.getMessage());
        }
    }

    private void cleanupOldDexFiles() {
        File[] files = dexCacheDir.listFiles();
        if (files != null && files.length > 10) {
            Arrays.sort(files, (a, b) -> Long.compare(a.lastModified(), b.lastModified()));
            for (int i = 0; i < files.length - 5; i++) {
                files[i].delete();
            }
        }
    }
}
