import { IApi } from 'umi-types';
import { join } from 'path';

export default function(api: IApi) {
  api.addRuntimePluginKey('request');

  const source = join(__dirname, '..', 'src', 'request');
  api.addUmiExports([
    {
      exportAll: true,
      source,
    },
  ]);
}
