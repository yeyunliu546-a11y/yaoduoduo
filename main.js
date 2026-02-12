import { createSSRApp } from 'vue'
import App from './App.vue'

// 1. 引入 store
import store from './store'

// 依然引用 uview-ui 这个路径
import uView from '@/uview-ui'

export function createApp() {
  const app = createSSRApp(App)
  
  // Vue3 插件安装方式
  app.use(uView)
  
  // 2. 必须挂载 store，否则 this.$store 为 undefined
  app.use(store)
  
  return {
    app
  }
}