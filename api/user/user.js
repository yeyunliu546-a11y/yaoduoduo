import request from '@/utils/request/request.js'

// API 地址配置
const api = {
  getDetail: '/api/User/Get',      
  bindMobile: '/api/User/BindMobile',  
  personal: '/api/User/UpdateInfo',     
  myGrade: '/api/UserGrade/GetMyGradeInfo',
  clinicDetail: '/api/Clinic/GetDetail',
  
  // ================= 新增：个人设置相关 API =================
  getCaptcha: '/api/Check/GetCaptcha',                   // 获取图形验证码
  sendSmsCaptcha: '/api/Check/SendSmsCaptcha',           // 发送短信验证码
  changeUserInfo: '/api/User/ChangeUserInfo',            // 修改头像等信息
  changeName: '/api/User/ChangeName',                    // 修改机构名称
  setReplacePhone: '/api/User/SetReplacePhone',          // 换绑手机号
  changePassword: '/api/User/ChangePasswordWithVerify'   // 修改密码
}

// ==========================================
// 核心业务方法
// ==========================================

export const getDetail = (param, option) => {
  const options = { isPrompt: true, load: true, ...option }
  return request.get(api.getDetail, param, options)
}

export const bindMobile = (data, option) => request.post(api.bindMobile, data, option)
export const personal = (data, option) => request.post(api.personal, data, option)
export const getUserGrade = (param, option) => request.get(api.myGrade, param, option)
export const getClinicDetail = (param, option) => request.get(api.clinicDetail, param, option)

// ================= 新增：个人设置相关方法 =================
export const getCaptcha = () => request.post(api.getCaptcha)
export const sendSmsCaptcha = (data) => request.post(api.sendSmsCaptcha, data)
export const changeUserInfo = (data) => request.post(api.changeUserInfo, data)
export const changeName = (data) => request.post(api.changeName, data)
export const setReplacePhone = (data) => request.post(api.setReplacePhone, data)
export const changePassword = (data) => request.post(api.changePassword, data)