import createTestServer from 'create-test-server';
import { extend } from 'umi-request';
import { request } from './request';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('request', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('normal', async () => {
    server.get('/test/requestType', (req, res) => {
      writeData(req.query, res);
    });

    let response = await request(prefix('/test/requestType'), {
      method: 'get',
      params: {
        foo: 'foo',
      },
    });
    expect(response.foo).toBe('foo');
  });
});
