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
        addUmiExports() {},
        writeTmpFile,
      },
      {
        dataField: 'result.data',
      },
    );

    expect(writeTmpFile).toHaveBeenLastCalledWith(
      'plugin-request/request.ts',
      expect.stringContaining('result => result?.result.data'),
    );
  });
});
