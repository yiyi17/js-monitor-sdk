import { getCLS, getFID, getLCP, ReportHandler } from 'web-vitals';
import { PerformaceData } from 'js-monitor-sdk/types/packages/types/index.types';
import { getConnectionStatus } from '../libs/network';

/**
 * @description 性能指标 performanceDta：页面加载、资源加载 DNS、TCP、FirstByte、Download、DOM解析、资源加载、Onload
 *
 */
export default function getPerformanceData(): PerformaceData {
  // 通过performance
  let t: PerformanceNavigationTiming;
  const _performance = window.performance;
  // console.log('getCLS(console.log)', getCLS(console.log));
  const pfData: PerformaceData = {
    type: '',
    dns: -1,
    tcp: -1,
    ttfb: -1,
    trans: -1,
    dom: -1,
    ssl: -1,
    firstbyte: -1,
    fp: -1,
    tti: -1,
    res: -1,
    ready: -1,
    load: -1,
    effectiveType: '',
    downlink: -1,
    rtt: -1,
    platform: '',
    fcp: -1,
    rd: -1,
    https: '',
    wherepage: -1,
  };

  if (_performance) {
    if (
      _performance.getEntriesByType &&
      _performance.getEntriesByType('navigation') &&
      _performance.getEntriesByType('navigation')[0]
    ) {
      t = _performance.getEntriesByType('navigation')[0] as any;
    } else if (_performance.timing) {
      t = _performance.timing as any;
    }

    // console.log('pfData', t);

    // @ts-ignore
    if (t) {
      pfData.type = 'Performance';
      if (t.domainLookupEnd && t.domainLookupStart !== undefined) {
        pfData.dns = Math.round(t.domainLookupEnd - t.domainLookupStart || 0);
      }
      if (t.connectEnd && t.connectStart !== undefined) {
        pfData.tcp = Math.round(t.connectEnd - t.connectStart);
      }

      if (t.responseStart && t.requestStart !== undefined) {
        pfData.ttfb = Math.round(t.responseStart - t.requestStart);
      }

      if (t.responseEnd && t.responseStart) {
        pfData.trans = Math.round(t.responseEnd - t.responseStart);
      }

      if (t.domInteractive && t.responseEnd) {
        pfData.dom = Math.round(t.domInteractive - t.responseEnd);
      }

      if (t.loadEventStart && t.domContentLoadedEventEnd) {
        pfData.res = Math.round(t.loadEventStart - t.domContentLoadedEventEnd);
      }

      const l = window.location;
      if (l && l.protocol === 'https:' && t.connectEnd && t.secureConnectionStart) {
        pfData.ssl = Math.round(t.connectEnd - t.secureConnectionStart);
      }

      if (t.responseStart && t.domainLookupStart) {
        pfData.firstbyte = Math.round(t.responseStart - t.domainLookupStart);
      }

      if (t.responseEnd && t.fetchStart) {
        pfData.fp = Math.round(t.responseEnd - t.fetchStart);
      }

      if (t.domInteractive && t.fetchStart) {
        pfData.tti = Math.round(t.domInteractive - t.fetchStart);
      }

      if (t.domContentLoadedEventEnd && t.fetchStart) {
        pfData.ready = Math.round(t.domContentLoadedEventEnd - t.fetchStart);
      }

      if (t.loadEventStart && t.fetchStart) {
        pfData.load = Math.round(t.loadEventStart - t.fetchStart);
      }

      // 网络 ConnectionStatus
      const network = getConnectionStatus();
      Object.assign(pfData, network);

      if (window.navigator) {
        pfData.platform = window.navigator.platform || '';
      }

      if (_performance && _performance.getEntries) {
        const perfEntries = _performance.getEntries();
        for (const key in perfEntries) {
          if (
            perfEntries[key].name &&
            perfEntries[key].name === 'first-contentful-paint' &&
            perfEntries[key].startTime
          ) {
            pfData.fcp = (perfEntries[key].startTime.toFixed(0) as any) * 1;
          }
          if (
            perfEntries[key].name &&
            perfEntries[key].name === 'first-paint' &&
            perfEntries[key].startTime
          ) {
            pfData.fp = (perfEntries[key].startTime.toFixed(0) as any) * 1;
          }
        }
      }

      // 重定向耗时
      if ((t as any).navigationStart !== undefined) {
        pfData.rd = t.fetchStart - (t as any).navigationStart;
      } else if (t.redirectEnd !== undefined) {
        pfData.rd = t.redirectEnd - t.redirectStart;
      } else {
        pfData.rd = 0;
      }

      pfData.https = t.nextHopProtocol || '';

      if (_performance.navigation || t.type) {
        if (t.type) {
          switch (t.type) {
            case 'navigate':
              pfData.wherepage = 0;
              break;
            case 'back_forward':
              pfData.wherepage = 2;
              break;
            case 'reload':
              pfData.wherepage = 1;
              break;
            case 'prerender':
              pfData.wherepage = 256;
              break;
            default:
              pfData.wherepage = 0;
          }
        } else {
          pfData.wherepage = _performance.navigation.type || -1;
        }
      }
    }
  }

  return pfData;

  //
}

/**
 *
 * @param fn
 * @description
 * LCP 最大内容绘制，测量加载性能。为了提供良好的用户体验，LCP 应在页面首次开始加载后的2.5 秒内发生。
 * FID 首次输入延迟，测量交互性。为了提供良好的用户体验，页面的 FID 应为100 毫秒或更短。
 * CLS 累积布局偏移，测量视觉稳定性。为了提供良好的用户体验，页面的 CLS 应保持在 0.1. 或更少。
 * https://web.dev/vitals/
 *
 * blank、LCP、FID、CLS、FCP、FMP、MPFID
 */
export function getWebVitals(fn: ReportHandler): void {
  getLCP(fn);
  getFID(fn);
  getCLS(fn);
  const btn = document.createElement('div');
  btn.style.height = 0 + 'px';
  btn.style.width = 0 + 'px';
  document.body.appendChild(btn);
  btn.click();
  document.body.removeChild(btn);
}
