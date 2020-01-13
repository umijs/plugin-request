import createTestServer from 'create-test-server';
import { request } from '../request';

jest.mock(
  'runtimeConfig',
  () => {
    return {
      timeout: 1000,
      errorConfig: {
        adaptor: data => {
          return {
            ...data,
            errorMessage: data.message,
          };
        },
      },
    };
  },
  { virtual: true },
);

describe('normal request', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('success', async () => {
    // success
    const rawData = {
      success: true,
      data: {
        list: ['test'],
      },
      message: 'test message',
    };
    server.get('/test/success', (req, res) => {
      res.send(rawData);
    });
    const response = await request(prefix('/test/success'));
    expect(response).toEqual(rawData);
  });

  it('failed', async () => {
    // failed
    const rawData = {
      success: false,
      message: 'test message',
    };
    server.get('/test/failed', (req, res) => {
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/failed'));
    } catch (e) {
      expect(e.name).toEqual('BizError');
      expect(e.message).toEqual('test message');
      expect(e.data).toEqual(rawData);
    }
  });

  it('http failed', async () => {
    // failed
    const rawData = {
      success: false,
      data: { list: [2] },
      message: 'test message',
    };
    server.get('/test/httpfailed', (req, res) => {
      res.status(500);
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/httpfailed'));
    } catch (e) {
      expect(e.name).toEqual('ResponseError');
      expect(e.message).toEqual('test message');
      expect(e.data).toEqual(rawData);
    }
  });
});
