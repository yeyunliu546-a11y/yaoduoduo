import {
  AccessToken,
  UserId
} from '@/store/mutation-types'
import storage from '@/utils/storage.js'
import * as apiLogin from '@/api/login/login.js'

const USER_INFO_KEY = 'user_info'
const CLINIC_AUDIT_STATUS_KEY = 'clinicAuditStatus'
const CLINIC_AUDIT_REMARK_KEY = 'clinicAuditRemark'
const HAS_CLINIC_PROFILE_KEY = 'hasClinicProfile'
const CLINIC_NAME_KEY = 'clinicName'
const CAN_ORDER_KEY = 'canOrder'

function pickFirst() {
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i]
    if (value !== undefined && value !== null) {
      return value
    }
  }
  return undefined
}

function normalizeUserInfo(raw = {}) {
  const auditStatus = Number(pickFirst(raw.ClinicAuditStatus, raw.clinicAuditStatus, -99))

  return {
    ...raw,
    token: pickFirst(raw.Token, raw.token, ''),
    userId: pickFirst(raw.UserId, raw.userId, null),
    hasClinicProfile: !!pickFirst(raw.HasClinicProfile, raw.hasClinicProfile, false),
    clinicAuditStatus: Number.isNaN(auditStatus) ? -99 : auditStatus,
    auditRemark: pickFirst(raw.AuditRemark, raw.auditRemark, ''),
    clinicName: pickFirst(
      raw.ClinicName,
      raw.clinicName,
      raw.OrganizationName,
      raw.organizationName,
      raw.OrgName,
      raw.orgName,
      raw.CompanyName,
      raw.companyName,
      ''
    )
  }
}

function persistUserInfo(raw = {}) {
  const normalized = normalizeUserInfo(raw)
  const expiryTime = 30 * 86400

  storage.set(USER_INFO_KEY, normalized, expiryTime)
  uni.setStorageSync(USER_INFO_KEY, normalized)
  uni.setStorageSync(CLINIC_AUDIT_STATUS_KEY, normalized.clinicAuditStatus)
  uni.setStorageSync(CLINIC_AUDIT_REMARK_KEY, normalized.auditRemark || '')
  uni.setStorageSync(HAS_CLINIC_PROFILE_KEY, normalized.hasClinicProfile)
  uni.setStorageSync(CLINIC_NAME_KEY, normalized.clinicName || '')

  return normalized
}

const user = {
  state: {
    token: '',
    userId: null,
    userInfo: {}
  },

  mutations: {
    SET_TOKEN: (state, value) => {
      state.token = value
    },
    SET_USER_ID: (state, value) => {
      state.userId = value
    },
    SET_USER_INFO: (state, value) => {
      state.userInfo = normalizeUserInfo(value || {})
    }
  },

  actions: {
    LoginSuccess({ commit }, loginResult) {
      const normalized = persistUserInfo(loginResult)
      const expiryTime = 30 * 86400

      storage.set(AccessToken, normalized.token, expiryTime)
      uni.setStorageSync('token', normalized.token)
      commit('SET_TOKEN', normalized.token)

      storage.set(UserId, normalized.userId, expiryTime)
      commit('SET_USER_ID', normalized.userId)

      commit('SET_USER_INFO', normalized)
    },

    SyncUserInfo({ commit }, userInfo) {
      const normalized = persistUserInfo(userInfo)
      commit('SET_USER_INFO', normalized)
      return normalized
    },

    LoginByPhone({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        apiLogin.loginByPhone(data).then(res => {
          const code = res.Code !== undefined ? res.Code : res.code
          const result = res.Result !== undefined ? res.Result : res.result
          if (code === 200) {
            dispatch('LoginSuccess', result || {})
            resolve(res)
          } else {
            reject(res)
          }
        }).catch(reject)
      })
    },

    LoginByPassword({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        apiLogin.loginByPassword(data).then(res => {
          const code = res.Code !== undefined ? res.Code : res.code
          const result = res.Result !== undefined ? res.Result : res.result
          if (code === 200) {
            dispatch('LoginSuccess', result || {})
            resolve(res)
          } else {
            reject(res)
          }
        }).catch(reject)
      })
    },

    LoginByWechat({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        apiLogin.loginByWechat(data).then(res => {
          const code = res.Code !== undefined ? res.Code : res.code
          const result = res.Result !== undefined ? res.Result : res.result
          if (code === 200) {
            dispatch('LoginSuccess', result || {})
            resolve(res)
          } else {
            reject(res)
          }
        }).catch(reject)
      })
    },

    Logout({ commit }) {
      return new Promise((resolve) => {
        storage.remove(UserId)
        storage.remove(AccessToken)
        storage.remove(USER_INFO_KEY)

        uni.removeStorageSync('token')
        uni.removeStorageSync(USER_INFO_KEY)
        uni.removeStorageSync(CLINIC_AUDIT_STATUS_KEY)
        uni.removeStorageSync(CLINIC_AUDIT_REMARK_KEY)
        uni.removeStorageSync(HAS_CLINIC_PROFILE_KEY)
        uni.removeStorageSync(CLINIC_NAME_KEY)
        uni.removeStorageSync(CAN_ORDER_KEY)

        commit('SET_TOKEN', '')
        commit('SET_USER_ID', null)
        commit('SET_USER_INFO', {})
        resolve()
      })
    }
  }
}

export default user
