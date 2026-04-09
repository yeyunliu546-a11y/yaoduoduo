import request from '@/utils/request/request.js'

// API 地址配置
const api = {
  getDetail: '/api/User/Get',      
  bindMobile: '/api/User/BindMobile',  
  personal: '/api/User/UpdateInfo',     
  myGrade: '/api/UserGrade/GetMyGradeInfo',
  clinicDetail: '/api/Clinic/GetDetail',
  
  // ================= 新增：个人设置相关 API =================
  getCaptcha: '/api/check/getImageCaptcha',              // 🌟 修复：根据真实代码修正路径
  sendSmsCaptcha: '/api/check/sendSmsCaptcha',           // 🌟 修复：顺便修正短信接口的大小写路径
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
// 🌟 修复：改为 GET 请求，且传 {load: false} 防止每次点验证码都弹 loading 框闪烁
export const getCaptcha = () => request.get(api.getCaptcha, {}, { load: false }) 
export const sendSmsCaptcha = (data) => request.post(api.sendSmsCaptcha, data, { load: false })
export const changeUserInfo = (data) => request.post(api.changeUserInfo, data)
export const changeName = (data) => request.post(api.changeName, data)
export const setReplacePhone = (data) => request.post(api.setReplacePhone, data)
export const changePassword = (data) => request.post(api.changePassword, data)