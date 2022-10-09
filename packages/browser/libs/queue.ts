type Type =
  | 'input'
  | 'click'
  | 'jsClick'
  | 'replaceState'
  | 'pushState'
  | 'popstate'
  | 'reqSuccess'
  | 'reqPerf'
  | 'reqError'
  | 'Script'
  | 'ResourceError';
export interface ErrorInfo {
  [x: string]: any;
  stack?: string | any[];
  type: Type;
  url?: string | any[];
  line?: number;
  col?: number;
  file_name?: string;
  msg?: string | string[];
  message?: string;
  name?: string;
  subclass?: string;
  path?: string[];
  outerHTML?: string;
  tagName?: string;
  className?: string;
}

class Queue {
  private queue: ErrorInfo[];

  private size: number;

  constructor() {
    this.queue = [];
    this.size = 10;
  }

  // 向数组中添加
  push(item: ErrorInfo) {
    const data = { ...item, time: new Date().getTime() };
    this.queue.push(data);
    if (this.queue.length > this.size) {
      this.queue.splice(0, this.queue.length - this.size);
    }
    return this.queue;
  }

  // 获取数组信息
  get() {
    return this.queue;
  }

  // 获取上报的动作列表
  getReportData() {
    const result = this.queue.map((el) => {
      const data = { ...el };
      if (data.userInputTarget) {
        delete data.userInputTarget;
      }
      const { type, ...other } = data;
      return {
        type,
        extra: JSON.stringify({ ...other })
      };
    });
    return result;
  }

  // 替换数组信息
  replace(item: ErrorInfo, index?: number) {
    const data = { ...item, time: new Date().getTime() };
    if (typeof index !== 'number') {
      this.queue.splice(this.queue.length - 1, 1, data);
    } else {
      this.queue.splice(index as number, 1, data);
    }
  }

  // 清空数组
  clear() {
    this.queue = [];
  }
}

interface IQueue extends Queue {
  [key: string]: any;
}

let queue: IQueue | null = null;

// 初始化队列
export const initQueue = (): void => {
  queue = new Queue();
};

// 获取需要代理的所有key
const keys = Object.keys(Queue.prototype).concat(['queue', 'size']);
const proxy = {};

// 代理queue，在未开启queue时，使所有方法失效
keys.forEach((key) => {
  Object.defineProperty(proxy, key, {
    get() {
      if (!queue) {
        return () => null;
      }
      return queue[key];
    }
  });
});

export default proxy as IQueue;
