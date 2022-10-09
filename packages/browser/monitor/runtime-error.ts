import {
  Common,
  InitOpts as Opts,
  LogSender
} from 'js-monitor-sdk/types/packages/types/index.types';
import { getPageRoute, getUserClick, getUserInput } from '../libs/actions';
import { addEvent } from '../libs/event';
import queue, { initQueue } from '../libs/queue';
// @ts-ignore
import TraceKit from '../libs/tracekit';

/**
 * Attach normal js runtime exception function
 * Example: `normalException(this.cacheUploader)`
 * @param {Function} function to upload log data
 */
export function normalException(sender: LogSender, common: Common): void {
  // console.log(111111, sender);

  // @ts-ignore
  TraceKit.report.subscribe(function Logger(errorData: {
    [x: string]: any;
    stack: string | any[];
    type: 'Script';
    url: string;
    line: number;
    col: number;
    file_name: string;
    msg: string | string[];
    message: string;
    name: string;
  }) {
    // console.log('error', errorData);
    if (
      errorData &&
      errorData.stack &&
      errorData.stack instanceof Array &&
      errorData.stack.length
    ) {
      errorData.type = 'Script';
      const el = errorData.stack[0];
      errorData.url = el.url || '';
      errorData.line = el.line ? el.line * 1 : -1;
      errorData.col = el.column ? el.column * 1 : -1;
      errorData.file_name = el.url || '';
      errorData.msg = errorData.message || '';
      errorData.name = errorData.name || '';

      // @ts-ignore
      delete errorData['message'];
      if (
        errorData.msg &&
        (typeof errorData.msg === 'string' || (errorData.msg as any) instanceof String) &&
        errorData.msg.indexOf('Script error') === -1
      ) {
        queue.push(errorData);
        errorData.actions = queue.getReportData();
        sender(errorData, common);
      }
    }
  });
}

/**
 * Attach unhandledRejection js runtime exception function
 * Example: `unhandledRejection(this.cacheUploader)`
 * @param {Function} function to upload log data
 */
export function unhandledRejection(sender: LogSender, common: Common): void {
  function handler(evt: { reason: Error }) {
    // console.log('unhandledRejection', evt);

    if (evt.reason) {
      // @ts-ignore
      const errorData = TraceKit.computeStackTrace(evt.reason);
      errorData.type = 'Script';
      if (
        errorData &&
        errorData.stack &&
        errorData.stack instanceof Array &&
        errorData.stack.length
      ) {
        const el = errorData.stack[0];
        errorData.url = el.url || '';
        errorData.line = el.line ? el.line * 1 : -1;
        errorData.col = el.column ? el.column * 1 : -1;
        errorData.file_name = el.url || '';
        errorData.msg = errorData.message || '';
        errorData.name = errorData.name || '';
        delete errorData['message'];
        if (
          errorData.msg &&
          (typeof errorData.msg === 'string' || errorData.msg instanceof String) &&
          errorData.msg.indexOf('Script error') === -1
        ) {
          queue.push(errorData);
          sender(errorData, common);
        }
      }
    }
  }

  // @ts-ignore
  addEvent('unhandledrejection', handler);
}

export default function getRuntimeError(
  sender: LogSender,
  common: Opts['common'] & { opts: Opts }
): void {
  const { opts } = common;
  const { userActions } = opts;
  normalException(sender, common);
  unhandledRejection(sender, common);
  // 行为收集初始化
  if (userActions) {
    initQueue();
    getPageRoute();
    getUserInput();
    getUserClick();
  }
}
