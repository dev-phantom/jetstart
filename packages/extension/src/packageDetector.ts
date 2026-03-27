
import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Tries to determine the Kotlin package name for a document.
 *
 * Priority:
 *   1. Already declared in the file (package line exists) → return null
 *      (caller uses this to skip adding package again)
 *   2. Derive from file path after java/ or kotlin/ source root
 *   3. Fall back to null (snippet will use a tab-stop placeholder)
 */
export function getPackageInfo(document: vscode.TextDocument): {
  hasPackage: boolean;
  packageName: string | null;
  subPackage: string | null; // just the last segment e.g. "ui", "data"
} {
  const text = document.getText();

  // Check if file already has a package declaration
  const existing = text.match(/^\s*package\s+([\w.]+)/m);
  if (existing) {
    return { hasPackage: true, packageName: existing[1], subPackage: null };
  }

  // Derive from file path
  const filePath = document.uri.fsPath.replace(/\\/g, '/');

  // Match Android project structure: .../java/<com/example/app/subpkg>/FileName.kt
  const match = filePath.match(/\/(?:java|kotlin)\/((?:[\w]+\/)*[\w]+)\/[^/]+\.kt$/);
  if (match) {
    const pkg = match[1].replace(/\//g, '.');
    const parts = pkg.split('.');
    const subPackage = parts.length > 1 ? parts[parts.length - 1] : null;
    return { hasPackage: false, packageName: pkg, subPackage };
  }

  return { hasPackage: false, packageName: null, subPackage: null };
}

/**
 * Derives a class name suggestion from the file name.
 * e.g. "notes_screen.kt" → "NotesScreen"
 *      "NoteItem.kt"     → "NoteItem"
 */
export function classNameFromFile(document: vscode.TextDocument): string {
  const fileName = path.basename(document.uri.fsPath, '.kt');
  // PascalCase: split on _ or - or existing camel humps
  return fileName
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());
}

/**
 * Builds the package prefix string to prepend to a snippet body.
 * Returns "" if the file already declares a package (don't re-add it).
 * Returns "package <detected>\n\n" if we could detect the package.
 * Returns "package ${1:com.example}\n\n" (tab stop) if we could not detect.
 */
export function buildPkgLine(document: vscode.TextDocument): string {
  const { hasPackage, packageName } = getPackageInfo(document);

  if (hasPackage) {
    return ''; // file already has package — don't add another
  }

  if (packageName) {
    return `package ${packageName}\n\n`;
  }

  // Unknown — let user fill it in
  return 'package ${1:com.example}\n\n';
}
