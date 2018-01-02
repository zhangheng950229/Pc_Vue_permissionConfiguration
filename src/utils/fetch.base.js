import axios from 'axios';
import { Message } from 'element-ui';
import Vue from 'vue'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/' : '/api', // api的base_url
  timeout: 5000                  // 请求超时时间
});
// request拦截器
service.interceptors.request.use(config => {
  // Do something before request is sent
  console.log('service.interceptors.response.use')
  return config;
}, error => {
  // Do something with request error
  console.log(error); // for debug
  Promise.reject(error);
})

// respone拦截器
service.interceptors.response.use(
  response => {
    // Do something before response is back
    const status = response.status
    if (status >= 200 && status < 300) {
      const data = response.data
      if (typeof data.code !== 'undefined') {
        const code = data.code
        if (code === -999) {
          window.location.href = 'http://bigdata.58.com/login?url=http://pzzx.58.com'
        } else if (code === 5) {
          window.location.href = '/#/restricted'
        }
      }
      return data
    }
  }
  ,
  error => {
    console.dir(error)
    console.dir(error.response)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
)

// TODO 
// 将业务方法挂载至service

export default service;