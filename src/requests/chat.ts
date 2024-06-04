import service from "@/utils/service";
import { baseURL } from "@/utils/service";
import utils from "@/utils/utils";

export const createChatRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/createChat",
    method: "POST",
    data: params,
  });
};

export const batchCreateChatRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/batchCreateChat",
    method: "POST",
    data: params,
  });
};

export const getChatListRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/getChatList",
    method: "GET",
    params,
  });
};

export const deleteChatRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/deleteChat",
    method: "POST",
    data: params,
  });
};

export const updateChatTitleRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/updateChatTitle",
    method: "POST",
    data: params,
  });
};

// https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant?grant_type=client_credentials&client_id=[应用API Key]&client_secret=[应用Secret Key]
