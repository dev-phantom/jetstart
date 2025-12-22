# [1.4.0](https://github.com/dev-phantom/jetstart/compare/v1.3.1...v1.4.0) (2025-12-22)


### Bug Fixes

* changed the ui for the client ([208a4b5](https://github.com/dev-phantom/jetstart/commit/208a4b5676b1dd82563ba7e23dc88a6eb80f325f))
* reduced qr code ([08da272](https://github.com/dev-phantom/jetstart/commit/08da272180dc2ea2360c11e668277cc1bddf8f28))


### Features

* added new jetstart theme color for web ([44772de](https://github.com/dev-phantom/jetstart/commit/44772de2f4f6af88106a05e02ab7e31c08b4f475))
* migrate to client-side blog, update branding, and config deployment ([308a7f9](https://github.com/dev-phantom/jetstart/commit/308a7f91ba864b69643cf558669614c54dd1bab2))
* working on landing page ([ec6c9a4](https://github.com/dev-phantom/jetstart/commit/ec6c9a4efe657d0e74c30ca4c2b5c08c76711afa))

## [1.3.1](https://github.com/dev-phantom/jetstart/compare/v1.3.0...v1.3.1) (2025-12-14)


### Bug Fixes

* fixed netlify deployment issue ([0a0266c](https://github.com/dev-phantom/jetstart/commit/0a0266c1bb69a5f45c39172473e4d43ee8e7ee65))
* fixed netlify deployment issue ([95a5290](https://github.com/dev-phantom/jetstart/commit/95a52901ed24b2fc81a15de43e2aa4fc8c2be9f7))

# [1.3.0](https://github.com/dev-phantom/jetstart/compare/v1.2.0...v1.3.0) (2025-12-14)


### Bug Fixes

* fix tserrors ([af0ee10](https://github.com/dev-phantom/jetstart/commit/af0ee10118bf81e1aaa87a346a36fe29be594c06))
* fixed emulator issue ([75932b3](https://github.com/dev-phantom/jetstart/commit/75932b3853b01d3de02550c55db5f2bb7dfae2fc))
* fixed netlify node version compactibility ([ea37148](https://github.com/dev-phantom/jetstart/commit/ea371482f39b36abf495dad58d6844f85db0bf6b))
* fixed netlify node version compactibility ([52a0934](https://github.com/dev-phantom/jetstart/commit/52a0934760d736d676f5270fa6f25b2119f8d667))


### Features

* a whole lot ([14b8cf9](https://github.com/dev-phantom/jetstart/commit/14b8cf9648b2b2efc6486bfacffd52753d55ad9d))

# [1.2.0](https://github.com/dev-phantom/jetstart/compare/v1.1.4...v1.2.0) (2025-12-10)


### Features

* Enhance WebSocket connection management with session isolation and update deployment documentation ([a6b40d5](https://github.com/dev-phantom/jetstart/commit/a6b40d5805342a5dd3ffcb7768f7fc4c383c6555))
* Implement DSL rendering components and performance metrics tracking ([c3cfb43](https://github.com/dev-phantom/jetstart/commit/c3cfb439df0fc6aa5b047f61599cef5e9e187fec))

## [1.1.4](https://github.com/dev-phantom/jetstart/compare/v1.1.3...v1.1.4) (2025-12-07)


### Bug Fixes

* embed Kotlin template files directly in CLI ([77f81d9](https://github.com/dev-phantom/jetstart/commit/77f81d96c461b89064652ffa4d74705b40563b94))

## [1.1.3](https://github.com/dev-phantom/jetstart/compare/v1.1.2...v1.1.3) (2025-12-06)


### Bug Fixes

* **cli:** add missing @jetstart/core dependency ([4abf755](https://github.com/dev-phantom/jetstart/commit/4abf7558efb6d093f28e0a008c9ab4f31086893b))

## [1.1.2](https://github.com/dev-phantom/jetstart/compare/v1.1.1...v1.1.2) (2025-12-06)


### Bug Fixes

* **publish:** replace file: dependencies with version numbers before publishing ([56b8991](https://github.com/dev-phantom/jetstart/commit/56b89915552ff53e18b096ad03e13c7d860873a6))

## [1.1.1](https://github.com/dev-phantom/jetstart/compare/v1.1.0...v1.1.1) (2025-12-06)


### Bug Fixes

* trigger npm package publishing ([f9889a1](https://github.com/dev-phantom/jetstart/commit/f9889a1847b1746ef9575301be2aecafe283a8ae))

# [1.1.0](https://github.com/dev-phantom/jetstart/compare/v1.0.0...v1.1.0) (2025-12-06)


### Bug Fixes

* **ci:** delete package-lock.json before npm install ([11545f8](https://github.com/dev-phantom/jetstart/commit/11545f8447c0e13a48a9cf48b77ac271a459b784))
* **ci:** install dependencies per package to avoid workspace resolution ([22a0999](https://github.com/dev-phantom/jetstart/commit/22a0999066a6cd28e22e8c841f5243e4e435a230))
* **ci:** resolve workspace dependency installation ([0fe91bc](https://github.com/dev-phantom/jetstart/commit/0fe91bc51a725fe3662865a3603ecf0f70e04a10))
* **ci:** simplify workflow to build packages independently ([ccdce89](https://github.com/dev-phantom/jetstart/commit/ccdce89f25b3d2195ba01a1f41a80905bc77165e))
* **ci:** use npm install instead of npm ci for monorepo ([f99c2da](https://github.com/dev-phantom/jetstart/commit/f99c2daf5c5329b5adec18550ab89ef3a008a0e6))
* **ci:** use npm install instead of npm ci in CI workflow ([d6f9b9b](https://github.com/dev-phantom/jetstart/commit/d6f9b9b04516a3b426f8e3c6196bc3046b3e3575))
* use * instead of workspace:* for npm compatibility ([1e32690](https://github.com/dev-phantom/jetstart/commit/1e32690759711df6aec8870a264f979c62d4e23c))
* use file: protocol for local workspace dependencies ([d8f98a4](https://github.com/dev-phantom/jetstart/commit/d8f98a441496233a1ca66811fc6baab45258203a))
* use workspace protocol for monorepo dependencies ([93dda09](https://github.com/dev-phantom/jetstart/commit/93dda09217941f649ab141297e25da2e53cf2ef5))
* **workspace:** use file: protocol and fix workspace configuration ([00438a9](https://github.com/dev-phantom/jetstart/commit/00438a99d9537db11cb5863f24fd5bcfa684f5e3))


### Features

* **ci:** enable npm publishing in semantic-release ([a1e96b9](https://github.com/dev-phantom/jetstart/commit/a1e96b9af739990054042d16da2e75bb47ca02f7))
* publishing to npm ([d2e790e](https://github.com/dev-phantom/jetstart/commit/d2e790eb54355131fc8c251c50724daf86ca9b5c))

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
