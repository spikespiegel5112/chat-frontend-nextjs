<template>
  <div
    class="layout_container"
    :class="{ mobile: state.mobileMode, welink: global.$checkIfWeLink() }"
    ref="layoutRef"
  >
    <div class="content" ref="contentRef" v-if="state.pageReady">
      <ChatList v-if="state.chatListFlag" ref="chatListRef" />
      <Chat @onChangeTitle="handleReloadChatList" />
    </div>
    <div v-else class="backgroundcolor"></div>
  </div>
</template>

<script lang="tsx" setup>
import {
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  ComponentInternalInstance,
  ref,
  nextTick,
} from "vue";

import Chat from "./Chat.vue";
import ChatList from "./ChatList.vue";

import {
  generateSignatureRequest,
  getHWH5UserIdByAuthCodeRequest,
} from "@/api/auth";

import {
  userCreateOrUpdateUserInfoRequest,
  checkUserExistRequest,
  getWelinkUserDetailRequest,
} from "@/api/user";
const { v4: uuidv4 } = require("uuid");

// import uuidv4 from "uuid";

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const layoutRef = ref(HTMLDivElement);
const contentRef = ref(HTMLDivElement);
const chatListRef = ref(HTMLDivElement);
console.log("=====chatListRef=====");
console.log(chatListRef);

const state = reactive({
  clientWidth: 0,
  mobileMode: false,
  isWeLink: false,
  pageReady: false,
  chatListFlag: true,
});

const contentStyle = computed(() => {
  let result = {
    height: "",
  };

  result.height =
    !!contentRef.value && contentRef.value.clientHeight > window.innerHeight
      ? "100%"
      : "auto";
  return result;
}) as any;

watch(
  () => state.pageReady,
  (newValue: any, oldValue: any) => {
    if (!!newValue) {
      hideLoading();
    }
  }
);

const _HWH5 = window.HWH5;

const init = () => {
  state.mobileMode = checkMobileMode();
  global.$store.commit("app/updateMobileMode", state.mobileMode);
  window.addEventListener("resize", () => {
    console.log("resize++++++++++++++++++++++++");
    state.mobileMode = checkMobileMode();
    global.$store.commit("app/updateMobileMode", state.mobileMode);
  });
};

const checkMobileMode = () => {
  state.clientWidth = layoutRef.value.clientWidth;
  return state.clientWidth <= 600;
};

const hideLoading = async () => {
  await nextTick();
  const loop = () => {
    const lineScaleEl = document.getElementById("line-scale") as HTMLElement;
    let count = 0;
    setTimeout(() => {
      if (!lineScaleEl && count < 200) {
        loop();
        count++;
      } else {
        lineScaleEl.style.display = "none";
      }
    }, 200);
  };
  loop();
};

const authHWH5Promise = (_HWH5: any) => {
  return new Promise((resolve, reject) => {
    /* 如果鉴权成功，会执行ready方法，把需要在页面加载时调用的相关接口放在ready中确保执行。
需要用户触发时才调用的接口，则直接调用，不需要放在ready函数中。*/
    generateSignaturePromise()
      .then((response2: any) => {
        response2 = response2.result;
        const configParams = {
          appId: response2.clientId, // 应用的client_id
          timestamp: response2.timeStamp, // 与生成签名一致的时间戳，精确到秒十位
          noncestr: response2.nonceStr, // 服务端使用的随机串
          signature: response2.signature, // 签名信息
          jsApiList: ["getUserInfo"],
        };
        console.log("configParams++++++", configParams);
        _HWH5.config(configParams);
        _HWH5.ready((response3: any) => {
          console.log("==========HWH5.ready==========", window);
          resolve(response3);
        });
        // 如果鉴权失败，则调用error方法
        _HWH5.error((error: any) => {
          console.log("==========HWH5.error==========", window);
          console.error("鉴权失败---", error);
          reject(error);
        });
      })
      .catch((error) => {
        error = error.data;
        const jsticketsInfo = error.jsticketsInfo;
        if (jsticketsInfo) {
          global.$message.error(
            `${jsticketsInfo.errorMessage}(${jsticketsInfo.errorCode})`
          );
        }

        console.error(error);
        reject(error);
      });
  });
};

