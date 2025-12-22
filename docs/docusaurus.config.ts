import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'JetStart',
  tagline: 'Launch Android apps at warp speed',
  favicon: 'img/logos/logo.png',

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
          editUrl:
            'https://github.com/dev-phantom/jetstart/tree/main/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false, // Disable the static blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    async function myPlugin(context, options) {
      return {
        name: 'docusaurus-plugin-sanity-blog',
        async contentLoaded({content, actions}) {
          const {addRoute} = actions;
          addRoute({
            path: '/blog/:slug',
            component: '@site/src/components/BlogPost.tsx',
            exact: true,
          });
        },
      };
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/jetstart-social-card.png',
    navbar: {
      title: 'JetStart',
      logo: {
        alt: 'JetStart Logo',
        src: 'img/logos/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blogs', label: 'Blog', position: 'left'},
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
              to: '/blogs',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@jetstart/cli',
            },
            {
              label: 'Contributing',
              to: '/docs/contributing/getting-started',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/dev-phantom/jetstart/blob/master/CHANGELOG.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} JetStart. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.vsDark,
      additionalLanguages: ['kotlin', 'bash', 'typescript', 'json', 'gradle'],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
