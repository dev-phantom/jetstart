#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Publishing JetStart packages to npm...\n');

const packages = [
  { name: '@jetstart/shared', dir: 'packages/shared' },
  { name: '@jetstart/core', dir: 'packages/core' },
  { name: '@jetstart/cli', dir: 'packages/cli' }
];

// Get the current version from root package.json
const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = rootPkg.version;

for (const pkg of packages) {
  console.log(`\n🚀 Publishing ${pkg.name}...`);

  try {
    const pkgPath = path.join(__dirname, '..', pkg.dir);
    const pkgJsonPath = path.join(pkgPath, 'package.json');

    // Read package.json
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const originalPkgJson = JSON.stringify(pkgJson, null, 2);

    // Replace file: dependencies with version numbers
    if (pkgJson.dependencies) {
      for (const [depName, depVersion] of Object.entries(pkgJson.dependencies)) {
        if (depVersion.startsWith('file:')) {
          pkgJson.dependencies[depName] = `^${version}`;
          console.log(`  → Updated ${depName}: ${depVersion} → ^${version}`);
        }
      }
    }

    // Write updated package.json
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');

    // Publish
    execSync('npm publish --access public', {
      cwd: pkgPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_AUTH_TOKEN: process.env.NPM_TOKEN
      }
    });

    // Restore original package.json
    fs.writeFileSync(pkgJsonPath, originalPkgJson + '\n');

    console.log(`✅ Successfully published ${pkg.name}`);
  } catch (error) {
    console.error(`❌ Failed to publish ${pkg.name}`);
    process.exit(1);
  }
}

console.log('\n🎉 All packages published successfully!');
