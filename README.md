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

  return (<>
    <h1>@umijs/plugin-request</h1>
    <h2>Users</h2>
    <ul>
      { users.map(u => <li key={u}>{u}</li>) }
    </ul>
    <h2>Test Request</h2>
    <ul>
      <li><button onClick={testRequest.bind(null, { showType: 0 })}>showType 0</button></li>
      <li><button onClick={testRequest.bind(null, { showType: 1 })}>showType 1</button></li>
      <li><button onClick={testRequest.bind(null, { showType: 4 })}>showType 4</button></li>
      <li><button onClick={testRequest.bind(null, { showType: 9 })}>showType 9</button></li>
    </ul>
  </>);
}
```

### 3 Add config in 'src/app.ts'

#### Add common options

```javascript
// src/app.ts
export const request = {
  prefix: '/api/v1',
  suffix: '.json',
  timeout: 3000,
}
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
  responseParsers: [
    {
      adaptor: {
        success: 'ok',
        data: 'result',
        errorCode: 'error.code', // support nested parsing
        errorMessage: 'error.msg',
      }
    }
  ]
}

// Function is also supported
export const request = {
  responseParsers: [
    {
      adaptor: (response) => {
        return {
          success: response.ok,
          data: response.result,
          errorCode: response.error.code,
          errorMessage: response.error.msg,
        }
      }
    }
  ]
}
```

##### Interface Resolution and Error Handling

1. When the response status code is not 200, the errorhandler will still be triggered. Developers can override the default errorhandler through configuration
2. When the response status code is 200 and body.success is true, no processing will be performed
3. When the response status code is 200 and 'body.success' is false, different error handling will be done according to the value of 'body.showtype' (default is 4)
    1. showType === 0, silent, do nonting;
    2. showType === 1, light message： antd.message.error(body.errorMessage)
    3. showType === 4, hard notification： antd.notification.open({ message: 'Request failed！', description: body.errorMessage })
    4. showType === 9, page redirect：like antd-pro，default page is '/exception?errorCode=xxx&errorMessage=xxx'

If you want to override all or part of the default error handling, just configure the handler:

```javascript
export const request = {
  responseParsers: [
    {
      handler: (showType, response, request, config, defaultHandle) => {
        // Override error handling with showtype 4
        if (showType === 4) {
          notification({
            message: 'Network error~',
            description: errorMessage,
          })
          return;
        }
        // The rest is handled by the default exception handler
        defaultHandler(showType, response, request, config);
      }
    }
  ]
}
```

If you do different processing for different interfaces, you can use the include combination to:

```javascript
export const request = {
  responseParsers: [
    {
      include: /^\/api\/v1/ig,
      adaptor: {
        success: 'ok',
        data: 'result',
        errorCode: 'error.code',
        errorMessage: 'error.msg',
      }
    }, // Interface adaptation for the interface begin with '/API/v1'
    {
      include: /^\/api\/v2/ig,
      handler: (showType, response, config, defaultHandler) => {
        // error handler
      }
    }, // Interface adaptation for the interface begin with '/API/v2'
  ]// The rest go to default error handler
}
```

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
    }
  ]
}
```

Full example can find in [./example](https://github.com/umijs/plugin-request/tree/master/example).

## LICENSE

MIT
