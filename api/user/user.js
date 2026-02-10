// 【修复1】引用路径必须精确到 .js 文件，使用 @ 别名
import request from '@/utils/request/request.js'

// API 地址配置
const api = {
  // 1. 个人信息
  // 原 user/get 推测对应后端的 Get 方法
  getDetail: '/api/User/Get',      
  
  // 2. (已删除) 资产信息接口 /api/User/GetAssets 因为数据已合并到 User/Get 中
  
  // 3. 绑定手机号
  bindMobile: '/api/User/BindMobile',  
  
  // 4. 修改个人信息
  // 原 user/personal 通常对应 UpdateInfo 或 Update
  personal: '/api/User/UpdateInfo',     

  // 5. 【新增】获取用户等级信息 (来源: 用户等级自动升级功能对接文档.md)
  myGrade: '/api/UserGrade/GetMyGradeInfo',

  // 6. 【新增】获取诊所资质详情 (来源: 资质审核法人身份证上传对接文档.md)
  clinicDetail: '/api/Clinic/GetDetail'
}

// ==========================================
// 核心业务方法
// ==========================================

// 1. 获取当前登录的用户信息 (包含头像、昵称、余额、积分、优惠券等)
export const getDetail = (param, option) => {
  const options = {
    isPrompt: true, 
    load: true, 
    ...option
  }
  return request.get(api.getDetail, param, options)
}

// 2. (已删除) 获取账户资产方法 assets

// 3. 绑定手机号
export const bindMobile = (data, option) => {
  return request.post(api.bindMobile, data, option)
}

// 4. 修改个人信息（头像昵称）
export const personal = (data, option) => {
  return request.post(api.personal, data, option)
}

// 5. 【新增】获取用户等级信息 (包含升级进度)
export const getUserGrade = (param, option) => {
  return request.get(api.myGrade, param, option)
}

// 6. 【新增】获取诊所资质详情 (审核状态等)
export const getClinicDetail = (param, option) => {
  return request.get(api.clinicDetail, param, option)
}