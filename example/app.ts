import { message } from 'antd'

export const request = {
  errorHandler: (error) => {
    const { response, request, data, type, name, message} = error;
    console.log('响应抛出异常:', error, response, request, data, type, name, message);

  },
}