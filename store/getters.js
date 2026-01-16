// 提供一种 安全、统一的方式 从 store 中读取状态。
// 类似于 Vue 组件中的 computed，但作用于全局状态。
const getters = {
  token: state => state.user.token,
  userId: state => state.user.userId,
  platform: state => state.app.platform
}

export default getters
