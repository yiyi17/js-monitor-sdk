# @pvjs/js-monitor-sdk

@pvjs/js-monitor-sdk, 前端 AMP 日志上报 SDK，支持性能、运行错误、接口性能、资源加载、接口非 200 监控

## 使用

实例化之后，自采集数据

TODO:

数据的收集服务需要自己建设，这里需要修改接口在 config 文件中 `SERVER_URL`、`IP_SERVER_URL`

```JS
import JSLogger from 'js-monitor-sdk'


const monitor = new JSLogger({
  performance: true,// 采集性能，默认关闭
  resourceError: true,// 采集资源加载错误，默认关闭
  request: true,// 采集请求异常与慢请求，默认关闭
  runtimeError: true,// 采集错误，默认关闭
  userActions: true;// 采集错误上下文，默认关闭
  trace: {
    open: true,// 接入trace，请务必关注后端是否允许请求头「X-B3-Traceid」跨域，默认关闭
    apiList: ['localhost', '127.0.0.1', '/api/v1'],// 配置需要支持trace的接口，支持字符串匹配
    ignoreList: [] // 忽略的接口地址，会覆盖hostList
  },
  common: { // 采集的公共字段
    disableLog: process.env.NODE_ENV==='development',// 是否禁止日志上报，建议本地改为 true
    projectId: 'test', // 项目id，唯一标识，必传
    // xxx 也可以在这里配置上传的字段，例如userId,
    userId: 'xxx',// 非必传，
    extra:{
      // ... 其他字段，非必传
    }
  },
});

```

配置环境变量

```JS
// vite
 define: {
    },

// webpack

{
   new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
    })
}

```

CDN 接入方式

```html
<script src="https://unpkg.com/@pvjs/js-monitor-sdk@版本号/dist/js-monitor-sdk.umd.js"></script>
<script>

  const monitor = new __JSLogger__({
    performance: true,// 采集性能，默认关闭
    resourceError: true,// 采集资源加载错误，默认关闭
    request: true,// 采集请求异常，默认关闭
    runtimeError: true,// 采集错误，默认关闭
    userActions: true;// 采集错误上下文，默认关闭
    trace: {
      open: true,// 接入trace，请务必关注后端是否允许请求头「X-B3-Traceid」跨域
      apiList: ['localhost', '127.0.0.1', '/api/v1'],// 配置需要支持trace的接口，支持字符串匹配
      ignoreList: [] // 忽略的接口地址，会覆盖hostList
    },// 接入trace，默认关闭
    common: {
     disableLog: false,// 是否禁止日志上报，建议本地改为 true
      projectId: 'test', // 项目id，唯一标识，必传
      // xxx 也可以在这里配置上传的字段，例如userId,
      userId: 'xxx',// 非必传，出入 userId 可以按照用户进行区分
      extra:{
        // ... 其他字段，非必传
      }
    },
  });
</script>
```

### 其他说明

1、如果对资源错误的捕获比较敏感，需要捕获全部的资源错误，在 html 的 header 中添加如下代码，如果不是特别敏感（或者不清楚），可以不写。

```js
window.__RESOURCE_ERROR__ = [];
window.addEventListener(
  'error',
  (event) => {
    window.__RESOURCE_ERROR__.push(event);
  },
  true
);
```

2、默认包括 polyfill，如果对 polyfill 不敏感，可以使用不包括 polyfill 的包

```js
import JSLogger from 'js-monitor-sdk/dist/js-monitor-sdk.esm.js';
```

ps: 业务接入要关注一下需要兼容的设备浏览器，如果对兼容有不清楚的地方详询鲍立磊。

## 监控大盘建设

前端的日志分析、监控、预警平台

## 参考资料

- [如何从 0 - 1 设计前端 APM 监控服务](https://zhuanlan.zhihu.com/p/584948647)
- [前端监控预警实战](https://zhuanlan.zhihu.com/p/514786984)
