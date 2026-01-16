// utils/request.js
const baseURL = 'http://112.126.75.108:5000' // 就是你同事给的地址

export default {
  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: baseURL + url,
        method: 'POST',
        data,
        header: {
          'Content-Type': 'application/json',
          // 如果已登录，自动带 token（可选）
          'Authorization': uni.getStorageSync('user_token') || ''
        },
        success: (res) => {
          // 假设后端返回格式：{ code: 200, message: '', result: {} }
          if (res.data.code === 200) {
            resolve(res.data.result)
          } else {
            uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(new Error(res.data.message))
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误，请检查连接', icon: 'none' })
          reject(err)
        }
      })
    })
  },

  get(url, params = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: baseURL + url,
        method: 'GET',
        data: params,
        header: {
          'Authorization': uni.getStorageSync('user_token') || ''
        },
        success: (res) => {
          if (res.data.code === 200) {
            resolve(res.data.result)
          } else {
            uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(new Error(res.data.message))
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(err)
        }
      })
    })
  }
}