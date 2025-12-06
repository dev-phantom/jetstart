#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('📦 Publishing JetStart packages to npm...\n');

const packages = [
  { name: '@jetstart/shared', dir: 'packages/shared' },
  { name: '@jetstart/core', dir: 'packages/core' },
  { name: '@jetstart/cli', dir: 'packages/cli' }
];

for (const pkg of packages) {
  console.log(`\n🚀 Publishing ${pkg.name}...`);

  try {
    const pkgPath = path.join(__dirname, '..', pkg.dir);

    execSync('npm publish --access public', {
      cwd: pkgPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_AUTH_TOKEN: process.env.NPM_TOKEN
      }
    });

    console.log(`✅ Successfully published ${pkg.name}`);
  } catch (error) {
    console.error(`❌ Failed to publish ${pkg.name}`);
    process.exit(1);
  }
}

console.log('\n🎉 All packages published successfully!');
