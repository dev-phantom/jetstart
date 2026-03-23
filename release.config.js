module.exports = {
  branches: ['master', 'develop'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
      [
        '@semantic-release/github',
        {
          assets: [
            {
              path: 'packages/client/app/build/outputs/apk/release/app-release.apk',
              label: 'Android Client (Release)',
            },
          ],
        },
      ],
  ],
};
