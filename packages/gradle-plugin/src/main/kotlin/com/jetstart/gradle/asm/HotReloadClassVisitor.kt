package com.jetstart.gradle.asm

import org.objectweb.asm.ClassVisitor
import org.objectweb.asm.FieldVisitor
import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes
import org.objectweb.asm.Type

/**
 * ASM ClassVisitor that instruments classes for hot reload.
 *
 * Adds a static `$change` field of type IncrementalChange to every class.
 * Transforms all non-constructor methods to check $change and delegate if set.
 */
class HotReloadClassVisitor(
    api: Int,
    classVisitor: ClassVisitor,
    private val className: String
) : ClassVisitor(api, classVisitor) {

    companion object {
        const val CHANGE_FIELD_NAME = "\$change"
        const val INCREMENTAL_CHANGE_TYPE = "Lcom/jetstart/hotreload/IncrementalChange;"
        const val INCREMENTAL_CHANGE_INTERNAL = "com/jetstart/hotreload/IncrementalChange"
        const val DISPATCH_METHOD = "access\$dispatch"
        const val DISPATCH_SIGNATURE = "(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/Object;"
    }

    private var isInterface = false
    private var isAnnotation = false
    private var hasChangeField = false
    private lateinit var internalClassName: String

    override fun visit(
        version: Int,
        access: Int,
        name: String,
        signature: String?,
        superName: String?,
        interfaces: Array<out String>?
    ) {
        internalClassName = name
        isInterface = (access and Opcodes.ACC_INTERFACE) != 0
        isAnnotation = (access and Opcodes.ACC_ANNOTATION) != 0

        super.visit(version, access, name, signature, superName, interfaces)
    }

    override fun visitField(
        access: Int,
        name: String,
        descriptor: String,
        signature: String?,
        value: Any?
    ): FieldVisitor? {
        // Check if $change field already exists
        if (name == CHANGE_FIELD_NAME) {
            hasChangeField = true
        }
        return super.visitField(access, name, descriptor, signature, value)
    }

    override fun visitMethod(
        access: Int,
        name: String,
        descriptor: String,
        signature: String?,
        exceptions: Array<out String>?
    ): MethodVisitor? {
        val mv = super.visitMethod(access, name, descriptor, signature, exceptions)
            ?: return null

        // Don't transform interfaces, annotations, constructors, or static initializers
        if (isInterface || isAnnotation) {
            return mv
        }

        // Skip constructors and static initializers
        if (name == "<init>" || name == "<clinit>") {
            return mv
        }

        // Skip synthetic and bridge methods
        if ((access and Opcodes.ACC_SYNTHETIC) != 0 || (access and Opcodes.ACC_BRIDGE) != 0) {
            return mv
        }

        // Skip native and abstract methods
        if ((access and Opcodes.ACC_NATIVE) != 0 || (access and Opcodes.ACC_ABSTRACT) != 0) {
            return mv
        }

        // Transform the method to check $change first
        val isStatic = (access and Opcodes.ACC_STATIC) != 0
        return HotReloadMethodVisitor(
            api = api,
            methodVisitor = mv,
            className = internalClassName,
            methodName = name,
            methodDescriptor = descriptor,
            isStatic = isStatic
        )
    }

    override fun visitEnd() {
        // Add $change field if not already present and not an interface
        if (!isInterface && !isAnnotation && !hasChangeField) {
            val fv = super.visitField(
                Opcodes.ACC_PUBLIC or Opcodes.ACC_STATIC,
                CHANGE_FIELD_NAME,
                INCREMENTAL_CHANGE_TYPE,
                null,
                null
            )
            fv?.visitEnd()
        }

        super.visitEnd()
    }
}
