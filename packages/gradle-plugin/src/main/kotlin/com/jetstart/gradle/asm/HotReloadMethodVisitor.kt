package com.jetstart.gradle.asm

import org.objectweb.asm.Label
import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes
import org.objectweb.asm.Type

/**
 * ASM MethodVisitor that transforms methods for hot reload.
 *
 * Injects code at the beginning of each method to:
 * 1. Load the $change field
 * 2. If not null, delegate to access$dispatch with method signature and args
 * 3. Otherwise, execute the original method body
 *
 * Generated code pattern:
 * ```
 * IncrementalChange change = ClassName.$change;
 * if (change != null) {
 *     return change.access$dispatch("methodName.(params)return", new Object[]{this, arg1, arg2...});
 * }
 * // original method body
 * ```
 */
class HotReloadMethodVisitor(
    api: Int,
    methodVisitor: MethodVisitor,
    private val className: String,
    private val methodName: String,
    private val methodDescriptor: String,
    private val isStatic: Boolean
) : MethodVisitor(api, methodVisitor) {

    override fun visitCode() {
        super.visitCode()
        injectChangeCheck()
    }

    private fun injectChangeCheck() {
        // Create signature string: "methodName.(param1,param2)returnType"
        val signature = "$methodName.$methodDescriptor"

        // Labels for control flow
        val skipLabel = Label()

        // Load $change field: IncrementalChange change = ClassName.$change;
        mv.visitFieldInsn(
            Opcodes.GETSTATIC,
            className,
            HotReloadClassVisitor.CHANGE_FIELD_NAME,
            HotReloadClassVisitor.INCREMENTAL_CHANGE_TYPE
        )

        // Duplicate for null check and later use
        mv.visitInsn(Opcodes.DUP)

        // If null, skip to original code
        mv.visitJumpInsn(Opcodes.IFNULL, skipLabel)

        // change is not null, call access$dispatch

        // Push method signature string
        mv.visitLdcInsn(signature)

        // Create Object[] for arguments
        val argTypes = Type.getArgumentTypes(methodDescriptor)
        val returnType = Type.getReturnType(methodDescriptor)

        // Calculate array size: +1 for 'this' if instance method
        val arraySize = argTypes.size + (if (isStatic) 0 else 1)

        // Create array: new Object[arraySize]
        pushInt(arraySize)
        mv.visitTypeInsn(Opcodes.ANEWARRAY, "java/lang/Object")

        // Fill array with arguments
        var localVarIndex = if (isStatic) 0 else 1  // Skip 'this' for static methods
        var arrayIndex = 0

        // Add 'this' reference for instance methods
        if (!isStatic) {
            mv.visitInsn(Opcodes.DUP)
            pushInt(0)
            mv.visitVarInsn(Opcodes.ALOAD, 0)  // Load 'this'
            mv.visitInsn(Opcodes.AASTORE)
            arrayIndex = 1
        }

        // Add each argument
        for (argType in argTypes) {
            mv.visitInsn(Opcodes.DUP)
            pushInt(arrayIndex)
            loadAndBoxArgument(argType, localVarIndex)
            mv.visitInsn(Opcodes.AASTORE)

            localVarIndex += argType.size  // Long and Double take 2 slots
            arrayIndex++
        }

        // Call access$dispatch(String, Object[]): Object
        mv.visitMethodInsn(
            Opcodes.INVOKEINTERFACE,
            HotReloadClassVisitor.INCREMENTAL_CHANGE_INTERNAL,
            HotReloadClassVisitor.DISPATCH_METHOD,
            HotReloadClassVisitor.DISPATCH_SIGNATURE,
            true
        )

        // Handle return value
        when (returnType.sort) {
            Type.VOID -> {
                mv.visitInsn(Opcodes.POP)  // Discard return value
                mv.visitInsn(Opcodes.RETURN)
            }
            Type.BOOLEAN -> {
                unboxBoolean()
                mv.visitInsn(Opcodes.IRETURN)
            }
            Type.BYTE -> {
                unboxByte()
                mv.visitInsn(Opcodes.IRETURN)
            }
            Type.CHAR -> {
                unboxChar()
                mv.visitInsn(Opcodes.IRETURN)
            }
            Type.SHORT -> {
                unboxShort()
                mv.visitInsn(Opcodes.IRETURN)
            }
            Type.INT -> {
                unboxInt()
                mv.visitInsn(Opcodes.IRETURN)
            }
            Type.LONG -> {
                unboxLong()
                mv.visitInsn(Opcodes.LRETURN)
            }
            Type.FLOAT -> {
                unboxFloat()
                mv.visitInsn(Opcodes.FRETURN)
            }
            Type.DOUBLE -> {
                unboxDouble()
                mv.visitInsn(Opcodes.DRETURN)
            }
            Type.ARRAY, Type.OBJECT -> {
                mv.visitTypeInsn(Opcodes.CHECKCAST, returnType.internalName)
                mv.visitInsn(Opcodes.ARETURN)
            }
            else -> {
                mv.visitInsn(Opcodes.ARETURN)
            }
        }

        // Skip label: pop the null $change and continue with original code
        mv.visitLabel(skipLabel)
        mv.visitInsn(Opcodes.POP)  // Pop the null $change value
    }

    private fun pushInt(value: Int) {
        when {
            value >= -1 && value <= 5 -> mv.visitInsn(Opcodes.ICONST_0 + value)
            value >= Byte.MIN_VALUE && value <= Byte.MAX_VALUE -> mv.visitIntInsn(Opcodes.BIPUSH, value)
            value >= Short.MIN_VALUE && value <= Short.MAX_VALUE -> mv.visitIntInsn(Opcodes.SIPUSH, value)
            else -> mv.visitLdcInsn(value)
        }
    }

    private fun loadAndBoxArgument(type: Type, localIndex: Int) {
        when (type.sort) {
            Type.BOOLEAN -> {
                mv.visitVarInsn(Opcodes.ILOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Boolean",
                    "valueOf",
                    "(Z)Ljava/lang/Boolean;",
                    false
                )
            }
            Type.BYTE -> {
                mv.visitVarInsn(Opcodes.ILOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Byte",
                    "valueOf",
                    "(B)Ljava/lang/Byte;",
                    false
                )
            }
            Type.CHAR -> {
                mv.visitVarInsn(Opcodes.ILOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Character",
                    "valueOf",
                    "(C)Ljava/lang/Character;",
                    false
                )
            }
            Type.SHORT -> {
                mv.visitVarInsn(Opcodes.ILOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Short",
                    "valueOf",
                    "(S)Ljava/lang/Short;",
                    false
                )
            }
            Type.INT -> {
                mv.visitVarInsn(Opcodes.ILOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Integer",
                    "valueOf",
                    "(I)Ljava/lang/Integer;",
                    false
                )
            }
            Type.LONG -> {
                mv.visitVarInsn(Opcodes.LLOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Long",
                    "valueOf",
                    "(J)Ljava/lang/Long;",
                    false
                )
            }
            Type.FLOAT -> {
                mv.visitVarInsn(Opcodes.FLOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Float",
                    "valueOf",
                    "(F)Ljava/lang/Float;",
                    false
                )
            }
            Type.DOUBLE -> {
                mv.visitVarInsn(Opcodes.DLOAD, localIndex)
                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "java/lang/Double",
                    "valueOf",
                    "(D)Ljava/lang/Double;",
                    false
                )
            }
            Type.ARRAY, Type.OBJECT -> {
                mv.visitVarInsn(Opcodes.ALOAD, localIndex)
            }
            else -> {
                mv.visitVarInsn(Opcodes.ALOAD, localIndex)
            }
        }
    }

    private fun unboxBoolean() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Boolean")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Boolean",
            "booleanValue",
            "()Z",
            false
        )
    }

    private fun unboxByte() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Byte")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Byte",
            "byteValue",
            "()B",
            false
        )
    }

    private fun unboxChar() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Character")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Character",
            "charValue",
            "()C",
            false
        )
    }

    private fun unboxShort() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Short")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Short",
            "shortValue",
            "()S",
            false
        )
    }

    private fun unboxInt() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Integer")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Integer",
            "intValue",
            "()I",
            false
        )
    }

    private fun unboxLong() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Long")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Long",
            "longValue",
            "()J",
            false
        )
    }

    private fun unboxFloat() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Float")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Float",
            "floatValue",
            "()F",
            false
        )
    }

    private fun unboxDouble() {
        mv.visitTypeInsn(Opcodes.CHECKCAST, "java/lang/Double")
        mv.visitMethodInsn(
            Opcodes.INVOKEVIRTUAL,
            "java/lang/Double",
            "doubleValue",
            "()D",
            false
        )
    }
}
