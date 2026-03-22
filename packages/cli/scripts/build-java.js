const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const isWin = os.platform() === 'win32';

// __dirname = packages/cli/scripts  →  ../template/base/gradlew[.bat]
const gradlewAbs = isWin
  ? path.resolve(__dirname, '..', 'template', 'base', 'gradlew.bat')
  : path.resolve(__dirname, '..', 'template', 'base', 'gradlew');

console.log('Building and publishing Java packages locally...');

try {
  if (!isWin) {
    execSync(`chmod +x "${gradlewAbs}"`);
  }
  console.log('\n[1/2] Publishing hot-reload-runtime...');
  execSync(`"${gradlewAbs}" publish`, {
    cwd: path.resolve(__dirname, '../../hot-reload-runtime'),
    stdio: 'inherit'
  });

  console.log('\n[2/2] Publishing gradle-plugin...');
  execSync(`"${gradlewAbs}" publish`, {
    cwd: path.resolve(__dirname, '../../gradle-plugin'),
    stdio: 'inherit'
  });

  console.log('\nSuccessfully bundled Java dependencies into packages/cli/maven-repo!');
} catch (error) {
  console.error('\nFailed to build Java packages:', error.message);
  process.exit(1);
}
