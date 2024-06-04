<template>
  <div
    class="chatlist_container"
    :class="currentExpendStatus ? 'expend' : 'shrink'"
  >
    <div class="header">
      <h1>
        <div class="logo"></div>
        <!-- <img :src.sync="state.yiyanLogoSrc" /> -->
      </h1>
      <div class="right">
        <a-button
          @click="handleCreateChat"
          :icon="h(PlusOutlined)"
          :disabled="state.processingFlag"
          type="primary"
        >
          新的对话
        </a-button>
      </div>
    </div>
    <el-scrollbar class="scroller" height="100%" v-loading="state.loadingChatListFlag">
      <ul class="chatlist">
        <li
          :class="{ active: item.active }"
          v-for="(item, index) in currentChatList"
          :key="index"
          @click="handleChooseChat(item, index)"
        >
          <div class="top">
            <label for="">
              {{ global.$isEmpty(item.title) ? "新的聊天" : item.title }}
            </label>
            <a-button
              class="delete"
              size="small"
              type="link"
              :icon="h(DeleteOutlined)"
              :disabled="state.processingFlag"
              @click.stop="handleDeleteChat(item, index)"
            ></a-button>
          </div>

          <div class="desc">
            <!-- <span class="left"> {{ item.conversationNumber }} 条对话 </span> -->
            <span class="right">
              {{ item.updatedAt }}
            </span>
          </div>
        </li>
      </ul>
    </el-scrollbar>
    <div class="backgroundcolor"></div>
  </div>
</template>

<script lang="tsx" setup>
import {
  ref,
  unref,
  reactive,
  watch,
  computed,
  onMounted,
  getCurrentInstance,
  ComponentInternalInstance,
  nextTick,
  h,
  createVNode,
} from "vue";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Modal, Button } from "ant-design-vue";

// import draggable from "vuedraggable";

import {
  createChatRequest,
  getChatListRequest,
  deleteChatRequest,
  batchCreateChatRequest,
} from "@/api/chat";

import { deleteMultipleMessagesByChatIdRequest } from "@/api/message";

import { message } from "ant-design-vue";
const [messageApi, contextHolder] = message.useMessage();

const { v4: uuidv4 } = require("uuid");

// import uuidv4 from "uuid";

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

let messageLoading: any;

const state = reactive({
  chatList: [] as any,
  expendStatus: true,
  chosenChatIndex: 0 as number,
  chosenChatId: null,
  processingFlag: false,
  confirmDeleteVisible: false,
  currentDeleteInfo: {},
  currentDeleteIndex: 0,
  yiyanLogoSrc: "",
  loadingChatListFlag: false,
});

const currentMobileMode = computed(() => {
  return global.$store.state.app.currentMobileMode;
}) as any;

const currentRoute = computed(() => {
  return global.$route;
}) as any;

const currentExpendStatus = computed(() => {
  return currentRoute.value.name === "chatList";
}) as any;

const currentChatList = computed(() => {
  return global.$store.state.app.currentChatList;
}) as any;

watch(
  () => state.chatList,
  (newValue: any, oldValue: any) => {
    if (newValue.length === 1) {
      state.chatList[0].active = true;
    }
  }
);

const requireImg = (imgPath: string) => {
  try {
    const handlePath = imgPath.replace("@", "..");
    return new URL(handlePath, import.meta.url).href;
  } catch (error) {
    console.warn(error);
  }
};

const getChatListPromise = () => {
  state.loadingChatListFlag = true;

  return new Promise((resolve, reject) => {
    const params = global.$checkIfWeLink()
      ? {
          welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
        }
      : {
          guestUserId: global.$store.state.user.userIdInfo.guestUserId,
        };
    getChatListRequest(params)
      .then((response: any) => {
        console.log("getChatListPromise+++++", response);
        const chatList = response.data.map((item: any, index: number) => {
          return Object.assign(item, {
            updatedAt: global
              .$moment(item.updatedAt)
              .format("yyyy/MM/DD HH:mm:ss"),
          });
        });

        global.$store.commit("app/updateCurrentChatList", chatList);

        state.chatList = chatList;
        state.loadingChatListFlag = false;

        resolve(response.data);
      })
      .catch((error: any) => {
        state.loadingChatListFlag = false;
        reject(error);
      });
  });
};

