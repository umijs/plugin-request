import { IApi } from 'umi-types';
import { join } from 'path';
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
  assert(/^[a-zA-Z\.]+$/.test(dataField), 'dataField should match /^[a-zA-Z.]+$/');

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
        requestTemplate.replace(/\/\*FRS\*\/(.+)\/\*FRE\*\//, formatResultStr),
      );
    } catch (e) {
      api.log.error(e);
    }
  });

  api.addUmiExports([
    {
      exportAll: true,
      source: join(api.paths.absTmpDirPath, namespace, 'request'),
    },
  ]);
}
