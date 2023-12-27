import { send } from './send';
import { IP_SERVER_URL, ua } from '../config';
import { version } from '../../../package.json';

export const sleep = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

// 只有web环境需要自己采集，hybrid由客户端自己采集
export function getIp(): void {
  if (ua.SpaceZHybrid) return;
  send.method.get({
    url: IP_SERVER_URL,
    success: (data: any) => {
      const res = JSON.parse(data);
      // console.log(res.dns[0].client_ip);
      window.returnCitySN = {
        client_ip: res.dns[0].client_ip,
      };
      return;
    },
    fail: () => {
      // console.log(err);
      return '';
    },
  });
}

// 处理数据
export async function handleLoggerData(logger: any): Promise<{
  type: string;
  defaultData: any;
  disableLog: any;
}> {
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
