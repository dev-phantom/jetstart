import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/system-requirements',
        'getting-started/troubleshooting-setup',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/creating-first-app',
        'guides/hot-reload-explained',
        'guides/using-qr-codes',
        'guides/working-with-emulators',
        'guides/debugging-tips',
        'guides/production-deployment',
        'guides/performance-optimization',
      ],
    },
    {
      type: 'category',
      label: 'CLI Reference',
      items: [
        'cli/overview',
        'cli/create',
        'cli/dev',
        'cli/build',
        'cli/logs',
        'cli/install-audit',
        'cli/android-emulator',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/hot-reload-system',
        'architecture/websocket-protocol',
        'architecture/build-system',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/rest-endpoints',
        'api/cli-api',
      ],
    },
    {
      type: 'category',
      label: 'Packages',
      items: [
        'packages/cli',
        'packages/core',
        'packages/shared',
        'packages/web',
        'packages/client',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/getting-started',
        'contributing/development-workflow',
        'contributing/coding-standards',
        'contributing/testing',
        'contributing/pull-requests',
        'contributing/release-process',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/connection-problems',
        'troubleshooting/build-errors',
        'troubleshooting/android-sdk-issues',
        'troubleshooting/faq',
      ],
    },
  ],
};

export default sidebars;
