/**
 * Base on https://github.com/umijs/umi-request
 */
import { extend, Context, RequestOptionsInit, OnionMiddleware } from 'umi-request';
import { message, notification } from 'antd';
import useAPI from '@umijs/use-api';
// @ts-ignore
import history from '@@/history';

// TODO typescript support
export const useRequest = (params: any, options?: any) => {
  return useAPI(params, {
    /*FRS*/ formatResult: res => res?.data /*FRE*/,
    ...options,
  });
};

export interface RequestConfig extends RequestOptionsInit {
  errorConfig?: {
    errorPage?: string;
    adaptor?: (resData: any, ctx: Context) => ErrorInfoStructure;
  };
  middlewares?: OnionMiddleware[];
}

export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 4,
  REDIRECT = 9,
}

interface ErrorInfoStructure {
  success: boolean;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
  showType?: ErrorShowType;
  traceId?: string;
  host?: string;
  [key: string]: any;
}

interface RequestError extends Error {
  data?: any;
  info?: ErrorInfoStructure;
  request?: Context['req'];
  response?: Context['res'];
}

const DEFAULT_ERROR_PAGE = '/exception';
const requestConfig: RequestConfig =
  require('umi/_runtimePlugin').mergeConfig('request') || {};
const errorAdaptor = requestConfig.errorConfig?.adaptor || (resData => resData);

export const request = extend({
  errorHandler: (error: RequestError) => {
    // @ts-ignore
    if (error?.request?.options?.skipErrorHandler) {
      throw error;
    }
    let errorInfo: ErrorInfoStructure | undefined;
    if (error.name === 'ResponseError' && error.data && error.request) {
      const ctx: Context = {
        req: error.request,
        res: error.response,
      };
      errorInfo = errorAdaptor(error.data, ctx);
      error.message = errorInfo?.errorMessage || error.message;
      error.data = error.data;
      error.info = errorInfo;
    }
    errorInfo = error.info;

    if (errorInfo) {
      const errorMessage = errorInfo?.errorMessage;
      const errorCode = errorInfo?.errorCode;
      const errorPage = requestConfig.errorConfig?.errorPage || DEFAULT_ERROR_PAGE;

      switch (errorInfo?.showType) {
        case ErrorShowType.SILENT:
          // do nothing
          break;
        case ErrorShowType.WARN_MESSAGE:
          message.warn(errorMessage);
          break;
        case ErrorShowType.ERROR_MESSAGE:
          message.error(errorMessage);
          break;
        case ErrorShowType.NOTIFICATION:
          notification.open({
            message: errorMessage,
          });
          break;
        case ErrorShowType.REDIRECT:
          history.push({
            pathname: errorPage,
            query: { errorCode, errorMessage },
          });
          // redirect to error page
          break;
        default:
          message.error(errorMessage);
          break;
      }
    } else {
      message.error(error.message || 'Request error, please retry.');
    }
    throw error;
  },
  ...requestConfig,
});

// 中间件统一错误处理
// 后端返回格式 { success: boolean, data: any }
// 按照项目具体情况修改该部分逻辑
request.use(async (ctx, next) => {
  await next();
  const { req, res } = ctx;
  // @ts-ignore
  if (req.options?.skipErrorHandler) {
    return;
  }
  const { options } = req;
  const { getResponse } = options;
  const resData = getResponse ? res.data : res;
  const errorInfo = errorAdaptor(resData, ctx);
  if (errorInfo.success === false) {
    // 抛出错误到 errorHandler 中处理
    const error: RequestError = new Error(errorInfo.errorMessage);
    error.name = 'BizError';
    error.data = resData;
    error.info = errorInfo;
    throw error;
  }
});

// Add user custom middlewares
const customMiddlewares = requestConfig.middlewares || [];
customMiddlewares.forEach(mw => {
  request.use(mw);
});
