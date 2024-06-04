import service from "@/utils/service";
import { baseURL } from "@/utils/service";

export const stableDiffusionTxt2imgRequest = (params: any) => {
  return service({
    url: baseURL + "/stableDiffusion/txt2img",
    method: "POST",
    data: params,
  });
};
