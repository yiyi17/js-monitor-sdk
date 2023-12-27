import JSLogger from './index';

it('should have instance methods', () => {
  const logger = new JSLogger();
  expect(window).toHaveProperty('__JSLogger__');
  expect(typeof logger.click).toBe('function');
  expect(typeof logger.show).toBe('function');
});

it('should not instantiate twice', () => {
  const spyConsoleWarn = jest.spyOn(window.console, 'warn');
  new JSLogger();
  expect(spyConsoleWarn.mock.calls.length === 0);
  new JSLogger();
  expect(spyConsoleWarn).toHaveBeenCalledWith(
    '%cJSLogger can not instantiate multiple times.',
    'color:blue;font-size:12px;',
  );
});
