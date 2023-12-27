// 通过配置判断初始化哪个采集
// 进行上报
import { ReportHandler } from 'web-vitals';
import { InitOpts as Opts } from 'js-monitor-sdk/types/packages/types/index.types';
import loggerSender from '../core/index';
import queue from './libs/queue';
// import { addEvent } from './libs/event';
import getPerformanceData, { getWebVitals } from './monitor/performance';
import getRequestLogger from './monitor/request';
import getResourceError from './monitor/resourc-error';
import getRuntimeError from './monitor/runtime-error';
import slowPage from './monitor/slow-page';
import getMemory from './monitor/memory';

const LIMIT_TIME = 8000;

declare global {
  interface Window {
    // 这里定义
    __RESOURCEERROR__: any;
  }
}

export default function initMonitor(opts: Opts): void {
  // console.log('initMonitor-opts', opts);

  const { trace, performance, resourceError, runtimeError, request, common } = opts;

  // delete opts.common;
  // 加载的性能数据
  if (performance) {
    const dataToSend = () => {
      // performance data
      const data = getPerformanceData();
      const memory = getMemory();

      loggerSender(
        { ...data, ...memory },
        {
          opts,
          ...common,
        },
      );

      //上报 FID CLS LCP
      getWebVitals(loggerSender as ReportHandler);

      // 慢加载
      if (data?.load > LIMIT_TIME) {
        slowPage(loggerSender, {
          opts,
          ...common,
        });
      }
    };
    // 如果已经 onload 直接对采集的数据进行上报
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        dataToSend();
      });
    } else {
      dataToSend();
    }
  }

  // 获取资源加载错误
  // 如果不是在 header 里面加载，可能有些不能捕获
  if (resourceError) {
    // TODO: 判断 非header 中且开启资源错误收集，给出 warning
    if (window.__RESOURCEERROR__ && window.__RESOURCEERROR__.length) {
      // console.log('__RESOURCEERROR__', __RESOURCEERROR__);
      window.__RESOURCEERROR__.forEach((event: Event) => {
        const data = getResourceError(event);
        if (data) {
          loggerSender(data, {
            opts,
            ...common,
          });
        }
      });
    }

    window.addEventListener(
      'error',
      (event) => {
        const data = getResourceError(event);
        if (data) {
          queue.push(data);
          loggerSender(data, {
            opts,
            ...common,
          });
        }
      },
      true,
    );
  }

  // request 请求相关
  if (request) {
    getRequestLogger(
      loggerSender,
      {
        opts,
        ...common,
      },
      { trace },
    );
  }

  // 获取运行时错误
  if (runtimeError) {
    getRuntimeError(loggerSender, {
      opts,
      ...common,
    });
  }
}
