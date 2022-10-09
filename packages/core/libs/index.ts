import { send } from './send';
import ua from './ua';

export const sleep = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

// 只有web环境需要自己采集，hybrid由客户端自己采集
export function getIp(): void {
  if (ua.SpaceZHybrid) return;
  send.method.get({
    url: '//118.89.204.198/resolv?host=www.spaceZ.com&os_type=web',
    success: (data: any) => {
      const res = JSON.parse(data);
      // console.log(res.dns[0].client_ip);
      window.returnCitySN = {
        client_ip: res.dns[0].client_ip
      };
      return;
    },
    fail: () => {
      // console.log(err);
      return '';
    }
  });
}
