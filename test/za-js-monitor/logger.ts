import JSLogger from '../../packages/index';



const monitor = new JSLogger({
  performance: true, // 采集性能
  resourceError: true, // 采集资源加载错误
  request: true, // 采集请求异常
  runtimeError: true, // 采集错误
  userActions: true, // 用户行为收集
  metrics: true, // 自定义指标服务
  trace: {
    open: true,
    apiList: ['127.0.0.1'],
    ignoreList: ['/sc-profiler'],
  }, // 接入trace
  common: {
    disableLog: process.env.NODE_ENV === 'development', // 是否禁止日志上报，建议本地改为 true
    // @ts-ignore
    projectId: 'test', // 项目id，唯一标识，必传
    // xxx 也可以在这里配置上传的字段，例如userId,
    userId: 'xxx', // 非必传，
    extra: {
      // ... 其他字段，非必传
    },
  },
});

export default monitor;
