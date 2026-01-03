/**
 * Override Generator
 * Generates $override classes that implement IncrementalChange interface.
 * These classes contain the new method implementations and route calls via access$dispatch.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { log, error as logError } from '../utils/logger';

export interface OverrideGeneratorResult {
  success: boolean;
  overrideClassFiles: string[];
  errors: string[];
}

export class OverrideGenerator {
  private static readonly TAG = 'OverrideGenerator';

  /**
   * Generate $override classes for all compiled class files.
   * The override classes implement IncrementalChange and contain the new method implementations.
   *
   * Strategy: Instead of complex bytecode manipulation, we generate Kotlin source code
   * for the $Override classes and compile them. This is simpler and more maintainable.
   */
  async generateOverrides(
    classFiles: string[],
    sourceFile: string,
    outputDir: string
  ): Promise<OverrideGeneratorResult> {
    const overrideClassFiles: string[] = [];
    const errors: string[] = [];

    try {
      // Read the original Kotlin source to understand method signatures
      const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

      // Parse class and method information from source
      const classInfo = this.parseKotlinSource(sourceContent, sourceFile);

      if (classInfo.length === 0) {
        errors.push('No classes found in source file');
        return { success: false, overrideClassFiles: [], errors };
      }

      // Generate override class source for each class
      for (const info of classInfo) {
        const overrideSource = this.generateOverrideSource(info);
        const overrideSourcePath = path.join(outputDir, `${info.className}\$override.kt`);

        fs.writeFileSync(overrideSourcePath, overrideSource);
        log(`Generated override source: ${info.className}$override.kt`);

        // Track the generated source file
        overrideClassFiles.push(overrideSourcePath);
      }

      return {
        success: true,
        overrideClassFiles,
        errors: []
      };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      errors.push(errorMsg);
      return { success: false, overrideClassFiles: [], errors };
    }
  }

  /**
   * Parse Kotlin source file to extract class and method information
   */
  private parseKotlinSource(source: string, filePath: string): ClassInfo[] {
    const classes: ClassInfo[] = [];

    // Extract package name
    const packageMatch = source.match(/^package\s+([\w.]+)/m);
    const packageName = packageMatch ? packageMatch[1] : '';

    // Simple regex-based parsing for class definitions
    // This handles basic cases - complex nested classes may need more sophisticated parsing
    const classRegex = /(?:class|object)\s+(\w+)(?:\s*:\s*[\w\s,<>]+)?\s*\{/g;
    let classMatch;

    while ((classMatch = classRegex.exec(source)) !== null) {
      const className = classMatch[1];
      const classStartIndex = classMatch.index;

      // Find matching closing brace
      let braceCount = 0;
      let classEndIndex = classStartIndex;
      let inString = false;
      let stringChar = '';

      for (let i = classStartIndex; i < source.length; i++) {
        const char = source[i];
        const prevChar = i > 0 ? source[i - 1] : '';

        // Handle string literals
        if ((char === '"' || char === '\'') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }

        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              classEndIndex = i;
              break;
            }
          }
        }
      }

      const classBody = source.substring(classStartIndex, classEndIndex + 1);
      const methods = this.parseMethodsFromClassBody(classBody, className);

      classes.push({
        packageName,
        className,
        fullClassName: packageName ? `${packageName}.${className}` : className,
        methods
      });
    }

    // Also handle top-level functions (they go in FileNameKt class)
    const topLevelMethods = this.parseTopLevelFunctions(source, filePath);
    if (topLevelMethods.length > 0) {
      const fileName = path.basename(filePath, '.kt');
      const ktClassName = fileName.charAt(0).toUpperCase() + fileName.slice(1) + 'Kt';

      classes.push({
        packageName,
        className: ktClassName,
        fullClassName: packageName ? `${packageName}.${ktClassName}` : ktClassName,
        methods: topLevelMethods
      });
    }

    return classes;
  }

  /**
   * Parse methods from a class body
   */
  private parseMethodsFromClassBody(classBody: string, className: string): MethodInfo[] {
    const methods: MethodInfo[] = [];

    // Match function definitions
    // This regex handles: fun name(params): ReturnType
    const funRegex = /fun\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([\w<>?,\s]+))?\s*[{=]/g;
    let funMatch;

    while ((funMatch = funRegex.exec(classBody)) !== null) {
      const methodName = funMatch[1];
      const paramsStr = funMatch[2];
      const returnType = funMatch[3]?.trim() || 'Unit';

      // Parse parameters
      const params = this.parseParameters(paramsStr);

      // Generate method signature for dispatch
      const signature = this.generateMethodSignature(methodName, params, returnType);

      methods.push({
        name: methodName,
        parameters: params,
        returnType,
        signature,
        isStatic: false // Assume instance method, TODO: detect companion object
      });
    }

    return methods;
  }

  /**
   * Parse top-level functions (not inside a class)
   */
  private parseTopLevelFunctions(source: string, filePath: string): MethodInfo[] {
    const methods: MethodInfo[] = [];

    // Remove class bodies first to get only top-level content
    let topLevelContent = source;

    // Remove all class/object bodies
    const classRegex = /(?:class|object)\s+\w+[^{]*\{/g;
    let match;
    const classPositions: { start: number; end: number }[] = [];

    while ((match = classRegex.exec(source)) !== null) {
      const startIndex = match.index;
      let braceCount = 0;
      let endIndex = startIndex;
      let inString = false;
      let stringChar = '';

      for (let i = startIndex; i < source.length; i++) {
        const char = source[i];
        const prevChar = i > 0 ? source[i - 1] : '';

        if ((char === '"' || char === '\'') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }

        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIndex = i;
              break;
            }
          }
        }
      }

      classPositions.push({ start: startIndex, end: endIndex + 1 });
    }

    // Sort and remove class bodies from end to start to maintain indices
    classPositions.sort((a, b) => b.start - a.start);
    for (const pos of classPositions) {
      topLevelContent = topLevelContent.substring(0, pos.start) + topLevelContent.substring(pos.end);
    }

    // Now parse functions from top-level content
    const funRegex = /fun\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([\w<>?,\s]+))?\s*[{=]/g;
    let funMatch;

    while ((funMatch = funRegex.exec(topLevelContent)) !== null) {
      const methodName = funMatch[1];
      const paramsStr = funMatch[2];
      const returnType = funMatch[3]?.trim() || 'Unit';

      const params = this.parseParameters(paramsStr);
      const signature = this.generateMethodSignature(methodName, params, returnType);

      methods.push({
        name: methodName,
        parameters: params,
        returnType,
        signature,
        isStatic: true // Top-level functions are static
      });
    }

    return methods;
  }

  /**
   * Parse parameter string into typed parameters
   */
  private parseParameters(paramsStr: string): ParameterInfo[] {
    if (!paramsStr.trim()) return [];

    const params: ParameterInfo[] = [];

    // Split by comma, but respect generics
    let depth = 0;
    let current = '';

    for (const char of paramsStr) {
      if (char === '<' || char === '(') depth++;
      if (char === '>' || char === ')') depth--;

      if (char === ',' && depth === 0) {
        if (current.trim()) {
          const param = this.parseParameter(current.trim());
          if (param) params.push(param);
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      const param = this.parseParameter(current.trim());
      if (param) params.push(param);
    }

    return params;
  }

  /**
   * Parse a single parameter definition
   */
  private parseParameter(paramStr: string): ParameterInfo | null {
    // Handle "name: Type" or "name: Type = default"
    const match = paramStr.match(/(\w+)\s*:\s*([\w<>?,.\s]+?)(?:\s*=.*)?$/);
    if (!match) return null;

    return {
      name: match[1],
      type: match[2].trim()
    };
  }

  /**
   * Generate a method signature string for dispatch routing
   */
  private generateMethodSignature(methodName: string, params: ParameterInfo[], returnType: string): string {
    // Format: methodName.(paramTypes)returnType
    // Using JVM-style descriptors
    const paramDescriptors = params.map(p => this.typeToDescriptor(p.type)).join('');
    const returnDescriptor = this.typeToDescriptor(returnType);
    return `${methodName}.(${paramDescriptors})${returnDescriptor}`;
  }

  /**
   * Convert Kotlin type to JVM descriptor-style string
   */
  private typeToDescriptor(type: string): string {
    // Simplified mapping - expand as needed
    const typeMap: Record<string, string> = {
      'Unit': 'V',
      'Int': 'I',
      'Long': 'J',
      'Float': 'F',
      'Double': 'D',
      'Boolean': 'Z',
      'Byte': 'B',
      'Char': 'C',
      'Short': 'S',
      'String': 'Ljava/lang/String;',
      'Any': 'Ljava/lang/Object;',
    };

    // Handle nullable types
    const nonNullType = type.replace('?', '');

    if (typeMap[nonNullType]) {
      return typeMap[nonNullType];
    }

    // Handle generic types like List<String>
    const genericMatch = nonNullType.match(/^(\w+)<.*>$/);
    if (genericMatch) {
      return `L${genericMatch[1]};`;
    }

    // Default to object type
    return `L${nonNullType.replace('.', '/')};`;
  }

  /**
   * Generate Kotlin source code for the $override class
   */
  private generateOverrideSource(classInfo: ClassInfo): string {
    const { packageName, className, methods } = classInfo;

    const lines: string[] = [];

    // Package declaration
    if (packageName) {
      lines.push(`package ${packageName}`);
      lines.push('');
    }

    // Import IncrementalChange
    lines.push('import com.jetstart.hotreload.IncrementalChange');
    lines.push('');

    // Generate override class
    lines.push(`/**`);
    lines.push(` * Generated override class for ${className}`);
    lines.push(` * Implements IncrementalChange to provide hot-reloaded method implementations`);
    lines.push(` */`);
    lines.push(`class ${className}\$override(private val newInstance: ${className}) : IncrementalChange {`);
    lines.push('');

    // Generate access$dispatch method
    lines.push('    override fun access\$dispatch(methodSignature: String, vararg args: Any?): Any? {');
    lines.push('        return when (methodSignature) {');

    for (const method of methods) {
      const { name, parameters, returnType, signature } = method;

      // Generate case for this method
      lines.push(`            "${signature}" -> {`);

      // Cast arguments and call the new method
      if (parameters.length === 0) {
        if (returnType === 'Unit') {
          lines.push(`                newInstance.${name}()`);
          lines.push('                null');
        } else {
          lines.push(`                newInstance.${name}()`);
        }
      } else {
        // Build argument list with casts
        const argCasts = parameters.map((p, i) => {
          // args[0] is 'this' for instance methods, so actual args start at index 1
          const argIndex = method.isStatic ? i : i + 1;
          return `args[${argIndex}] as ${p.type}`;
        });

        if (returnType === 'Unit') {
          lines.push(`                newInstance.${name}(${argCasts.join(', ')})`);
          lines.push('                null');
        } else {
          lines.push(`                newInstance.${name}(${argCasts.join(', ')})`);
        }
      }

      lines.push('            }');
    }

    // Default case
    lines.push('            else -> throw IllegalArgumentException("Unknown method: $methodSignature")');
    lines.push('        }');
    lines.push('    }');
    lines.push('}');

    return lines.join('\n');
  }
}

interface ClassInfo {
  packageName: string;
  className: string;
  fullClassName: string;
  methods: MethodInfo[];
}

interface MethodInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  signature: string;
  isStatic: boolean;
}

interface ParameterInfo {
  name: string;
  type: string;
}
