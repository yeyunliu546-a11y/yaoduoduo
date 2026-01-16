// api/auth.js
import request from '@/utils/request/request.js'

// 微信登录（含诊所检查）
export function loginByWechat(data) {
  return request.post('/api/Check/LoginWxWithClinicCheck', data)
}

// 发送短信验证码
export function sendSmsCaptcha(data) {
  return request.post('/captcha/sendSms', data) // 路径按后端实际接口调整
}

// 短信登录
export function loginBySms(data) {
  return request.post('/auth/login/sms', data)
}

// 密码登录
export function loginByPassword(data) {
  return request.post('/auth/login/password', data)
}