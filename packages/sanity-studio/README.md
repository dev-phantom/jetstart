# @jetstart/sanity-studio

Sanity Studio instance powering the content backend for [jetstart.site](https://jetstart.site) blog.

## Overview

This package is the CMS for the JetStart documentation site. It runs a Sanity Studio connected to the JetStart Sanity project, where documentation pages, changelog entries, and site content are authored and published.

It is not part of the hot reload toolchain — it exists purely to manage website content.

---

## Development

```bash
# Install dependencies (from monorepo root)
npm install

# Start Sanity Studio locally
npm run dev --workspace=packages/sanity-studio
# Opens at http://localhost:3333
```

---

## Deployment

The studio is deployed to Netlify. See `netlify.toml` in this package for the build configuration.

```bash
# Build for production
npm run build --workspace=packages/sanity-studio

# Deploy via monorepo deploy script
npm run deploy:sanity
```

---

## Schema

Content type schemas live in `schemaTypes/`. Refer to the [Sanity documentation](https://www.sanity.io/docs) for schema authoring guidance.

---

## Configuration

- `sanity.config.ts` — project ID, dataset, and plugin configuration
- `sanity.cli.ts` — CLI configuration for `sanity` commands
- `.env.local` — local environment overrides (not committed)

---

## Links

- [Sanity documentation](https://www.sanity.io/docs/introduction/getting-started)
- [Sanity community](https://www.sanity.io/community/join)
- [Extending Sanity Studio](https://www.sanity.io/docs/content-studio/extending)

