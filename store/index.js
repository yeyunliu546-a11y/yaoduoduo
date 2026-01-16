// 创建并导出整个应用的 根 Store 实例。
// 使用 模块化（modules） 组织状态：将状态拆分为 app（应用相关，如 platform）和 user（用户相关，如 token、userId）。
// 注册全局 getters（从 store 中派生状态的计算属性）

// store/index.js
import { createStore } from 'vuex'
import getters from './getters'
import { app, user } from './modules'

// 创建 store 实例
const store = createStore({
  modules: {
    app,
    user
  },
  getters
})

export default store
