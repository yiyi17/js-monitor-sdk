import { InitOpts as Opts, LogSender } from 'js-monitor-sdk/types/packages/types/index.types';
import { getConnectionStatus } from '../libs/network';
import getPerformanceData from './performance';
// 耗时比较大的
// size 比较大的
export default function slowPage(sender: LogSender, common: Opts['common'] & { opts: Opts }): void {
  const resources =
    (window.performance &&
      window.performance.getEntriesByType instanceof Function &&
      (window.performance.getEntriesByType('resource') as PerformanceResourceTiming[])) ||
    [];
  const res_data: {
    size: number;
    spend_time: number;
    dns: number;
    protocol: string;
    name: string;
  }[] = [];
  resources.forEach((resource) => {
    //dns tcp ssl firstbyte dom load
    const network = getConnectionStatus();
    const data = {
      size: resource.transferSize,
      spend_time: resource.duration,
      dns: resource.domainLookupStart - resource.domainLookupEnd,
      protocol: resource.nextHopProtocol,
      name: resource.name,
      ...network,
    };
    res_data.push(data);
  });

  if (res_data.length) {
    const data = getPerformanceData();
    // @ts-ignore
    sender({ res_data, resources_num: resources.length, ...data, type: 'slowPage' }, common);
  }
}
