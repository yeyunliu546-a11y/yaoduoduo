import request from '@/utils/request/request.js'

const api = {
  getDetail: '/api/User/Get',
  personal: '/api/User/UpdateInfo',
  myGrade: '/api/UserGrade/GetMyGradeInfo',
  clinicStatus: '/api/Clinic/CheckStatus',
  clinicDetail: '/api/Clinic/GetMyClinicDetail',
  clinicExampleImages: '/api/Clinic/GetExampleImages',
  getMyStatus: '/api/User/GetMyStatus',
  getCaptcha: '/api/Check/GetImageCaptcha',
  sendSmsCaptcha: '/api/check/sendSmsCaptcha',
  changeUserInfo: '/api/User/ChangeUserInfo',
  changeName: '/api/User/ChangeName',
  setReplacePhone: '/api/User/SetReplacePhone',
  changePassword: '/api/User/ChangePasswordWithVerify'
}

export const getDetail = (param, option) => {
  const options = { isPrompt: true, load: true, ...option }
  return request.get(api.getDetail, param, options)
}

export const personal = (data, option) => request.post(api.personal, data, option)
export const getUserGrade = (param, option) => request.get(api.myGrade, param, option)
export const getClinicStatus = (param, option) => request.get(api.clinicStatus, param, option)
export const getClinicDetail = (param, option) => request.get(api.clinicDetail, param, option)
export const getClinicExampleImages = (param, option) => request.get(api.clinicExampleImages, param, option)
export const getMyStatus = (param, option) => request.get(api.getMyStatus, param, option)
export const getCaptcha = () => request.get(api.getCaptcha, {}, { load: false })
export const sendSmsCaptcha = (data) => request.post(api.sendSmsCaptcha, data, { load: false })
export const changeUserInfo = (data) => request.post(api.changeUserInfo, data)
export const changeName = (data) => request.post(api.changeName, data)
export const setReplacePhone = (data) => request.post(api.setReplacePhone, data)
export const changePassword = (data) => request.post(api.changePassword, data)
