import axios from "axios";
console.log("service+++++", import.meta.env);

const _baseURL: string = import.meta.env.VITE_BASE_URL;

const service: any = axios.create({
  baseURL: _baseURL,
  // 超时
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

service.interceptors.request.use(
  (config: any) => {
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res: any) => {
    // console.log(res);
    if (res.status === 404) {
    }
    if (res.baseURL === "") {
    }
    // console.log("service.interceptors++++", res);
    const result = res.data;
    return result;
  },
  (error: any) => {
    console.log("service.interceptors error++++", error);
    return Promise.reject(error.response);
  }
);

export default service;

export const baseURL = _baseURL;
