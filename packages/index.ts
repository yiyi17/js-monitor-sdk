import { InitOpts as Opts } from 'js-monitor-sdk/types/packages/types/index.types';
import initMonitor from './browser';
import loggerSender from './core';
import { initJSLogger } from './utils';

declare global {
  interface Window {
    // 这里定义
    __JSLogger__: any;
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
    ignoreList: [],
  },
  runtimeError: false,
  userActions: false,
  metrics: false,
  common: {
    disableLog: false,
    projectId: 'dev_project',
  },
};

let hasNew = false;

export default class JSLogger {
  private opts: Opts = optsDefault;

  constructor(opts: Partial<Opts>) {
    if (hasNew) {
      console.warn('%cJSLogger can not instantiate multiple times.', 'color:blue;font-size:12px;');
      return;
    }
    hasNew = true;
    this.opts = opts
      ? {
          ...optsDefault,
          ...opts,
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
    initMonitor(this.opts);
  }

  /**
   *
   * @param data 上报日志内容
   * @param esIndexKeyword 关键标识
   * @returns
   * @description 展现日志
   */
  show(data: any, esIndexKeyword: string): void {
    if (!data) return;
    if (!esIndexKeyword) throw Error('arguments need two, but one');
    const { common } = this.opts;
    Object.assign(common, {
      esIndexKeyword,
    });
    Object.assign(data, { type: 'show' });
    loggerSender(data, common);
  }

  /**
   *
   * @param data 上报日志内容
   * @param esIndexKeyword 关键标识
   * @returns
   * @description 点击日志
   */
  click(data: any, esIndexKeyword: string): void {
    if (!data) return;
    if (!esIndexKeyword) throw Error('arguments need two, but one');

    const { common } = this.opts;
    Object.assign(common, {
      esIndexKeyword,
    });
    Object.assign(data, { type: 'click' });
    loggerSender(data, common);
  }
}

window.__JSLogger__ = JSLogger;

// hybrid中直接进行实例化，通过自定义属性获取

initJSLogger(JSLogger);
