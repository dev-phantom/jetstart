"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prism_react_renderer_1 = require("prism-react-renderer");
const config = {
    title: 'JetStart',
    tagline: 'Launch Android apps at warp speed',
    favicon: 'img/favicon.ico',
    // Set the production url of your site here
    url: 'https://jetstart.dev',
    // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl: '/',
    // GitHub pages deployment config.
    organizationName: 'dev-phantom',
    projectName: 'jetstart',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    editUrl: 'https://github.com/dev-phantom/jetstart/tree/main/docs/',
                    showLastUpdateTime: true,
                    showLastUpdateAuthor: true,
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true,
                    },
                    // Please change this to your repo.
                    editUrl: 'https://github.com/dev-phantom/jetstart/tree/main/docs/',
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            },
        ],
    ],
    themeConfig: {
        // Replace with your project's social card
        image: 'img/jetstart-social-card.png',
        navbar: {
            title: 'JetStart',
            logo: {
                alt: 'JetStart Logo',
                src: 'img/logos/jetstart-logo-4-primary.png',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    position: 'left',
                    label: 'Docs',
                },
                { to: '/blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/dev-phantom/jetstart',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Getting Started',
                            to: '/docs/getting-started/introduction',
                        },
                        {
                            label: 'CLI Reference',
                            to: '/docs/cli/overview',
                        },
                        {
                            label: 'Architecture',
                            to: '/docs/architecture/overview',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'GitHub Discussions',
                            href: 'https://github.com/dev-phantom/jetstart/discussions',
                        },
                        {
                            label: 'Issues',
                            href: 'https://github.com/dev-phantom/jetstart/issues',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: '/blog',
                        },
                        {
                            label: 'npm',
                            href: 'https://www.npmjs.com/package/@jetstart/cli',
                        },
                        {
                            label: 'Contributing',
                            to: '/docs/contributing/getting-started',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} JetStart. Built with Docusaurus.`,
        },
        prism: {
            theme: prism_react_renderer_1.themes.vsDark,
            additionalLanguages: ['kotlin', 'bash', 'typescript', 'json', 'gradle'],
        },
        colorMode: {
            defaultMode: 'dark',
            disableSwitch: true,
            respectPrefersColorScheme: false,
        },
    },
};
exports.default = config;
//# sourceMappingURL=docusaurus.config.js.map