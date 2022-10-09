export default {};

/**
 * @description common 数据结构
 */
export type Common = {
  disableLog?: boolean;
  projectId: string;
  esIndexKeyword?: string; // es 的 index 关键字
};
/**
 * @description  初始化参数类型
 */
export type InitOpts = {
  metrics: boolean;
  performance: boolean;
  resourceError: boolean;
  runtimeError: boolean;
  userActions: boolean;
  request: boolean;
  trace: {
    open: boolean;
    apiList: string[];
    ignoreList: string[];
  };
  common: Common;
};

export type PerformaceData = {
  type: string;
  dns: number;
  tcp: number;
  ttfb: number;
  trans: number;
  dom: number;
  ssl: number;
  firstbyte: number;
  fp: number;
  tti: number;
  res: number;
  ready: number;
  load: number;
  effectiveType: string;
  downlink: number;
  rtt: number;
  platform: string;
  fcp: number;
  rd: number;
  https: string;
  wherepage: number;
};

export type ErrorData = {
  outerHTML: any;
  timestamp: number;
  XPath: string | null;
  selector: string;
  type: 'ResourceError';
  url: string | any[];
  baseURI: any;
  tagName: any;
};

export type LogSender = (data: any, common: Common) => void;

export type SData = {
  size?: any;
  dns?: any;
  protocol?: any;
  spend_time?: any;
  name?: any;
  effectiveType?: any;
  downlink?: any;
  rtt?: any;
  request: string;
  elapsed_time: number;
  req_url: string;
  response: string;
  method: string;
  status: number;
  statusText: string;
  type: 'reqPerf' | 'reqError' | 'reqSuccess';
  trace_id: string;
};

// History行为信息
export interface HistoryArgumentsItem {
  state: any;
  title: string;
  from?: string;
  to: string;
}
// History params
export interface HistoryArguments extends Event {
  params?: HistoryArgumentsItem;
}

export interface IHistory extends History {
  [key: string]: any;
}
