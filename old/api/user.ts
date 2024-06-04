// import { getCurrentInstance, ComponentInternalInstance } from "vue";
import service from "@/utils/service";
import { baseURL } from "@/utils/service";

export const getUserInfoRequest = (params: any) => {
  return service({
    url: baseURL + "/user/getData",
    method: "GET",
    data: params.data,
    params: params.params,
  });
};

export const userCreateOrUpdateUserInfoRequest = (params: any) => {
  return service({
    url: baseURL + "/user/createOrUpdateUserInfo",
    method: "POST",
    data: params,
  });
};

export const checkUserExistRequest = (params: any) => {
  return service({
    url: baseURL + "/user/checkUserExist",
    method: "POST",
    data: params,
  });
};

export const getWelinkUserDetailRequest = (params: any) => {
  return service({
    url: baseURL + "/user/getWelinkUserDetail",
    method: "POST",
    data: params,
  });
};


