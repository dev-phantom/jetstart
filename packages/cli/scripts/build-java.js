const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const isWin = os.platform() === 'win32';

// __dirname = packages/cli/scripts  →  ../template/base/gradlew[.bat]
const gradlewAbs = isWin
  ? path.resolve(__dirname, '..', 'template', 'base', 'gradlew.bat')
  : path.resolve(__dirname, '..', 'template', 'base', 'gradlew');

/**
 * On Windows, validate the current JAVA_HOME env var and fall back to probing
 * common JDK install locations if it is missing or points to a stale path.
 * Returns the resolved JAVA_HOME string, or null if no JDK is found.
 */
function resolveJavaHome() {
  if (!isWin) return process.env.JAVA_HOME || null;

  // Use the current JAVA_HOME if it already points to a valid java.exe
  const current = process.env.JAVA_HOME;
  if (current && fs.existsSync(path.join(current, 'bin', 'java.exe'))) {
    return current;
  }

  // Probe common Windows JDK install locations
  const roots = [
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    'C:\\Program Files\\Microsoft',
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Eclipse Adoptium'),
    path.join(os.homedir(), '.jdks'),
  ].filter(r => { try { return fs.existsSync(r); } catch { return false; } });

  for (const root of roots) {
    // root itself is the JDK (e.g. JAVA_HOME pointing directly to the JDK root)
    if (fs.existsSync(path.join(root, 'bin', 'java.exe'))) return root;
    // root contains versioned subdirectories (e.g. Eclipse Adoptium\jdk-17.x.x)
    try {
      for (const entry of fs.readdirSync(root)) {
        const candidate = path.join(root, entry, 'bin', 'java.exe');
        if (fs.existsSync(candidate)) return path.join(root, entry);
      }
    } catch { /* ignore permission errors */ }
  }
  return null;
}

console.log('Building and publishing Java packages locally...');

const javaHome = resolveJavaHome();
if (isWin && !javaHome) {
  console.error('\nCould not find a valid JDK installation.');
  console.error('Set JAVA_HOME to your JDK 17+ directory, or run:');
  console.error('  jetstart create my-app --full-install\n');
  process.exit(1);
}

const env = { ...process.env };
if (javaHome) env.JAVA_HOME = javaHome;

try {
  if (!isWin) {
    execSync(`chmod +x "${gradlewAbs}"`);
  }
  console.log('\n[1/2] Publishing hot-reload-runtime...');
  execSync(`"${gradlewAbs}" publish`, {
    cwd: path.resolve(__dirname, '../../hot-reload-runtime'),
    stdio: 'inherit',
    env,
  });

  console.log('\n[2/2] Publishing gradle-plugin...');
  execSync(`"${gradlewAbs}" publish`, {
    cwd: path.resolve(__dirname, '../../gradle-plugin'),
    stdio: 'inherit',
    env,
  });

  console.log('\nSuccessfully bundled Java dependencies into packages/cli/maven-repo!');
} catch (error) {
  console.error('\nFailed to build Java packages:', error.message);
  process.exit(1);
}
