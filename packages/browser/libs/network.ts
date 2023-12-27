export function getConnectionStatus(): {
  effectiveType: string;
  downlink: number;
  rtt: number;
} {
  let network = {
    effectiveType: '',
    downlink: -1,
    rtt: -1,
  };
  if (window.navigator && (window.navigator as any).connection) {
    network = {
      // @ts-ignore
      effectiveType: window.navigator?.connection?.effectiveType || '',
      // @ts-ignore
      downlink: window.navigator?.connection?.downlink || -1,
      // @ts-ignore
      rtt: window.navigator?.connection?.rtt || -1,
    };
  }
  return network;
}
