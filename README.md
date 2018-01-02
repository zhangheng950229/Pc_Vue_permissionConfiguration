# Permission

## 目录结构
```shell
├── build                      // 构建相关  
├── config                     // 配置相关
├── src                        // 源代码
│   ├── api                    // 所有请求
│   ├── assets                 // 主题 字体等静态资源
│   ├── components             // 全局公用组件
│   ├── filtres                // 全局filter
│   ├── router                 // 路由
│   ├── styles                 // 全局样式
│   ├── utils                  // 全局公用方法
│   ├── views                  // 业务视图
│   ├── App.vue                // 入口页面
│   └── main.js                // 入口 加载组件 初始化等
├── static                     // 第三方不打包资源
├── .babelrc                   // babel-loader 配置
├── eslintrc.js                // eslint 配置项
├── .gitignore                 // git 忽略项
├── favicon.ico                // favicon图标
├── index.html                 // html模板
└── package.json               // package.json

```

## Notes
* 新增db.json 用于本地json Mock
* 本地Mock 采用 json-server 搭建
* 新增Webpack打包资源分析 @/statistics.html - stats.json
* 通过element-variables.scss修改基本变量
* 注意重写Element ui 样式表 - /theme/index.css
* 新开发页面仅仅需要于@/router/index.js 中新增对应的路由，且将组件挂载好即可，无需更改菜单文件
* Add Element-ui Theme
* Write the route and render the sidebar menu automaticly
* `@` ref `src`
* Add Vue Render Function
* Axios default config --> utils/fetch.base.js (line.11)

    the server need to set cors response header
    
    can use the mockServer_pc now
* Use VueAxios --> can use axios in this.$http
* dev-server option

    @config/index.js ---> dev.proxyTable

    The common is an example

    more option github ---> http-proxy-middleware


## Build Setup

``` bash
# install dependencies
npm install

# run the mock server 
npm run mock

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
