import { ErrorData } from 'js-monitor-sdk/types/packages/types/index.types';

/**
 * @description resourceError 资源加载错误
 */
export default function getResourceError(evt: Event): ErrorData | undefined {
  const errorData: ErrorData = {
    outerHTML: undefined,
    timestamp: -1,
    XPath: null,
    selector: '',
    type: 'ResourceError',
    url: '',
    baseURI: undefined,
    tagName: undefined,
  };
  // 统计 link、script、audio、video 和 img 资源错误
  if ((evt as any).target.tagName) {
    // 记录页面错误元素
    const target = evt.target ? evt.target : evt.srcElement;
    errorData.outerHTML = (target && (target as any).outerHTML).slice(0, 200);
    // 记录错误时间戳
    errorData.timestamp = evt.timeStamp || -1;

    // 记录XPath资源错误定位符
    errorData.XPath = (function (target) {
      const arr: any[] = [];
      for (
        ;
        target && (target as HTMLElement).nodeType === window.Node.ELEMENT_NODE;
        target = (target as HTMLElement).parentNode
      ) {
        let pre;
        let index = 0;
        let bool = false;
        for (pre = (target as HTMLElement).previousSibling; pre; pre = pre.previousSibling) {
          pre.nodeType !== window.Node.DOCUMENT_TYPE_NODE &&
            pre.nodeName === (target as HTMLElement).nodeName &&
            ++index;
        }
        for (pre = (target as HTMLElement).nextSibling; pre && !bool; pre = pre.nextSibling) {
          pre.nodeName === (target as HTMLElement).nodeName && (bool = true);
        }
        const left =
          ((target as HTMLElement).prefix ? (target as HTMLElement).prefix + ':' : '') +
          (target as HTMLElement).localName;
        const right = index || bool ? '[' + (index + 1) + ']' : '';
        arr.splice(0, 0, left + right);
      }
      return arr.length ? '/' + arr.join('/') : null;
    })(target);

    // 记录 Selector 资源错误定位符
    errorData.selector = (function (target: any) {
      const arr = [];
      for (; target.parentNode; ) {
        if (target.id) {
          arr.unshift('#' + target.id);
          break;
        }
        if (target === target.ownerDocument.documentElement) {
          arr.unshift(target.tagName);
        } else {
          let i = 1;
          for (let el = target; el.previousElementSibling; el = el.previousElementSibling, i++);
          arr.unshift(target.tagName + ':nth-child(' + i + ')');
        }
        target = target.parentNode;
      }
      return arr.join(' > ');
    })(target);

    errorData.type = 'ResourceError';
    const targetElement = evt.target as any;
    errorData.url = (targetElement && targetElement.src) || targetElement.href || '';
    errorData.baseURI = (targetElement && targetElement.baseURI) || '';
    errorData.tagName = (targetElement && targetElement.tagName) || '';
    if (errorData.url && (typeof errorData.url === 'string' || errorData.url instanceof String)) {
      return errorData;
    }
  }
}
