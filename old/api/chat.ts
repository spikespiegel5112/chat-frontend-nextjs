// import { getCurrentInstance, ComponentInternalInstance } from "vue";
import service from "@/utils/service";
import { baseURL } from "@/utils/service";
import { getCurrentInstance, ComponentInternalInstance } from "vue";
// const currentInstance = getCurrentInstance() as ComponentInternalInstance;
// const global = currentInstance.appContext.config.globalProperties;
import { utils } from "@/utils/utils";
import { store } from "@/store";

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

export const chatCompletionsRequest = (params: any) => {
  const paramsObject = {
    access_token: store.state.user.baiduAPIAccessInfo.access_token,
  };
  return service({
    url:
      baseURL +
      "/chat/chatCompletions" +
      utils.$objectToUrlString(paramsObject),
    method: "POST",
    data: params.data,
    params: params.params,
  });
};

export const updateChatTitleRequest = (params: any) => {
  return service({
    url: baseURL + "/chat/updateChatTitle",
    method: "POST",
    data: params,
  });
};

export const wenxinworkshopChatCompletionsRequest = (params: any) => {
  return utils.$parseSteamData(
    "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
    store.state.user.baiduAPIAccessInfo.access_token,
    params.body,
    params.onMessage
  );
};

export const callWenXinWorkshopEbInstantRequest = (params: any) => {
  return utils.$wenxinworkshopChatCompletionsRequest(
    "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant",
    store.state.user.baiduAPIAccessInfo.access_token,
    params.body,
    params.onMessage
  );
};

export const checkChatCompletionsErrorRequest = (body: any) => {
  return service({
    url: baseURL + "/chat/checkChatCompletionsError",
    method: "POST",
    data: {
      query: {
        access_token: store.state.user.baiduAPIAccessInfo.access_token,
      },
      body: body,
    },
  });
};

// https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant?grant_type=client_credentials&client_id=[应用API Key]&client_secret=[应用Secret Key]
