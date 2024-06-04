const user = {
  namespaced: true,
  state: {
    baiduAPIAccessInfo: {},
    userIdInfo: {},
    userDetailInfo: {},
  },
  mutations: {
    updateBaiduAPIAccessInfo: (state: any, payload: object) => {
      state.baiduAPIAccessInfo = payload;
    },
    updateUserIdInfo: (state: any, payload: object) => {
      state.userIdInfo = payload;
    },
    updateUserDetailInfo: (state: any, payload: object) => {
      state.userDetailInfo = payload;
    },
  },
  actions: {},
  getters: {},
};

export default user;
