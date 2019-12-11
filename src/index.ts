import { IApi } from 'umi-types';
import { join } from 'path';

export default function (api: IApi, option) {
  api.log.info('【plugin-req】get option', JSON.stringify(option));

  api.addRuntimePluginKey('request');

  api.onOptionChange(newOpts => {
    api.rebuildTmpFiles();
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set('@alipay/bigfish/sdk/fetch$', join(__dirname, './fetch.js'))
      .set('@alipay/bigfish/sdk/request$', join(__dirname, './request.js'));
  });

  // api.addEntryImport(() => {
  //   return {
  //     source: join(__dirname, './middlewares/response-parser'),
  //     specifier: 'responseParser',
  //   };
  // });

  api.addEntryCodeAhead(`import { __init_request__ } from '@alipay/bigfish/sdk/request'`)
  api.addEntryCode(`__init_request__();`)
}
