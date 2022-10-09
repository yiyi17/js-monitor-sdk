const UA = navigator.userAgent;

export default {
  UA,
  Mobile: /Mobile/.test(UA),
  Android: /Android/.test(UA),
  SpaceZ: /SpaceZ|osee2unifiedRelease|Futureve/.test(UA),
  SpaceZHybrid: /SpaceZHybrid/.test(UA),
  Bot: /SpaceZExternalHit|Baiduspider|Googlebot|yodaobot|Sogou web spider|Sogou inst spider|bingbot|360spider|sosospider|YisouSpider|DuckDuckBot|HTTP_Request2|Readability|Slackbot|Instapaper|pocket/.test(
    UA
  )
};
