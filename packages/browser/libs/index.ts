export const isNotApi = (url: string): boolean =>
  url?.indexOf('.js') !== -1 ||
  url?.indexOf('.css') !== -1 ||
  url?.indexOf('.html') !== -1 ||
  url?.indexOf('.ts') !== -1;

export const isDefaultApi = (url: string, apiList?: string[]): boolean => {
  const urlPath = url?.split('?')[0];
  const defaultApi = apiList?.some((item) => urlPath?.indexOf(item) !== -1);

  return !!defaultApi;
};

export const isIgnore = (url: string, ignoreList?: string[]): boolean => {
  const urlPath = url?.split('?')[0];
  const ignoreApi = ignoreList?.some((item) => urlPath?.indexOf(item) !== -1);
  return !!ignoreApi;
};
