<template>
  <div class="dialog_container">
    <div class="header">
      <a-button
        v-if="
          global.$store.state.app.currentMobileMode && !global.$checkIfWeLink()
        "
        class="common_button_item"
        @click="handleGoBack"
        :icon="h(LeftOutlined)"
        type="link"
      >
      </a-button>
      <h2 class="center">
        <label class="title" @click="autoMessage">
          {{ global.$store.state.app.currentChatTitle || "新的聊天" }}
        </label>
        <span class="count">消息数：{{ state.chatHistory.length }}</span>
      </h2>
    </div>
    <div class="chat_container" ref="chatContainerRef">
      <el-scrollbar
        class="scroller"
        v-loading="state.loadingFlag"
        @scroll="handleScrollChat"
        height="100%"
        ref="scrollbarRef"
      >
        <WelcomeNew
          v-if="state.chatHistory.length === 0 && !state.loadingFlag"
        />
        <ul class="content" ref="chatScrollbarRef">
          <li
            v-for="(item, index) in historyMessages"
            :key="index"
            :class="checkChatStyle(item.role)"
          >
            <div class="avatar left" v-if="item.role === 'assistant'">
              <div class="content">
                <HaitongUniTrustAvatar />
              </div>
            </div>
            <div class="avatar right" v-if="item.role === 'user'">
              <div class="content">
                <UserAvatar />
              </div>
            </div>
            <div v-if="item.role === 'assistant'" class="content">
              {{ item.content }}
            </div>
            <div v-if="item.role === 'user'" class="content">
              {{ item.content }}
            </div>
            <div class="desc">
              {{ global.$moment(item.updatedAt).format("yyyy/MM/DD HH:mm:ss") }}
            </div>
          </li>
          <SplitLine
            v-if="lastHistoryMessageData"
            :text="global.$moment(lastHistoryMessageData.updatedAt).fromNow()"
          />
          <li
            v-for="(item, index) in currentMessages"
            :key="index"
            :class="checkChatStyle(item.role)"
          >
            <div class="avatar left" v-if="item.role === 'assistant'">
              <div class="content">
                <HaitongUniTrustAvatar />
              </div>
            </div>
            <div class="avatar right" v-if="item.role === 'user'">
              <div class="content">
                <UserAvatar />
              </div>
            </div>
            <div v-if="item.role === 'assistant'" class="content">
              {{
                state.typingFlag && index === currentMessages.length - 1
                  ? state.typingText + " | "
                  : item.content
              }}
            </div>
            <div v-if="item.role === 'user'" class="content">
              {{ item.content }}
            </div>
            <div class="desc">
              {{ global.$moment(item.updatedAt).format("yyyy/MM/DD HH:mm:ss") }}
            </div>
          </li>

          <li class="left" v-if="state.thinkingFlag">
            <div class="avatar left">
              <div class="content">
                <HaitongUniTrustAvatar />
              </div>
            </div>
            <div class="content">
              <CommonTextLoading />
            </div>
          </li>
        </ul>
        <a-button
          class="backtotop"
          :class="{
            active: state.onTheBottom && global.$route.name === 'chat',
          }"
          shape="circle"
          size="large"
          @click="scrollToBottom('smooth')"
          :icon="h(VerticalAlignBottomOutlined)"
        >
        </a-button>
      </el-scrollbar>
    </div>

    <div class="input_container">
      <a-form class="main" ref="formDataRef" :model="state.formData">
        <a-form-item>
          <div class="input_wrapper">
            <a-input-group compact size="large">
              <a-textarea
                v-model:value="state.formData.message"
                id="input_textarea"
                clearable
                type="textarea"
                ref="textareaRef"
                autoSize
                :disabled="state.thinkingFlag || state.typingFlag"
                autocomplete="off"
                :placeholder="submitInputPlaceholder"
                :style="inputStyle"
                @input.native="handleEditingMessage"
                @focusin="handleFocusin"
                @keydown="handleSubmitByShortcut"
              >
              </a-textarea>
              <a-button
                class="button_item"
                @click="handleSubmitMessage"
                :disabled="disableSubmitFlag"
                type="primary"
                :icon="h(SendOutlined)"
              >
              </a-button>
            </a-input-group>

            <!-- <div class="button_item">
              <a-button
                @click="handleSubmitMessage"
                :disabled="disableSubmitFlag"
                type="primary"
                :icon="h(SendOutlined)"
              >
              </a-button>
            </div> -->
          </div>
        </a-form-item>
      </a-form>
    </div>
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
  h,
} from "vue";

