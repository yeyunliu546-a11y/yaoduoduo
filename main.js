import { createSSRApp } from 'vue'
import App from './App.vue'

// 依然引用 uview-ui 这个路径，因为我们没改文件夹名
import uView from '@/uview-ui'

export function createApp() {
  const app = createSSRApp(App)
  
  // Vue3 插件安装方式
  app.use(uView)
  
  return {
    app
  }
}