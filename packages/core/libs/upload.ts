import { version } from '../../../package.json';
import { sleep } from './index';
import ua from './ua';

declare global {
  interface Window {
    // 这里定义
    monitor: any;
    returnCitySN: any;
  }
}

let monitorInit = false;
let monitorInstance: any = null;
// 初始化monitor
function initSDK() {
  const monitorConfig = {
    useProto3: false,
    enableLog: false,
    // apiHost: '/api/v1',
    apiHost: '//apm.spaceZ.com/collector/apm',
    apiPath: '',
    product: 'SpaceZ',
    onBeforeSend: (
      monitorLogEntry: any,
      { defaultSendHandler }: any = {
        defaultSendHandler: () => {
          // eslint-disable-next-line no-console
          console.log('defaultSendHandler');
        },
      },
    ) => {
      // 是否不上报日志
      const isEnableSend = true;
      try {
        // 获取 ip
        monitorLogEntry.base.network = {
          internet_ip: window.returnCitySN.client_ip,
        };

        // 获取 client_id,可以与大数据打通
        const client_id = monitorLogEntry.base.id.client_id;
        const json = JSON.parse(monitorLogEntry.extra.monitor.json_log.json);
        json.client_id = client_id;

        // 重新序列化
        monitorLogEntry.extra.monitor.json_log.json = JSON.stringify(json);
      } catch (error) {
        // console.log(error);
      }
      // eslint-disable-next-line no-console
      // console.log(JSON.parse(monitorLogEntry.extra.monitor.json_log.json));
      return isEnableSend ? defaultSendHandler && defaultSendHandler(monitorLogEntry) : false;
    },
  };
  if (window.monitor) {
    monitorInstance = new window.monitor.Client({
      ...monitorConfig,
    });
    monitorInstance.config(monitorConfig);
    monitorInit = true;
  }
}

// 处理数据
async function handleLoggerData(logger: any) {
  // 公共参数
  if (!window.returnCitySN && !ua.SpaceZHybrid) {
    await sleep(1000);
  }

  const href = window.location.href;
  const defaultData = {
    monitor_monitor_version: version,
    ua: navigator.userAgent.toLowerCase(),
    page_url: href && href.split('?')[0],
    current_href: href,
    ...window.returnCitySN,
  };

  // 设置 es 索引值
  const defaultESIndex = 'fe-monitor';
  const { esIndexKeyword, disableLog } = logger;
  let type = defaultESIndex;
  if (esIndexKeyword) {
    type = logger.type
      ? `fe-${logger.type}-${esIndexKeyword}`
      : `${defaultESIndex}-${esIndexKeyword}`;
  } else {
    type = logger.type ? `fe-${logger.type}` : `${defaultESIndex}`;
  }

  // 是否禁止上报
  if (disableLog) {
    // eslint-disable-next-line no-console
    console.info('%c[js-monitor-sdk.logData]', `color: green`, {
      logData: {
        ...defaultData,
        ...logger,
      },
    });
  }

  return {
    type,
    defaultData,
    disableLog,
  };
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function webUpload(logger: any): Promise<void> {
  if (window.monitor && !monitorInit) {
    initSDK();
  }
  const { type, defaultData, disableLog } = await handleLoggerData(logger);
  if (disableLog) return;

  monitorInstance &&
    monitorInstance.trackMonitor(
      {},
      {
        monitor: {
          json_log: {
            type: type,
            json: JSON.stringify({
              ...defaultData,
              ...logger,
            }),
          },
        },
      },
    );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function webUploadTempData(loggerTemp: any): void {
  // 加载完成上报暂存的数据
  window.addEventListener('load', async () => {
    if (!monitorInstance) {
      // 等待 1s
      await sleep(1000);
    }
    if (monitorInstance && loggerTemp.length) {
      while (loggerTemp.length) {
        webUpload(loggerTemp[0]);
        loggerTemp.shift();
      }
    } else if (!window.monitor) {
      // 依赖 monitor，如果业务确实没有monitor，需要业务自己引入
      // eslint-disable-next-line no-console
      console.warn('monitor 没有初始化成功，请检查代码');
    }
  });
}

/**
 *
 * @returns
 * @description  如果是客户端, 端能力上报;
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function hybridUpload(logger: any): Promise<void> {
  // @ts-ignore
  if (typeof spaceZHybrid !== 'undefined') {
    const { type, defaultData, disableLog } = await handleLoggerData(logger);
    if (disableLog) return;
    // @ts-ignore
    spaceZHybrid.ready().then(() => {
      const action = 'base/report';
      const params = {
        target: 'APM',
        params: {
          indexName: `hybrid-${type}`,
          params: {
            ...defaultData,
            ...logger,
          },
        },
      };

      // since 2.27.0
      // @ts-ignore
      typeof spaceZHybrid === 'function'
        ? // @ts-ignore
          spaceZHybrid(action).dispatch(params)
        : // @ts-ignore
          spaceZHybrid.dispatch(action, params);
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('请接入 spaceZ-hybrid，详见： https://hybrid.in.spaceZ.com/');
    // 依赖hybrid，如果确实没有接入hybrid，需要web上报兜底
    webUpload(logger);
  }
}

export default {};

// 索引的创建规则：默认索引，根据日志类型来创建索引

/**
 * mp-apm-fe-monitor
 * mp-apm-fe-performance
 * mp-apm-fe-slowpage
 * mp-apm-fe-reqerror
 * mp-apm-fe-reqperf
 * mp-apm-fe-resourceerror
 * mp-apm-fe-script
 * */

// 看数据情况是否根据项目进行创建索引，
// 如果根据项目进行拆分索引，就按照业务传来的 esIndexKeyword 拼接