import {
  wenxinworkshopChatCompletionsRequest,
  chatCompletionsRequest,
  checkChatCompletionsErrorRequest,
} from "@/api/chat";
import { stableDiffusionTxt2imgRequest } from "@/api/stableDiffusion";

import {
  submitMessageRequest,
  getMessageByChatIdRequest,
  deleteMultipleMessagesRequest,
} from "@/api/message";
import { updateChatTitleRequest } from "@/api/chat";
import { getBaiduTokenRequest } from "@/api/auth";

// import { ElScrollbar } from "element-plus";
// import { Button, Form, Input, FormItem } from "ant-design-vue";
// import user from "../store/modules/user";
import {
  DeleteOutlined,
  PlusOutlined,
  SendOutlined,
  LeftOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons-vue";

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const chatScrollbarRef = ref(HTMLDivElement);
const chatContainerRef = ref(HTMLDivElement);
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const loading = ref(true);
const textareaRef = ref(HTMLTextAreaElement);

const emit = defineEmits<{
  (e: "onChangeTitle", status: any): void;
}>();

// const loadingInstance = ElLoading.service();
const state: any = reactive({
  chatTitle: "",
  dialogNumber: "",
  currentChatList: [] as any,
  currentChatData: {},
  formData: {
    message: "",
  },
  chatHistory: [] as any,
  loadingFlag: false,
  thinkingFlag: false,
  typingFlag: false,
  typeable: false,
  redundantChatHistoryList: [] as any,
  typingText: "",
  rowNumber: 2,
  hasHistoryMessagesFlag: false,
  onTheBottom: false,
});

const disableSubmitFlag = computed(() => {
  return (
    state.thinkingFlag ||
    global.$isEmpty(state.formData.message) ||
    (state.chatHistory.length !== 0 &&
      state.chatHistory[state.chatHistory.length - 1].role !== "user")
  );
}) as any;

const textChecker = async () => {
  await nextTick();
  const textareaEl = document.getElementById("input_textarea");
  const scrollHeight = textareaEl.scrollHeight - 64;
  const widthCount = Math.floor(scrollHeight / 26) + 2;
  state.rowNumber = widthCount;
};

const submitInputPlaceholder = computed(() => {
  return global.$isMobile() ? "" : "按 Enter 发送";
}) as any;

const currentChatId = computed(() => {
  return global.$route.query.chatId;
}) as any;

const inputStyle = computed(() => {
  return "flex:1";
}) as any;

const currentLoadingFlag = computed(() => {
  return global.$store.state.app.currentLoadingFlag;
}) as any;

const historyMessages = computed(() => {
  return state.chatHistory.filter((item: any) => !!item.isHistory);
});

const currentMessages = computed(() => {
  return state.chatHistory.filter((item: any) => !item.isHistory);
});

const lastMessageData = computed(() => {
  return state.chatHistory[state.chatHistory.length - 1];
}) as any;

const lastHistoryMessageData = computed(() => {
  return historyMessages.value[historyMessages.value.length - 1];
}) as any;

watch(
  () => global.$router.currentRoute.value,
  (newValue: any, oldValue: any) => {
    console.log("global.$router.currentRoute.value++++", newValue);
    init();
  }
);

watch(
  () => state.formData.message,
  (newValue: any, oldValue: any) => {}
);

watch(
  () => global.$store.state.app.updateCleanDialogFlag,
  (newValue: any, oldValue: any) => {
    if (!!newValue) {
      init();
    }
    global.$store.commit("app/updateCleanDialogFlag", false);
  }
);

watch(
  () => global.$store.state.app.currentDeletingChatId,
  (newValue: any, oldValue: any) => {
    global.$store.commit("app/updateCurrentChatId", state.currentChatData.id);
    if (newValue === currentChatId.value) {
      init();
    }

    global.$store.commit("app/updateCleanDialogFlag", false);
  }
);

let messageArray: string[] = [];
let count = 0;

const typingEffect = (message: string) => {
  messageArray.push(...message.split(""));
  const loop = (message: string) => {
    if (count <= messageArray.length - 1 && !!state.typingFlag) {
      state.typingText += messageArray[count];
      scrollToBottom("instant");
    }
    const lastMessageData = state.chatHistory[state.chatHistory.length - 1];
    if (lastMessageData.status === "writing") {
      setTimeout(() => {
        count++;
        loop(message);
      }, 100);
    } else if (lastMessageData.status === "end") {
      if (count < messageArray.length) {
        setTimeout(() => {
          count++;
          loop(message);
        }, 10);
      } else {
        state.typingFlag = false;
        state.typingText = "";
        count = 0;
        messageArray = [];
      }
    }
    // scrollToBottom('smooth');
  };
  if (state.typingFlag === false) {
    state.typingFlag = true;
    loop(message);
  }
};

const getMessageHistoryByChatIdPromise = () => {
  return new Promise((resolve, reject) => {
    state.chatHistory = [];
    if (global.$isEmpty(global.$route.query.chatId)) {
      resolve(null);
      return;
    }
    getMessageByChatIdRequest({
      chatId: global.$route.query.chatId,
    })
      .then(async (response: any) => {
        if (response.data.length > 0) {
          state.hasHistoryMessagesFlag = true;
        }
        response.data.forEach((item: any) => {
          state.chatHistory.push({
            id: item.id,
            role: item.role,
            content: item.content,
            status: "end",
            updatedAt: item.updatedAt,
            isHistory: true,
          });
        });
        state.redundantChatHistoryList = getChatHistoryRedundant();
        if (state.redundantChatHistoryList.length > 0) {
          await deleteRedundantMessagesPromise(state.redundantChatHistoryList);
          deleteLocalRedundantMessages();
        }

        resolve(response);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

const getLastData = (data: any[]) => {
  const index = data.length === 0 ? 0 : data.length - 1;
  return data[index];
};

const intentRecognitionPromise = (message: string) => {
  return new Promise((resolve, reject) => {
    const prompt = global.$store.state.app.prompt;
    chatCompletionsRequest({
      data: {
        messages: [
          {
            content: prompt + message,
            role: "user",
          },
        ],
        temperature: 0.1,
        top_p: 0.1,
      },
    })
      .then((response: any) => {
        resolve(response);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

const parseUserIntention = (userIntention: any) => {
  let userIntentionContent = userIntention.result;
  let result;
  try {
    userIntentionContent = userIntentionContent.replaceAll("'", '"');
    console.log("parseUserIntention+++++", userIntentionContent);

    result = JSON.parse(userIntentionContent);
    result = result.scene;
  } catch (error) {
    console.log(error);
    const isLLM = /LLM/g.test(userIntentionContent);
    const isTXT_2_IMG = /TXT_2_IMG/g.test(userIntentionContent);
    if (isTXT_2_IMG) {
      result = "TXT_2_IMG";
    } else if (isLLM) {
      result = "LLM";
    }
  }
  return result;
};

const chatCompletionsSSEPromise = () => {
  return new Promise(async (resolve, reject) => {
    console.log(state.chatTitle);
    console.log(global.$store.state);
    const lastMessageData = getLastData(state.chatHistory);
    if (!!global.$route.query.chatId) {
      state.currentChatList = global.$store.state.currentChatList;
    }
    if (
      state.chatHistory.length === 0 ||
      state.chatHistory[state.chatHistory.length - 1].role === "assistant"
    ) {
      resolve(null);
      return;
    }
    global.$store.commit("app/updateCurrentLoadingFlag", true);
    global.$store.commit("app/updateCurrentWritingChatId", currentChatId.value);
    scrollToBottom("instant");

    // 不做意图识别，默认LLM类型
    // const userIntention = await intentRecognitionPromise(
    //   lastMessageData.content
    // );
    // const parsedUserIntention = parseUserIntention(userIntention);
    const parsedUserIntention = "LLM";
    if (parsedUserIntention === "LLM") {
      wenxinworkshopChatCompletionsRequest({
        body: {
          messages: state.chatHistory,
        },
        onMessage: (response: any) => {
          console.log("wenxinworkshopChatCompletionsRequest++++", response);
          state.thinkingFlag = false;
          state.writingFlag = true;
          const theLastOne = state.chatHistory[state.chatHistory.length - 1];
          if (
            currentChatId.value !== global.$store.state.app.currentWritingChatId
          ) {
            global.$store.commit("app/updateCurrentLoadingFlag", false);
            return;
          }
          if (response.type === "DATA") {
            global.$store.commit("app/updateCurrentLoadingFlag", false);
            if (!!theLastOne && theLastOne.role === "user") {
              state.chatHistory.push({
                role: "assistant",
                content: response.content.result,
                status: "writing",
              });
            } else {
              state.chatHistory[state.chatHistory.length - 1].content +=
                response.content.result;
            }
            typingEffect(response.content.result);
          } else if (response.type === "END") {
            state.chatHistory[state.chatHistory.length - 1].status = "end";
            // state.typingFlag = false;

            submitMessageRequest({
              data: {
                content:
                  state.chatHistory[state.chatHistory.length - 1].content,
                role: "assistant",
                chatId: global.$route.query.chatId,
                welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
                guestUserId: global.$store.state.user.userIdInfo.guestUserId,
              },
            })
              .then(async (response: any) => {
                resolve(response);
              })
              .catch((error: any) => {
                console.error(error);
                reject(error);
              })
              .finally(() => {
                state.writingFlag = false;
              });
          } else if (response.type === "ERROR") {
            checkChatCompletionsErrorRequest({
              content: state.chatHistory[state.chatHistory.length - 1].content,
              role: "assistant",
              chatId: global.$route.query.chatId,
              welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
              guestUserId: global.$store.state.user.userIdInfo.guestUserId,
            })
              .then(async (response: any) => {
                const errorMessage = `错误码${response.data.error_code}: ${response.data.error_msg}`;

                state.chatHistory.push({
                  role: "assistant",
                  content: errorMessage,
                  status: "writing",
                });

                typingEffect(errorMessage);
                state.chatHistory[state.chatHistory.length - 1].status = "end";

                submitMessageRequest({
                  data: {
                    content:
                      state.chatHistory[state.chatHistory.length - 1].content,
                    role: "assistant",
                    chatId: global.$route.query.chatId,
                    welinkUserId:
                      global.$store.state.user.userIdInfo.welinkUserId,
                    guestUserId:
                      global.$store.state.user.userIdInfo.guestUserId,
                  },
                })
                  .then(async (response: any) => {
                    resolve(response);
                  })
                  .catch((error: any) => {
                    console.error(error);
                    reject(error);
                  })
                  .finally(() => {
                    state.writingFlag = false;
                  });
                resolve(response);
              })
              .catch((error: any) => {
                console.log("checkChatCompletionsErrorRequest+++++");
                console.error(error);
                reject(error);
              })
              .finally(() => {
                state.writingFlag = false;
              });
          }
          scrollToBottom("instant");
        },
        onError: (error: any) => {
          console.log("wenxinworkshopChatCompletionsRequest error+++++");
          console.log(error);
        },
      });
    } else if (parsedUserIntention === "TXT_2_IMG") {
      const response = await chatCompletionsRequest({
        data: {
          messages: [
            {
              content: `请为我翻译这段话："${lastMessageData.content}"`,
              role: "user",
            },
          ],
        },
      });
      const translatedQuestion = response.result;
      stableDiffusionTxt2imgRequest({
        prompt: translatedQuestion,
        steps: 5,
      })
        .then((response: any) => {
          console.log(response);
        })
        .catch(async (error: any) => {
          console.log(error);
          state.thinkingFlag = false;
          global.$message({
            type: "error",
            message: "调用作画api失败",
            duration: 3000,
          });

          const getChatHistoryRedundantList = getChatHistoryRedundant();
          if (getChatHistoryRedundantList.length > 0) {
            await deleteRedundantMessagesPromise(getChatHistoryRedundantList);
          }
          await deleteLastUserMessagePromise();
          await getMessageHistoryByChatIdPromise();
        });
    }
  });
};

const handleFocusin = async (event: any) => {
  scrollToBottom("instant");
};

const handleEditingMessage = async (value: any) => {
  // console.log("==========================================");
  // console.log("value", value);
  const _event: Event | undefined = event;
  // console.log("handleEditingMessage", state.formData.message);
  // console.log("event2", _event);
  // console.log("state.chatHistory", state.chatHistory.length);
  // console.log("inputType++++", _event.inputType);

  const isEmptyChat = state.chatHistory.length === 0;
  const isUserTyping = !isEmptyChat
    ? state.chatHistory[state.chatHistory.length - 1].role === "user"
    : true;
  const isTextTyping =
    _event.inputType === "insertCompositionText" ||
    _event.inputType === "insertText";
  const isInsertCompositionText = _event.inputType === "insertCompositionText";
  const isDeleteByCut = _event.inputType === "deleteByCut";
  const isInsertFromPaste = _event.inputTpee === "insertFromPaste";
  const isInsertText = _event.inputType === "insertText";
  const isDeleteContentBackward = _event.inputType === "deleteContentBackward";
  const undefinedInputType = _event.inputType === undefined;

  let result = "";
  if (state.chatHistory.length === 0 && state.formData.message.length !== 0) {
    state.chatHistory.push({
      role: "user",
      content: "",
    });
  }
  // console.log("state.chatHistory.length+++++", state.chatHistory.length);
  if (isInsertCompositionText) {
    // console.log("isInsertCompositionText+++++");
    if (isEmptyChat || !isUserTyping) {
      let temp = state.chatHistory;
      temp.push({
        role: "user",
        content: state.formData.message,
      });
      state.chatHistory = temp;
    }
    result = state.formData.message;
    state.chatHistory[state.chatHistory.length - 1].content = result;
  }

  if (
    isDeleteByCut ||
    isDeleteContentBackward ||
    isInsertText ||
    isInsertFromPaste ||
    isUserTyping ||
    undefinedInputType
  ) {
    result = state.formData.message;
  }

  // console.log("value++++");
  // console.log(value);

  if (!isUserTyping && state.formData.message.length !== 0) {
    result = state.formData.message;
    state.chatHistory.push({
      role: "user",
      content: result,
    });
  }

  state.chatHistory[state.chatHistory.length - 1].content = result;

  if (
    state.formData.message === "" &&
    isUserTyping &&
    !isInsertCompositionText
  ) {
    state.chatHistory.pop();
  }
  scrollToBottom("instant");
};

const handleSubmitByShortcut = (event: any) => {
  if (event.keyCode === 13) {
    if (global.$isNotEmpty(state.formData.message)) {
      handleSubmitMessage();
    } else {
      console.log(currentInstance.appContext.config.globalProperties);
      global.$message.warning("请输入问题");
    }
  }
};

const getAccessTokenAgainPromise = () => {
  return new Promise((resolve, reject) => {
    if (!!global.$store.state.user.baiduAPIAccessInfo.access_token) {
      resolve(null);
    } else {
      getBaiduTokenRequest()
        .then((response: any) => {
          global.$store.commit("user/updateBaiduAPIAccessInfo", response);
          resolve(null);
        })
        .catch((error: any) => {
          reject(error);
        });
    }
  });
};

const handleSubmitMessage = async () => {
  global.$store.commit("app/updateCurrentLoadingFlag", true);
  if (state.formData.message.trim().toLowerCase() === "vconsole") {
    openVConsole();
    return;
  }
  state.thinkingFlag = true;

  if (!global.$store.state.user.baiduAPIAccessInfo.access_token) {
    await getAccessTokenAgainPromise();
  }
  scrollToBottom("instant");
  submitMessageRequest({
    data: {
      content: state.formData.message,
      role: "user",
      chatId: global.$route.query.chatId,
      guestUserId: global.$store.state.user.userIdInfo.guestUserId,
      welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
    },
  })
    .then(async (response: any) => {
      console.log("submitMessageRequest+++++", response);
      state.formData.message = "";
      state.chatHistory[state.chatHistory.length - 1].id = response.data.id;
      const getChatHistoryRedundantList = getChatHistoryRedundant();
      if (getChatHistoryRedundantList.length > 0) {
        await deleteRedundantMessagesPromise(getChatHistoryRedundantList);
      }
      scrollToBottom("instant");
      chatCompletionsSSEPromise()
        .then((response: any) => {
          console.log("global.$store.state.app+++", global.$store.state.app);
          if (global.$store.state.app.currentChatTitle === "") {
            changeTitle();
          }
        })
        .catch(async (error: any) => {
          global.$message.error(`服务器开小差了，请重试`);
          const getChatHistoryRedundantList = getChatHistoryRedundant();
          if (getChatHistoryRedundantList.length > 0) {
            await deleteRedundantMessagesPromise(getChatHistoryRedundantList);
          }
        });
    })
    .catch(async (error: any) => {
      global.$message.error(`服务器开小差了，请重试`);
      const getChatHistoryRedundantList = getChatHistoryRedundant();
      if (getChatHistoryRedundantList.length > 0) {
        await deleteRedundantMessagesPromise(getChatHistoryRedundantList);
      }
    });
};

const openVConsole = () => {
  console.log("navigator++++++", navigator);
  console.log("navigator.userAgent++++++", navigator.userAgent);
  console.log("location++++++", location);

  const currentRoute = global.$route;
  console.log("=====currentRoute=====");
  console.log(currentRoute);
  console.log(location);
  const origin = location.origin;
  console.log({
    name: currentRoute.name,
    query: Object.assign(currentRoute.query, {
      enable_console: 1,
    }),
  });
  global.$router.push({
    path: "/",
    query: {
      enable_console: 1,
    },
  });
  setTimeout(() => {
    location.reload();
  }, 1000);
};

const getChatHistoryRedundant = () => {
  const redundantMessageIdList = [] as any;
  state.chatHistory.forEach((item: any, index: number) => {
    if (index !== 0 && item.role === state.chatHistory[index - 1].role) {
      redundantMessageIdList.push(item.id);
    }
  });
  state.chatHistory.forEach((item: any, index: number) => {
    if (global.$isEmpty(state.chatHistory[index].content)) {
      state.chatHistory.splice(index, 2);
    }
  });

  return redundantMessageIdList;
};

const deleteRedundantMessagesPromise = (data: number[]) => {
  return new Promise((resolve, reject) => {
    deleteMultipleMessagesRequest(data)
      .then((response: any) => {
        resolve(response);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

const deleteLastUserMessagePromise = () => {
  const lastMessageData = getLastData(state.chatHistory);
  const lastChatId = lastMessageData.id;
  return new Promise((resolve, reject) => {
    if (lastMessageData.role === "user") {
      deleteMultipleMessagesRequest([lastChatId])
        .then((response: any) => {
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    } else {
      resolve(null);
    }
  });
};

const handleGoBack = () => {
  global.$router.push({
    name: "chatList",
  });
  global.$store.commit("app/updateExpendStatus", true);
};

const checkChatStyle = (role: string) => {
  return role === "user" ? "right" : "left";
};

const deleteLocalRedundantMessages = () => {
  state.chatHistory = state.chatHistory.filter(
    (item: any) =>
      !state.redundantChatHistoryList.some((item2: any) => item2 === item.id)
  );
};

const changeTitle = () => {
  if (state.chatHistory.length === 1) return;
  const firstMessage = state.chatHistory[0].content;
  console.log(global.$store.state.app);
  updateChatTitleRequest({
    chatId: currentChatId.value,
    title: firstMessage,
  })
    .then((response: any) => {
      console.log("changeTitle++++", response);
      global.$store.commit("app/updateCurrentChatTitle", firstMessage);
      emit("onChangeTitle", response);
    })
    .catch((error: any) => {
      console.error(error);
    });
};

const getChaiInfoPromise = () => {};

const init = async () => {
  try {
    state.formData.message = "";
    state.thinkingFlag = false;
    state.loadingFlag = true;
    await getMessageHistoryByChatIdPromise();
    getChaiInfoPromise();
    deleteUserMessageOnMounted();
    state.loadingFlag = false;
    scrollToBottom("instant");
    if (global.$store.state.app.currentChatTitle === "新的对话") {
      changeTitle();
    }
  } catch (error) {
    console.log(error);
  }
};

const scrollToBottom = async (behavior: string) => {
  await nextTick();
  scrollbarRef.value.wrapRef.scrollTo({
    left: 0,
    top: chatScrollbarRef.value!.clientHeight,
    behavior,
  });
};

const deleteUserMessageOnMounted = () => {
  return new Promise((resolve, reject) => {
    const currentChatData = state.chatHistory;
    const lastMessageData = currentChatData[currentChatData.length - 1];
    if (!!lastMessageData && lastMessageData.role === "user") {
      const lastMessageId = lastMessageData.id;
      deleteMultipleMessagesRequest([lastMessageId])
        .then((response: any) => {
          state.chatHistory.pop();
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    }
  });
};

const autoMessage = () => {
  if (process.env.NODE_ENV === "production") return;
  const lastMessageData = getLastData(state.chatHistory);
  if (!!lastMessageData && lastMessageData.role === "user") {
    return;
  }
  state.formData.message = [
    "介绍一下杰西利弗莫尔",
    "介绍一下洛克白板说",
    "介绍一下沃勒斯坦",
    "介绍一下斯多葛",
    "介绍一下海德格尔",
    "背诵一下心经",
    "和光同尘是什么意思",
    "上善若水。水善利万物而不争，处众人之所恶，故几于道",
  ];
  // state.formData.message = "shishi";
  // state.formData.message = "帮我设计一个logo";
  state.chatHistory.push({
    role: "user",
    content: state.formData.message,
  });
  scrollToBottom("instant");
  console.log(state.chatHistory);
};

const handleScrollChat = (event: any) => {
  if (global.$route.name !== "chat") return;
  const scrollTop = event.scrollTop;

  const offsetHeight = scrollbarRef.value.wrapRef.clientHeight;
  const clientHeight = chatScrollbarRef.value.clientHeight;

  state.onTheBottom = offsetHeight + scrollTop < clientHeight;

  // console.log("===============");
  // console.log(scrollTop);
  // console.log(offsetHeight);
  // console.log(clientHeight);
};

onMounted(async () => {
  init();
});

onBeforeUnmount(() => {
  state.chatHistory = [];
  state.loadingFlag = false;
  state.thinkingFlag = false;
  global.$store.commit("app/updateCurrentChatHistory", state.chatHistory);
});
</script>

<style scoped lang="scss">
.dialog_container {
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;
  color: #ccc;
  position: relative;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f5f4f6, #e6ebf7);

  .header {
    display: flex;
    flex-direction: row;
    padding: 0 0.5rem 0 0.5rem;
    width: 100%;
    height: 1.1rem;
    background-color: rgba($color: #f2f5fe, $alpha: 0.9);
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    top: 0;
    z-index: 1;
    .left {
      display: inline-block;
      width: 1.5rem;
      vertical-align: middle;
    }
    .center {
      display: inline-block;
      margin: 0;
      vertical-align: middle;
      flex: 1;
      text-align: center;
      color: #333;
      font-size: 0.5rem;
      .title {
        display: inline-block;
        width: 65%;
        height: 1.1rem;
        line-height: 1.1rem;
        position: relative;
        z-index: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .count {
        display: inline-block;
        margin: 0.4rem 0 0 0.2rem;
        padding: 0 0.5rem;
        width: 100vw;
        font-size: 0.3rem;
        color: #666;
        position: absolute;
        right: 0;
        text-align: right;
      }
    }
    .right {
      display: inline-block;
      width: 1.5rem;
      vertical-align: middle;
    }
  }
  .chat_container {
    flex: 1;
    overflow: auto;
    position: relative;
    background-color: #f2f5fe;
    ul {
      position: relative;
      padding: 0 0.5rem;

      li {
        margin: 0.4rem 0;
        font-size: 0;
        &:last-child {
          margin: 0.4rem 0 1rem 0;
        }
        &:first-child {
          margin: 0.3rem 0;
        }
        .avatar {
          display: block;
          padding: 0 0.1rem;
          font-size: 0.8rem;
          width: 100%;
          height: 1rem;
          box-sizing: border-box;
          > .content {
            width: 100%;
            // box-shadow: 2px 2px 5px #ccc;
            overflow: hidden;
            align-items: center;
            .avatar_item {
              display: inline-block;
              width: 1rem;
              height: 1rem;
              background-color: #e7f8ff;
              vertical-align: bottom;
            }
          }
          > .desc {
            display: inline-block;
            flex: 1;
            font-size: 0.4rem;
            color: #999;
          }
          img {
            width: 100%;
          }

          &.left {
            margin: 0 0 0.4rem 0;
          }
          &.right {
            margin: 0 0 0.4rem 0;
            img {
              width: 1rem;
            }
          }
        }
        > .content {
          display: inline-block;
          padding: 0.2rem 0.4rem;
          max-width: 19rem;
          min-width: 1rem;
          border-radius: 0.3rem;
          position: relative;
          vertical-align: bottom;
          font-size: 0.45rem;
          line-height: 0.85rem;
          word-break: break-all;
          text-align: left;
          color: #24292f;
          border: 1px solid #24292f;
          transition: all 0.3s;
          white-space: pre-line;
          &:before,
          &:after {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-width: 0.3rem;
            border-style: solid;
            position: absolute;
            bottom: 0;
          }
          &:after {
            border-width: 0.34rem;
          }
        }
        &.left {
          text-align: left;
          > .content {
            background-color: #fff;
            &:before {
              border-color: transparent transparent #fff transparent;
              bottom: calc(100% - 1px);
              left: 0.33rem;
              z-index: 1;
            }
            &:after {
              border-color: transparent transparent #24292f transparent;
              bottom: 100%;
              left: 0.3rem;
            }
            .avatar_item {
              background-color: #fff;
            }
          }
          > .avatar {
            .desc {
              margin: 0 0 0 0.5rem;
              text-align: right;
            }
          }
        }
        &.right {
          text-align: right;
          > .content {
            background-color: #fff;
            &:before {
              border-color: transparent transparent #fff transparent;
              bottom: calc(100% - 1px);
              right: 0.3rem;
              z-index: 1;
            }
            &:after {
              border-color: transparent transparent #24292f transparent;
              bottom: 100%;
              right: 0.27rem;
            }
          }
          > .avatar {
            .desc {
              margin: 0 0.5rem 0 0;
              text-align: left;
            }
          }
        }
      }
    }
  }
  .input_container {
    padding: 0.4rem 0.4rem 0 0.4rem;
    // height: 0.8rem;
    background: transparent;
    .main {
      .a-form-item {
        margin: 0 0 0.3rem 0;
      }
      .input_wrapper {
        display: flex;
        width: 100%;
        text-align: left;
        .ant-input-group {
          display: flex;
          .ant-input {
            // padding: 0 0.4rem 0 0;
            resize: none;
            line-break: anywhere;
            transition: all 0.3s;
            // border-radius: 0.2rem;
            // min-height: 1.2rem !important;
            font-size: 0.6rem;
            textarea {
              // padding: 0 0.4rem 0 0;
              resize: none;
              line-break: anywhere;
              transition: all 0.3s;
              // border-radius: 0.2rem;
              // min-height: 1.2rem !important;
              font-size: 0.8rem;
            }
          }
          .button_item {
            text-align: center;
            width: 1.3rem;
            height: 100%;
            button {
              padding: 0.1rem 0;
              width: 100%;
              height: 100%;
              line-height: 1rem;
              text-align: center;
              font-size: 0.5rem;
              border-radius: 0.2rem;
            }
          }
        }
      }
    }
  }
  .message_container {
    height: 3rem;
  }
  .common_button_item {
    position: absolute;
    left: 0;
    height: 1.1rem;
    line-height: 0.1rem;
    font-size: 0.7rem;
    z-index: 1;
  }
  .el-loading-parent--relative {
    // height: calc(100vh - 3.5rem);
  }
  .backtotop {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 1.1rem;
    height: 1.1rem;
    opacity: 0;
    transition: all 0.3s;
    z-index: -1;
    &.active {
      opacity: 0.8;
      z-index: 5555;
    }
  }
}
</style>
