import { version } from '../../../package.json';

const hasMonitor = Array.from(document.getElementsByTagName('script')).some((script) => {
  return script.src && script.src.includes('/js-monitor-sdk@');
});

if (!hasMonitor) {
  const head = document.head || document.getElementsByTagName('head')[0];
  if (head) {
    const script = document.createElement('script');
    script.src = `https://spacez.com/js-monitor-sdk@v${version}/dist/js-monitor-sdk.umd.js`;
    script.setAttribute('instanced', 'yes');
    script.setAttribute('disableLog', 'false');
    head.appendChild(script);
  }
}
