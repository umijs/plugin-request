/**
 * request 网络请求工具
 * 提供诸如参数序列号, 缓存, 超时, 字符编码处理, 错误处理等常用功能,
 * 详情参考api文档: https://bigfish.alipay.com/doc/api#request
 */
import { extend, Context, RequestOptionsInit, OnionMiddleware } from 'umi-request';
import { message, notification } from 'antd';
import history from '@@/history';

export interface RequestConfig extends RequestOptionsInit {
  errorConfig?: {
    errorPage?: string;
    adaptor?: (resData: any, ctx?: Context) => ErrorInfoStructure;
  };
  middlewares?: (
    defaultMiddlewares: OnionMiddleware[],
  ) => OnionMiddleware[] | OnionMiddleware[];
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
}

const DEFAULT_ERROR_PAGE = '/exception';
const requestConfig: RequestConfig =
  require('umi/_runtimePlugin').mergeConfig('request') || {};
const errorAdaptor = requestConfig.errorConfig?.adaptor || (resData => resData);

export const request = extend({
  errorHandler: (error: RequestError) => {
    console.log('get error', error);
    let errorInfo: ErrorInfoStructure | undefined;
    if (error.name === 'ResponseError' && error.data) {
      errorInfo = errorAdaptor(error.data);
    } else if (error.name === 'BizError') {
      errorInfo = error.info;
    }

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
