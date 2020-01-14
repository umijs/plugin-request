# @umijs/plugin-request

[![codecov](https://codecov.io/gh/umijs/plugin-request/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/plugin-request)
[![NPM version](https://img.shields.io/npm/v/@umijs/plugin-request.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-request)
[![CircleCI](https://circleci.com/gh/umijs/plugin-request/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/plugin-request/tree/master)
[![GitHub Actions status](https://github.com/umijs/plugin-request/workflows/Node%20CI/badge.svg)](https://github.com/umijs/plugin-request)
[![NPM downloads](http://img.shields.io/npm/dm/@umijs/plugin-request.svg?style=flat)](https://npmjs.org/package/@umijs/plugin-request)

Integrate umi-request deeply to umi.

## Install

```bash
# or yarn
$ npm install @umijs/plugin-request --save
```

## Usage

Getting started in 3 steps.

### 1. Configure in `.umirc.js`

```js
export default {
  plugins: [['@umijs/plugin-request', options]],
};
```

### 2 Use request in your project.

```javascript
import React, { useState, useEffect } from 'react';
import { request } from 'umi';

async function testRequest({ showType }) {
  await request(`/api/users/failure?showType=${showType}`);
}

export default () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: users } = await request(`/api/users`);
      setUsers(users);
    })();
  }, []);

  return (
    <>
      <h1>@umijs/plugin-request</h1>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <h2>Test Request</h2>
      <ul>
        <li>
          <button onClick={testRequest.bind(null, { showType: 0 })}>showType 0</button>
        </li>
        <li>
          <button onClick={testRequest.bind(null, { showType: 1 })}>showType 1</button>
        </li>
        <li>
          <button onClick={testRequest.bind(null, { showType: 4 })}>showType 4</button>
        </li>
        <li>
          <button onClick={testRequest.bind(null, { showType: 9 })}>showType 9</button>
        </li>
      </ul>
    </>
  );
};
```

### 3 Add config in 'src/app.ts'

#### Add common options

```javascript
// src/app.ts
export const request = {
  prefix: '/api/v1',
  suffix: '.json',
  timeout: 3000,
};
```

#### ResponseParser middleware

We have agreed on a set of **standard interface structure** specifications and provided **default interface parsing and error handling** capabilities, which are integrated in the request through the **ResponseParser middleware**

##### Standard interface structure

```typescript
export interface response {
  success: boolean; // if request is success
  data?: any; // response data
  errorCode?: string; // code for errorType
  errorMessage?: string; // message display to user
  showType?: number; // error display type： 0 silent; 1 message; 4 notification; 9 page
  traceId?: string; // Convenient for back-end Troubleshooting: unique request ID
  host?: string; // onvenient for backend Troubleshooting: host of current access server
}
```

If the interface structure of the project is inconsistent with the standard interface specification, but you want to use the following interface resolution and error handling capabilities, you can use request.responseparsers []. Adapter to adapt:

```javascript
// Assume your project interface structure is: "{ok: true, result: { name: 'litou' }, error: { code: '000', msg: 'xxx' } }"
// The configuration is as follows:

export const request = {
  errorConfig: {
    adaptor: data => {
      return {
        success: data.ok,
        data: data.result,
        errorCode: data.error.code,
        errorMessage: data.error.msg,
      };
    },
  },
};
```

##### Interface Resolution and Error Handling

1. When the response status code is not 200, the errorhandler will still be triggered. Developers can override the default errorhandler through configuration
2. When the response status code is 200 and body.success is true, no processing will be performed
3. When the response status code is 200 and 'body.success' is false, different error handling will be done according to the value of 'body.showtype' (default is 4)
   - showType === 0, silent, do nonting;
   - showType === 1, warn message： antd.message.warn(body.errorMessage)
   - showType === 2, error message： antd.message.error(body.errorMessage)
   - showType === 4, notification： antd.notification.open({ message: 'Request failed！', description: body.errorMessage })
   - showType === 9, page redirect：like antd-pro，default page is '/exception?errorCode=xxx&errorMessage=xxx'

If you want to override all or part of the default error handling, just configure the handler:

```javascript
export const request = {
  errorHandler: error => {
    if (error.name === 'BizError') {
      if (error.info.showType === 9) {
        // your code
      }
    }
  },
  errorConfig: {
    errorPage: '/exception', // redirect when show type is 9
  },
};
```

If you want to skip errorHander on some request, we extend a request option `skipErrorHandler`, you can set it ture for skip default error handler.

#### Middleware

The responseParser middleware is built in. You can expand middlewares through 'middlewares' config:

```javascript
export const request = {
  middlewares: [
    async function middlewareA(ctx, next) {
      console.log('A before');
      await next();
      console.log('A after');
    },
    async function middlewareB(ctx, next) {
      console.log('B before');
      await next();
      console.log('B after');
    },
  ],
};
```

Full example can find in [./example](https://github.com/umijs/plugin-request/tree/master/example).

## Contribute

1. npm i && npm i umi@latest

2. npm run build -- -w

3. cd example

4. npx umi dev

## LICENSE

MIT
