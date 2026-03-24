# JetStart Documentation

This directory contains the official JetStart documentation website, built with [Docusaurus](https://docusaurus.io/).

## Development

### Installation

```bash
cd docs
npm install
```

### Local Development

```bash
npm run dev
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory that can be served using any static hosting service.

### Deployment

The documentation is automatically deployed to Netlify when changes are pushed to the main branch.

## Project Structure

```
docs/
├── blog/                   # Blog posts
├── docs/                   # Documentation markdown files
│   ├── getting-started/   # Getting Started guides
│   ├── cli/               # CLI reference
│   ├── guides/            # Tutorials and guides
│   ├── architecture/      # Architecture documentation
│   ├── api/               # API reference
│   ├── packages/          # Package documentation
│   ├── contributing/      # Contribution guidelines
│   └── troubleshooting/   # Troubleshooting guides
├── src/                    # Custom React components
│   ├── components/        # Reusable components
│   ├── css/               # Custom styles
│   └── pages/             # Custom pages
├── static/                 # Static assets
│   └── img/               # Images
├── docusaurus.config.ts   # Docusaurus configuration
├── sidebars.ts            # Sidebar navigation
└── package.json
```

## Writing Documentation

### Creating a New Document

1. Create a new `.md` file in the appropriate directory under `docs/`
2. Add frontmatter at the top:

```markdown
---
sidebar_position: 1
title: My Document Title
description: A short description of the document
---

# My Document Title

Content goes here...
```

3. Update `sidebars.ts` if needed

### Markdown Features

Docusaurus supports enhanced Markdown with:

- Code blocks with syntax highlighting
- Admonitions (:::tip, :::warning, etc.)
- Tabs
- MDX (React components in Markdown)

See [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features) for more.

## Branding

The documentation uses the JetStart brand colors:

- **Primary**: #FA8F14 (Orange)
- **Secondary**: #F04023 (Red-Orange)
- **Background Dark**: #160E36 (Dark Purple)
- **Background Darker**: #120A24 (Deep Purple)
- **Foreground**: #F8F3F0 (Cream)

These are configured in `src/css/custom.css`.

## Contributing

Contributions to the documentation are welcome! Please:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Test locally with `npm start`
5. Submit a pull request

## License

MIT
