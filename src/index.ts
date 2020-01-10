import { IApi } from 'umi-types';
import { join } from 'path';

export default function(api: IApi) {
  api.addRuntimePluginKey('request');

  const source = join(__dirname, '..', 'src', 'request');
  api.addUmiExports([
    {
      specifiers: ['request'],
      source,
    },
  ]);

  api.addEntryCode(`require('${source}').__init_request__();`);
}
