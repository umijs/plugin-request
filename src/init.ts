import { RequestMethod, RequestOptionsInit, OnionMiddleware } from 'umi-request';
import { message, notification } from 'antd';
import history from '@@/history';
import get from 'lodash.get';
import 'antd/dist/antd.css';

interface IHandler {
  ( showType: number, response: ResponseStructure, request: { url: string, options: RequestOptionsInit} , config: IResponseParser, defaultHandler?: IHandler ): void;
}

export interface IResponseParser {
  include?: ( url: string, options: RequestOptionsInit) => boolean | RegExp | string;
  adaptor?:  (response: any ) => ( Promise<ResponseStructure> | ResponseStructure ) | ResponseStructure;
  showType?: ( response: ResponseStructure, request: { url: string, options: RequestOptionsInit} ) => number | number;
  handler?: IHandler;
  errorPage?: string;
}

export interface RequestConfig extends RequestOptionsInit {
  responseParsers: IResponseParser[];
  middlewares?: ( defaultMiddlewares: OnionMiddleware[] ) => OnionMiddleware[] | OnionMiddleware[];
}

export interface ResponseStructure {
  success: boolean;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
  showType?: number;
  traceId?: string;
  host?: string;
  [key: string]: any;
}

const DEFAULT_ERROR_PAGE = '/exception';

/**
 * 返回最终中间件列表
 * @param innerMiddlewares 内置中间件
 * @param customMiddlewares 用户自定义中间件
 */
function getRequestMiddlewares(innerMiddlewares: OnionMiddleware[], customMiddlewares: ((innerMiddlewares: OnionMiddleware[]) => OnionMiddleware[]) | OnionMiddleware[]) {
  if ( customMiddlewares instanceof Array) {
    return [...customMiddlewares, ...innerMiddlewares];
  }
  return customMiddlewares(innerMiddlewares);
}

/**
 * 返回当前请求是否符合匹配规则
 * @param include 匹配规则
 * @param url 当前请求 URL
 * @param options 当前请求参数
 */
function checkIfMatch( include: string | RegExp | Function, url: string, options: RequestOptionsInit): boolean {
  if (typeof include === 'string') return include === url;
  if (include instanceof RegExp) return include.test(url);
  if (typeof include === 'function') return include(url, options);
  return false;
}

/**
 * 默认异常处理类型： 0、1、4、9
 * @param response 响应结果
 */
function defaultShowType (response: ResponseStructure): number {
  return response.showType || 4;
}

/**
 * 默认响应处理方式
 * @param showType 异常码
 * @param response 响应结果
 */
let defaultHandler: IHandler;
defaultHandler = (showType, response, request, responseParserConfig) => {
  const { options = {} } = request;
  const { getResponse = false } = options;
  const responseData = getResponse ? response.data : response;
  const { errorMessage = '请求异常', errorCode = '' } = responseData;
  const { errorPage = DEFAULT_ERROR_PAGE } = responseParserConfig;

  console.log(`showType`, showType);

  switch(showType) {
    case 0:
      // do nothing
      break;
    case 1:
      message.error(errorMessage);
      break;
    case 4:
      notification.open({
        message: '请求出错!',
        description: errorMessage,
      });
      break;
    case 9:
      history.push({
        pathname: errorPage,
        query: { errorCode, errorMessage }
      });
      // 跳转到 404 页面
      break;
    default:
      break;
  }
};

/**
 * 根据适配器将响应结果转化为规范接口
 * @param adaptor 适配器
 * @param res 接口响应结构
 */
async function getResponseByAdaptor(adaptor: ((response: any ) =>  Promise<ResponseStructure> | ResponseStructure) | ResponseStructure, res: any) {
  let responseByAdaptor: ResponseStructure;
  if (typeof adaptor === 'function') {
    responseByAdaptor = await adaptor(res);
    return responseByAdaptor;
  }

  responseByAdaptor = { success: true };
  if (typeof adaptor === 'object') {

    for (let key in adaptor) {
      responseByAdaptor[key] = get(res, adaptor[key])
    }
  }
  return responseByAdaptor;
}

/**
 * 根据用户在 app.ts 里的 responseParsers 返回最终中间件
 * @param config responseParser 中间件配置
 */
function getResponseParserMiddleware(config: IResponseParser[]) {
  let responseParser: OnionMiddleware;
  responseParser = async (ctx, next) => {
    await next();

    const { req } = ctx;
    const { url, options } = req;
    const { getResponse = false } = options;
    const defaultConfig: IResponseParser = {
      showType: defaultShowType,
      handler: defaultHandler,
    }

    // 获取符合条件的配置
    const matchConfig: IResponseParser = config.find(item => {
      const { include } = item;
      if (include === undefined) return true;
      if (include instanceof Array) {
        return include.findIndex((item) =>  checkIfMatch(item, url, options) ) >= 0
      }
      return checkIfMatch(include, url, options);
    }) || defaultConfig;

    const { showType = defaultShowType, handler = defaultHandler, adaptor = undefined } = matchConfig || {};

    // todo: adaptor 处理、接口解析、错误处理
    if (adaptor) {
      const responseByAdaptor = await getResponseByAdaptor(adaptor, ctx.res);
      ctx.res = responseByAdaptor;
    }

    const { res } = ctx;
    const resData = getResponse ? res.data : res;
    const { success } = resData;
    if (success) return;
    handler(showType(res, req), res, req, matchConfig, defaultHandler);

  }
  return responseParser;
}

function __init__( request: RequestMethod ) {

  const requestConfig: RequestConfig = require('umi/_runtimePlugin').mergeConfig('request') || {};
  const { responseParsers: responseParsersConfig = [], middlewares = [], ...requestOptions } = requestConfig;
  const responseParserMiddleware = getResponseParserMiddleware(responseParsersConfig);
  const requestMiddlewares = getRequestMiddlewares([responseParserMiddleware], middlewares);

  request.extendOptions(requestOptions);
  requestMiddlewares.forEach( mw => {
    request.use(mw);
  });
}

export default __init__;
