<template>
  <router-view v-slot="{ Component }">
    <transition name="silde">
      <component :is="Component" />
    </transition>
  </router-view>
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
} from "vue";
import { getBaiduTokenRequest } from "@/api/auth";

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const state = reactive({});

const currentMobileMode = computed(() => {
  return global.$store.state.app.currentMobileMode;
}) as any;

watch(
  () => currentMobileMode.value,
  (newValue: any, oldValue: any) => {
    initRemResizing();
  }
);

const initRemResizing = () => {
  let fontSize = 20;
  if (global.$store.state.app.currentMobileMode) {
    fontSize = 30;
  }

  global.$remResizing({
    baseline: 320,
    fontSize: fontSize,
    threshold: 640,
  });
  console.log("=====initRemResizing=====");
  console.log(fontSize);
};

const getToken = () => {
  getBaiduTokenRequest()
    .then((response: any) => {
      global.$store.commit("user/updateBaiduAPIAccessInfo", response);
    })
    .catch((error: any) => {
      console.log(error);
    });
};
const initVConsole = () => {
  if (process.env.NODE_ENV === "production") return;
  const vConsole = new VConsole();
  vConsole.setSwitchPosition(20, 200);
  if (global.$isMobile() && !global.$isWindows()) {
    const vConsole = new VConsole();
    vConsole.setSwitchPosition(20, 100);
  }
};
onMounted(() => {
  initRemResizing();
  getToken();
  // initVConsole();
});
</script>

<style scoped lang="scss">
.chatlist_container {
  background: #ccc;
  .header {
    height: 10rem;
    font-size: 0.7rem;
  }
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

/* 下面我们会解释这些 class 是做什么的 */
.silde-enter-active,
.silde-leave-active {
  transition: all 0.3s ease-out;
}

.silde-enter-from,
.silde-leave-to {
  transform: translateX(100vw);
}
</style>
