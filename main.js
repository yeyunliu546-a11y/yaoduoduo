import App from './App'

// 【新增】引入 uView 主库
import uView from '@/uview-ui'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

// 【新增】使用 uView
Vue.use(uView)

Vue.config.productionTip = false

// Vue 2: 挂载 $navTo
Vue.prototype.$navTo = function (path, params = {}) {
  let query = ''
  if (params && Object.keys(params).length > 0) {
    query = '?' + Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
  }
  uni.navigateTo({ url: `/${path}${query}` })
}

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

function $navTo(path, params = {}) {
  let query = ''
  if (params && Object.keys(params).length > 0) {
    query = '?' + Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
  }
  uni.navigateTo({ url: `/${path}${query}` })
}

export function createApp() {
  const app = createSSRApp(App)
  // 【新增】Vue 3 使用 app.use
  app.use(uView)
  
  // 👇 挂载到全局属性（Vue 3 替代 Vue.prototype）
  app.config.globalProperties.$navTo = $navTo

  return {
    app
  }
}
// #endif