import {
  HistoryArguments,
  HistoryArgumentsItem,
  IHistory
} from 'js-monitor-sdk/types/packages/types/index.types';
import queue, { ErrorInfo } from '../libs/queue';

/**
 * 获取用户点击行为
 * @param common
 */
export const getUserClick = (): void => {
  window.addEventListener(
    'click',
    (event: any) => {
      const {
        path = [],
        target,
        pointerType = 'null',
        composedPath
      } = event as PointerEvent & { path: any };
      // 判断是否人为触发
      const type = pointerType ? 'click' : 'jsClick';
      const { outerHTML, tagName, className } = target as HTMLElement;
      const paths = (composedPath && composedPath.apply(event)) || path;
      const pathText = paths.reduce((result, el) => {
        const { localName = '' } = el as Element | SVGAElement;
        let { className: parentClassName = '' } = el as Element | SVGAElement;
        // svg、path等标签
        if (typeof parentClassName === 'object') {
          parentClassName = parentClassName?.baseVal || '';
        }
        if (!localName || localName.includes('body') || localName.includes('html')) {
          return result;
        }
        const suffix = parentClassName ? `.${parentClassName.replace(/\s+/g, '.')}` : '';
        result.push(localName + suffix);
        return result;
      }, [] as string[]);
      queue.push({
        type,
        path: pathText,
        outerHTML,
        tagName,
        className
      });
    },
    true
  );
};

/**
 * 防抖
 */
const debounce = (fn: (e: any) => void, delay: number) => {
  let timer: any = null;
  return function (...args: any) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      // @ts-ignore
      fn.call(this, ...args);
    }, delay);
  };
};

/**
 * 处理用户输入
 */
const handleUserInput = (event: any) => {
  const { inputType = '', target } = event as InputEvent;
  if (!inputType) return;
  const { value, innerText, localName, className, tagName } = target as HTMLInputElement;
  const types = ['input', 'textarea'];
  const content = types.includes(localName) ? value : innerText;
  const data = {
    type: 'input',
    content,
    userInputTarget: target,
    tagName,
    className
  };
  const result = queue.get();
  if (!Array.isArray(result)) return;
  const last = result[result.length - 1];
  const { userInputTarget: lastTarget } = last;
  if (target === lastTarget) {
    queue.replace(data as ErrorInfo);
  } else {
    queue.push(data as ErrorInfo);
  }
};

/**
 * 监听用户输入事件
 * @param common
 */
export const getUserInput = (): void => {
  window.addEventListener('input', debounce(handleUserInput, 200), false);
};

/**
 * 拦截pushState、replaceState
 */
const bindEventListener = function (type: string) {
  const historyEvent = (history as IHistory)[type];
  return function (...data: any) {
    const from = window.location.pathname;
    // @ts-ignore
    const newEvent = historyEvent.apply(this, data);
    const e: HistoryArguments = new Event(type);
    const [state, title, url] = data;
    e.params = {
      state,
      title,
      from,
      to: url
    };
    window.dispatchEvent(e);
    return newEvent;
  };
};
window.history.pushState = bindEventListener('pushState');
window.history.replaceState = bindEventListener('replaceState');

/**
 * 获取路由变化
 */
export const getPageRoute = (): void => {
  // 监听replaceState
  window.addEventListener('replaceState', (event: HistoryArguments) => {
    const { params = {} } = event;
    const { from, to } = params as HistoryArgumentsItem;
    queue.push({
      type: 'replaceState',
      from,
      to
    });
  });

  // 监听pushState
  window.addEventListener('pushState', (event: HistoryArguments) => {
    const { params = {} } = event;
    const { from, to } = params as HistoryArgumentsItem;
    queue.push({
      type: 'pushState',
      from,
      to
    });
  });

  // 对addHistoryListener的补充，比如go、back、forward等
  window.addEventListener('popstate', () => {
    queue.push({
      type: 'popstate',
      to: window.location.href
    });
  });
};
