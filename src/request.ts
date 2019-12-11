import request, { extend, fetch } from 'umi-request';
import __init__ from './init';

// TODO: add this in bigfish
// fetch.interceptors.request.use(chartSetInterceptor);

fetch.interceptors.response.use((response) => {
  console.log('resopnse')
  if (!response) return;
  // response.headers.append('hahahah', 'hahahah');
  console.log(response.headers.get('Content-Type'));
  return response;
});

// TODO: add this in bigfish
// 拓展请求内核中间件，支持 RPC 请求： request('alipay.client.xxx', { __umiRequestCoreType__: 'rpc', data: [], headers: {} })
// request.use(rpcRequest, { core: true });

// 拦截器共享
request.interceptors = fetch.interceptors;

const __init_request__ = () => {
  __init__(request)
};

export { extend, fetch, __init_request__ };
export default request;
