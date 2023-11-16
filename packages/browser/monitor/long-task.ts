import { postWeberJSON } from '../../core';

type LongTaskMonitorOpt = {
  projectId: string;
};
export default function longTaskMonitor({ projectId }: LongTaskMonitorOpt): void {
  if (performance && performance.getEntries instanceof Function && PerformanceObserver) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const { name, startTime, duration } = entry;
        const href = window.location.href;
        postWeberJSON({
          type: 'web_longtask',
          base: {
            platform: 'web',
            project: projectId,
            page_url: href && href.split('?')[0],
            current_href: href
          },
          data: {
            name,
            startTime,
            duration,
            attribution: (entry as any)?.attribution || []
          }
        });
      });
    });

    observer.observe({ type: 'longtask', buffered: true });
  }
}
