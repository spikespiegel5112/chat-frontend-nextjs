<template>
  <div class="welcome_wrapper">
    <div class="main">
      <span class="greeting">{{ state.typingText }}</span>
      <div class="introduction">{{ state.typingText2 }}</div>
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
} from "vue";

import { ElScrollbar } from "element-plus";
import user from "../store/modules/user";

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const textareaRef = ref(HTMLTextAreaElement);

const state = reactive({
  chatTitle: "",
  typingFlag: true,
  typingText: "",
  typingText2: "",
  promptVisible: false,
});

const currentChatId = computed(() => {
  return global.$route.query.chatId;
}) as any;

const getGreeting = () => {
  return `Hi, ${getTimePeriod()}好`;
};

const getTimePeriod = () => {
  // 获取当前时间
  const currentTime = global.$moment();
  // 获取当前小时
  const currentHour = currentTime.hour();

  // 根据当前小时判断时间段
  let timePeriod;
  if (currentHour >= 0 && currentHour < 11) {
    timePeriod = "上午";
  } else if (currentHour >= 11 && currentHour < 13) {
    timePeriod = "中午";
  } else if (currentHour >= 13 && currentHour < 18) {
    timePeriod = "下午";
  } else {
    timePeriod = "晚上";
  }
  return timePeriod;
};

let messageArray: string[] = [];
let count = 0;

const typingEffect = (message: string, frequent: number, callback: void) => {
  messageArray.push(...message.split(""));
  let result = "";
  const loop = (message: string) => {
    if (count <= messageArray.length - 1 && !!state.typingFlag) {
      result += messageArray[count];
      callback(result);
    }
    const messageArrayLength = messageArray.length;
    if (count < messageArrayLength) {
      setTimeout(() => {
        count++;
        loop(message);
      }, frequent);
    } else {
      // state.typingFlag = false;
      // state.typingText = "";
      // count = 0;
      // messageArray = [];
    }
    // scrollToBottom();
  };
  loop(message);
};

const promptAnimation = () => {
  state.promptVisible = true;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      state.promptVisible = false;
      resolve();
    }, 0);
  });
};

const greetingPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      typingEffect(getGreeting(), 200, (text: string) => {
        state.typingText = text;
      });
      resolve();
    }, 500);
  });
};

const greeting2Promise = () => {
  return new Promise((resolve, reject) => {
    const text =
      "我是你的专属AI伙伴，我可以根据你的个性化需求，提供专属决策推荐。";
    setTimeout(() => {
      typingEffect(text, 50, (text: string) => {
        state.typingText2 = text;
      });
      resolve();
    }, 1500);
  });
};

onMounted(async () => {
  await promptAnimation();
  await greetingPromise();
  await greeting2Promise();
});

onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
.welcome_wrapper {
  padding: 0.5rem;
  width: 100%;
  border-radius: 0.5rem;
  box-sizing: border-box;
  .main {
    padding: 0 0 0.5rem 0;
    width: 100%;
    background-color: rgba($color: #fff, $alpha: 0.9);
    color: #000;
    text-align: left;
    transition: all 0.3s;
    border-radius: 0.3rem;
    .greeting {
      display: block;
      padding: 0.4rem;
      width: 100%;
      font-size: 0.8rem;
      border-radius: 0.6rem;
      box-sizing: border-box;
      font-family: "simhei";
    }
    .introduction {
      padding: 0 0.4rem;
      font-size: 0.5rem;
      line-height: 0.7rem;
      color: #666;
    }
  }
}
</style>
