/**
 * JsCompilerService
 * Compiles Kotlin Compose source to browser-executable ES modules via kotlinc-js.
 *
 * Pipeline (two steps required by K2 compiler):
 *   1. user.kt → screen.klib       (compile)
 *   2. screen.klib → screen.mjs    (link, includes stdlib + stubs)
 *
 * The resulting .mjs exports renderScreen() which builds a plain JS object tree.
 * The browser imports it, calls renderScreen(() => ScreenName()), renders tree as HTML.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { log, error as logError, warn } from '../utils/logger';

export interface JsCompileResult {
  success: boolean;
  jsBase64?: string;
  byteSize?: number;
  compileTimeMs?: number;
  screenFunctionName?: string;
  error?: string;
}

export class JsCompilerService {
  private kotlincJsPath: string | null = null;
  private stdlibKlib: string | null = null;
  private stubsKlib: string | null = null;
  private readonly workDir: string;

  constructor() {
    this.workDir = path.join(os.tmpdir(), 'jetstart-js-compiler');
    fs.mkdirSync(this.workDir, { recursive: true });
    this.init();
  }

  private init(): void {
    const isWin = process.platform === 'win32';
    const ext = isWin ? '.bat' : '';
    const candidates = [
      'C:\\kotlinc\\bin\\kotlinc-js.bat',
      path.join(process.env.KOTLIN_HOME || '', 'bin', `kotlinc-js${ext}`),
      path.join(process.env.PATH?.split(isWin ? ';' : ':')[0] || '', `kotlinc-js${ext}`),
    ];
    for (const c of candidates) {
      if (c && fs.existsSync(c)) {
        this.kotlincJsPath = c;
        break;
      }
    }
    if (!this.kotlincJsPath) {
      warn('[JsCompiler] kotlinc-js not found — web live preview disabled');
      return;
    }

    const kotlincDir = path.dirname(path.dirname(this.kotlincJsPath));
    const stdlib = path.join(kotlincDir, 'lib', 'kotlin-stdlib-js.klib');
    if (fs.existsSync(stdlib)) {
      this.stdlibKlib = stdlib;
      log(`[JsCompiler] kotlinc-js ready: ${path.basename(this.kotlincJsPath)}`);
    } else {
      warn('[JsCompiler] kotlin-stdlib-js.klib not found — web live preview disabled');
    }
  }

  isAvailable(): boolean {
    return !!(this.kotlincJsPath && this.stdlibKlib);
  }

  private writeStubsSource(): string {
    const p = path.join(this.workDir, 'compose-stubs.kt');
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, COMPOSE_STUBS, 'utf8');
    }
    return p;
  }

  /** Build the Compose shims klib once. Returns klib path or null. */
  private ensureStubsKlib(): string | null {
    if (this.stubsKlib && fs.existsSync(this.stubsKlib)) return this.stubsKlib;

    const src = this.writeStubsSource();
    const outKlib = path.join(this.workDir, 'compose_stubs.klib');
    const argFile = path.join(this.workDir, 'stubs-args.txt');

    fs.writeFileSync(
      argFile,
      [
        '-ir-output-name',
        'compose_stubs',
        '-ir-output-dir',
        this.workDir,
        '-libraries',
        this.stdlibKlib!,
        '-module-kind',
        'es',
        '-target',
        'es2015',
        '-Xir-produce-klib-file',
        src,
      ].join('\n'),
      'utf8'
    );

    log('[JsCompiler] Building Compose shims klib (one-time, ~30s)...');
    const r = spawnSync(this.kotlincJsPath!, [`@${argFile}`], {
      shell: true,
      encoding: 'utf8',
      timeout: 120000,
    });

    if ((r.status === 0 || !r.stderr?.includes('error:')) && fs.existsSync(outKlib)) {
      this.stubsKlib = outKlib;
      log('[JsCompiler] Compose shims klib ready');
      return outKlib;
    }
    logError('[JsCompiler] Stubs klib failed: ' + (r.stderr || r.stdout || '').slice(0, 300));
    return null;
  }

  /**
   * Compile a .kt Compose file to a browser-runnable ES module.
   * Returns base64-encoded .mjs content.
   */

  /**
   * Remove horizontalArrangement = ... lines that appear inside non-Row containers.
   * LazyVerticalStaggeredGrid etc. don't accept this param in our stubs.
   * Row/LazyRow DO accept it — those lines are kept.
   */
  private removeHorizontalArrangementOutsideRow(text: string): string {
    const lines = text.split('\n');
    const out: string[] = [];
    const stack: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      // Track container openings (rough, single-line detection)
      if (/\bLazyVerticalStaggeredGrid\s*\(/.test(t)) stack.push('LazyVerticalStaggeredGrid');
      else if (/\bLazyVerticalGrid\s*\(/.test(t)) stack.push('LazyVerticalGrid');
      else if (/\bLazyColumn\s*\(/.test(t)) stack.push('LazyColumn');
      else if (/\bLazyRow\s*\(/.test(t) || /\bRow\s*\(/.test(t)) stack.push('Row');
      else if (/\bColumn\s*\(/.test(t)) stack.push('Column');
      else if (/\bScaffold\s*\(/.test(t)) stack.push('Scaffold');
      else if (/\bCard[^(]*\(/.test(t)) stack.push('Card');
      // Remove horizontalArrangement if not in a Row
      if (/^\s*horizontalArrangement\s*=/.test(line)) {
        const current = stack[stack.length - 1];
        if (current !== 'Row') continue; // skip
      }
      out.push(line);
    }
    return out.join('\n');
  }

  /**
   * Remove a brace-balanced block (including optional trailing else block).
   * Used to surgically strip LaunchedEffect, forEach, broken if-else blocks etc.
   */
  private removeBalancedBlock(text: string, re: RegExp): string {
    let match: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((match = re.exec(text)) !== null) {
      let i = match.index + match[0].length - 1; // last char should be '{'
      let depth = 1;
      const blockStart = match.index;
      i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        i++;
      }
      // Check for else
      const rest = text.slice(i);
      const elseM = rest.match(/^\s*else\s*\{/);
      if (elseM) {
        i += elseM[0].length;
        depth = 1;
        while (i < text.length && depth > 0) {
          if (text[i] === '{') depth++;
          else if (text[i] === '}') depth--;
          i++;
        }
      }
      text = text.slice(0, blockStart) + text.slice(i);
      re.lastIndex = blockStart;
    }
    return text;
  }

  /**
   * Remove "} else { BLOCK }" where the else body matches a predicate.
   */
  private removeElseBlockIf(text: string, predicate: (body: string) => boolean): string {
    const re = /\}\s*else\s*\{([^{}]|\{[^{}]*\})*\}/gs;
    return text.replace(re, (match) => (predicate(match) ? '}' : match));
  }

  /**
   * Preprocess a Kotlin Compose source file for kotlinc-js compilation.
   *
   * The user's file uses Android/Compose/Java imports that don't exist in
   * a browser context. This method transforms the file so that only the
   * Compose UI structure remains — which maps directly to our jetstart.compose
   * shims. The result compiles cleanly with kotlinc-js.
   */
  private preprocessFile(ktFilePath: string, runDir: string): string {
    let text = fs.readFileSync(ktFilePath, 'utf8');

    // Pass 1: Whole-file transformations
    // Imports / package
    text = text.replace(/^import\s+.*/gm, '');
    text = text.replace(/^package\s+.*/gm, '');
    // Annotations
    text = text.replace(/^@OptIn[^\n]*/gm, '');
    text = text.replace(/^@HiltViewModel[^\n]*/gm, '');
    text = text.replace(/^@Composable\s*/gm, '');
    // dp/sp
    text = text.replace(/(\d+(?:\.\d+)?)\.dp\b/g, '$1');
    text = text.replace(/(\d+(?:\.\d+)?)\.sp\b/g, '$1');
    // Icons
    text = text.replace(/Icons\.(Filled|Outlined|Rounded|Sharp|TwoTone)\./g, 'Icons.Default.');
    // ViewModel params
    text = text.replace(/,?\s*\w+\s*:\s*\w*ViewModel\s*=\s*viewModel\([^)]*\)/g, '');
    text = text.replace(/,?\s*\w+\s*:\s*\w*ViewModel\b/g, '');
    text = text.replace(/\(\s*,/g, '(');
    text = text.replace(/,\s*\)/g, ')');
    // ViewModel usage
    text = text.replace(/\bval\s+(\w+)\s+by\s+viewModel\.\w+\.collectAsState\(\)/g, 'val $1 = ""');
    text = text.replace(/\bvar\s+(\w+)\s+by\s+viewModel\.\w+\.collectAsState\(\)/g, 'var $1 = ""');
    text = text.replace(/\bviewModel\.\w+\.collectAsState\(\)/g, '"preview"');
    text = text.replace(/\bviewModel::\w+/g, '{}');
    text = text.replace(/,?\s*viewModel\s*=\s*\w+[^,)\n]*/g, '');
    text = text.replace(/\bviewModel\.\w+\b/g, 'Unit');
    // Delegate by remember
    text = text.replace(/\bval\s+(\w+)\s+by\s+remember\s*\{[^}]+\}/g, 'val $1 = ""');
    text = text.replace(
      /\bvar\s+(\w+)\s+by\s+remember\s*\{\s*mutableStateOf\((false|true)\)\s*\}/g,
      'var $1: Boolean = $2'
    );
    text = text.replace(/\bvar\s+(\w+)\s+by\s+remember\s*\{[^}]+\}/g, 'var $1 = ""');
    // Data class fields
    text = text.replace(/\bnote\.content\b/g, '"Note content"');
    text = text.replace(/\bnote\.\w+\b/g, '"preview"');
    text = text.replace(/\b(\w+)\s*:\s*Note\b/g, '$1: String = "Note"');
    // Preview lists
    text = text.replace(
      /\bval\s+suggestedTags\b[^\n]*/g,
      'val suggestedTags: List<String> = listOf()'
    );
    text = text.replace(/suggestedTags\.isEmpty\(\)/g, 'true');
    text = text.replace(/suggestedTags\.isNotEmpty\(\)/g, 'false');
    text = text.replace(
      /\bval\s+searchResults\b[^\n]*/g,
      'val searchResults: List<String> = listOf("Note 1", "Note 2", "Note 3")'
    );
    // Named M3 colors
    const colorMap: Record<string, string> = {
      onSurfaceVariant: '"#49454F"',
      onBackground: '"#1C1B1F"',
      outline: '"#79747E"',
      surfaceVariant: '"#E7E0EC"',
      onPrimaryContainer: '"#21005D"',
      inverseOnSurface: '"#F4EFF4"',
      inverseSurface: '"#313033"',
      tertiaryContainer: '"#FFD8E4"',
    };
    for (const [k, v] of Object.entries(colorMap)) {
      text = text.replace(new RegExp(`MaterialTheme\\.colorScheme\\.${k}\\b`, 'g'), v);
    }
    // Remove arg-style attributes that aren't in stubs
    text = text.replace(/,?\s*colors\s*=\s*\w+Defaults\.\w+\s*\([\s\S]*?\)/g, '');
    text = text.replace(/,?\s*(?:content)?[Ww]indow[Ii]nsets[^\n,)]*/g, '');
    text = text.replace(/,?\s*verticalItemSpacing\s*=\s*[^\n,)]+/g, '');
    text = text.replace(/,?\s*contentPadding\s*=\s*[^\n,)]+/g, '');
    text = text.replace(/,?\s*minLines\s*=\s*\d+/g, '');
    text = text.replace(/,?\s*elevation\s*=\s*CardDefaults\.[^)]+\)/g, '');
    text = text.replace(/PaddingValues\((\d+)\)/g, '$1');
    text = text.replace(/PaddingValues\([^)]*\)/g, '0');
    // Named padding → single value
    text = text.replace(
      /\.padding\(\s*(?:start|left|horizontal)\s*=\s*(\d+)[^)]*\)/g,
      '.padding($1)'
    );
    text = text.replace(/\.padding\(\s*(?:top|vertical)\s*=\s*(\d+)[^)]*\)/g, '.padding($1)');
    text = text.replace(/\.padding\(padding\)/g, '.padding(0)');
    // Shape removal
    text = text.replace(
      /,?\s*shape\s*=\s*(?:MaterialTheme\.shapes\.\w+|RoundedCornerShape\([^)]*\)|CircleShape)/g,
      ''
    );
    // Modifier
    text = text.replace(/\bModifier\b(?!\(\)|[\w])/g, 'Modifier()');
    text = text.replace(/\bModifier\(\)\s*\n\s*\./g, 'Modifier().');
    text = text.replace(
      /\)\s*\n\s*\.(fill|padding|height|width|size|weight|background|clip|alpha|wrap)/g,
      ').$1'
    );
    // horizontalArrangement not in staggered grid stubs
    text = this.removeHorizontalArrangementOutsideRow(text);
    // Scroll
    text = text.replace(/\.horizontalScroll\([^)]*\)|\.verticalScroll\([^)]*\)/g, '');
    text = text.replace(/,?\s*state\s*=\s*remember(?:ScrollState|LazyListState)\(\)/g, '');
    // Dialog → Box
    text = text.replace(/\bDialog\b\s*\(/g, 'Box(');
    // Scaffold padding → _
    text = text.replace(/\)\s*\{\s*padding\s*->/g, ') { _ ->');
    // Misc
    text = text.replace(/,?\s*singleLine\s*=\s*\w+/g, '');
    text = text.replace(/,?\s*isError\s*=\s*\w+/g, '');
    text = text.replace(/,?\s*keyboardOptions\s*=\s*[^,)\n]+/g, '');
    text = text.replace(/,?\s*keyboardActions\s*=\s*[^,)\n]+/g, '');
    text = text.replace(/,?\s*interactionSource\s*=\s*[^,)\n]+/g, '');
    text = text.replace(/SimpleDateFormat\([^)]*\)\.format\([^)]*\)/g, '"Today"');
    // Stray Unit(...) calls
    text = text.replace(/\bUnit\([^)]*\)/g, '{}');
    text = text.replace(/\{\s*Unit\s*\}/g, '{}');
    // Fix extra ) from removed args in grid calls
    text = text.replace(/StaggeredGridCells\.Fixed\((\d+)\)\),/g, 'StaggeredGridCells.Fixed($1),');
    text = text.replace(/modifier\s*=\s*Modifier\(\)\),/g, 'modifier = Modifier(),');

    // Pass 2: Brace-balanced block removal
    // LaunchedEffect / SideEffect / DisposableEffect
    for (const kw of ['LaunchedEffect', 'DisposableEffect', 'SideEffect']) {
      text = this.removeBalancedBlock(text, new RegExp(`\\b${kw}\\b[^{]*\\{`, 'g'));
    }
    // .forEach { ... }
    text = this.removeBalancedBlock(text, /\.forEach\s*\{/g);
    // if (false) { ... } [else { ... }]
    text = this.removeBalancedBlock(text, /if\s*\(\s*false\s*\)\s*\{/g);
    // if (listOf<...>().isNotEmpty()) { ... }
    text = this.removeBalancedBlock(text, /if\s*\(\s*listOf<[^>]*>\(\)\.isNotEmpty\(\)\s*\)\s*\{/g);
    // if (X.isNotEmpty()) { ... } — generic tag guards
    text = this.removeBalancedBlock(text, /if\s*\(\s*\w+\.isNotEmpty\(\)\s*\)\s*\{/g);
    // Remove else blocks containing broken/removed suggestedTags code
    text = this.removeElseBlockIf(
      text,
      (body) => body.includes('suggestedTags') || body.includes('Modifier()),')
    );

    // Pass 3: Final cleanup
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/,\s*\)/g, ')');
    text = text.replace(/\(\s*,/g, '(');

    // Detect the screen function name to wrap the entry point
    const screenMatch = text.match(/^fun\s+(\w+Screen)/m) || text.match(/^fun\s+(\w+)/m);
    const screenName = screenMatch ? screenMatch[1] : null;
    const renderWrapper = screenName
      ? `\n\n@OptIn(kotlin.js.ExperimentalJsExport::class)\n@JsExport\nfun __jetstart_render__(): dynamic = renderScreen { ${screenName}() }\n`
      : '';

    const result = 'import jetstart.compose.*\n\n' + text.trim() + renderWrapper + '\n';
    const preprocessedPath = path.join(runDir, 'preprocessed.kt');
    fs.writeFileSync(preprocessedPath, result, 'utf8');
    return preprocessedPath;
  }

  async compile(ktFilePath: string): Promise<JsCompileResult> {
    if (!this.isAvailable()) return { success: false, error: 'kotlinc-js unavailable' };

    const stubsKlib = this.ensureStubsKlib();
    if (!stubsKlib) return { success: false, error: 'Compose shims compilation failed' };

    const t0 = Date.now();
    const runId = `run_${Date.now()}`;
    const runDir = path.join(this.workDir, runId);
    fs.mkdirSync(runDir, { recursive: true });

    try {
      // Step 1: .kt → screen.klib
      const screenKlib = path.join(runDir, 'screen.klib');
      const args1 = path.join(runDir, 'step1.txt');
      const libs1 = [this.stdlibKlib!, stubsKlib].join(process.platform === 'win32' ? ';' : ':');

      // Preprocess: strip Android imports, annotations, and types not available in JS
      const preprocessedKtPath = this.preprocessFile(ktFilePath, runDir);

      fs.writeFileSync(
        args1,
        [
          '-ir-output-name',
          'screen',
          '-ir-output-dir',
          runDir,
          '-libraries',
          libs1,
          '-module-kind',
          'es',
          '-target',
          'es2015',
          '-Xir-produce-klib-file',
          preprocessedKtPath,
        ].join('\n'),
        'utf8'
      );

      const r1 = spawnSync(this.kotlincJsPath!, [`@${args1}`], {
        shell: true,
        encoding: 'utf8',
        timeout: 120000,
      });

      if (!fs.existsSync(screenKlib)) {
        const errLines = (r1.stderr || r1.stdout || '')
          .split('\n')
          .filter((l: string) => l.includes('error:'))
          .slice(0, 8)
          .join('\n');
        return { success: false, error: `Step 1 failed:\n${errLines}` };
      }

      // Step 2: screen.klib → screen.mjs
      const outDir = path.join(runDir, 'out');
      fs.mkdirSync(outDir, { recursive: true });
      const args2 = path.join(runDir, 'step2.txt');

      fs.writeFileSync(
        args2,
        [
          '-ir-output-name',
          'screen',
          '-ir-output-dir',
          outDir,
          '-libraries',
          libs1,
          '-module-kind',
          'es',
          '-target',
          'es2015',
          '-Xir-produce-js',
          `-Xinclude=${screenKlib}`,
        ].join('\n'),
        'utf8'
      );

      const r2 = spawnSync(this.kotlincJsPath!, [`@${args2}`], {
        shell: true,
        encoding: 'utf8',
        timeout: 120000,
      });

      const mjsPath = path.join(outDir, 'screen.mjs');
      if (!fs.existsSync(mjsPath)) {
        const errLines = (r2.stderr || r2.stdout || '')
          .split('\n')
          .filter((l: string) => !l.startsWith('warning:') && l.trim())
          .slice(0, 8)
          .join('\n');
        return { success: false, error: `Step 2 failed:\n${errLines}` };
      }

      // Detect the screen function name from source
      const ktSrc = fs.readFileSync(ktFilePath, 'utf8');
      const screenMatch = ktSrc.match(/fun\s+(\w+Screen)\s*[({]/);
      const screenFunctionName = screenMatch?.[1] ?? 'Screen';

      const mjsBytes = fs.readFileSync(mjsPath);
      const jsBase64 = mjsBytes.toString('base64');
      const elapsed = Date.now() - t0;
      log(
        `[JsCompiler] ✅ ${path.basename(ktFilePath)} → JS in ${elapsed}ms (${mjsBytes.length} bytes)`
      );

      return {
        success: true,
        jsBase64,
        byteSize: mjsBytes.length,
        compileTimeMs: elapsed,
        screenFunctionName,
      };
    } finally {
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch {}
    }
  }
}

// Compose shim stubs (validated against kotlinc-js 2.3.0)
const COMPOSE_STUBS =
  'package jetstart.compose\n\nexternal fun println(s: String): Unit\n\nobject ComposeTree {\n    val root: dynamic = js("({type:\'root\',children:[]})")\n    val stack: dynamic = js("([])")\n    fun push(node: dynamic) {\n        val cur: dynamic = if (stack.length > 0) stack[stack.length - 1] else root\n        cur.children.push(node)\n        stack.push(node)\n    }\n    fun pop() { stack.pop() }\n    fun current(): dynamic = if (stack.length > 0) stack[stack.length - 1] else root\n    fun reset() {\n        root.children.splice(0)  // clear children array in-place\n        stack.splice(0)          // clear stack\n    }\n    // Run lambda in isolated sub-tree — prevents slot content from leaking\n    fun captureSlot(lambda: ()->Unit): dynamic {\n        val slotRoot: dynamic = js("({type:\'slot\',children:[]})")\n        stack.push(slotRoot)\n        lambda()\n        stack.pop()\n        return slotRoot.children\n    }\n}\n\nclass Modifier {\n    val s: dynamic = js("({})")\n    fun fillMaxSize(): Modifier { s.fillMaxSize = true; return this }\n    fun fillMaxWidth(): Modifier { s.fillMaxWidth = true; return this }\n    fun fillMaxHeight(): Modifier { s.fillMaxHeight = true; return this }\n    fun padding(all: Int): Modifier { s.padding = all; return this }\n    fun padding(all: Float): Modifier { s.padding = all; return this }\n    fun padding(horizontal: Int = 0, vertical: Int = 0): Modifier { s.paddingH=horizontal; s.paddingV=vertical; return this }\n    fun height(dp: Int): Modifier { s.height=dp; return this }\n    fun height(dp: Float): Modifier { s.height=dp; return this }\n    fun width(dp: Int): Modifier { s.width=dp; return this }\n    fun width(dp: Float): Modifier { s.width=dp; return this }\n    fun size(dp: Int): Modifier { s.size=dp; return this }\n    fun weight(f: Float): Modifier { s.weight=f; return this }\n    fun weight(f: Int): Modifier { s.weight=f.toFloat(); return this }\n    fun background(color: String): Modifier { s.background=color; return this }\n    fun clip(shape: String): Modifier { s.clip=shape; return this }\n    fun clickable(onClick: ()->Unit): Modifier { s.clickable=true; return this }\n    fun alpha(a: Float): Modifier { s.alpha=a; return this }\n    fun border(width: Int, color: String): Modifier { s.borderWidth=width; s.borderColor=color; return this }\n    fun wrapContentWidth(): Modifier { s.wrapWidth=true; return this }\n    fun wrapContentHeight(): Modifier { s.wrapHeight=true; return this }\n    fun offset(x: Int=0, y: Int=0): Modifier { s.offsetX=x; s.offsetY=y; return this }\n    companion object { operator fun invoke(): Modifier = Modifier() }\n}\n\nobject Arrangement {\n    val Top = "top"; val Bottom = "bottom"; val Center = "center"\n    val Start = "start"; val End = "end"\n    val SpaceBetween = "space-between"; val SpaceEvenly = "space-evenly"; val SpaceAround = "space-around"\n    fun spacedBy(dp: Int) = "spacedBy(${"$"}dp)"\n    fun spacedBy(dp: Float) = "spacedBy(${"$"}{dp.toInt()})"\n}\nobject Alignment {\n    val Top = "top"; val Bottom = "bottom"; val CenterVertically = "centerVertically"\n    val CenterHorizontally = "centerHorizontally"; val Center = "center"\n    val Start = "start"; val End = "end"\n    val TopStart = "topStart"; val TopEnd = "topEnd"\n    val BottomStart = "bottomStart"; val BottomEnd = "bottomEnd"\n    val TopCenter = "topCenter"; val BottomCenter = "bottomCenter"\n}\nobject MaterialTheme {\n    val colorScheme = ColorScheme(); val typography = Typography(); val shapes = Shapes()\n}\nclass ColorScheme {\n    val primary = "#6750A4"; val onPrimary = "#FFFFFF"\n    val secondary = "#625B71"; val surface = "#FFFBFE"\n    val background = "#FFFBFE"; val error = "#B3261E"\n    val primaryContainer = "#EADDFF"; val secondaryContainer = "#E8DEF8"\n    val surfaceVariant = "#E7E0EC"; val outline = "#79747E"\n    val onBackground = "#1C1B1F"; val onSurface = "#1C1B1F"\n    val tertiaryContainer = "#FFD8E4"; val inverseSurface = "#313033"\n    val inverseOnSurface = "#F4EFF4"; val onPrimaryContainer = "#21005D"\n}\nclass Typography {\n    val displayLarge = "displayLarge"; val displayMedium = "displayMedium"; val displaySmall = "displaySmall"\n    val headlineLarge = "headlineLarge"; val headlineMedium = "headlineMedium"; val headlineSmall = "headlineSmall"\n    val titleLarge = "titleLarge"; val titleMedium = "titleMedium"; val titleSmall = "titleSmall"\n    val bodyLarge = "bodyLarge"; val bodyMedium = "bodyMedium"; val bodySmall = "bodySmall"\n    val labelLarge = "labelLarge"; val labelMedium = "labelMedium"; val labelSmall = "labelSmall"\n}\nclass Shapes { val small="small"; val medium="medium"; val large="large"; val extraLarge="extraLarge" }\nobject FontWeight { val Bold="bold"; val Normal="normal"; val Light="light"; val Medium="medium"; val SemiBold="semibold" }\nobject TextAlign { val Start="start"; val Center="center"; val End="end"; val Justify="justify" }\nobject ContentScale { val Crop="crop"; val Fit="fit"; val FillBounds="fillBounds"; val FillWidth="fillWidth" }\nobject Color {\n    val White = "#FFFFFF"; val Black = "#000000"; val Transparent = "transparent"\n    val Red = "#F44336"; val Blue = "#2196F3"; val Green = "#4CAF50"\n    val Gray = "#9E9E9E"; val LightGray = "#E0E0E0"; val DarkGray = "#424242"\n    val Unspecified = "unspecified"\n}\n\nfun rememberSaveable(vararg inputs: Any?, calculation: ()->Any?): Any? = calculation()\nfun remember(vararg inputs: Any?, calculation: ()->Any?): Any? = calculation()\nfun <T> mutableStateOf(value: T): MutableState<T> = MutableStateImpl(value)\ninterface MutableState<T> { var value: T }\nclass MutableStateImpl<T>(override var value: T): MutableState<T>\noperator fun <T> MutableState<T>.getValue(thisRef: Any?, property: Any?): T = value\noperator fun <T> MutableState<T>.setValue(thisRef: Any?, property: Any?, v: T) { value = v }\nfun stringResource(id: Int): String = "string_${"$"}id"\nfun painterResource(id: Int): Any = js("({type:\'resource\',id:${"$"}id})")\n\nobject Icons {\n    object Default {\n        val Add: Any = js("({icon:\'add\'})")\n        val Search: Any = js("({icon:\'search\'})")\n        val Close: Any = js("({icon:\'close\'})")\n        val Check: Any = js("({icon:\'check\'})")\n        val Delete: Any = js("({icon:\'delete\'})")\n        val Edit: Any = js("({icon:\'edit\'})")\n        val Home: Any = js("({icon:\'home\'})")\n        val Menu: Any = js("({icon:\'menu\'})")\n        val Settings: Any = js("({icon:\'settings\'})")\n        val ArrowBack: Any = js("({icon:\'arrow_back\'})")\n        val MoreVert: Any = js("({icon:\'more_vert\'})")\n        val Favorite: Any = js("({icon:\'favorite\'})")\n        val Share: Any = js("({icon:\'share\'})")\n        val Info: Any = js("({icon:\'info\'})")\n        val Person: Any = js("({icon:\'person\'})")\n        val Star: Any = js("({icon:\'star\'})")\n        val Notifications: Any = js("({icon:\'notifications\'})")\n        val Email: Any = js("({icon:\'email\'})")\n        val Phone: Any = js("({icon:\'phone\'})")\n        val Lock: Any = js("({icon:\'lock\'})")\n        val Visibility: Any = js("({icon:\'visibility\'})")\n        val VisibilityOff: Any = js("({icon:\'visibility_off\'})")\n        val ShoppingCart: Any = js("({icon:\'shopping_cart\'})")\n        val KeyboardArrowDown: Any = js("({icon:\'keyboard_arrow_down\'})")\n        val KeyboardArrowUp: Any = js("({icon:\'keyboard_arrow_up\'})")\n    }\n    object Filled { val Add = Default.Add; val Search = Default.Search; val Edit = Default.Edit }\n    object Outlined { val Add = Default.Add; val Search = Default.Search }\n    object Rounded { val Add = Default.Add }\n}\n\n// ── Layout composables ────────────────────────────────────────────────────────\nfun Column(modifier: Modifier=Modifier(), verticalArrangement: Any="", horizontalAlignment: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'Column\',children:[]})")\n    n.modifier=modifier.s; n.verticalArrangement=verticalArrangement.toString(); n.horizontalAlignment=horizontalAlignment.toString()\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Row(modifier: Modifier=Modifier(), horizontalArrangement: Any="", verticalAlignment: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'Row\',children:[]})")\n    n.modifier=modifier.s; n.horizontalArrangement=horizontalArrangement.toString(); n.verticalAlignment=verticalAlignment.toString()\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Box(modifier: Modifier=Modifier(), contentAlignment: Any="topStart", content: ()->Unit={}) {\n    val n: dynamic = js("({type:\'Box\',children:[]})")\n    n.modifier=modifier.s; n.contentAlignment=contentAlignment.toString()\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Text(text: String, modifier: Modifier=Modifier(), style: Any="", color: Any="", fontSize: Any="", fontWeight: Any="", textAlign: Any="", maxLines: Int=Int.MAX_VALUE, overflow: Any="") {\n    val n: dynamic = js("({type:\'Text\',children:[]})")\n    n.text=text; n.modifier=modifier.s\n    val styleStr = style.toString()\n    n.style=if(styleStr.isEmpty()) "bodyMedium" else styleStr\n    n.color=color.toString(); n.fontWeight=fontWeight.toString(); n.textAlign=textAlign.toString(); n.maxLines=maxLines\n    ComposeTree.current().children.push(n)\n}\nfun Button(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, shape: Any="", colors: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'Button\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun OutlinedButton(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, content: ()->Unit) {\n    val n: dynamic = js("({type:\'OutlinedButton\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun TextButton(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, content: ()->Unit) {\n    val n: dynamic = js("({type:\'TextButton\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun ElevatedButton(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, content: ()->Unit) {\n    val n: dynamic = js("({type:\'ElevatedButton\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun FilledTonalButton(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, content: ()->Unit) {\n    val n: dynamic = js("({type:\'FilledTonalButton\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun FloatingActionButton(onClick: ()->Unit, modifier: Modifier=Modifier(), containerColor: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'FloatingActionButton\',children:[]})")\n    n.modifier=modifier.s; n.containerColor=containerColor.toString()\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun ExtendedFloatingActionButton(onClick: ()->Unit, modifier: Modifier=Modifier(), icon: ()->Unit={}, text: ()->Unit) {\n    val n: dynamic = js("({type:\'ExtendedFAB\',children:[]})")\n    n.modifier=modifier.s\n    ComposeTree.push(n); icon(); text(); ComposeTree.pop()\n}\nfun IconButton(onClick: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true, content: ()->Unit) {\n    val n: dynamic = js("({type:\'IconButton\',children:[]})")\n    n.modifier=modifier.s; n.enabled=enabled\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Card(onClick: (()->Unit)?=null, modifier: Modifier=Modifier(), shape: Any="", colors: Any="", elevation: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'Card\',children:[]})")\n    n.modifier=modifier.s; n.clickable=(onClick!=null)\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun ElevatedCard(onClick: (()->Unit)?=null, modifier: Modifier=Modifier(), shape: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'ElevatedCard\',children:[]})")\n    n.modifier=modifier.s\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun OutlinedCard(onClick: (()->Unit)?=null, modifier: Modifier=Modifier(), shape: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'OutlinedCard\',children:[]})")\n    n.modifier=modifier.s\n    ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Scaffold(modifier: Modifier=Modifier(), topBar: ()->Unit={}, bottomBar: ()->Unit={}, floatingActionButton: ()->Unit={}, snackbarHost: (Any)->Unit={}, containerColor: Any="", content: (Any)->Unit) {\n    val n: dynamic = js("({type:\'Scaffold\',children:[],topBar:[],bottomBar:[],fab:[]})")\n    n.modifier=modifier.s\n    n.topBar = ComposeTree.captureSlot { topBar() }\n    n.bottomBar = ComposeTree.captureSlot { bottomBar() }\n    n.fab = ComposeTree.captureSlot { floatingActionButton() }\n    ComposeTree.push(n); content(js("({})")); ComposeTree.pop()\n}\nfun TopAppBar(title: ()->Unit, modifier: Modifier=Modifier(), navigationIcon: ()->Unit={}, actions: ()->Unit={}, colors: Any="") {\n    val n: dynamic = js("({type:\'TopAppBar\',children:[],title:[],actions:[]})")\n    n.modifier=modifier.s\n    n.title = ComposeTree.captureSlot { title() }\n    n.actions = ComposeTree.captureSlot { actions() }\n    ComposeTree.current().children.push(n)\n}\nfun CenterAlignedTopAppBar(title: ()->Unit, modifier: Modifier=Modifier(), navigationIcon: ()->Unit={}, actions: ()->Unit={}, colors: Any="") = TopAppBar(title=title, modifier=modifier, navigationIcon=navigationIcon, actions=actions, colors=colors)\nfun LargeTopAppBar(title: ()->Unit, modifier: Modifier=Modifier(), navigationIcon: ()->Unit={}, actions: ()->Unit={}, colors: Any="") = TopAppBar(title=title, modifier=modifier, navigationIcon=navigationIcon, actions=actions, colors=colors)\nfun MediumTopAppBar(title: ()->Unit, modifier: Modifier=Modifier(), navigationIcon: ()->Unit={}, actions: ()->Unit={}, colors: Any="") = TopAppBar(title=title, modifier=modifier, navigationIcon=navigationIcon, actions=actions, colors=colors)\nfun NavigationBar(modifier: Modifier=Modifier(), containerColor: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'NavigationBar\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun NavigationBarItem(selected: Boolean, onClick: ()->Unit, icon: ()->Unit, label: (()->Unit)?=null, modifier: Modifier=Modifier()) {\n    val n: dynamic = js("({type:\'NavigationBarItem\',children:[],label:[]})")\n    n.selected=selected; n.modifier=modifier.s\n    n.children = ComposeTree.captureSlot { icon() }\n    if (label != null) { n.label = ComposeTree.captureSlot { label() } }\n    ComposeTree.current().children.push(n)\n}\nfun OutlinedTextField(value: String, onValueChange: (String)->Unit, modifier: Modifier=Modifier(), label: (()->Unit)?=null, placeholder: (()->Unit)?=null, leadingIcon: (()->Unit)?=null, trailingIcon: (()->Unit)?=null, isError: Boolean=false, singleLine: Boolean=false, maxLines: Int=Int.MAX_VALUE, shape: Any="", keyboardOptions: Any="", keyboardActions: Any="") {\n    val n: dynamic = js("({type:\'OutlinedTextField\',children:[]})")\n    n.value=value; n.modifier=modifier.s; n.isError=isError; n.singleLine=singleLine\n    if (label!=null) { n.label = ComposeTree.captureSlot { label() } }\n    if (placeholder!=null) { n.placeholder = ComposeTree.captureSlot { placeholder() } }\n    ComposeTree.current().children.push(n)\n}\nfun TextField(value: String, onValueChange: (String)->Unit, modifier: Modifier=Modifier(), label: (()->Unit)?=null, placeholder: (()->Unit)?=null, leadingIcon: (()->Unit)?=null, trailingIcon: (()->Unit)?=null, isError: Boolean=false, singleLine: Boolean=false, shape: Any="", keyboardOptions: Any="", keyboardActions: Any="") {\n    val n: dynamic = js("({type:\'TextField\',children:[]})")\n    n.value=value; n.modifier=modifier.s; n.isError=isError\n    if (label!=null) { n.label = ComposeTree.captureSlot { label() } }\n    ComposeTree.current().children.push(n)\n}\nfun SearchBar(query: String, onQueryChange: (String)->Unit, onSearch: (String)->Unit, active: Boolean, onActiveChange: (Boolean)->Unit, modifier: Modifier=Modifier(), placeholder: (()->Unit)?=null, leadingIcon: (()->Unit)?=null, trailingIcon: (()->Unit)?=null, content: ()->Unit={}) {\n    val n: dynamic = js("({type:\'SearchBar\',children:[]})")\n    n.query=query; n.modifier=modifier.s; ComposeTree.current().children.push(n)\n}\nfun LazyColumn(modifier: Modifier=Modifier(), state: Any="", contentPadding: Any="", verticalArrangement: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'LazyColumn\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun LazyRow(modifier: Modifier=Modifier(), state: Any="", contentPadding: Any="", horizontalArrangement: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'LazyRow\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun LazyVerticalGrid(columns: Any, modifier: Modifier=Modifier(), contentPadding: Any="", verticalArrangement: Any="", horizontalArrangement: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'LazyVerticalGrid\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun LazyVerticalStaggeredGrid(columns: Any, modifier: Modifier=Modifier(), contentPadding: Any="", content: ()->Unit) {\n    val n: dynamic = js("({type:\'LazyVerticalStaggeredGrid\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun Icon(imageVector: Any, contentDescription: String?, modifier: Modifier=Modifier(), tint: Any="") {\n    val n: dynamic = js("({type:\'Icon\',children:[]})")\n    val iv: dynamic = imageVector\n    n.icon = if(iv != null && iv.icon != null) iv.icon.toString() else "default"\n    n.contentDescription=contentDescription?:""; n.modifier=modifier.s; n.tint=tint.toString()\n    ComposeTree.current().children.push(n)\n}\nfun Image(painter: Any, contentDescription: String?, modifier: Modifier=Modifier(), contentScale: Any=ContentScale.Fit, alignment: Any=Alignment.Center) {\n    val n: dynamic = js("({type:\'Image\',children:[]})")\n    n.contentDescription=contentDescription?:""; n.modifier=modifier.s\n    ComposeTree.current().children.push(n)\n}\nfun Spacer(modifier: Modifier=Modifier()) {\n    val n: dynamic = js("({type:\'Spacer\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.current().children.push(n)\n}\nfun Divider(modifier: Modifier=Modifier(), thickness: Int=1, color: Any="") {\n    val n: dynamic = js("({type:\'Divider\',children:[]})")\n    n.modifier=modifier.s; n.thickness=thickness; ComposeTree.current().children.push(n)\n}\nfun HorizontalDivider(modifier: Modifier=Modifier(), thickness: Int=1, color: Any="") = Divider(modifier, thickness, color)\nfun Switch(checked: Boolean, onCheckedChange: ((Boolean)->Unit)?, modifier: Modifier=Modifier(), enabled: Boolean=true) {\n    val n: dynamic = js("({type:\'Switch\',children:[]})")\n    n.checked=checked; n.modifier=modifier.s; n.enabled=enabled; ComposeTree.current().children.push(n)\n}\nfun Checkbox(checked: Boolean, onCheckedChange: ((Boolean)->Unit)?, modifier: Modifier=Modifier(), enabled: Boolean=true) {\n    val n: dynamic = js("({type:\'Checkbox\',children:[]})")\n    n.checked=checked; n.modifier=modifier.s; n.enabled=enabled; ComposeTree.current().children.push(n)\n}\nfun CircularProgressIndicator(modifier: Modifier=Modifier(), color: Any="", strokeWidth: Int=4) {\n    val n: dynamic = js("({type:\'CircularProgressIndicator\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.current().children.push(n)\n}\nfun LinearProgressIndicator(progress: Float=0f, modifier: Modifier=Modifier(), color: Any="") {\n    val n: dynamic = js("({type:\'LinearProgressIndicator\',children:[]})")\n    n.progress=progress; n.modifier=modifier.s; ComposeTree.current().children.push(n)\n}\nfun AssistChip(onClick: ()->Unit, label: ()->Unit, modifier: Modifier=Modifier(), leadingIcon: (()->Unit)?=null, enabled: Boolean=true) {\n    val n: dynamic = js("({type:\'Chip\',chipType:\'assist\',children:[]})")\n    n.modifier=modifier.s\n    n.label = ComposeTree.captureSlot { label() }\n    ComposeTree.current().children.push(n)\n}\nfun FilterChip(selected: Boolean, onClick: ()->Unit, label: ()->Unit, modifier: Modifier=Modifier(), leadingIcon: (()->Unit)?=null, enabled: Boolean=true) {\n    val n: dynamic = js("({type:\'Chip\',chipType:\'filter\',children:[]})")\n    n.selected=selected; n.modifier=modifier.s\n    n.label = ComposeTree.captureSlot { label() }\n    ComposeTree.current().children.push(n)\n}\nfun SuggestionChip(onClick: ()->Unit, label: ()->Unit, modifier: Modifier=Modifier(), enabled: Boolean=true) {\n    val n: dynamic = js("({type:\'Chip\',chipType:\'suggestion\',children:[]})")\n    n.modifier=modifier.s\n    n.label = ComposeTree.captureSlot { label() }\n    ComposeTree.current().children.push(n)\n}\nfun AlertDialog(onDismissRequest: ()->Unit, title: (()->Unit)?=null, text: (()->Unit)?=null, confirmButton: ()->Unit, dismissButton: (()->Unit)?=null, modifier: Modifier=Modifier()) {\n    val n: dynamic = js("({type:\'AlertDialog\',children:[],title:[],text:[],confirmButton:[],dismissButton:[]})")\n    n.modifier=modifier.s\n    if (title!=null) { n.title = ComposeTree.captureSlot { title() } }\n    if (text!=null) { n.text = ComposeTree.captureSlot { text() } }\n    n.confirmButton = ComposeTree.captureSlot { confirmButton() }\n    if (dismissButton!=null) { n.dismissButton = ComposeTree.captureSlot { dismissButton() } }\n    ComposeTree.current().children.push(n)\n}\nfun DropdownMenu(expanded: Boolean, onDismissRequest: ()->Unit, modifier: Modifier=Modifier(), content: ()->Unit) {\n    if (!expanded) return\n    val n: dynamic = js("({type:\'DropdownMenu\',children:[]})")\n    n.modifier=modifier.s; ComposeTree.push(n); content(); ComposeTree.pop()\n}\nfun DropdownMenuItem(text: ()->Unit, onClick: ()->Unit, modifier: Modifier=Modifier(), leadingIcon: (()->Unit)?=null) {\n    val n: dynamic = js("({type:\'DropdownMenuItem\',children:[]})")\n    n.modifier=modifier.s\n    n.text = ComposeTree.captureSlot { text() }\n    ComposeTree.current().children.push(n)\n}\nfun SnackbarHost(hostState: Any, modifier: Modifier=Modifier(), snackbar: (Any)->Unit={}) {}\nfun items(count: Int, key: ((Int)->Any)?=null, itemContent: (Int)->Unit) { for (i in 0 until minOf(count, 20)) { itemContent(i) } }\nfun <T> items(items: List<T>, key: ((T)->Any)?=null, itemContent: (T)->Unit) { items.take(20).forEach { itemContent(it) } }\nfun item(key: Any?=null, content: ()->Unit) { content() }\nfun rememberLazyListState(): Any = js("({})")\nfun rememberScrollState(): Any = js("({})")\nfun SnackbarHostState(): Any = js("({})")\nfun rememberSnackbarHostState(): Any = js("({})")\nfun rememberModalBottomSheetState(initialValue: Any?=null, skipPartiallyExpanded: Boolean=true): Any = js("({})")\nobject KeyboardOptions { val Default = js("({})") }\nobject KeyboardActions { val Default = js("({})") }\nobject ImeAction { val Done="done"; val Search="search"; val Go="go"; val Next="next" }\nobject KeyboardType { val Text="text"; val Number="number"; val Email="email"; val Password="password" }\nfun PaddingValues(all: Int=0): Any = js("({})")\nfun PaddingValues(horizontal: Int=0, vertical: Int=0): Any = js("({})")\nfun PaddingValues(start: Int=0, top: Int=0, end: Int=0, bottom: Int=0): Any = js("({})")\nobject StaggeredGridCells { fun Fixed(n: Int) = n; fun Adaptive(minSize: Int) = minSize }\nobject GridCells { fun Fixed(n: Int) = n; fun Adaptive(minSize: Int) = minSize }\n\n// ── Entry point called by the browser ────────────────────────────────────────\n@JsExport\nfun renderScreen(content: ()->Unit): dynamic {\n    ComposeTree.reset()\n    content()\n    return ComposeTree.root\n}';
