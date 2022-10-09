import { send } from './libs/send';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function (data: any) {
  //

  send.method.post({
    url: '//spaceZ-web-analytics.spaceZ.com/api/v2/apm/logs/batch',
    data: data,
    headers: {}
  });
}
