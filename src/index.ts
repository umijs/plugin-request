import { IApi } from 'umi-types';
import { join, dirname } from 'path';
import assert from 'assert';
import { readFileSync } from 'fs';

export interface RequestOptions {
  dataField?: string;
}

export default function(api: IApi, options: RequestOptions) {
  api.addRuntimePluginKey('request');

  const { dataField = 'data' } = options || {};
  const source = join(__dirname, '..', 'src', 'request.ts');
  const requestTemplate = readFileSync(source, 'utf-8');
  const namespace = 'plugin-request';
  assert(/^[a-zA-Z]*$/.test(dataField), 'dataField should match /^[a-zA-Z]*$/');

  api.onGenerateFiles(() => {
    try {
      // Write .umi/plugin-request/request.ts
      let formatResultStr;
      if (dataField === '') {
        formatResultStr = 'formatResult: result => result';
      } else {
        formatResultStr = `formatResult: result => result?.${dataField}`;
      }
      api.writeTmpFile(
        `${namespace}/request.ts`,
        requestTemplate
          .replace(/\/\*FRS\*\/(.+)\/\*FRE\*\//, formatResultStr)
          .replace(/\['data'\]/g, dataField ? `['${dataField}']` : '')
          .replace(/data: T;/, dataField ? `${dataField}: T;` : '')
          .replace(
            /umi-request/g,
            api.winPath(dirname(require.resolve('umi-request/package'))),
          )
          .replace(
            /@ahooksjs\/use-request/g,
            api.winPath(dirname(require.resolve('@ahooksjs/use-request/package'))),
          ),
      );
    } catch (e) {
      api.log.error(e);
    }
  });

  api.addUmiExports([
    {
      exportAll: true,
      source: api.winPath(join(api.paths.absTmpDirPath, namespace, 'request')),
    },
  ]);
}
