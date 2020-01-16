import pluginFunc from '../src/index';

describe('plugin-request', () => {
  test('dataField', () => {
    const writeTmpFile = jest.fn();
    pluginFunc(
      {
        addRuntimePluginKey() {},
        onGenerateFiles(handler) {
          handler();
        },
        paths: {
          absTmpDirPath: '/test/page/.umi',
        },
        winPath() {},
        addUmiExports() {},
        writeTmpFile,
      },
      {
        dataField: 'result',
      },
    );

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
  });
});
