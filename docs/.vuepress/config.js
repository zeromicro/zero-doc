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
                text: "框架",
                link: "/frame/",
            },
            { text: "GO中国", link: "https://gocn.vip/" },
            {
                text: "Zero",
                link: "https://github.com/tal-tech/go-zero",
            },
        ],
        docsDir: "docs",
        docsBranch: "main",
        editLinks: true,
        editLinkText: "在github.com上编辑此页",
        sidebar: {
            "/summary/": [""], //这样自动生成对应文章
            "/frame/": [
                {
                    title: "1 简介",
                    collapsable: false, // 可选的, 默认值是 true,
                    children: [
                        "/frame/bookstore",
                    ],
                },
                {
                    title: "2 核心",
                    collapsable: false, // 可选的, 默认值是 true,
                    children: [
                        "/frame/core-logger",
                        "/frame/core-bloom",
                        "/frame/core-executors",
                        "/frame/core-streamapi",
                        "/frame/core-redis",
                    ],
                },
            ], //这样自动生成对应文章
            "/awesome/": [
                {
                    title: "扩展阅读", // 必要的
                    collapsable: false, // 可选的, 默认值是 true,
                    children: ["/awesome/register"],
                },
            ],
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
                platform: 'github', //v3的platform是github，v4的是github-v4
                locale: 'zh', //语言
                // 其他的 Vssue 配置
                owner: 'tal-tech', //github账户名
                repo: 'zero-doc', //github一个项目的名称
                clientId: '1252229e5b787945392d',//注册的Client ID
                clientSecret: '567d4c19eee82ebd0724b880180f164e96a807a1',//注册的Client Secret
                autoCreateIssue:true // 自动创建评论，默认是false，最好开启，这样首次进入页面的时候就不用去点击创建评论的按钮了。
            },
        ],
        "@vuepress/back-to-top",
        "@vuepress/active-header-links",
        "@vuepress/medium-zoom",
        "@vuepress/nprogress",
    ],
};
