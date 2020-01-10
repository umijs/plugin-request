import React, { useState, useEffect } from 'react';
import { request } from 'umi';

async function testRequest({ showType }) {
  const data = await request(`/api/users/failure?showType=${showType}`);
  console.log('test request console will not be excute', data);
  return data;
}

async function testRequestError() {
  await request('/api/status/failure');
}

export default () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: users } = await request(`/api/users`);
      console.log('get userData:', users);
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
    <h2>Test Request ErrorHandler</h2>
    <ul>
      <li><button onClick={testRequestError}>error handler</button></li>
    </ul>
  </>);
}
