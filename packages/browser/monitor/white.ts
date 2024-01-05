declare global {
  interface Window {
    // 这里定义
    __loopTimer__: any;
  }
}

/**
 * 检测页面是否白屏
 * @param {function} callback - 回到函数获取检测结果
 * @param {boolean} skeletonProject - 页面是否有骨架屏
 * @param {array} whiteBoxElements - 容器列表，默认值为['html', 'body', '#app', '#root']
 */
export function openWhiteScreen(
  callback: (arg0: { status: string }) => void,
  { skeletonProject, whiteBoxElements }: any,
): void {
  let _whiteLoopNum = 0;
  const _skeletonInitList: any[] = []; // 存储初次采样点
  let _skeletonNowList: any[] = []; // 存储当前采样点

  // 项目有骨架屏
  if (skeletonProject) {
    if (document.readyState != 'complete') {
      sampling();
    }
  } else {
    // 页面加载完毕
    if (document.readyState === 'complete') {
      sampling();
    } else {
      window.addEventListener('load', sampling);
    }
  }
  // 选中dom点的名称
  function getSelector(element: Element) {
    if (element.id) {
      return '#' + element.id;
    } else if (element.className) {
      // div home => div.home
      return (
        '.' +
        element.className
          .split(' ')
          .filter((item) => !!item)
          .join('.')
      );
    } else {
      return element.nodeName.toLowerCase();
    }
  }
  // 判断采样点是否为容器节点
  function isContainer(element: Element) {
    const selector = getSelector(element);
    if (skeletonProject) {
      _whiteLoopNum ? _skeletonNowList.push(selector) : _skeletonInitList.push(selector);
    }
    return whiteBoxElements.indexOf(selector) != -1;
  }
  // 采样对比
  function sampling() {
    let emptyPoints = 0;
    for (let i = 1; i <= 9; i++) {
      const xElements = document.elementsFromPoint(
        (window.innerWidth * i) / 10,
        window.innerHeight / 2,
      );
      const yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10,
      );
      if (isContainer(xElements[0])) emptyPoints++;
      // 中心点只计算一次
      if (i != 5) {
        if (isContainer(yElements[0])) emptyPoints++;
      }
    }
    // 页面正常渲染，停止轮训
    if (emptyPoints != 17) {
      if (skeletonProject) {
        // 第一次不比较
        if (!_whiteLoopNum) return openWhiteLoop();
        // 比较前后dom是否一致
        if (_skeletonNowList.join() == _skeletonInitList.join())
          return callback({
            status: 'error',
          });
      }
      if (window.__loopTimer__) {
        clearTimeout(window.__loopTimer__);
        window.__loopTimer__ = null;
      }
    } else {
      // 开启轮训
      if (!window.__loopTimer__) {
        openWhiteLoop();
      }
    }
    // 17个点都是容器节点算作白屏
    callback({
      status: emptyPoints == 17 ? 'error' : 'ok',
    });
  }
  // 开启白屏轮训
  function openWhiteLoop() {
    if (window.__loopTimer__) return;
    window.__loopTimer__ = setInterval(() => {
      if (skeletonProject) {
        _whiteLoopNum++;
        _skeletonNowList = [];
      }
      sampling();
    }, 1000);
  }
}