const handleChooseChat = (item: any, index: number) => {
  console.log("handleChooseChat++++++", item);
  state.chosenChatIndex = index;
  highLightChat(index);
  if (state.chatList.length === 0) {
    return;
  }
  if (currentMobileMode) {
    global.$store.commit("app/updateExpendStatus", false);
    state.expendStatus = false;
  }

  global.$store.commit("app/updateCurrentChatTitle", item.title);
  global.$store.commit("app/updateCurrentChatId", item.chatId);
  global.$store.commit(
    "app/updateCurrentChatDialogNumber",
    item.conversationNumber
  );
  global.$router.push({
    name: "chat",
    query: {
      chatId: item.chatId,
    },
  });
  console.log(global.$store.state);
};

const highLightChat = (index: number) => {
  state.chatList = state.chatList.map((item2: any, index2: number) => {
    const activeFlag = index === index2;
    if (activeFlag) {
      state.chosenChatId = item2.chatId;
      console.log("state.chosenChatId++++++", state.chosenChatId);
    }
    return Object.assign(item2, {
      active: activeFlag,
    });
  });
};

const highLightLastChat = () => {
  const lastChatDataIndex =
    state.chatList.length > 0 ? state.chatList.length - 1 : 0;
  highLightChat(lastChatDataIndex);
};

const chooseLastChat = () => {
  highLightLastChat();
  const lastChatDataIndex =
    state.chatList.length > 0 ? state.chatList.length - 1 : 0;
  handleChooseChat(state.chatList[lastChatDataIndex], lastChatDataIndex);
};

const handleDeleteChat = (item: any, index: number) => {
  // state.confirmDeleteVisible = true;
  state.currentDeleteInfo = item;
  state.currentDeleteIndex = index;
  Modal.confirm({
    title: "提示",
    content: "删除后无法恢复，是否继续删除？",
    centered: true,
    maskClosable: true,
    onOk() {
      console.log("OK");
      messageLoading = message.loading("删除中..", 0);
      confirmDeleteChat(state.currentDeleteInfo, state.currentDeleteIndex);
    },
    onCancel() {
      console.log("Cancel");
    },
    class: "test",
  });
};

const confirmDeleteChat = async (item: any, index: number) => {
  state.processingFlag = true;

  await nextTick();
  await deleteChatRequest({
    id: item.id,
  });
  await deleteMultipleMessagesByChatIdRequest({
    chatId: item.chatId,
  });
  setTimeout(messageLoading, 0);

  state.confirmDeleteVisible = false;
  // message.loading("Action in progress..", 0);
  messageApi.info("Hello, Ant Design Vue!");
  // global.$message({
  //   type: "success",
  //   message: "删除成功",
  //   duration: 3000,
  // });

  if (item.id === global.$store.state.app.currentChatId) {
    global.$store.commit("app/updateCleanDialogFlag", true);
  }
  await getChatListPromise();
  const chatListLength = state.chatList.length;
  let chosenIndex = index;

  if (chatListLength === 0) {
    await handleCreateChatPromise();
    await getChatListPromise();
  }
  if (item.active === true) {
    const chatListLength = state.chatList.length;
    if (index >= chatListLength) {
      chosenIndex = chatListLength - 1;
    }
    if (!global.$isMobile() || !global.$store.state.app.currentMobileMode) {
      console.log(state.chatList);
      console.log(chosenIndex);
      handleChooseChat(state.chatList[chosenIndex], chosenIndex);
    } else {
      highLightChat(chosenIndex);
    }
  } else {
    state.chatList.forEach((item2: any, index2: number) => {
      if (item2.chatId === state.chosenChatId) {
        highLightChat(index2);
        if (!global.$isMobile() || !global.$store.state.app.currentMobileMode) {
          handleChooseChat(state.chatList[index2], index2);
        }
      }
    });
    console.log(state.chosenChatIndex);
  }
  state.processingFlag = false;
};

