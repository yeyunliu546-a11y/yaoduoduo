import request from '@/utils/request/request.js'

// api地址
const api = {
  imageCaptcha: '/api/Check/GetImageCaptcha', // 🌟 修复：同样更新这里的路径和大小写
  sendSmsCaptcha: 'check/sendSmsCaptcha'
}

// 图形验证码
export function getImageCaptcha() {
  // 🌟 这里也已经是 get 方法了
  return request.get(api.imageCaptcha, {}, { load: false })
}

// 发送短信验证码
export function sendSmsCaptcha(data) {
  return request.post(api.sendSmsCaptcha, data, { load: false })
}