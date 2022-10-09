// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function addEvent(ev: string, fn: any): void {
  if ((window as any).attachEvent) {
    // 针对IE浏览器
    (window as any).attachEvent('on' + ev, fn);
  } else {
    // 针对FF与chrome
    window.addEventListener(ev, fn, false);
  }
}
