import { getIp } from './libs/index';
import { ua } from '../config';
import { hybridUpload, webUpload, webUploadTempData } from './libs/upload';

const loggerTemp: any[] = [];
let commonTemp: any;
// 上报缓存数据

if (!ua.SpaceZHybrid) {
  webUploadTempData(loggerTemp);
  getIp();
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (data: any, common: any): void => {
  // 数据处理
  if (!data) return;
  if (data.name === 'CLS' || data.name === 'LCP') data.entries = [];
  // 解决 WebVitals 日志上报的公共参数问题:首次先记录common参数，待 WebVitals 对 common 进行重新赋值
  if (common) {
    commonTemp = common;
  }
  if (!common) {
    common = commonTemp;
  }
  const logger = {
    ...data,
    ...common,
  };

  // TODO: 需要自己实现上报方法
  // eslint-disable-next-line no-console
  console.log(logger);

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
};

export function postWeberJSON(data: any): void {
  // eslint-disable-next-line no-console
  console.log(data);
}
