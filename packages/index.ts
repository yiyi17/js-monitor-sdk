// 日志的class 类

// console.log('%c start success', 'color:green;font-size:20px;');

import { InitOpts as Opts } from 'js-monitor-sdk/types/packages/types/index.types';
import initMonitor from './browser';
import loggerSender from './core';
import {
  // initStatsc,
  initJSLogger
} from './utils';

declare global {
  interface Window {
    // 这里定义
    JSLogger: any;
  }
}

// 配置默认开关，默认全部关闭
const optsDefault: Opts = {
  performance: false,
  resourceError: false,
  request: false,
  trace: {
    open: false,
    apiList: [],
    ignoreList: []
  },
  runtimeError: false,
  userActions: false,
  metrics: false,
  common: {
    disableLog: false,
    projectId: 'msfe'
  }
};

let hasNew = false;

export default class JSLogger {
  private opts: Opts = optsDefault;
  statsc: any;

  constructor(opts: Partial<Opts>) {
    if (hasNew) {
      console.warn('%cJSLogger can not instantiate multiple times.', 'color:blue;font-size:12px;');
      return;
    }
    hasNew = true;
    this.opts = opts
      ? {
          ...optsDefault,
          ...opts
        }
      : optsDefault;

    try {
      this.init();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  private init() {
    // 初始化日志，进行采集上报
    // const { common, metrics } = this.opts;

    initMonitor(this.opts);
    // if (metrics) {
    // this.statsc = initStatsc(common.projectId);
    // }
  }

  // 展现日志
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  show(data: any, esIndexKeyword: string): void {
    if (!data) return;
    if (!esIndexKeyword) throw Error('arguments need two, but one');
    const { common } = this.opts;
    Object.assign(common, {
      esIndexKeyword
    });
    Object.assign(data, { type: 'show' });
    // es索引为： `fe-show-${esIndexKeyword}`
    loggerSender(data, common);
  }

  // 点击日志
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  click(data: any, esIndexKeyword: string): void {
    if (!data) return;
    if (!esIndexKeyword) throw Error('arguments need two, but one');

    const { common } = this.opts;
    Object.assign(common, {
      esIndexKeyword
    });
    Object.assign(data, { type: 'click' });
    // es索引为： `fe-click-${esIndexKeyword}`
    loggerSender(data, common);
  }

  metrics(): void {
    console.warn('已不支持,请接入 指标SDK：@cfe/statsc-client');

    // if (!this.statsc) {
    //   console.warn('%cStatsc Client is not init.', 'color:blue;font-size:12px;');
    //   return;
    // }
    // this.statsc.increment(metricsData);
  }
}

window.JSLogger = JSLogger;

// hybrid中直接进行实例化，通过自定义属性获取

initJSLogger(JSLogger);
