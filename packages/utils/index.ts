// import Client from './statsc-client/esm/index';
export default {};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initJSLogger(JSLogger: any): void {
  let instanced;
  let disableLog;
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const src = script.getAttribute('src');
    if (script && src && src.indexOf('js-monitor-sdk') > -1 && script.getAttribute('instanced')) {
      instanced = script.getAttribute('instanced');
      disableLog = script.getAttribute('disableLog');
    }
  }
  // console.log(instanced);

  if (instanced === 'yes') {
    new JSLogger({
      performance: true, // 采集性能
      resourceError: true, // 采集资源加载错误
      runtimeError: true, // 采集错误
      request: false, // 采集请求异常
      trace: {
        apiList: [],
        ignoreList: [],
        open: false,
      }, // 接入trace
      common: {
        disableLog: disableLog === 'yes', // 是否禁止日志上报，建议本地改为 true
        projectId: '', // 项目id，唯一标识，必传
        // xxx 也可以在这里配置上传的字段，例如userId,
        userId: '', // 非必传，出入 userId 可以按照用户进行区分
        extra: {
          // ... 其他字段，非必传
        },
      },
    });
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export function initStatsc(appName: string): any {
//   const statsc = Client.connect({ appName });
//   return statsc;
// }
