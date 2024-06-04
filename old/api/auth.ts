import service from "@/utils/service";
import { baseURL } from "@/utils/service";

export const getBaiduTokenRequest = () => {
  return service({
    url: baseURL + "/chat/getBaiduToken",
    method: "POST",
    data: {},
  });
};

export const generateSignatureRequest = (data: any) => {
  return service({
    url: baseURL + "/auth/generateSignature",
    method: "POST",
    data,
  });
};

export const getHWH5UserIdByAuthCodeRequest = (params: any) => {
  return service({
    url: baseURL + "/auth/getHWH5UserIdByAuthCode",
    method: "GET",
    params,
  });
};
