// 存储应用级环境信息（最典型的是 platform 平台类型）
// 用于条件渲染：例如你的页面中根据 platform == 'H5' 调整样式
// 未来可扩展：比如添加 theme（主题）、language（语言）等全局配置
// 为什么需要这个？
// UniApp/H5/小程序在 UI 和 API 上有差异，通过 platform 可统一处理兼容逻辑。

import {
  Platform
} from '@/store/mutation-types'
import storage from '@/utils/storage'


const app = {
  state: {
    // 当前终端平台
    platform: ''
  },

  mutations: {
    SetPlatform: (state, value) => {
      state.platform = value
    }
  },

  actions: {

  }
}

export default app
