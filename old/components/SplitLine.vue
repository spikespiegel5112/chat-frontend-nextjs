<template>
  <div class="splitline_item">
    <a-divider>
      {{ props.text }}
    </a-divider>
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

interface Props {
  text?: boolean;
}

const props = defineProps({
  text: {
    type: String,
    default: true,
    required: false,
  },
});

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.splitline_item {
  .ant-divider {
    span {
      background: red;
    }
    :deep(.ant-divider-inner-text) {
      font-size: 0.4rem;
    }
  }
}
</style>
