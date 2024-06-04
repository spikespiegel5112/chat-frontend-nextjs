import { getBaiduTokenRequest } from "@/api/auth";
import { getUserInfoRequest } from "@/api/user";
import { getCurrentInstance, ComponentInternalInstance } from "vue";
import router from "@/router";
// import { store } from "@/store";
// import { mapGetters, useStore } from "vuex";

// const currentInstance = getCurrentInstance() as ComponentInternalInstance;
// const global = currentInstance.appContext.config.globalProperties;

router.beforeEach((to: any, from: any, next: any) => {
  console.log("+++++++++++++++++++++++++++++");
  next();
});

router.afterEach((to, from) => {
  console.log("finsh", to);
});

router.onError((error) => {
  console.log("router.onError", error);
});
