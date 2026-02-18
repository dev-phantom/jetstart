package com.jetstart.hotreload;

/**
 * Interface for dispatching method calls to updated implementations.
 * Every instrumented class will have a static $change field of this type.
 * When an update is loaded, this field is set to the override implementation.
 *
 * This is the core of the Instant Run-style hot reload pattern:
 * 1. Gradle plugin instruments classes with: public static IncrementalChange $change;
 * 2. Methods check: if ($change != null) return $change.access$dispatch(...);
 * 3. When code changes, we load new DEX, create IncrementalChange that delegates to it
 * 4. Set $change field via reflection - now all method calls route to new code!
 */
public interface IncrementalChange {
    /**
     * Dispatch a method call to the updated implementation.
     *
     * @param methodSignature The method signature in format "methodName.(paramTypes)returnType"
     * @param args The method arguments, with 'this' as the first argument for instance methods
     * @return The result of the method invocation
     */
    Object access$dispatch(String methodSignature, Object... args);
}
