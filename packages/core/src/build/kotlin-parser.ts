// import { log } from '../utils/logger'; // Use local for debug

// Simple logger
const log = (msg: string) => console.log(`[KotlinParser] ${msg}`);

export enum TokenType {
  Identifier,
  StringLiteral,
  NumberLiteral,
  ParenOpen,
  ParenClose,
  BraceOpen,
  BraceClose,
  Equals,
  Comma,
  Dot,
  Colon,
  Keyword,
  Operator,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Tokenizer {
  private content: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(content: string) {
    this.content = content;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.position < this.content.length) {
      const char = this.content[this.position];

      if (/\s/.test(char)) {
        this.advance();
        continue;
      }

      if (char === '/' && this.peek() === '/') {
        this.skipLineComment();
        continue;
      }
      
      if (char === '/' && this.peek() === '*') {
        this.skipBlockComment();
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      if (/[0-9]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      if (char === '"') {
        tokens.push(this.readString());
        continue;
      }

      // Symbols
      if (char === '(') tokens.push(this.createToken(TokenType.ParenOpen, '('));
      else if (char === ')') tokens.push(this.createToken(TokenType.ParenClose, ')'));
      else if (char === '{') tokens.push(this.createToken(TokenType.BraceOpen, '{'));
      else if (char === '}') tokens.push(this.createToken(TokenType.BraceClose, '}'));
      else if (char === '=') tokens.push(this.createToken(TokenType.Equals, '='));
      else if (char === ',') tokens.push(this.createToken(TokenType.Comma, ','));
      else if (char === '.') tokens.push(this.createToken(TokenType.Dot, '.'));
      else if (char === ':' && this.peek() === ':') {
        // Method reference operator ::
        tokens.push(this.createToken(TokenType.Operator, '::'));
        this.advance(); // consume first :
      }
      else if (char === ':') tokens.push(this.createToken(TokenType.Colon, ':'));
      else tokens.push(this.createToken(TokenType.Operator, char)); // Generic operator for others

      this.advance();
    }
    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }

  private advance() {
    if (this.content[this.position] === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.position++;
  }

  private peek(): string {
    return this.position + 1 < this.content.length ? this.content[this.position + 1] : '';
  }

  private createToken(type: TokenType, value: string): Token {
    return { type, value, line: this.line, column: this.column };
  }

  private skipLineComment() {
    while (this.position < this.content.length && this.content[this.position] !== '\n') {
        this.position++; // Don't advance line count here, standard advance handles \n char
    }
    // Let the main loop handle the newline char
  }

  private skipBlockComment() {
    this.position += 2; // Skip /*
    while (this.position < this.content.length) {
        if (this.content[this.position] === '*' && this.peek() === '/') {
            this.position += 2;
            return;
        }
        this.advance();
    }
  }

  private readIdentifier(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    while (this.position < this.content.length && /[a-zA-Z0-9_]/.test(this.content[this.position])) {
      value += this.content[this.position];
      this.advance(); // Don't use standard advance for loop safety? Actually standard advance is safe
    }
    
    // Check keywords
    const keywords = ['val', 'var', 'fun', 'if', 'else', 'true', 'false', 'null', 'return', 'package', 'import', 'class', 'object'];
    const type = keywords.includes(value) ? TokenType.Keyword : TokenType.Identifier;
    
    // Correction: We advanced tokens in the loop, but we need to create token with START position
    return { type, value, line: startLine, column: startColumn };
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    while (this.position < this.content.length && /[0-9]/.test(this.content[this.position])) {
       value += this.content[this.position];
       this.advance(); // Safe to advance as we checked condition
    }
    // Don't consume dot here to support 16.dp as 16, ., dp
    return { type: TokenType.NumberLiteral, value, line: startLine, column: startColumn };
  }

  private readString(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Skip open quote
    let value = '';
    while (this.position < this.content.length && this.content[this.position] !== '"') {
      if (this.content[this.position] === '\\') {
        this.advance();
        if (this.position < this.content.length) value += this.content[this.position];
      } else {
        value += this.content[this.position];
      }
      this.advance();
    }
    this.advance(); // Skip close quote
    return { type: TokenType.StringLiteral, value, line: startLine, column: startColumn };
  }
}

import { DSLElement } from './dsl-types';

export class KotlinParser {
  private tokens: Token[];
  private position: number = 0;
  private library: Map<string, string>;

  constructor(tokens: Token[], library: Map<string, string> = new Map()) {
    this.tokens = tokens;
    this.library = library;
  }

  parse(): any {
    log(`Parsing with ${this.tokens.length} tokens`);
    const elements = this.parseBlockContent();
    
    // Create logic root (like "Column")
    let root: any;
    if (elements.length === 1) {
        root = elements[0];
    } else {
        root = {
            type: 'Column',
            children: elements
        };
    }

    // Transform to DivKit
    const divBody = this.mapToDivKit(root);

    // Wrap in standard DivKit structure
    return {
        "templates": {},
        "card": {
            "log_id": "hot_reload_screen",
            "states": [
                {
                    "state_id": 0,
                    "div": divBody
                }
            ]
        }
    };
  }

  private mapToDivKit(element: any): any {
      if (!element) return null;

      // Base properties
      const paddings = this.mapModifiersToPaddings(element.modifier);
      const width = this.mapModifiersToSize(element.modifier, 'width');
      const height = this.mapModifiersToSize(element.modifier, 'height');
      
      const commonProps: any = {};
      if (paddings) commonProps.paddings = paddings;
      if (width) commonProps.width = width;
      if (height) commonProps.height = height;

      // Type mapping
      switch (element.type) {
          case 'Column':
              return {
                  type: 'container',
                  orientation: 'vertical',
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter((Boolean as any)) || [],
                  ...commonProps
              };
          case 'Row':
              return {
                  type: 'container',
                  orientation: 'horizontal',
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter((Boolean as any)) || [],
                  ...commonProps
              };
          case 'Box':
              return {
                  type: 'container',
                  layout_mode: 'overlap', // DivKit overlap container
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter((Boolean as any)) || [],
                  ...commonProps
              };
          case 'Text':
              return {
                  type: 'text',
                  text: element.text || '',
                  text_color: element.color || '#000000',
                  font_size: this.mapStyleToSize(element.style),
                  ...commonProps
              };
          case 'Button':
          case 'FloatingActionButton':
              // Buttons are containers with actions
              const btnContent = element.children && element.children.length > 0 
                  ? this.mapToDivKit(element.children[0]) // Icon or Text
                  : { type: 'text', text: element.text || "Button" };
                  
              return {
                  type: 'container',
                  items: [btnContent],
                  actions: element.onClick ? [{
                      log_id: "click",
                      url: "div-action://set_variable?name=debug_click&value=true" // Placeholder
                      // Real logic: url: `div-action://${element.onClick}` if we had logic engine
                  }] : [],
                  background: [{ type: 'solid', color: element.color || '#6200EE' }],
                  ...commonProps
              };
          case 'Icon':
              return {
                  type: 'image',
                  // DivKit needs URL. We map Icons.Default.Add to a resource or web URL?
                  // DivKit supports local resources "android.resource://"
                  image_url: "https://img.icons8.com/material-outlined/24/000000/add.png", // Fallback for demo
                  tint_color: element.tint,
                  width: { type: 'fixed', value: 24 },
                  height: { type: 'fixed', value: 24 },
                  ...commonProps
              };
          case 'Scaffold':
              // Scaffold is a layout container - map children to DivKit container
              return {
                  type: 'container',
                  orientation: 'vertical',
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter(Boolean) || [],
                  ...commonProps
              };
          case 'Card':
              return {
                  type: 'container',
                  orientation: 'vertical',
                  background: [{ type: 'solid', color: '#FFFFFF' }],
                  border: { corner_radius: 8 },
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter(Boolean) || [],
                  ...commonProps
              };
          case 'LazyVerticalStaggeredGrid':
          case 'LazyColumn':
          case 'LazyRow':
              // Lazy lists - map as containers
              return {
                  type: 'container',
                  orientation: element.type === 'LazyRow' ? 'horizontal' : 'vertical',
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter(Boolean) || [],
                  ...commonProps
              };
          case 'OutlinedTextField':
          case 'TextField':
              return {
                  type: 'input',
                  hint_text: element.placeholder || 'Enter text...',
                  ...commonProps
              };
          case 'Spacer':
              return {
                  type: 'separator',
                  delimiter_style: { color: '#00000000' }, // transparent
                  ...commonProps
              };
          case 'AlertDialog':
          case 'Dialog':
              // Dialogs - just render the content for preview
              return {
                  type: 'container',
                  orientation: 'vertical',
                  items: element.children?.map((c: any) => this.mapToDivKit(c)).filter(Boolean) || [],
                  ...commonProps
              };
          case 'AssistChip':
          case 'SuggestionChip':
          case 'FilterChip':
              return {
                  type: 'text',
                  text: element.text || 'Chip',
                  text_color: '#6200EE',
                  font_size: 12,
                  border: { corner_radius: 16 },
                  background: [{ type: 'solid', color: '#E8DEF8' }],
                  paddings: { left: 12, right: 12, top: 6, bottom: 6 },
                  ...commonProps
              };
          default:
              // Fallback
              return {
                  type: 'text',
                  text: `[${element.type}]`,
                  text_color: '#FF0000'
              };
      }
  }

  private mapModifiersToPaddings(modifier: any): any {
      if (!modifier) return null;
      const p: any = {};
      if (modifier.padding) { p.left=modifier.padding; p.right=modifier.padding; p.top=modifier.padding; p.bottom=modifier.padding; }
      if (modifier.paddingHorizontal) { p.left=modifier.paddingHorizontal; p.right=modifier.paddingHorizontal; }
      if (modifier.paddingVertical) { p.top=modifier.paddingVertical; p.bottom=modifier.paddingVertical; }
      return Object.keys(p).length > 0 ? p : null;
  }

  private mapModifiersToSize(modifier: any, dim: 'width' | 'height'): any {
      if (!modifier) return { type: 'wrap_content' };
      if (dim === 'width' && modifier.fillMaxWidth) return { type: 'match_parent' };
      if (dim === 'height' && modifier.fillMaxHeight) return { type: 'match_parent' };
      if (modifier[dim]) return { type: 'fixed', value: modifier[dim] };
      return { type: 'wrap_content' };
  }

  private mapStyleToSize(style: string | undefined): number {
      if (!style) return 14;
      if (style.includes('Large')) return 22;
      if (style.includes('Medium')) return 18;
      if (style.includes('Small')) return 14;
      return 14;
  }

  private parseBlockContent(): DSLElement[] {
    const elements: DSLElement[] = [];

    // Check for lambda parameters at the start of block: { padding -> ... }
    this.skipLambdaParameters();

    while (!this.isAtEnd() && !this.check(TokenType.BraceClose)) {
      const startPos = this.position;
      const currentToken = this.peekCurrent();
      log(`[parseBlockContent] pos=${startPos}, token=${currentToken.value} (${TokenType[currentToken.type]})`);

      try {
        const element = this.parseStatement();
        if (element) {
          log(`[parseBlockContent] Got element: ${element.type}`);
          elements.push(element);
        }
        // If we didn't move forward, force advance to avoid infinite loop
        if (this.position === startPos) {
            log(`[parseBlockContent] Skipping stuck token: ${JSON.stringify(currentToken)}`);
            this.advance();
        }
      } catch (e) {
          log(`Error parsing statement at ${this.position}: ${e}`);
          this.advance(); // Force advance to break loop if stuck
      }
    }

    log(`[parseBlockContent] Returning ${elements.length} elements`);
    return elements;
  }

  private parseStatement(): DSLElement | null {
      try {
          if (this.check(TokenType.Identifier)) {
              const nextToken = this.peek();

              // Case 1: Direct function call - Identifier followed by ( or {
              if (nextToken.type === TokenType.ParenOpen || nextToken.type === TokenType.BraceOpen) {
                   this.advance(); // consume identifier so parseFunctionCall can see it as previous()
                   return this.parseFunctionCall();
              }

              // Case 2: Assignment statement - identifier = expression
              // This handles: showAddDialog = true, x = foo.bar(), etc.
              if (nextToken.type === TokenType.Equals) {
                  this.advance(); // consume identifier
                  this.skipAssignment(); // consume = and expression
                  return null; // Assignment is not a UI element
              }

              // Case 3: Identifier chain (a.b.c) possibly followed by call or assignment
              this.advance(); // consume first identifier
              while (this.match(TokenType.Dot)) {
                  this.match(TokenType.Identifier);
              }

              // After consuming chain, check what follows
              if (this.check(TokenType.Equals)) {
                  // Chain assignment: foo.bar = value
                  this.skipAssignment();
                  return null;
              }

              if (this.check(TokenType.ParenOpen) || this.check(TokenType.BraceOpen)) {
                  // Chain ends with function call
                  if (this.match(TokenType.ParenOpen)) {
                      this.consumeParenthesesContent(); // consume args (we're already past the open paren)
                  }
                  if (this.check(TokenType.BraceOpen)) {
                      this.consume(TokenType.BraceOpen, "Expect '{'");
                      const children = this.parseBlockContent();
                      this.consume(TokenType.BraceClose, "Expect '}'");
                      return {
                          type: 'BlockWrapper',
                          children
                      };
                  }
                  return null;
              }

              return null; // Just an identifier access, skip
          }

          if (this.match(TokenType.Keyword)) {
              const keyword = this.previous().value;
              if (keyword === 'val' || keyword === 'var') {
                  this.skipDeclaration();
                  return null;
              }
              if (keyword === 'if') {
                  this.consumeUntil(TokenType.BraceOpen); // Skip condition
                  if (this.match(TokenType.BraceOpen)) {
                       const children = this.parseBlockContent();
                       this.consume(TokenType.BraceClose, "Expect '}' after if block");
                       return {
                           type: 'Box',
                           children
                       };
                  }
                  return null;
              }
          }

          return null;
      } catch (e) {
          log(`CRIT: Error in parseStatement at ${this.position}: ${e}`);
          return null; // Recover gracefully
      }
  }

  /**
   * Consume parentheses content (after opening paren has been consumed)
   */
  private consumeParenthesesContent() {
      let depth = 1;
      while (depth > 0 && !this.isAtEnd()) {
          if (this.check(TokenType.ParenOpen)) depth++;
          if (this.check(TokenType.ParenClose)) depth--;
          this.advance();
      }
  }
      

  private parseFunctionCall(): DSLElement | null {
      const name = this.previous().value;
      const element: DSLElement = {
          type: name,
          children: []
      };
      
      // INLINING LOGIC
      if (this.library && this.library.has(name)) {
           // Consume arguments at call site to advance cursor
           this.consumeParentheses(); 

           // Consume optional trailing lambda at call site if present? 
           // NoteItem(...) { } - usually not if it's a leaf, but if it has content...
           // For now assuming simplistic NoteItem(...)
           
           const body = this.library.get(name)!;
           const subLibrary = new Map(this.library);
           subLibrary.delete(name); // Prevent direct recursion

           const tokenizer = new Tokenizer(body);
           const subTokens = tokenizer.tokenize();
           const subParser = new KotlinParser(subTokens, subLibrary); // Pass library down
           
           // We need to parse the *content* of the function.
           // Function body: "Card { ... }"
           // subParser.parse() will return the Card.
           const inlined = subParser.parse();
           return inlined; 
      }

      // Standard logic: Check for arguments (...)
      let args: any = {};
      if (this.match(TokenType.ParenOpen)) {
          args = this.parseArguments();
      }
      
      if (args.modifier) element.modifier = args.modifier;
      if (args.text) element.text = args.text;
      if (args.style) element.style = args.style;
      if (args.floatingActionButton) element.floatingActionButton = args.floatingActionButton;
      if (args.placeholder) (element as any).placeholder = args.placeholder;
      if (args.label) (element as any).label = args.label;
      if (args.contentDescription) (element as any).contentDescription = args.contentDescription;
      
      // Trailing lambda
      if (this.check(TokenType.BraceOpen)) {
          this.advance(); // {
          element.children = this.parseBlockContent();
          this.consume(TokenType.BraceClose, "Expect '}' after lambda");
      }
      
      return element;
  }

  private parseArguments(): any {
      const args: any = {};

      while (!this.check(TokenType.ParenClose) && !this.isAtEnd()) {
          // Look for "name ="
          if (this.check(TokenType.Identifier) && this.peek().type === TokenType.Equals) {
              const argName = this.advance().value;
              this.advance(); // consume '='

              // Check if value is a block { ... }
              if (this.check(TokenType.BraceOpen)) {
                  this.consume(TokenType.BraceOpen, "Expect '{'");
                  const blockElements = this.parseBlockContent();
                  this.consume(TokenType.BraceClose, "Expect '}'");

                  // Handle specific named block arguments
                  if (argName === 'floatingActionButton') {
                       args.floatingActionButton = blockElements.length > 0 ? blockElements[0] : null;
                  } else if (argName === 'topBar') {
                       args.topBar = blockElements.length > 0 ? blockElements[0] : null;
                  } else if (argName === 'bottomBar') {
                       args.bottomBar = blockElements.length > 0 ? blockElements[0] : null;
                  } else if (argName === 'placeholder') {
                       // Extract text from placeholder lambda: placeholder = { Text("...") }
                       if (blockElements.length > 0 && blockElements[0].text) {
                           args.placeholder = blockElements[0].text;
                       }
                  } else if (argName === 'label') {
                       // Extract text from label lambda: label = { Text("...") }
                       if (blockElements.length > 0 && blockElements[0].text) {
                           args.label = blockElements[0].text;
                       }
                  } else if (argName === 'title') {
                       // Extract title for AlertDialog: title = { Text("New Note") }
                       if (blockElements.length > 0 && blockElements[0].text) {
                           args.title = blockElements[0].text;
                       }
                  } else if (argName === 'text') {
                       // Dialog content lambda: text = { Column { ... } }
                       args.textContent = blockElements;
                  } else if (argName === 'confirmButton') {
                       // AlertDialog confirmButton lambda
                       args.confirmButton = blockElements.length > 0 ? blockElements[0] : null;
                  } else if (argName === 'dismissButton') {
                       // AlertDialog dismissButton lambda
                       args.dismissButton = blockElements.length > 0 ? blockElements[0] : null;
                  } else if (argName === 'content') {
                       args.contentChildren = blockElements;
                  } else if (argName === 'onClick') {
                       // Flag as interactive
                       args.onClick = "interaction";
                  } else {
                       // Generic: store any other lambda content
                       args[argName + 'Content'] = blockElements;
                  }
              } else {
                   // Value parsing
                   const value = this.parseValue();

                   if (argName === 'text') args.text = value;
                   if (argName === 'modifier') args.modifier = value;
                   if (argName === 'style') args.style = value;
                   if (argName === 'contentDescription') args.contentDescription = value;
                   if (argName === 'value') args.value = value;
                   if (argName === 'minLines') args.minLines = value;
                   if (argName === 'onClick') args.onClick = "interaction"; // Handle onClick = ref
              }
          } else {
             // Positional arg? Text("Foo")
             // Assume first arg is content/text for Text components
             const value = this.parseValue();
             if (typeof value === 'string') args.text = value; // Heuristic
          }

          if (!this.match(TokenType.Comma)) {
              break;
          }
      }

      this.consume(TokenType.ParenClose, "Expect ')' after arguments");
      return args;
  }

  private parseValue(): any {
      if (this.match(TokenType.StringLiteral)) {
          return this.previous().value;
      }
      if (this.match(TokenType.NumberLiteral)) {
           // check for .dp
           let num = parseFloat(this.previous().value);
           if (this.match(TokenType.Dot) && this.check(TokenType.Identifier) && this.peekCurrent().value === 'dp') {
               this.advance(); // consume dp
               // It's a dp value, return raw number for DSL usually (dsl-types expectation)
               // Modifier parsing logic handles this differently?
               // If this is passed to 'height', we just want the number.
           }
           return num;
      }
      
      // Identifier chain: MaterialTheme.typography.bodyLarge or FunctionCall(args)
      if (this.match(TokenType.Identifier)) {
          let chain = this.previous().value;
          while (this.match(TokenType.Dot)) {
              if (this.match(TokenType.Identifier)) {
                  chain += '.' + this.previous().value;
              }
          }

          // Handle method reference: viewModel::onSearchQueryChanged
          if (this.check(TokenType.Operator) && this.peekCurrent().value === '::') {
              this.advance(); // consume ::
              if (this.match(TokenType.Identifier)) {
                  chain += '::' + this.previous().value;
              }
              return chain; // Return as string representation
          }

          // Modifier parsing: Modifier.padding(...).fillMaxSize()
          if (chain.startsWith('Modifier')) {
               return this.continueParsingModifier(chain);
          }

          // Check for function-like call: Color(0xFF...) or StaggeredGridCells.Fixed(2)
          if (this.check(TokenType.ParenOpen)) {
              this.consumeParentheses(); // Consume params cleanly
              return chain + "(...)"; // Return simplified representation
          }

          // Style parsing: MaterialTheme.typography.displaySmall
          if (chain.includes('typography')) {
              return chain.split('.').pop(); // return "displaySmall"
          }


          // Detect variable references (data-bound content)
          // We provide realistic mock data for common variable names to support "Visual Hot Reload"
          // regardless of runtime data availability.
          const firstChar = chain.charAt(0);
          const isLowerCase = firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
          const knownPrefixes = ['MaterialTheme', 'Icons', 'Color', 'Arrangement', 'Alignment', 'ContentScale', 'FontWeight', 'TextStyle'];
          const isKnownConstant = knownPrefixes.some(p => chain.startsWith(p));

          if (isLowerCase && !isKnownConstant) {
              return `{{ ${chain} }}`; 
          }

          return chain;
      }

      return null;
  }

  // REMOVE THIS DUPLICATE - it was already here
  private parseValueOLD(): any {
      if (this.match(TokenType.StringLiteral)) {
          return this.previous().value;
      }
      if (this.match(TokenType.NumberLiteral)) {
           let num = parseFloat(this.previous().value);
           if (this.match(TokenType.Dot) && this.check(TokenType.Identifier) && this.peekCurrent().value === 'dp') {
               this.advance();
           }
           return num;
      }

      if (this.match(TokenType.Identifier)) {
          let chain = this.previous().value;
          while (this.match(TokenType.Dot)) {
              if (this.match(TokenType.Identifier)) {
                  chain += '.' + this.previous().value;
              }
          }

          if (this.check(TokenType.Operator) && this.peekCurrent().value === '::') {
              this.advance();
              if (this.match(TokenType.Identifier)) {
                  chain += '::' + this.previous().value;
              }
              return chain;
          }

          if (chain.startsWith('Modifier')) {
               return this.continueParsingModifier(chain);
          }

          if (this.check(TokenType.ParenOpen)) {
              this.consumeParentheses();
              return chain + "(...)";
          }

          if (chain.includes('typography')) {
              return chain.split('.').pop(); // return "displaySmall"
          }
          return chain;
      }
      
      return null;
  }
  
  private consumeParentheses() {
      if (this.match(TokenType.ParenOpen)) {
          let nesting = 1;
          while (nesting > 0 && !this.isAtEnd()) {
              if (this.check(TokenType.ParenOpen)) nesting++;
              if (this.check(TokenType.ParenClose)) nesting--;
              this.advance();
          }
      }
  }
  
  private continueParsingModifier(initialChain: string): any {
      const modifier: any = {};
      let currentSegment = initialChain; // e.g. "Modifier.padding" or just "Modifier"

      // Loop to handle chain
      // usage: Modifier.padding(16.dp).fillMaxSize()

      while (true) {
          // Check for call (...)
          if (this.match(TokenType.ParenOpen)) {
               // Parsing arguments for this modifier method
               if (currentSegment.endsWith('padding')) {
                    // Handle: padding(16.dp) or padding(start = 16.dp, top = 8.dp)
                    this.parseModifierPaddingArgs(modifier);
                } else if (currentSegment.endsWith('height')) {
                    const val = this.parseValue();
                    if (typeof val === 'number') modifier.height = val;
                    while (!this.check(TokenType.ParenClose)) this.advance();
                } else if (currentSegment.endsWith('width')) {
                    const val = this.parseValue();
                    if (typeof val === 'number') modifier.width = val;
                    while (!this.check(TokenType.ParenClose)) this.advance();
                } else if (currentSegment.endsWith('size')) {
                    const val = this.parseValue();
                    if (typeof val === 'number') modifier.size = val;
                    while (!this.check(TokenType.ParenClose)) this.advance();
               } else {
                   // unknown method, skip args
                    while (!this.check(TokenType.ParenClose)) this.advance();
               }
               this.consume(TokenType.ParenClose, "Expect ')'");
          } else {
              // property access or no-arg method?
              // .fillMaxSize
               if (currentSegment.endsWith('fillMaxSize')) modifier.fillMaxSize = true;
               if (currentSegment.endsWith('fillMaxWidth')) modifier.fillMaxWidth = true;
               if (currentSegment.endsWith('fillMaxHeight')) modifier.fillMaxHeight = true;
          }

          // Next in chain
          if (this.match(TokenType.Dot)) {
              if (this.match(TokenType.Identifier)) {
                  currentSegment = this.previous().value;
              } else { break; }
          } else {
              break;
          }
      }

      return modifier;
  }

  /**
   * Parse padding arguments: padding(16.dp) or padding(start = 16.dp, top = 8.dp, horizontal = 16.dp)
   */
  private parseModifierPaddingArgs(modifier: any) {
      // Check for named or positional arguments
      while (!this.check(TokenType.ParenClose) && !this.isAtEnd()) {
          if (this.check(TokenType.Identifier) && this.peek().type === TokenType.Equals) {
              // Named argument: start = 16.dp
              const argName = this.advance().value;
              this.advance(); // consume '='
              const val = this.parseValue();
              if (typeof val === 'number') {
                  if (argName === 'start') modifier.paddingStart = val;
                  else if (argName === 'end') modifier.paddingEnd = val;
                  else if (argName === 'top') modifier.paddingTop = val;
                  else if (argName === 'bottom') modifier.paddingBottom = val;
                  else if (argName === 'horizontal') modifier.paddingHorizontal = val;
                  else if (argName === 'vertical') modifier.paddingVertical = val;
                  else if (argName === 'all') modifier.padding = val;
              }
          } else {
              // Positional argument: padding(16.dp)
              const val = this.parseValue();
              if (typeof val === 'number') {
                  modifier.padding = val;
              }
          }

          if (!this.match(TokenType.Comma)) break;
      }
  }

  private skipDeclaration() {
      // Skip until equals, then consume the expression
      // val x = 10
      // val x by remember { mutableStateOf(false) }
      while (!this.isAtEnd() && !this.check(TokenType.Equals)) {
          // Handle 'by' keyword for delegated properties
          if (this.check(TokenType.Identifier) && this.peekCurrent().value === 'by') {
              this.advance(); // consume 'by'
              break;
          }
          this.advance();
      }
      if (this.match(TokenType.Equals)) {
          this.consumeExpression();
      } else {
          // 'by' delegation - consume the expression
          this.consumeExpression();
      }
  }

  /**
   * Skip an assignment statement: identifier = expression
   * Handles: showAddDialog = true, x = foo.bar(), etc.
   */
  private skipAssignment() {
      // We've already consumed the identifier, now consume = and expression
      if (this.match(TokenType.Equals)) {
          this.consumeExpression();
      }
  }

  /**
   * Consume an expression, handling nested parentheses, braces, and brackets.
   * Stops at: comma, closing paren/brace (unmatched), keywords that start statements, or EOF.
   */
  private consumeExpression() {
      let parenDepth = 0;
      let braceDepth = 0;

      while (!this.isAtEnd()) {
          const current = this.peekCurrent();

          // Stop at keywords that start new statements (only at top level)
          if (current.type === TokenType.Keyword && parenDepth === 0 && braceDepth === 0) {
              const kw = current.value;
              if (kw === 'val' || kw === 'var' || kw === 'fun' || kw === 'if' || kw === 'return' || kw === 'class' || kw === 'object') {
                  break; // New statement starting
              }
          }

          // Stop at Identifiers that look like function calls (Composables) at top level
          // Heuristic: Uppercase first letter followed by ( suggests a Composable call
          if (current.type === TokenType.Identifier && parenDepth === 0 && braceDepth === 0) {
              const firstChar = current.value.charAt(0);
              if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
                  // Check if next token is ( or { (function call)
                  const nextIdx = this.position + 1;
                  if (nextIdx < this.tokens.length) {
                      const next = this.tokens[nextIdx];
                      if (next.type === TokenType.ParenOpen || next.type === TokenType.BraceOpen) {
                          break; // Likely a new Composable call statement
                      }
                  }
              }
          }

          // Track nesting
          if (current.type === TokenType.ParenOpen) {
              parenDepth++;
              this.advance();
              continue;
          }
          if (current.type === TokenType.ParenClose) {
              if (parenDepth === 0) break; // Unmatched - belongs to parent
              parenDepth--;
              this.advance();
              continue;
          }
          if (current.type === TokenType.BraceOpen) {
              braceDepth++;
              this.advance();
              continue;
          }
          if (current.type === TokenType.BraceClose) {
              if (braceDepth === 0) break; // Unmatched - belongs to parent
              braceDepth--;
              this.advance();
              continue;
          }

          // Stop at comma only if we're at top level (not nested)
          if (current.type === TokenType.Comma && parenDepth === 0 && braceDepth === 0) {
              break;
          }

          this.advance();
      }
  }

  /**
   * Skip lambda parameters at the start of a block: { padding -> ... } or { a, b -> ... }
   * Returns true if parameters were skipped.
   */
  private skipLambdaParameters(): boolean {
      // Look ahead to detect pattern: identifier(s) followed by ->
      // Arrow is tokenized as two operators: - and >
      const startPos = this.position;

      // Consume identifiers and commas
      while (this.check(TokenType.Identifier)) {
          this.advance();
          if (!this.match(TokenType.Comma)) break;
      }

      // Check for arrow (- followed by >)
      if (this.check(TokenType.Operator) && this.peekCurrent().value === '-') {
          this.advance();
          if (this.check(TokenType.Operator) && this.peekCurrent().value === '>') {
              this.advance();
              return true; // Successfully skipped lambda params
          }
      }

      // No arrow found, restore position
      this.position = startPos;
      return false;
  }

  // Helpers
  private match(type: TokenType): boolean {
      if (this.check(type)) {
          this.advance();
          return true;
      }
      return false;
  }

  private check(type: TokenType): boolean {
      if (this.isAtEnd()) return false;
      return this.peekCurrent().type === type;
  }

  private advance(): Token {
      if (!this.isAtEnd()) this.position++;
      return this.previous();
  }

  private isAtEnd(): boolean {
      return this.peekCurrent().type === TokenType.EOF;
  }

  private peekCurrent(): Token {
      return this.tokens[this.position];
  }
  
  private peek(): Token { // lookahead
      if (this.position + 1 >= this.tokens.length) return this.tokens[this.tokens.length - 1]; // EOF
      return this.tokens[this.position + 1];
  }

  private previous(): Token {
      return this.tokens[this.position - 1];
  }

  private consume(type: TokenType, message: string): Token {
      if (this.check(type)) return this.advance();
      throw new Error(`Parse Error: ${message} at line ${this.peekCurrent().line}`);
  }
  
  private consumeUntil(type: TokenType) {
      while (!this.isAtEnd() && !this.check(type)) {
          this.advance();
      }
  }
}
