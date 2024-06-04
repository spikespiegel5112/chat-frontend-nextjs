<template>
  <div class="user avatar_item">
    <img v-if="!!userAvatar" :src="userAvatar" alt="" />
    <HaitongUnitrustHorseAvatar v-else />
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

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const userAvatar = computed(() => {
  const userDetailInfo = global.$store.state.user.userDetailInfo;
  const result = global.$isNotEmpty(userDetailInfo)
    ? userDetailInfo.avatar
    : null;
  return result;
}) as any;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.user {
  width: 1rem;
  height: 1rem;
  img{
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}
</style>
