export const SERVER_URL = '';

// 如果自己没有可以考虑 sohu 的 https://pv.sohu.com/cityjson?ie=utf-8,貌似用不了了
// 自建 IP 服务
export const IP_SERVER_URL = '';

const UA = navigator.userAgent;

export const ua = {
  UA,
  Mobile: /Mobile/.test(UA),
  Android: /Android/.test(UA),
  SpaceZ: /SpaceZ|osee2unifiedRelease|Futureve/.test(UA),
  SpaceZHybrid: /SpaceZHybrid/.test(UA),
  Bot: /SpaceZExternalHit|Baiduspider|Googlebot|yodaobot|Sogou web spider|Sogou inst spider|bingbot|360spider|sosospider|YisouSpider|DuckDuckBot|HTTP_Request2|Readability|Slackbot|Instapaper|pocket/.test(
    UA,
  ),
};
