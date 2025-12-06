#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node update-versions.js <version>');
  process.exit(1);
}

console.log(`Updating all packages to version ${newVersion}`);

// Update root package.json
const rootPkgPath = path.join(__dirname, '../package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
rootPkg.version = newVersion;
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
console.log(`✓ Updated root package.json to ${newVersion}`);

// Update packages/shared
const sharedPkgPath = path.join(__dirname, '../packages/shared/package.json');
const sharedPkg = JSON.parse(fs.readFileSync(sharedPkgPath, 'utf8'));
sharedPkg.version = newVersion;
fs.writeFileSync(sharedPkgPath, JSON.stringify(sharedPkg, null, 2) + '\n');
console.log(`✓ Updated packages/shared to ${newVersion}`);

// Update packages/core (version only, workspace deps stay as workspace:*)
const corePkgPath = path.join(__dirname, '../packages/core/package.json');
const corePkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
corePkg.version = newVersion;
fs.writeFileSync(corePkgPath, JSON.stringify(corePkg, null, 2) + '\n');
console.log(`✓ Updated packages/core to ${newVersion}`);

// Update packages/cli (version only, workspace deps stay as workspace:*)
const cliPkgPath = path.join(__dirname, '../packages/cli/package.json');
const cliPkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf8'));
cliPkg.version = newVersion;
fs.writeFileSync(cliPkgPath, JSON.stringify(cliPkg, null, 2) + '\n');
console.log(`✓ Updated packages/cli to ${newVersion}`);

console.log(`\n✅ All packages updated to ${newVersion}`);
