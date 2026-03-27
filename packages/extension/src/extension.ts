import * as vscode from 'vscode';
import { SNIPPETS } from './snippets/definitions';
import { ImportCompletionProvider } from './importProvider';
import { classNameFromFile, getPackageInfo } from './packageDetector';
import { getImportEdits } from './importUtils';

export function activate(context: vscode.ExtensionContext) {
  //  Snippet completion provider


  // Registers every snippet prefix as a CompletionItem in .kt files.
  const snippetProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'kotlin', scheme: 'file' },
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const lineText = document.lineAt(position).text;
        const linePrefix = lineText.slice(0, position.character);

        // Don't trigger inside import/package lines
        if (/^\s*(import|package)\s/.test(linePrefix)) { return []; }

        const className = classNameFromFile(document);
        const ctx       = { className };

        return SNIPPETS.map(def => {
          const item = new vscode.CompletionItem(
            def.prefix,
            vscode.CompletionItemKind.Snippet,
          );
          item.label          = def.label;
          item.detail         = def.detail;
          item.documentation  = new vscode.MarkdownString(def.documentation);
          item.insertText     = new vscode.SnippetString(def.body(ctx));
          item.filterText     = def.prefix;
          item.sortText       = '0' + def.prefix; // always sort to top

          // Add imports to the top of the file
          if (def.imports) {
            item.additionalTextEdits = getImportEdits(document, def.imports);
          }

          return item;
        });
      },
    },
    // Trigger on any character — lets you type 'kt' and see suggestions
  );

  // Import auto-complete provider
  const importProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'kotlin', scheme: 'file' },
    new ImportCompletionProvider(),
    '.', // also trigger on dot for Icons.Default etc.
  );

  // Command: Insert Package Declaration
  const insertPkgCmd = vscode.commands.registerCommand(
    'jetstartSnippets.insertPackage',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'kotlin') {
        vscode.window.showWarningMessage('JetStart: Open a Kotlin file first.');
        return;
      }

      const { hasPackage, packageName } = getPackageInfo(editor.document);

      if (hasPackage) {
        vscode.window.showInformationMessage('JetStart: Package already declared.');
        return;
      }

      const pkg = packageName
        ?? await vscode.window.showInputBox({
             prompt: 'Enter package name (e.g. com.example.app.ui)',
             placeHolder: 'com.example.app.ui',
           });

      if (!pkg) { return; }

      await editor.edit((eb: vscode.TextEditorEdit) => {
        eb.insert(new vscode.Position(0, 0), `package ${pkg}\n\n`);
      });
    },
  );

  // Auto-insert package on new .kt file
  // When a brand-new empty .kt file is opened, auto-insert the package line.
  const onOpen = vscode.workspace.onDidOpenTextDocument(async (doc) => {
    if (doc.languageId !== 'kotlin') { return; }
    if (doc.getText().trim().length > 0) { return; } // not empty

    const { hasPackage, packageName } = getPackageInfo(doc);
    if (hasPackage || !packageName) { return; }

    // Wait a tick for the editor to attach
    await new Promise(r => setTimeout(r, 80));
    const editor = vscode.window.visibleTextEditors.find(
      (e: vscode.TextEditor) => e.document.uri.toString() === doc.uri.toString(),
    );
    if (!editor) { return; }

    // Insert as snippet so user can tab through if needed
    await editor.insertSnippet(
      new vscode.SnippetString(`package ${packageName}\n\n$0`),
      new vscode.Position(0, 0),
    );
  });

  context.subscriptions.push(snippetProvider, importProvider, insertPkgCmd, onOpen);

  console.log('JetStart Kotlin & Compose Snippets activated ✅');
}

export function deactivate() {}
