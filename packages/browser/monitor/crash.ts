import { v4 as uuidv4 } from 'uuid';

// 基于 Service Worker 的崩溃统计方案
// p1：网页加载后，通过 postMessage API 每 5s 给 sw 发送一个心跳，表示自己的在线，sw 将在线的网页登记下来，更新登记时间；

if (navigator.serviceWorker.controller !== null) {
  const HEARTBEAT_INTERVAL = 5 * 1000; // 每五秒发一次心跳
  const sessionId = uuidv4();
  const heartbeat = function () {
    // @ts-ignore
    window.navigator.serviceWorker.controller.postMessage({
      type: 'heartbeat',
      id: sessionId,
      data: {}, // 附加信息，如果页面 crash，上报的附加数据
    });
  };

  window.addEventListener('beforeunload', function () {
    // @ts-ignore
    navigator.serviceWorker.controller.postMessage({
      type: 'unload',
      id: sessionId,
    });
  });
  setInterval(heartbeat, HEARTBEAT_INTERVAL);
  heartbeat();
}

// p2：网页在 beforeunload 时，通过 postMessage API 告知自己已经正常关闭，sw 将登记的网页清除；
// p3：如果网页在运行的过程中 crash 了，sw 中的 running 状态将不会被清除，更新时间停留在奔溃前的最后一次心跳；
// sw：Service Worker 每 10s 查看一遍登记中的网页，发现登记时间已经超出了一定时间（比如 15s）即可判定该网页 crash 了。
const CHECK_CRASH_INTERVAL = 10 * 1000; // 每 10s 检查一次
const CRASH_THRESHOLD = 15 * 1000; // 15s 超过15s没有心跳则认为已经 crash
const pages = {};
let timer: NodeJS.Timer | null;
function checkCrash() {
  const now = Date.now();
  for (const id in pages) {
    // @ts-ignore
    const page = pages[id];
    if (now - page.t > CRASH_THRESHOLD) {
      //TODO: 上报 crash
      // @ts-ignore
      delete pages[id];
    }
  }
  if (Object.keys(pages).length == 0) {
    // @ts-ignore
    clearInterval(timer);

    timer = null;
  }
}

// @ts-ignore

Worker.addEventListener('message', (e) => {
  const data = e.data;
  if (data.type === 'heartbeat') {
    // @ts-ignore
    pages[data.id] = {
      t: Date.now(),
    };
    if (!timer) {
      timer = setInterval(function () {
        checkCrash();
      }, CHECK_CRASH_INTERVAL);
    }
  } else if (data.type === 'unload') {
    // TODO: 正常的上报
    // @ts-ignore
    delete pages[data.id];
  }
});
