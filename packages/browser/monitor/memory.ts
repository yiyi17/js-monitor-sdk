export default (): {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
} => {
  let data = {
    usedJSHeapSize: -1,
    totalJSHeapSize: -1,
    jsHeapSizeLimit: -1,
  };
  if (window.performance) {
    const memory = (performance as any)?.memory;
    if (memory) {
      data = memory;
    }
  }
  return {
    memory: {
      usedJSHeapSize: data?.usedJSHeapSize,
      totalJSHeapSize: data?.totalJSHeapSize,
      jsHeapSizeLimit: data?.jsHeapSizeLimit,
    },
  };
};
