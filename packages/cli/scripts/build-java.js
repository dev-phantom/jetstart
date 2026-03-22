const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const isWin = os.platform() === 'win32';
const gradlew = isWin ? '..\\\\template\\\\base\\\\gradlew.bat' : '../template/base/gradlew';

console.log('Building and publishing Java packages locally...');

try {
  console.log('\\n[1/2] Publishing hot-reload-runtime...');
  execSync(`${gradlew} publish`, {
    cwd: path.resolve(__dirname, '../../hot-reload-runtime'),
    stdio: 'inherit'
  });

  console.log('\\n[2/2] Publishing gradle-plugin...');
  execSync(`${gradlew} publish`, {
    cwd: path.resolve(__dirname, '../../gradle-plugin'),
    stdio: 'inherit'
  });

  console.log('\\nSuccessfully bundled Java dependencies into packages/cli/maven-repo!');
} catch (error) {
  console.error('\\nFailed to build Java packages:', error.message);
  process.exit(1);
}
