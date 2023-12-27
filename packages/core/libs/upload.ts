import { handleLoggerData, sleep } from './index';
import { SERVER_URL, ua } from '../config';

declare global {
  interface Window {
    // 这里定义
    __monitor__: any;
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
    apiHost: SERVER_URL,
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
  if (window.__monitor__) {
    monitorInstance = new window.__monitor__.Client({
      ...monitorConfig,
    });
    monitorInstance.config(monitorConfig);
    monitorInit = true;
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function webUpload(logger: any): Promise<void> {
  if (window.__monitor__ && !monitorInit) {
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
    } else if (!window.__monitor__) {
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
    // 依赖hybrid，如果确实没有接入 hybrid，需要web上报兜底
    webUpload(logger);
  }
}

export default function uploadLogData(logger: any, loggerTemp: any[]): void {
  // 数据上报
  if (ua.SpaceZHybrid) {
    // 端内依赖 hybrid 上报
    hybridUpload(logger);
  } else {
    if (!window.__monitor__) {
      // onload 后对暂存的数据进行上报
      loggerTemp.push(logger);
      return;
    }
    webUpload(logger);
  }
}
