import request from '@/utils/request/request.js'

// ==========================================
// API 路由地址配置
// ==========================================
const api = {
  // --- 基础信息 ---
  getDetail: '/api/User/Get',      
  personal: '/api/User/UpdateInfo',     
  myGrade: '/api/UserGrade/GetMyGradeInfo',
  clinicDetail: '/api/Clinic/GetDetail',
  
  // --- 🌟 账户安全与状态（新增） ---
  getMyStatus: '/api/User/GetMyStatus',                  // 获取是否绑定手机/密码状态
  
  // --- 个人设置与验证 ---
  getCaptcha: '/api/Check/GetImageCaptcha',              // 图形验证码
  sendSmsCaptcha: '/api/check/sendSmsCaptcha',           // 短信验证码
  changeUserInfo: '/api/User/ChangeUserInfo',            // 修改头像/名称
  changeName: '/api/User/ChangeName',                    // 单独修改名称（备用）
  setReplacePhone: '/api/User/SetReplacePhone',          // 手机号绑定与换绑（统一接口）
  changePassword: '/api/User/ChangePasswordWithVerify'   // 密码设置与修改（统一接口）
}

// ==========================================
// 核心业务方法导出
// ==========================================

// 获取用户基础详情
export const getDetail = (param, option) => {
  const options = { isPrompt: true, load: true, ...option }
  return request.get(api.getDetail, param, options)
}

export const personal = (data, option) => request.post(api.personal, data, option)
export const getUserGrade = (param, option) => request.get(api.myGrade, param, option)
export const getClinicDetail = (param, option) => request.get(api.clinicDetail, param, option)

// ================= 🌟 账户安全与状态方法 =================
// 获取用户当前的安全设置状态 (hasPhone, hasPassword)
export const getMyStatus = (param, option) => request.get(api.getMyStatus, param, option)

// ================= 个人设置与验证方法 =================
// 获取图形验证码 (静默拉取，不显示loading)
export const getCaptcha = () => request.get(api.getCaptcha, {}, { load: false }) 

// 发送短信验证码 (静默拉取，防止遮挡按钮倒计时)
export const sendSmsCaptcha = (data) => request.post(api.sendSmsCaptcha, data, { load: false })

export const changeUserInfo = (data) => request.post(api.changeUserInfo, data)
export const changeName = (data) => request.post(api.changeName, data)
export const setReplacePhone = (data) => request.post(api.setReplacePhone, data)
export const changePassword = (data) => request.post(api.changePassword, data)