const handleCreateChatPromise = () => {
  return new Promise((resolve, reject) => {
    createChatRequest({
      title: "",
      welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
      guestUserId: global.$store.state.user.userIdInfo.guestUserId,
    })
      .then(async (response: any) => {
        resolve(response);
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
};

const handleCreateChat = async () => {
  messageLoading = message.loading("创建对话中..", 0);
  state.processingFlag = true;
  console.log("global.$store.state.user.access_token", global.$store.state);
  if (currentMobileMode) {
    global.$store.commit("app/updateExpendStatus", false);
    state.expendStatus = false;
  }
  console.log(global.$store);
  await handleCreateChatPromise();
  await getChatListPromise();
  setTimeout(messageLoading, 0);

  chooseLastChat();
  state.processingFlag = false;
};

const init = () => {
  const currentRoute = global.$router.currentRoute.value;
  state.chosenChatIndex = 0;
  const routeQueryId = currentRoute.query.chatId;

  if (global.$isEmpty(routeQueryId)) {
    if (
      state.chatList.length > 0 &&
      !global.$store.state.app.currentMobileMode
    ) {
      state.chosenChatIndex = 0;
      handleChooseChat(
        state.chatList[state.chosenChatIndex],
        state.chosenChatIndex
      );
    }
  } else {
    state.chatList.forEach((item: any, index: number) => {
      if (item.chatId === routeQueryId) {
        state.chosenChatIndex = index;
        handleChooseChat(
          state.chatList[state.chosenChatIndex],
          state.chosenChatIndex
        );
      }
    });
  }

  if (!!state.chosenChatIndex && state.chatList.length !== 0) {
    state.chatList[state.chosenChatIndex].active = true;
  }

  state.yiyanLogoSrc = requireImg("../assets/yiyan-logo.png");
};

const handleCreateChatToLocal = () => {
  const chatListDataString: string | null =
    localStorage.getItem("wenxinChatList");
  const chatListData: any[] = JSON.parse(chatListDataString || "[]");
  const defaultChatTitle = "";

  let result = [] as any;
  const uniqueId = uuidv4();
  if (chatListData.length > 0) {
    result = chatListData;
  }
  result.forEach((item: any) => {
    item.active = false;
  });
  result.push({
    title: defaultChatTitle,
    chatId: uniqueId,
    conversationNumber: 0,
    updatedAt: global.$moment().format("yyyy/MM/DD hh:mm:ss"),
  });

  console.log(result);
  localStorage.setItem("wenxinChatList", JSON.stringify(result));
  state.chatList = result;
  state.chatList[state.chatList.length - 1].active = true;
  global.$router.push({
    name: "chat",
    query: {
      chatId: uniqueId,
    },
  });
  global.$store.commit("app/updateCurrentChatTitle", defaultChatTitle);
  global.$store.commit("app/updateCurrentChatId", uniqueId);
  global.$store.commit("app/updateCurrentChatDialogNumber", 0);
};

const getChatListFromLocalPromise = () => {
  return new Promise((resolve, reject) => {
    try {
      let chatListDataString: string | null =
        localStorage.getItem("wenxinChatList");
      let result = [] as any;
      result = JSON.parse(chatListDataString || "[]");

      if (global.$isEmpty(chatListDataString)) {
        localStorage.setItem("wenxinChatList", "[]");
      }
      state.chatList = result;

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// const handleDeleteChatFromLocal = (item: any, index: number) => {
//   deleteMultipleMessagesByChatIdRequest({
//     chatId: item.chatId,
//   })
//     .then((response: any) => {
//       global.$message.success("删除成功");
//       if (item.chatId === global.$store.state.app.currentChatId) {
//         global.$store.commit("app/updateCleanDialogFlag", true);
//       }
//       let currentChatIndex;
//       state.chatList.forEach((item2: any, index2: number) => {
//         if (item.chatId === item2.chatId) {
//           currentChatIndex = index2;
//         }
//       });
//       state.chatList.splice(currentChatIndex, 1);
//       if (item.active === true) {
//         const chatListLength = state.chatList.length;
//         if (index >= chatListLength) {
//           index = chatListLength - 1;
//         }
//         handleChooseChat(state.chatList[index], index);
//       }

//       localStorage.setItem("wenxinChatList", JSON.stringify(state.chatList));
//       if (state.chatList.length === 0) {
//         handleCreateChatToLocal();
//       }
//     })
//     .catch((error: any) => {
//       console.log(error);
//     });
// };

const migrateChatListToDataBase = () => {
  console.log(global.$store.state.user);
  const localChatListString: string =
    localStorage.getItem("wenxinChatList") || "";
  let localChatList = JSON.parse(localChatListString);
  localChatList = localChatList.map((item: any) => {
    return Object.assign(item, {
      welinkUserId: global.$store.state.user.welinkUserId,
      guestUserId: global.$store.state.user.guestUserId,
    });
  });
  batchCreateChatRequest({
    chatList: localChatList,
    welinkUserId: global.$store.state.user.welinkUserId,
    guestUserId: global.$store.state.user.guestUserId,
  })
    .then((response: any) => {
      console.log(response);

      // localStorage.removeItem("wenxinChatList");
    })
    .catch((error: any) => {
      console.log(error);
    });
};

onMounted(async () => {
  await getChatListPromise();
  if (state.chatList.length === 0) {
    handleCreateChat();
  }

  init();
});
</script>

<style scope lang="scss">
.chatlist_container {
  // padding: 0.8rem;
  height: 100vh;
  background: #e7f8ff;
  color: #303030;
  position: relative;
  box-sizing: border-box;
  overflow: auto;
  z-index: 3;
  background: #fff;
  .scroller {
    height: calc(100% - 2rem);
    z-index: 1;
    position: relative;
  }

  .header {
    display: flex;
    padding: 0.5rem;
    z-index: 1;
    position: relative;
    .left {
      display: inline-block;
      vertical-align: middle;
      text-align: left;
      font-size: 1.5rem;
    }
    h1 {
      margin: 0;
      flex: 1;
      display: inline-block;
      vertical-align: middle;
      text-align: left;
      .logo {
        display: inline-block;
        margin: 0.1rem 0 0 0;
        width: 2.2rem;
        height: 0.8rem;
        background-image: url("@/assets/yiyan-logo.png");
        background-size: contain;
        background-repeat: no-repeat;
      }
      &:before {
        content: "";
        display: inline-block;
        width: 0;
        height: 100%;
        vertical-align: middle;
      }
      .el-text {
        display: inline-block;
        vertical-align: middle;
      }
    }
    .right {
      display: inline-block;
      vertical-align: middle;
      text-align: right;
      &:before {
        content: "";
        display: inline-block;
        width: 0;
        height: 100%;
        vertical-align: middle;
      }
      .common_button_item {
        vertical-align: middle;
      }
    }
  }
  .chatlist {
    padding: 0 0.5rem;
    z-index: 1;
    li {
      padding: 0.2rem 0.4rem;
      margin: 0 0 0.4rem 0;
      border: 1px solid #ccc;
      border-radius: 0.3rem;
      font-size: 0.4rem;
      background-color: #fff;
      transition: 0.3s all;
      &.active {
        border: 1px solid #1677ff;
        background-color: #1677ff;
        color: #fff;
        .delete {
          color: #fff;
        }
      }
      .delete {
        color: #333;
      }
      &:target {
        background-color: #111;
      }

      .top {
        display: flex;
        margin: 0 0 0.3rem 0;
        width: 100%;
        text-align: right;
        align-items: center;
        justify-content: center;
        label {
          display: inline-block;
          flex: 1;
          text-align: left;
          font-weight: bold;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .delete {
          display: inline-block;
          font-size: 0.4rem;
        }
      }

      .desc {
        display: flex;
        .left {
          flex: 1;
        }
      }
    }
  }
}
</style>

<style lang="scss">
:v-deep(.confirmdelete_dialog) {
  .el-dialog__headers {
    label {
      font-size: 3rem;
    }
  }
}
.el-overlay {
  .confirmdelete_drawer {
    .a-drawer__header {
      font-size: 0.5rem;
      h4 {
        margin: 0;
        text-align: left;
      }
    }
  }
  .confirmdelete_dialog {
    .el-dialog__body {
      font-size: 0.5rem;
    }
  }
}
</style>
