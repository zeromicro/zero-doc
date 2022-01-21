// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'go-zero',
  tagline: 'go-zero是一个集成了各种工程实践的web和rpc框架。通过弹性设计保障了大并发服务端的稳定性，经受了充分的实战检验',
  url: 'https://zeromicro.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/go-zero.svg',
  organizationName: 'zeromicro', // Usually your GitHub org/user name.
  projectName: 'zero-doc', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
          apiKey: '0d47915493f6871d9cef0dc511f7e64e',
          indexName: 'go-zero',
      },
      navbar: {
        title: 'Go-zero',
        logo: {
          alt: 'Go-zero Logo',
          src: 'img/go-zero.png',
        },
        items: [
          {
            to: 'docs/intro/brief',
            activeBasePath: 'docs',
            position: 'left',
            label: '文档',
          },
          {to: '/blog', label: '博客', position: 'left'},
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/zeromicro/go-zero',
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
                label: 'docs',
                to: '/docs/intro/brief',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Chat Group',
                href: 'https://join.slack.com/t/go-zero/shared_invite/zt-10ruju779-BE4y6lQNB_R21samtyKTgA',
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
                label: 'GitHub',
                href: 'https://github.com/zeromicro/go-zero',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} go-zero.dev, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
    i18n: {
      defaultLocale: 'zh',
      locales: ['zh', 'en'],
      localeConfigs: {
        zh: {
          label: '中文',
        },
        en: {
          label: 'English',
        },
    },
  },
};

module.exports = config;
