import * as fs from 'fs';
import * as path from 'path';
import { UIDefinition, DSLElement, DSLModifier, ParseResult } from './dsl-types';
import { log } from '../utils/logger';
import { Tokenizer, KotlinParser } from './kotlin-parser';

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

      // FIRST: Check if there's a getDefaultDSL() function
      const dslFromFunction = this.extractDSLFromFunction(content);
      if (dslFromFunction) {
        return {
          success: true,
          dsl: JSON.parse(dslFromFunction)
        };
      }

      // FALLBACK: Find @Composable function
      const { main: composableMatch, library } = this.extractComposables(content);

      if (!composableMatch) {
        log('No main composable found, generating default DSL');
        return {
          success: true,
          dsl: this.generateDefaultDSL()
        };
      }

      // Tokenize and Parse the body using Recursive Descent Parser
      log(`Tokenizing composable body (${composableMatch.name})...`);
      const tokenizer = new Tokenizer(composableMatch.body);
      const tokens = tokenizer.tokenize();
      
      log(`Generated ${tokens.length} tokens. Parsing...`);
      const parser = new KotlinParser(tokens, library);
      const rootElement = parser.parse();

      const dsl: UIDefinition = {
        version: '1.0',
        screen: rootElement
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

  private static extractDSLFromFunction(content: string): string | null {
    const functionRegex = /fun\s+getDefaultDSL\s*\(\s*\)\s*:\s*String\s*\{\s*return\s*"""([\s\S]*?)"""/;
    const match = content.match(functionRegex);
    if (match && match[1]) {
      return match[1].trim().replace(/\.trimIndent\(\)/, '');
    }
    return null;
  }

  /**
   * Find the main @Composable function in the file
   */
  /**
   * Find the main @Composable and a library of all others
   */
  private static extractComposables(content: string): { main: { name: string, body: string } | null, library: Map<string, string> } {
      const library = new Map<string, string>();
      let main: { name: string, body: string } | null = null;
      
      const composableIndices = [...content.matchAll(/@Composable/g)].map(m => m.index!);
      
      for (const startIndex of composableIndices) {
        const funRegex = /fun\s+(\w+)/g;
        funRegex.lastIndex = startIndex; 
        const funMatch = funRegex.exec(content);
        
        if (!funMatch || (funMatch.index - startIndex > 200)) continue;
  
        const functionName = funMatch[1];
        const funIndex = funMatch.index;
        
        const openParenIndex = content.indexOf('(', funIndex);
        let bodyStartIndex = -1;
        
        if (openParenIndex !== -1) {
            const closeParenIndex = this.findMatchingBracket(content, openParenIndex, '(', ')');
            if (closeParenIndex !== -1) {
               bodyStartIndex = content.indexOf('{', closeParenIndex);
            }
        } else {
            bodyStartIndex = content.indexOf('{', funIndex);
        }
        
        if (bodyStartIndex === -1) continue;
  
        const bodyEndIndex = this.findMatchingBracket(content, bodyStartIndex, '{', '}');
        
        if (bodyEndIndex !== -1) {
          const body = content.substring(bodyStartIndex + 1, bodyEndIndex).trim();
          
          library.set(functionName, body);
          
          // Heuristic for Main: 'Screen' suffix or simply the largest/last one? 
          // For now, let's assume the one named 'NotesScreen' or similar is Main.
          // Or just keep the logic: "NotesScreen" (file name matches?)
          // For now, ensure we capture everything.
          
          if (!main) main = { name: functionName, body };
          // If explicitly named 'Screen', prefer it
          if (functionName.endsWith('Screen')) main = { name: functionName, body };
        }
      }
      
      return { main, library };
  }

  private static findMatchingBracket(content: string, startIndex: number, openChar: string, closeChar: string): number {
    let count = 0;
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === openChar) count++;
      else if (content[i] === closeChar) count--;
      if (count === 0) return i;
    }
    return -1;
  }


  // ... removed obsolete methods ...
  private static generateDefaultDSL(): UIDefinition {
    return {
      version: '1.0',
      screen: {
        type: 'Column',
        modifier: { fillMaxSize: true, padding: 16 },
        children: [
          { type: 'Text', text: 'Welcome to JetStart! 🚀', style: 'headlineMedium' },
          { type: 'Text', text: 'Edit your code to see hot reload', style: 'bodyMedium' }
        ]
      }
    };
  }
}
