import request from '@/utils/request/request.js'

// API 地址配置
const api = {
  getDetail: '/api/User/Get',      
  bindMobile: '/api/User/BindMobile',  
  personal: '/api/User/UpdateInfo',     
  myGrade: '/api/UserGrade/GetMyGradeInfo',
  clinicDetail: '/api/Clinic/GetDetail',
  
  // ================= 新增：个人设置相关 API =================
  getCaptcha: '/api/Check/GetImageCaptcha',              // 🌟 修复：后端要求的精确大写和路径
  sendSmsCaptcha: '/api/check/sendSmsCaptcha',           
  changeUserInfo: '/api/User/ChangeUserInfo',                 // 🌟 修复：修改为你和后端沟通确认的新路径
  changeName: '/api/User/ChangeName',                    
  setReplacePhone: '/api/User/SetReplacePhone',          
  changePassword: '/api/User/ChangePasswordWithVerify'   
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
// 🌟 getCaptcha 已经使用的是 request.get，不需要改动代码结构
export const getCaptcha = () => request.get(api.getCaptcha, {}, { load: false }) 
export const sendSmsCaptcha = (data) => request.post(api.sendSmsCaptcha, data, { load: false })
export const changeUserInfo = (data) => request.post(api.changeUserInfo, data)
export const changeName = (data) => request.post(api.changeName, data)
export const setReplacePhone = (data) => request.post(api.setReplacePhone, data)
export const changePassword = (data) => request.post(api.changePassword, data)