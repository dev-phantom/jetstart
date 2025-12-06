import * as fs from 'fs';
import * as path from 'path';
import { UIDefinition, DSLElement, DSLModifier, ParseResult } from './dsl-types';
import { log } from '../utils/logger';

/**
 * DSL Parser
 * Converts Kotlin Compose code to JSON DSL for runtime interpretation
 */
export class DSLParser {
  private static readonly TAG = 'DSLParser';

  /**
   * Parse a Kotlin file and extract UI definition
   */
  static parseFile(filePath: string): ParseResult {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          errors: [`File not found: ${filePath}`]
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return this.parseContent(content, filePath);
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to read file: ${error}`]
      };
    }
  }

  /**
   * Parse Kotlin content and extract UI definition
   */
  static parseContent(content: string, filePath: string): ParseResult {
    try {
      log(`Parsing Kotlin file: ${path.basename(filePath)}`);

      // FIRST: Check if there's a getDefaultDSL() function with JSON
      const dslFromFunction = this.extractDSLFromFunction(content);
      if (dslFromFunction) {
        log(`Extracted DSL from getDefaultDSL(): ${dslFromFunction.length} bytes`);
        return {
          success: true,
          dsl: JSON.parse(dslFromFunction)
        };
      }

      // FALLBACK: Try to find @Composable functions with Compose code
      const composableMatch = this.findMainComposable(content);

      if (!composableMatch) {
        log('No main composable found, generating default DSL');
        return {
          success: true,
          dsl: this.generateDefaultDSL()
        };
      }

      // Parse the composable body
      const element = this.parseComposableBody(composableMatch.body);

      const dsl: UIDefinition = {
        version: '1.0',
        screen: element
      };

      log(`Successfully parsed DSL: ${JSON.stringify(dsl).length} bytes`);

      return {
        success: true,
        dsl
      };
    } catch (error) {
      log(`Parse error: ${error}`);
      return {
        success: false,
        errors: [`Parse error: ${error}`]
      };
    }
  }

  /**
   * Extract DSL JSON from getDefaultDSL() or similar function (legacy support)
   */
  private static extractDSLFromFunction(content: string): string | null {
    // Look for functions that return JSON strings (legacy approach)
    const functionRegex = /fun\s+getDefaultDSL\s*\(\s*\)\s*:\s*String\s*\{\s*return\s*"""([\s\S]*?)"""/;
    const match = content.match(functionRegex);

    if (match && match[1]) {
      let jsonString = match[1].trim();
      jsonString = jsonString.replace(/\.trimIndent\(\)/, '');
      return jsonString;
    }

    return null;
  }

  /**
   * Find the main @Composable function in the file
   */
  private static findMainComposable(content: string): { name: string; body: string } | null {
    // Look for @Composable functions (AppContent, MainScreen, etc.)
    const composableRegex = /@Composable\s+fun\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const matches = [...content.matchAll(composableRegex)];

    log(`Found ${matches.length} @Composable functions`);

    if (matches.length === 0) {
      log('No @Composable functions found in file');
      return null;
    }

    // Use the first composable function (should be AppContent, not LoadingScreen)
    const match = matches[0];
    const functionName = match[1];
    log(`Parsing composable function: ${functionName}`);

    const startIndex = match.index! + match[0].length;

    // Extract the function body (handle nested braces)
    const body = this.extractFunctionBody(content, startIndex);
    log(`Extracted function body: ${body.substring(0, 100)}...`);

    return {
      name: functionName,
      body
    };
  }

  /**
   * Extract function body handling nested braces
   */
  private static extractFunctionBody(content: string, startIndex: number): string {
    let braceCount = 1;
    let endIndex = startIndex;

    while (braceCount > 0 && endIndex < content.length) {
      if (content[endIndex] === '{') braceCount++;
      if (content[endIndex] === '}') braceCount--;
      endIndex++;
    }

    return content.substring(startIndex, endIndex - 1).trim();
  }

  /**
   * Parse the composable body and extract UI structure
   */
  private static parseComposableBody(body: string): DSLElement {
    // Try to find the root element (Column, Row, Box, etc.)
    const layoutMatch = body.match(/(Column|Row|Box)\s*\(/);

    if (!layoutMatch) {
      // Fallback: Simple text content
      const textMatch = body.match(/Text\s*\(\s*text\s*=\s*"([^"]+)"/);
      if (textMatch) {
        return {
          type: 'Text',
          text: textMatch[1]
        };
      }

      // Default fallback
      return {
        type: 'Column',
        modifier: { fillMaxSize: true, padding: 16 },
        horizontalAlignment: 'CenterHorizontally',
        verticalArrangement: 'Center',
        children: [
          {
            type: 'Text',
            text: 'Hot Reload Active',
            style: 'headlineMedium'
          }
        ]
      };
    }

    const layoutType = layoutMatch[1];
    const layoutStartIndex = layoutMatch.index! + layoutMatch[0].length;

    // Extract FULL layout declaration (parameters + body with children)
    // We need to extract from after "Column(" to the end, including ) { ... }
    const layoutFullContent = body.substring(layoutStartIndex);

    return this.parseLayout(layoutType, layoutFullContent);
  }

  /**
   * Parse a layout element (Column, Row, Box)
   */
  private static parseLayout(type: string, content: string): DSLElement {
    const element: DSLElement = { type };

    // Parse modifier
    const modifierMatch = content.match(/modifier\s*=\s*Modifier([^,\n}]+)/);
    if (modifierMatch) {
      element.modifier = this.parseModifier(modifierMatch[1]);
    }

    // Parse alignment
    const alignmentMatch = content.match(/horizontalAlignment\s*=\s*Alignment\.(\w+)/);
    if (alignmentMatch) {
      element.horizontalAlignment = alignmentMatch[1];
    }

    const arrangementMatch = content.match(/verticalArrangement\s*=\s*Arrangement\.(\w+)/);
    if (arrangementMatch) {
      element.verticalArrangement = arrangementMatch[1];
    }

    // Parse children (content inside the braces)
    const childrenMatch = content.match(/\)\s*\{([\s\S]+)\}$/);
    if (childrenMatch) {
      element.children = this.parseChildren(childrenMatch[1]);
    }

    return element;
  }

  /**
   * Parse modifier chain
   */
  private static parseModifier(modifierChain: string): DSLModifier {
    const modifier: DSLModifier = {};

    if (modifierChain.includes('.fillMaxSize()')) modifier.fillMaxSize = true;
    if (modifierChain.includes('.fillMaxWidth()')) modifier.fillMaxWidth = true;
    if (modifierChain.includes('.fillMaxHeight()')) modifier.fillMaxHeight = true;

    const paddingMatch = modifierChain.match(/\.padding\((\d+)\.dp\)/);
    if (paddingMatch) {
      modifier.padding = parseInt(paddingMatch[1]);
    }

    const sizeMatch = modifierChain.match(/\.size\((\d+)\.dp\)/);
    if (sizeMatch) {
      modifier.size = parseInt(sizeMatch[1]);
    }

    const heightMatch = modifierChain.match(/\.height\((\d+)\.dp\)/);
    if (heightMatch) {
      modifier.height = parseInt(heightMatch[1]);
    }

    const widthMatch = modifierChain.match(/\.width\((\d+)\.dp\)/);
    if (widthMatch) {
      modifier.width = parseInt(widthMatch[1]);
    }

    return modifier;
  }

  /**
   * Parse children elements (handles multi-line elements)
   * Maintains source code order
   */
  private static parseChildren(content: string): DSLElement[] {
    // Remove all newlines and extra whitespace for easier parsing
    const normalized = content.replace(/\s+/g, ' ');

    // Track elements with their positions for proper ordering
    const elements: Array<{ position: number; element: DSLElement }> = [];
    const usedText = new Set<string>();

    // First pass: Parse Button elements and track their text to avoid duplicates
    const buttonRegex = /Button\s*\(\s*onClick\s*=\s*\{[^}]*\}(?:[^)]*modifier\s*=\s*Modifier\.fillMaxWidth\s*\(\s*\))?[^)]*\)\s*\{\s*Text\s*\(\s*"([^"]+)"\s*\)/g;
    let match;
    while ((match = buttonRegex.exec(normalized)) !== null) {
      const buttonText = match[1];
      elements.push({
        position: match.index!,
        element: {
          type: 'Button',
          text: buttonText,
          onClick: 'handleButtonClick',
          modifier: normalized.includes('fillMaxWidth') ? { fillMaxWidth: true } : undefined
        }
      });
      usedText.add(buttonText);
    }

    // Parse Spacer elements
    const spacerRegex = /Spacer\s*\(\s*modifier\s*=\s*Modifier\.height\s*\(\s*(\d+)\.dp\s*\)/g;
    while ((match = spacerRegex.exec(normalized)) !== null) {
      elements.push({
        position: match.index!,
        element: {
          type: 'Spacer',
          height: parseInt(match[1])
        }
      });
    }

    // Parse Text elements (multiple patterns, skip if text is in a button)
    const textPatterns = [
      /Text\s*\(\s*text\s*=\s*"([^"]+)"[^)]*style\s*=\s*MaterialTheme\.typography\.(\w+)/g,
      /Text\s*\(\s*"([^"]+)"[^)]*style\s*=\s*MaterialTheme\.typography\.(\w+)/g,
      /Text\s*\(\s*text\s*=\s*"([^"]+)"/g,
      /Text\s*\(\s*"([^"]+)"\s*\)/g
    ];

    for (const regex of textPatterns) {
      while ((match = regex.exec(normalized)) !== null) {
        const text = match[1];
        // Skip if this text is already used in a button
        if (!usedText.has(text)) {
          elements.push({
            position: match.index!,
            element: {
              type: 'Text',
              text: text,
              style: match[2] || undefined
            }
          });
          usedText.add(text);
        }
      }
    }

    // Sort by position to maintain source order
    elements.sort((a, b) => a.position - b.position);

    // Return just the elements, in correct order
    return elements.map(e => e.element);
  }

  /**
   * Extract content within parentheses (handles nesting)
   */
  private static extractParenthesesContent(content: string, startIndex: number): string {
    let parenCount = 1;
    let endIndex = startIndex;

    while (parenCount > 0 && endIndex < content.length) {
      if (content[endIndex] === '(') parenCount++;
      if (content[endIndex] === ')') parenCount--;
      endIndex++;
    }

    return content.substring(startIndex, endIndex - 1);
  }

  /**
   * Generate default DSL when parsing fails
   */
  private static generateDefaultDSL(): UIDefinition {
    return {
      version: '1.0',
      screen: {
        type: 'Column',
        modifier: {
          fillMaxSize: true,
          padding: 16
        },
        horizontalAlignment: 'CenterHorizontally',
        verticalArrangement: 'Center',
        children: [
          {
            type: 'Text',
            text: 'Welcome to JetStart! 🚀',
            style: 'headlineMedium'
          },
          {
            type: 'Spacer',
            height: 16
          },
          {
            type: 'Text',
            text: 'Edit your code to see hot reload',
            style: 'bodyMedium'
          }
        ]
      }
    };
  }
}
