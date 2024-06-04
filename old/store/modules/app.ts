const app = {
  namespaced: true,
  state: () => ({
    currentChatTitle: "",
    currentChatDialogNumber: 0,
    currentChatId: 0,
    currentChatHistory: [],
    currentChatList: [],
    currentMobileMode: false,
    currentExpendStatus: true,
    cleanDialogFlag: false,
    currentDeletingChatId: false,
    currentWritingChatId: null,
    currentWritingFlag: false as boolean,
    prompt:
      "你的任务是判断[用户输入]意图，如果意图是[作画]、[设计logo]、[画画]、[做画]，[scene]值为TXT_2_IMG；如果意图不是'作画'、'设计'、'设计logo'、'画画'、'做画'，[scene]值为LLM。需要参考[示例]和[格式]回答，不要返回推理过程，返回字符串。[格式]{'scene':}[示例]###[用户输入]帮我作画{'scene':'TXT_2_IMG'}[用户输入]我要作诗{'scene':'LLM'}。",
  }),
  mutations: {
    updateCurrentChatList: (state: any, payload: object) => {
      state.currentChatList = payload;
    },
    updateCurrentChatTitle: (state: any, payload: object) => {
      state.currentChatTitle = payload;
    },
    updateCurrentChatDialogNumber: (state: any, payload: object) => {
      state.currentChatDialogNumber = payload;
    },
    updateCurrentChatId: (state: any, payload: object) => {
      state.currentChatId = payload;
    },
    updateMobileMode: (state: any, payload: object) => {
      state.currentMobileMode = payload;
    },
    updateExpendStatus: (state: any, payload: object) => {
      state.currentExpendStatus = payload;
    },
    updateCurrentChatHistory: (state: any, payload: object) => {
      state.currentChatHistory = payload;
    },
    updateCleanDialogFlag: (state: any, payload: object) => {
      state.cleanDialogFlag = payload;
    },
    updateCurrentDeletingChatId: (state: any, payload: object) => {
      state.currentDeletingChatId = payload;
    },
    updateCurrentWritingChatId: (state: any, payload: object) => {
      state.currentWritingChatId = payload;
    },
    updateCurrentLoadingFlag: (state: any, payload: object) => {
      state.currentWritingFlag = payload;
    },
  },
  actions: {},
  getters: {},
};

export default app;
