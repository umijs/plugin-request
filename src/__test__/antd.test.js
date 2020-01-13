import createTestServer from 'create-test-server';
import { request } from '../request';

jest.mock(
  'runtimeConfig',
  () => {
    return {
      errorConfig: {},
      middlewares: [
        async (ctx, next) => {
          await next();
          const { res } = ctx;
          res.testMiddlewares = 'middlewares works';
        },
      ],
    };
  },
  { virtual: true },
);

jest.mock('antd', () => {
  // mock antd throw error for test
  return {
    message: {
      warn: () => {
        throw new Error('message.warn');
      },
      error: () => {
        throw new Error('message.error');
      },
    },
    notification: {
      open: () => {
        throw new Error('notification.open');
      },
    },
  };
});

describe('antd error tip', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('antd message warn', async () => {
    const rawData = {
      success: false,
      errorMessage: 'test message',
      showType: 1,
    };
    server.get('/test/failed', (req, res) => {
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/failed'));
    } catch (e) {
      expect(e.message).toEqual('message.warn');
    }
  });

  it('antd message warn', async () => {
    const rawData = {
      success: false,
      errorMessage: 'test message',
      showType: 2,
    };
    server.get('/test/failed2', (req, res) => {
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/failed2'));
    } catch (e) {
      expect(e.message).toEqual('message.error');
    }
  });

  it('silent', async () => {
    const rawData = {
      success: false,
      errorMessage: 'test message',
      showType: 0,
    };
    server.get('/test/failed0', (req, res) => {
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/failed0'));
    } catch (e) {
      expect(e.message).toEqual('test message');
    }
  });

  it('silent', async () => {
    const rawData = {
      success: false,
      errorMessage: 'test message',
      showType: 4,
    };
    server.get('/test/failed4', (req, res) => {
      res.send(rawData);
    });
    try {
      const response = await request(prefix('/test/failed4'));
    } catch (e) {
      expect(e.message).toEqual('notification.open');
    }
  });
});
