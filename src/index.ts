import { IApi } from 'umi-types';
import { join } from 'path';

export default function (api: IApi) {
  api.addRuntimePluginKey('request');

  const source = join(__dirname, '..', 'src', 'request.ts');
  api.addUmiExports([
    {
      specifiers: ['request'],
      source,
    },
  ]);

  // api.addEntryImport(() => {
  //   return {
  //     source: join(__dirname, './middlewares/response-parser'),
  //     specifier: 'responseParser',
  //   };
  // });

  api.addEntryCode(`require('${source}').__init_request__();`);
}
