import {
  InitOpts as Opts,
  LogSender,
  SData
} from 'js-monitor-sdk/types/packages/types/index.types';
import { isIgnore, isNotApi, isDefaultApi } from '../libs';
import { getConnectionStatus } from '../libs/network';
import queue from '../libs/queue';
import { setTrace } from '../libs/trace';

// 统计慢接口，3s 以上的
const TIME_LIMIT = 3000;

type CheckReq =
  | {
      size: number;
      dns: number;
      protocol: string;
      spend_time: number;
      name: string;
      effectiveType: string;
      downlink: number;
      rtt: number;
    }
  | {};

function checkReq(url: string): CheckReq {
  const resources =
    (window.performance &&
      window.performance.getEntriesByType instanceof Function &&
      (window.performance.getEntriesByType('resource') as PerformanceResourceTiming[])) ||
    [];
  const resource = resources.find((res) => res.name.indexOf(url) !== -1);

  if (resource) {
    const network = getConnectionStatus();
    return {
      size: resource.transferSize,
      spend_time: resource.duration,
      dns: resource.domainLookupStart - resource.domainLookupEnd,
      protocol: resource.nextHopProtocol,
      // name: resource.name,
      ...network
    };
  } else {
    return {};
  }
}

/**
 *
 * @param sender
 */
