import { join } from 'path';

export default {
  plugins: [
    [
      join(__dirname, '..', require('../package').main || 'index.js'),
      {
        dataField: 'result',
      },
    ],
    [
      'umi-plugin-react',
      {
        dva: {
          immer: true,
        },
        antd: true,
        locale: {},
        library: 'react',
        pwa: false,
        hd: false,
        fastClick: false,
        title: 'default title',
      },
    ],
  ],
};
