import * as vscode from 'vscode';

/**
 * Find the line number after which to insert a new import.
 * Priority:
 * 1. After the last existing import.
 * 2. After the package declaration.
 * 3. At the beginning of the file.
 */
export function findImportInsertLine(document: vscode.TextDocument): number {
  let lastImportLine = -1;
  let packageLine = -1;

  // Scan the first 100 lines for package and import declarations
  const lineCount = Math.min(document.lineCount, 100);
  for (let i = 0; i < lineCount; i++) {
    const text = document.lineAt(i).text.trim();
    if (text.startsWith('package ')) {
      packageLine = i;
    }
    if (text.startsWith('import ')) {
      lastImportLine = i;
    }
    // If we hit a class/fun/val/var declaration, we've likely passed the header
    if (/^\s*(class|fun|interface|object|val|var|sealed|data|enum)\s/.test(text)) {
      break;
    }
  }

  if (lastImportLine >= 0) {
    return lastImportLine + 1;
  }
  if (packageLine >= 0) {
    return packageLine + 2; // Add a blank line if possible
  }
  return 0;
}

/**
 * Returns a list of TextEdits to add missing imports.
 */
export function getImportEdits(document: vscode.TextDocument, imports: string[]): vscode.TextEdit[] {
  const existingText = document.getText();
  const missingImports = imports.filter(imp => !existingText.includes(`import ${imp}`));

  if (missingImports.length === 0) {
    return [];
  }

  const insertLine = findImportInsertLine(document);
  return missingImports.map(imp => 
    vscode.TextEdit.insert(new vscode.Position(insertLine, 0), `import ${imp}\n`)
  );
}