const generateSignaturePromise = () => {
  return new Promise((resolve, reject) => {
    const currentUrl = location.origin + location.pathname;
    generateSignatureRequest({
      url: currentUrl,
    })
      .then((response: any) => {
        console.log("generateSignature++++++", response);
        resolve(response);
      })
      .catch((error: any) => {
        console.log("generateSignature error++++", error);
        reject(error);
      });
  });
};

const getHWH5UserIdByAuthCodePromise = async (authCodeData: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("_HWH5.getAuthCode()++++++", authCodeData);
      const userIdInfoResponse = await getHWH5UserIdByAuthCodeRequest({
        code: authCodeData.code,
      });
      console.log("getHWH5UserIdByAuthCodeRequest+++++", userIdInfoResponse);
      global.$store.commit("user/updateUserIdInfo", {
        welinkTenantId: userIdInfoResponse.data.tenantId,
        welinkUserId: userIdInfoResponse.data.userId,
      });
      resolve(userIdInfoResponse);
    } catch (error) {
      reject(error);
    }
  });
};

const submitUserIdInfoPromise = () => {
  return new Promise(async (resolve, reject) => {
    const userIdInfo = global.$store.state.user.userIdInfo;
    const params = {
      welinkUserId: userIdInfo.welinkUserId,
      welinkTenantId: userIdInfo.welinkTenantId,
      guestUserId: userIdInfo.guestUserId,
    };
    const ifUserExist = await checkUserExistRequest(params);
    if (ifUserExist.result === true) {
      resolve(ifUserExist);
      return;
    }
    userCreateOrUpdateUserInfoRequest(params)
      .then((response: any) => {
        console.log("userCreateOrUpdateUserInfoRequest+++", response);
        resolve(response);
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
};

const initHWH5 = async () => {
  state.pageReady = false;

  if (global.$checkIfWeLink()) {
    console.log("==========is Welink==========");
    console.log(_HWH5);
    console.log("location+++++", location);
    // const userInfoResponse = await _HWH5.getUserInfo();
    await authHWH5Promise(_HWH5);

    const authCodeData = await _HWH5.getAuthCode();

    await getHWH5UserIdByAuthCodePromise(authCodeData);
    await getUserDetailPromise();
  } else {
    const wenxinChatUserInfoString =
      localStorage.getItem("wenxinChatUserIdInfo") || "";
    if (global.$isNotEmpty(wenxinChatUserInfoString)) {
      const wenxinChatUserInfo = JSON.parse(wenxinChatUserInfoString);
      global.$store.commit("user/updateUserIdInfo", {
        guestUserId: wenxinChatUserInfo.guestUserId,
      });
    } else {
      global.$store.commit("user/updateUserIdInfo", {
        guestUserId: "guest_" + uuidv4(),
      });
      localStorage.setItem(
        "wenxinChatUserIdInfo",
        JSON.stringify(global.$store.state.user.userIdInfo)
      );
    }
  }
  await submitUserIdInfoPromise();

  state.pageReady = true;
};

const getUserDetailPromise = () => {
  return new Promise((resolve, reject) => {
    getWelinkUserDetailRequest({
      userId: global.$store.state.user.userIdInfo.welinkUserId,
    })
      .then((response: any) => {
        global.$store.commit("user/updateUserDetailInfo", response);
        resolve(response);
      })
      .catch((error: any) => {
        console.error(error);
        reject(error);
      });
  });
};

const handleReloadChatList = async () => {
  state.chatListFlag = false;
  await nextTick();
  state.chatListFlag = true;
};

onMounted(async () => {
  init();
  initHWH5();
});

onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
.layout_container {
  display: flex;
  width: 100%;
  height: 100vh;
  // min-height: 100vh;
  align-items: center;
  justify-content: center;
  flex-direction: inherit;
  color: #303030;
  background: #151515;
  overscroll-behavior: none;

  &:before {
    content: "";
    display: inline-block;
    width: 0;
    height: 100%;
  }
  .content {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 300px;
    max-height: 20rem;
    border-radius: 0.3rem;
    position: relative;
    overflow: hidden;
    box-shadow: 50px 50px 100px 10px rgba(0, 0, 0, 0.1);
    .chatlist_container {
      max-width: 9rem;
      width: 25%;
      min-width: 7rem;
      height: 100%;
    }
  }
}
</style>
