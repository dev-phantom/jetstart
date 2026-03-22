package com.jetstart.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project
import com.android.build.api.instrumentation.AsmClassVisitorFactory
import com.android.build.api.instrumentation.ClassContext
import com.android.build.api.instrumentation.ClassData
import com.android.build.api.instrumentation.FramesComputationMode
import com.android.build.api.instrumentation.InstrumentationParameters
import com.android.build.api.instrumentation.InstrumentationScope
import com.android.build.api.variant.AndroidComponentsExtension
import com.jetstart.gradle.asm.HotReloadClassVisitor
import org.gradle.api.provider.ListProperty
import org.gradle.api.tasks.Input
import org.objectweb.asm.ClassVisitor

/**
 * JetStart Hot Reload Gradle Plugin
 *
 * Instruments all classes with $change field for method delegation,
 * enabling true hot reload without app restart.
 */
class JetStartPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        // Create extension for configuration
        val extension = project.extensions.create(
            "jetStartHotReload",
            JetStartExtension::class.java
        )

        // Apply only to Android projects
        project.plugins.withId("com.android.application") {
            configureAndroidProject(project, extension)
        }
        project.plugins.withId("com.android.library") {
            configureAndroidProject(project, extension)
        }
    }

    private fun configureAndroidProject(project: Project, extension: JetStartExtension) {
        val androidComponents = project.extensions.getByType(AndroidComponentsExtension::class.java)

        androidComponents.onVariants { variant ->
            // Only apply to debug builds
            if (!variant.name.contains("debug", ignoreCase = true)) {
                return@onVariants
            }

            variant.instrumentation.transformClassesWith(
                HotReloadClassVisitorFactory::class.java,
                InstrumentationScope.ALL
            ) { params ->
                params.excludePackages.set(extension.excludePackages)
            }

            variant.instrumentation.setAsmFramesComputationMode(
                FramesComputationMode.COMPUTE_FRAMES_FOR_INSTRUMENTED_METHODS
            )
        }

        project.logger.lifecycle("[JetStart] Hot reload instrumentation enabled for debug builds")
    }
}

/**
 * Extension for configuring the plugin
 */
open class JetStartExtension {
    var enabled: Boolean = true
    var excludePackages: List<String> = listOf(
        "com.jetstart.hotreload",  // Don't instrument the runtime itself
        "kotlin.",
        "kotlinx.",
        "androidx.",
        "android.",
        "com.google.",
        "java.",
        "javax."
    )
}

/**
 * Parameters for the ASM transformation
 */
interface HotReloadParameters : InstrumentationParameters {
    @get:Input
    val excludePackages: ListProperty<String>
}

/**
 * Factory for creating HotReloadClassVisitor instances
 */
abstract class HotReloadClassVisitorFactory : AsmClassVisitorFactory<HotReloadParameters> {

    override fun createClassVisitor(
        classContext: ClassContext,
        nextClassVisitor: ClassVisitor
    ): ClassVisitor {
        return HotReloadClassVisitor(
            api = instrumentationContext.apiVersion.get(),
            classVisitor = nextClassVisitor,
            className = classContext.currentClassData.className
        )
    }

    override fun isInstrumentable(classData: ClassData): Boolean {
        val className = classData.className

        // Skip excluded packages
        val excludes = parameters.get().excludePackages.get()
        for (exclude in excludes) {
            if (className.startsWith(exclude)) {
                return false
            }
        }

        // Skip interfaces, annotations, enums
        if (classData.classAnnotations.contains("kotlin.Metadata")) {
            // Check if it's an interface or annotation
            // For now, instrument all Kotlin classes
        }

        // Skip R classes and BuildConfig
        if (className.endsWith(".R") ||
            className.contains(".R$") ||
            className.endsWith(".BuildConfig")) {
            return false
        }

        return true
    }
}
