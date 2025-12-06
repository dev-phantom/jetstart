# 1.0.0 (2025-12-06)


* feat!: initial stable release of JetStart ([cad9baf](https://github.com/dev-phantom/jetstart/commit/cad9bafd925df50fd030e9d63c5a1cc0d5946dd0))


### Bug Fixes

* add missing Android client resources and theme ([cd7a399](https://github.com/dev-phantom/jetstart/commit/cd7a3990e3d652d00972f4416c7b007426770bac))
* add missing Typography definition for client theme ([36b7eb3](https://github.com/dev-phantom/jetstart/commit/36b7eb351001d82383da269b07ce50013130d1f2))
* **ci:** add CLI bin directory to git for CI execution ([f449dd8](https://github.com/dev-phantom/jetstart/commit/f449dd88e6638b150662e2a67d2a51d3bb84c788))
* **ci:** only build and test published packages (shared, core, cli) ([8b97c7b](https://github.com/dev-phantom/jetstart/commit/8b97c7bd1c518c99ed2c0e57dc7aa62669bd5159))
* **ci:** run CLI directly with node instead of npm link ([04e86e7](https://github.com/dev-phantom/jetstart/commit/04e86e70458b607b2bc830216bbc2bc07b041c56))
* **ci:** update Node.js version to 22.x for semantic-release ([f2bd18f](https://github.com/dev-phantom/jetstart/commit/f2bd18ffe6a763f533c184b8278321b987539c10))
* **ci:** use local CLI build instead of npx for testing ([6a99031](https://github.com/dev-phantom/jetstart/commit/6a99031042b2897bffd6c7101597158381dc5c20))
* fixing the cicd ([4038413](https://github.com/dev-phantom/jetstart/commit/403841373df275e47e78f5fef5573e86cb1ff896))
* TypeScript build configuration and implement Core build module ([9b23cc0](https://github.com/dev-phantom/jetstart/commit/9b23cc0c983e55373cde3b56cdddd0ed3b3ff7a5))


### Features

* **ci:** add automatic release based on conventional commits ([9614966](https://github.com/dev-phantom/jetstart/commit/9614966f6f62128f8f9ed5c11f71c1e1c1ca3795))
* **ci:** add automatic versioning and improve release workflow ([88b55c7](https://github.com/dev-phantom/jetstart/commit/88b55c702d29874842e417c669da24df92198bf3))
* configure semantic-release for automated versioning ([6c61602](https://github.com/dev-phantom/jetstart/commit/6c61602861e277734f77cc70238a4c040082c69c))
* Implement DSL parsing and hot reload for UI components ([6cbd45a](https://github.com/dev-phantom/jetstart/commit/6cbd45a58f19ca8246ee87566aa597e048ff5211))
* implement working QR scanner with CameraX and ML Kit ([6592b1f](https://github.com/dev-phantom/jetstart/commit/6592b1f336af12d70d6a193aa43c7fc949620144))
* integrate CLI with Core server and implement hot reload foundation ([4eaecd9](https://github.com/dev-phantom/jetstart/commit/4eaecd982f1ee8359b3505281a2bd72f21606fce))
* JetStart v0.1.0 - blazing fast hot reload for Android Compose ([6c46ced](https://github.com/dev-phantom/jetstart/commit/6c46ced50b7846e2be9ed825be5e335ceaa8a309))
* JetStart v0.1.0 - blazing fast hot reload for Android Compose ([9e963f4](https://github.com/dev-phantom/jetstart/commit/9e963f4fb81923bbf4a329a1dccd511468ecb9ef))
* new update ([2f7f458](https://github.com/dev-phantom/jetstart/commit/2f7f458976c2cac3307124361100ff6add23989e))


### BREAKING CHANGES

* First stable release - establishes public API
* **ci:** /! → major bump (0.1.0 → 1.0.0)
- Automatically bumps versions in all packages
- Creates git tag and GitHub release
- Skips if no conventional commits found

Usage: Just commit with conventional commit format and push to master!

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
