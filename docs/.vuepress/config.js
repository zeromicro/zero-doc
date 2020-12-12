const moment = require("moment");
module.exports = {
    title: "GoZero",
    description: "集成各种工程实践的 WEB 和 RPC 框架",
    head: [
        ["link", { rel: "icon", href: "/logo.png" }],
        [
            "meta",
            {
                name: "keywords",
                content: "Go,golang,zero,go-zero,micro service,gRPC",
            },
        ],
    ],

    markdown: {
        lineNumbers: true, // 代码块显示行号
    },
    themeConfig: {
        nav: [
            {
                text: "首页",
                link: "/",
            },
            {
                text: "框架文档",
                link: "/zero/",
            },
            {
                text: "GoZero",link: "https://github.com/tal-tech/go-zero",
            },
            {
                text: "CDS",link: "https://github.com/tal-tech/cds",
            },
        ],
        docsDir: "docs",
        docsBranch: "main",
        editLinks: true,
        editLinkText: "在github.com上编辑此页",
        sidebar: {
            '/zero/': getGoZeroSidebar('简介', 'core', 'rest', 'zrpc', 'goctl', '源码解读', 'awesome'),
        },
        sidebarDepth: 2,
        lastUpdated: "上次更新",
        serviceWorker: {
            updatePopup: {
                message: "发现新内容可用",
                buttonText: "刷新",
            },
        },
    },
    plugins: [
        [
            "@vuepress/last-updated",
            {
                transformer: (timestamp, lang) => {
                    // 不要忘了安装 moment
                    const moment = require("moment");
                    moment.locale("zh-cn");
                    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
                },

                dateOptions: {
                    hours12: true,
                },
            },
        ],
        [
            '@vssue/vuepress-plugin-vssue',
            {
                platform: 'github', // v3的platform是github，v4的是github-v4
                locale: 'zh', // 语言
                // 其他的 Vssue 配置
                owner: 'tal-tech', // github账户名
                repo: 'zero-doc', // github一个项目的名称
                clientId: '1252229e5b787945392d',   // 注册的Client ID
                clientSecret: '567d4c19eee82ebd0724b880180f164e96a807a1',   // 注册的Client Secret
                autoCreateIssue: true   // 自动创建评论，默认是false，最好开启，这样首次进入页面的时候就不用去点击创建评论的按钮了。
            },
        ],
        "@vuepress/back-to-top",
        "@vuepress/active-header-links",
        "@vuepress/medium-zoom",
        "@vuepress/nprogress",
    ],
};

// go-zero main document file
function getGoZeroSidebar(A, B, C, D, E, F, G) {
    return [
        {
            title: A,
            collapsable: false,
            children: [
                ['', 'go-zero 简介'],
                'bookstore',
            ]
        },
        {
            title: B,
            collapsable: false,
            children: [
                ['logx', 'logx'],
                'bloom',
                'executors',
                'streamapi-fx',
                ['timingWheel', 'timingWheel'],
                'periodlimit',
                'tokenlimit',
                'redis-lock'
            ]
        },
    ]
}
