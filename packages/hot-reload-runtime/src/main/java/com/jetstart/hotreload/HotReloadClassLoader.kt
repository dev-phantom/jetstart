package com.jetstart.hotreload

import dalvik.system.DexClassLoader

/**
 * Child-First ClassLoader
 * Prioritizes loading classes from the DEX file (child) before delegating to the parent.
 * This is CRITICAL for hot reload to work, otherwise the parent classloader (which has the original class)
 * shadows the new class in the DEX, causing the "new" class to be identically equal to the "old" class,
 * leading to infinite recursion.
 */
class HotReloadClassLoader(
    dexPath: String,
    optimizedDirectory: String?,
    librarySearchPath: String?,
    parent: ClassLoader
) : DexClassLoader(dexPath, optimizedDirectory, librarySearchPath, parent) {

    override fun loadClass(name: String, resolve: Boolean): Class<*> {
        // Check if class is already loaded to prevent duplicate class definition
        var c = findLoadedClass(name)
        if (c != null) {
            if (resolve) resolveClass(c)
            return c
        }

        // Delegate system classes to parent immediately to avoid conflicts
        if (name.startsWith("java.") || name.startsWith("android.") || name.startsWith("androidx.") || name.startsWith("kotlin.")) {
            return super.loadClass(name, resolve)
        }

        // Try to find the class in THIS dex file (child-first)
        try {
            c = findClass(name)
            if (resolve) resolveClass(c)
            return c
        } catch (e: ClassNotFoundException) {
            // If not found in DEX, delegate to parent (dependencies, etc.)
            return super.loadClass(name, resolve)
        }
    }
}
