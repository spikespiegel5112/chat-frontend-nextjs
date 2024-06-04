// import { getCurrentInstance, ComponentInternalInstance } from "vue";
import service from "@/utils/service";
import { baseURL } from "@/utils/service";

export const deleteMultipleMessagesRequest = (data: object) => {
  return service({
    url: baseURL + "/message/deleteMultipleMessages",
    method: "POST",
    data,
  });
};

export const deleteMultipleMessagesByChatIdRequest = (data: object) => {
  return service({
    url: baseURL + "/message/deleteMultipleMessagesByChatId",
    method: "POST",
    data,
  });
};

export const getMessageByChatIdRequest = (params: object) => {
  return service({
    url: baseURL + "/message/getMessageByChatId",
    method: "GET",
    params,
  });
};

export const submitMessageRequest = (params: any) => {
  return service({
    url: baseURL + "/message/submitMessage",
    method: "POST",
    data: params.data,
  });
};