// 入参计略
export default function getRequestLogger(
  sender: LogSender,
  common: Opts['common'] & { opts: Opts },
  options: Partial<Pick<Opts, 'trace'>>
): void {
  const opts = {
    hostFilter: [], // 日志上报接口不做监听
    ...options
  };
  /*
   * 拦截ajax请求，保存data
   *
   */
  const mockAjax = function () {
    // console.log('request');

    // 放弃低版本IE
    if (!window.XMLHttpRequest) {
      return;
    }

    // 收集完信息 _fun.apply(this,arguments)防污染原型
    const _open = window.XMLHttpRequest.prototype.open;

    (window as any).XMLHttpRequest.prototype.open = function (
      method: string,
      url: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      boolen: boolean
    ) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      // eslint-disable-next-line prefer-rest-params
      const args = [].slice.call(arguments);
      const _onreadystatechange =
        self.onreadystatechange ||
        function () {
          //
        };

      const item = {
        url: url || '',
        method: method || '',
        filter: false,
        startTime: -1,
        trace_id: opts.trace ? setTrace() : '',
        endTime: -1,
        time: -1,
        status: -1,
        statusText: '',
        response: {}
      };

      self.addEventListener('readystatechange', function () {
        item.url = args[1];

        const isUpload = opts.hostFilter.findIndex((filter) => {
          return item.url.indexOf(filter) !== -1;
        });
        if (isUpload !== -1) return;

        if (self.readyState === 0) {
          // UNSENT
        } else if (self.readyState === 1) {
          // OPEN
          item.filter = true;
          if (item.url && (typeof item.url === 'string' || (item.url as any) instanceof String)) {
            item.filter = false;
            item.startTime = +new Date();
            // item.traceid = (state.pvid || '') + '-' + state.ajaxid;
            // state.ajaxid++;
            // 添加trace_id

            const isApi = !isNotApi(item.url);

            if (
              opts.trace?.open &&
              isApi &&
              isDefaultApi(item.url, opts.trace?.apiList) &&
              !isIgnore(item.url, opts.trace?.ignoreList)
            ) {
              self.setRequestHeader('X-B3-Traceid', item.trace_id);
              //   self.setRequestHeader('rpcid', '1');
            }
          }
        } else if (self.readyState === 2) {
          // HEADERS_RECEIVED
        } else if (self.readyState === 3) {
          // LOADING
        } else if (self.readyState === 4) {
          // DONE
          // debugger;
          if (!item.filter) {
            let isReport = false;
            let reqType: SData['type'] = 'reqSuccess';
            item.endTime = +new Date();
            item.time = item.endTime - (item.startTime || 0);
            item.status = self.status;
            item.statusText = self.statusText;
            item.response =
              self.response.length > 2000 ? self.response.substr(0, 2000) : self.response;
            const isOK = (self.status >= 200 && self.status < 300) || self.status === 304;

            // 处理 GET 请求的参数
            const urlTemp = item?.url?.split('?')[0];
            const method = item?.method;
            const requestTemp = item?.url?.split('?')[1];

            if (item.time >= TIME_LIMIT && isOK) {
              isReport = true;
              reqType = 'reqPerf';
            } else if (!isOK) {
              // console.log('wwww', arguments, item.time, self);
              isReport = true;
              reqType = 'reqError';
            }
            const sData = {
              type: reqType,
              request: requestTemp || '',
              elapsed_time: item.time,
              method: method || 'GET',
              req_url: urlTemp || '未知',
              response: JSON.stringify(item.response) || '',
              status: item.status,
              statusText: item.statusText,
              ...checkReq(item.url),
              trace_id: item.trace_id
            };
            queue.push(sData);
            // 需要上报
            if (isReport) {
              sender(sData, common);
            }
          }
          // if (!item.filter && opts.trace.open) {
          //   const aData = {
          //     type: 'ajaxTraceLog',
          //     traceid: item.traceid,
          //     rpcid: '1',
          //     ajaxUrl: item.url,
          //   };
          //   uploader(aData, 'c', 'network');
          // }
        }
        // eslint-disable-next-line prefer-rest-params
        return _onreadystatechange.apply(self, arguments);
      });

      // eslint-disable-next-line prefer-rest-params
      return _open.apply(self, arguments as any);
    };
  };
  mockAjax();

  // fetch的拦截
  const fetchRequest = () => {
    const originFetch = fetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      // writable: true, // 不能同时设置 writable 与get
      get() {
        return (url: RequestInfo, options?: RequestInit | undefined): Promise<Response> => {
          let sData: SData;
          let isReport = false;
          let reqType: SData['type'] = 'reqSuccess';
          const startTime = Date.now();
          const trace_id = opts.trace ? setTrace() : '';

          const isApi = !isNotApi(url as string);
          if (
            opts.trace?.open &&
            isApi &&
            isDefaultApi(url as string, opts.trace?.apiList) &&
            !isIgnore(url as string, opts.trace?.ignoreList)
          ) {
            if (options) {
              options.headers = {
                ...options?.headers,
                'X-B3-Traceid': trace_id
              };
            } else {
              options = {
                headers: {
                  'X-B3-Traceid': trace_id
                }
              };
            }
          }
          return new Promise((resolve, reject) => {
            originFetch(url, {
              ...options
            })
              .then((res) => {
                const spendTime = Date.now() - startTime;
                const isOK = (res.status >= 200 && res.status < 300) || res.status === 304;
                // 处理 GET 请求的参数
                const urlTemp = res?.url?.split('?')[0];
                let requestTemp = res?.url?.split('?')[1];
                const method = options?.method;

                // 处理非 get 请求参数
                if (method && method?.toUpperCase() !== 'GET') {
                  requestTemp = JSON.stringify(options?.body);
                }

                const cloneRes = res.clone();
                if (spendTime >= TIME_LIMIT && isOK) {
                  isReport = true;
                  reqType = 'reqPerf';
                } else if (!isOK) {
                  isReport = true;
                  reqType = 'reqError';
                }
                // 需要记录的数据
                sData = {
                  type: reqType,
                  request: requestTemp || '',
                  elapsed_time: spendTime,
                  req_url: urlTemp,
                  method: method || 'GET',
                  response: JSON.stringify(cloneRes.body) || '',
                  status: res.status,
                  statusText: res.statusText,
                  ...checkReq(res.url),
                  trace_id
                };

                queue.push(sData);
                if (isReport) {
                  // 上报
                  sender(sData, common);
                }

                // 返回值可能是json、text、arraybuffer
                // const cloneRes = res.clone();
                // cloneRes.json().then((body) => {});

                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          });
        };
      },
      set() {
        //兼容业务的window.fetch重写问题
      }
    });
  };
  fetchRequest();
}
