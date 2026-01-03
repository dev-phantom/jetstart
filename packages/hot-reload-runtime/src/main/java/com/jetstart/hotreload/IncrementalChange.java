package com.jetstart.hotreload;

/**
 * Interface for dispatching method calls to updated implementations.
 * Every instrumented class will have a static $change field of this type.
 * When an update is loaded, this field is set to the override implementation.
 */
public interface IncrementalChange {
    /**
     * Dispatch a method call to the updated implementation.
     *
     * @param methodSignature The method signature in format "methodName_(paramTypes)returnType"
     * @param args The method arguments, with 'this' as the first argument for instance methods
     * @return The result of the method invocation
     */
    Object access$dispatch(String methodSignature, Object... args);
}
