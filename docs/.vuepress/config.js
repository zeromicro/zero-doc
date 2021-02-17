const moment = require("moment");
module.exports = {
    title: "go-zero",
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
                text: "go-zero",link: "https://github.com/tal-tech/go-zero",
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
            '/zero/': getGoZeroSidebar('简介', '开发指南', 'core', 'rest', 'zrpc', 'goctl', '源码解读', 'awesome'),
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
                clientSecret: 'c424d19a9cb758d0800f644376b0b4dd24828c94',   // 注册的Client Secret
                autoCreateIssue: false   // 自动创建评论，默认是false，最好开启，这样首次进入页面的时候就不用去点击创建评论的按钮了。
            },
        ],
        "@vuepress/back-to-top",
        "@vuepress/active-header-links",
        "@vuepress/medium-zoom",
        "@vuepress/nprogress",
    ],
};

// go-zero main document file
function getGoZeroSidebar(A, B, C, D, E, F, G, H) {
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
                '开发指南',
                '快速开始',
                '功能描述',
                ['HTTP Middleware', 'HTTP Middleware'],
                '自定义错误返回',
                '创建API服务',
                'model生成',
                '用户注册',
                '用户登陆',
                'JWT生成',
                '获取用户信息(JWT鉴权)',
                '获取用户信息(header)',
                '中间件使用',
                'rpc调用',
            ]
        },
        {
            title: C,
            collapsable: false,
            children: [
                ['logx', 'logx'],
                'bloom',
                'executors',
                'streamapi-fx',
                ['timingWheel', 'timingWheel'],
                'periodlimit',
                'tokenlimit',
                ['store all', 'store all'],
                'store mysql',
                'redis-lock',
            ]
        },
        {
            title: D,
            collapsable: false,
            children: [
                ['server', 'server'],
                'JWT鉴权中间件',
                '自适应融断中间件',
                '验签中间件',
                'TraceHandler',
                'params',
                'router',
                'tokenparser',
                'rest engine',
            ]
        },
        {
            title: E,
            collapsable: false,
            children: [
                ['zrpc简介', '简介'],
                ['zrpc目录结构', '目录结构'],
                '参数配置客户端',
                '参数配置服务端',
                '项目创建',
                ['zrpc服务端', '服务端'],
                ['zrpc客户端', '客户端'],
                '自定义拦截器',
                '服务注册',
                '负载均衡',
            ]
        },
        {
            title: F,
            collapsable: false,
            children: [
                'goctl-overview',
                'goctl-api',
                'goctl-rpc',
                'goctl-model',
                'goctl-template',
                'goctl-plugin',
                'goctl-docker',
                'goctl-kube',
                '附录1',
                '附录2',
                '附录3',
            ]
        },
        {
            title: H,
            collapsable: false,
            children: [
                '10月3日线上交流问题汇总',
            ]
        },
    ]
}
