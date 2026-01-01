import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'src',
  title: 'Crowlog',
  lang: 'en-US',
  lastUpdated: true,
  outDir: './dist',
  cleanUrls: true,
  markdown: {
    theme: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
  },
  description: 'Crowlog is a simple, lightweight, zero-dependency, and extendable logging library that is designed to be used in any project.',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo-dark.svg' }],
  ],
  themeConfig: {
    siteTitle: 'Crowlog',
    logo: {
      dark: '/logo-light.svg',
      light: '/logo-dark.svg',
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Sponsor the project', link: 'https://github.com/sponsors/CorentinTh' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Basic Usage', link: '/basic-usage' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Child Loggers', link: '/guides/child-loggers' },
          { text: 'Logger Factories', link: '/guides/logger-factories' },
          { text: 'Pretty Printing', link: '/guides/pretty-logging' },
          { text: 'Testing with Crowlog', link: '/guides/testing-with-crowlog' },
        ],
      },
      {
        text: 'Transports',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/transports/' },
          { text: 'Stdout Transport', link: '/transports/stdout' },
          { text: 'In-Memory Transport', link: '/transports/in-memory' },
          { text: 'Writing Custom Transports', link: '/transports/custom' },
        ],
      },
      {
        text: 'Plugins',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/plugins/' },
          { text: 'Filter Plugin', link: '/plugins/filter' },
          { text: 'Redact Plugin', link: '/plugins/redact' },
          { text: 'Global Context Plugin', link: '/plugins/global-context' },
          { text: 'Async Context Plugin', link: '/plugins/async-context' },
          { text: 'Writing Custom Plugins', link: '/plugins/custom' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'Secure Publishing', link: '/resources/secure-publishing' },
          { text: 'Credits', link: '/resources/credits' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CorentinTh/crowlog' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2025-present Corentin Thomasset`,
    },

    editLink: {
      pattern: 'https://github.com/CorentinTh/crowlog/edit/main/apps/docs/src/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },
  },
});
