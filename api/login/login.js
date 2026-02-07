import request from '@/utils/request/request.js'

// ==========================================
// 登录接口 (基于《小程序多方式登录API对接文档》v1.0)
// ==========================================

// 1. 微信一键登录
// URL: /api/Check/MiniAppLoginByWx
// 参数: { WxCode, InviteCode }
export function loginByWechat(data) {
  return request.post('/api/Check/MiniAppLoginByWx', data)
}

// 2. 手机验证码登录
// URL: /api/Check/MiniAppLoginByPhone
// 参数: { Mobile, SmsCode, SmsVerifyCodeId(可选) }
export function loginByPhone(data) {
  return request.post('/api/Check/MiniAppLoginByPhone', data)
}

// 3. 账号密码登录
// URL: /api/Check/MiniAppLoginByPassword
// 参数: { Account, Password, AppKey: 'wxapp', VerifyCode... }
export function loginByPassword(data) {
  return request.post('/api/Check/MiniAppLoginByPassword', data)
}

// 4. 发送短信验证码
// URL: /api/Check/SendSmsCode
// 参数: { Mobile, Type }
export function sendSmsCode(data) {
  return request.post('/api/Check/SendSmsCode', data)
}
// 5. 获取图形验证码 (密码登录必填)
// URL: /api/Check/GetImageCaptcha
export function getImageCaptcha() {
  return request.get('/api/Check/GetImageCaptcha')
}