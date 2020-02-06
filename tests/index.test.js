import pluginFunc from '../src/index';

describe('plugin-request', () => {
  const getMockAPI = (writeTmpFile = () => {}) => {
    return {
      addRuntimePluginKey() {},
      onGenerateFiles(handler) {
        handler();
      },
      paths: {
        absTmpDirPath: '/test/page/.umi',
      },
      winPath() {
        return '/winpathtest';
      },
      addUmiExports() {},
      writeTmpFile,
    };
  };

  test('dataField', () => {
    const writeTmpFile = jest.fn();
    pluginFunc(getMockAPI(writeTmpFile), {
      dataField: 'result',
    });

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('result => result?.result'),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining("['result']"),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('result: T;'),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('/winpathtest'),
    );
  });

  test('dataField format', () => {
    const writeTmpFile = jest.fn();
    pluginFunc(getMockAPI(writeTmpFile), {
      dataField: '',
    });
    expect(writeTmpFile).toHaveBeenCalled();

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('type ResultWithData<T = any> = {  [key: string]: any };'),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('BaseOptions<R, P>'),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('BaseResult<R, P>'),
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('result => result'),
    );

    try {
      pluginFunc(getMockAPI(), {
        dataField: '&12',
      });
    } catch (e) {
      expect(e.message).not.toBeNull();
    }
  });
});
