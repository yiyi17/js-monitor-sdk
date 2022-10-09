import fetch from 'node-fetch';
import initMonitor from '../index';
import getPerformanceData, { getWebVitals } from '../monitor/performance';
import getMemory from '../monitor/memory'
import getRequestLogger from '../monitor/request';
import getResourceError from '../monitor/resourc-error';
import getRuntimeError from '../monitor/runtime-error';

jest.mock('node-fetch');

jest.mock('../monitor/request.ts');

jest.mock('../monitor/runtime-error');

jest.mock('../monitor/resourc-error');

jest.mock('../monitor/performance');

jest.mock('../monitor/memory')

describe('all features enabled', () => {
  const opts = {
    performance: false,
    resourceError: false,
    runtimeError: false,
    request: false,
    common: {},
  };
  const BeforeLoadErrorArr = [new Error(1), new Error(2)];

  beforeAll(() => {
    // use mocked node-fetch to realize window.fetch
    window.fetch = fetch;
  });

  it('should parse option "performance loading"', () => {
    const spyAddEventsListener = jest.spyOn(window, 'addEventListener');
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });
    initMonitor({ ...opts, performance: true });
    expect(spyAddEventsListener.mock.calls).toMatchSnapshot();
    const onLoad = spyAddEventsListener.mock.calls[0][1];
    onLoad();
    expect(getPerformanceData).toHaveBeenCalled();
    expect(getWebVitals).toHaveBeenCalled();
    spyAddEventsListener.mockRestore();
  });

  it('should parse option "performance complete"', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });
    initMonitor({ ...opts, performance: true });
    expect(getMemory).toHaveBeenCalled()
    expect(getPerformanceData).toHaveBeenCalled();
    expect(getWebVitals).toHaveBeenCalled();
  });

  it('should parse option "resourceError"', () => {
    window.__RESOURCEERROR__ = BeforeLoadErrorArr;
    const spyAddEventsListener = jest.spyOn(window, 'addEventListener');
    initMonitor({ ...opts, resourceError: true });

    expect(spyAddEventsListener.mock.calls[0][0]).toBe('error');
    const onError = spyAddEventsListener.mock.calls[0][1];
    onError();
    expect(getResourceError).toHaveBeenCalledTimes(BeforeLoadErrorArr.length + 1);
    spyAddEventsListener.mockRestore();
    window.__RESOURCEERROR__ = undefined;
  });

  it('should parse option "getRequestLogger"', () => {
    initMonitor({ ...opts, request: true });
    expect(getRequestLogger).toHaveBeenCalled();
  });

  it('should parse option "getRuntimeError"', () => {
    initMonitor({ ...opts, runtimeError: true });
    expect(getRuntimeError).toHaveBeenCalled();
  });
});
