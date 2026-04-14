import mockGoods from '@/mock/goods.js'

const URL_API = 'https://www.yaoduoduo.top'
const USE_MOCK = false
const mockData = { ...mockGoods }

const GOODS_API_PATTERNS = [
  /^\/api\/Goods\//i,
  /^\/api\/Cart\//i,
  /^\/api\/user\/prescription\/cart/i,
  /^\/api\/Order\/GetOrderSettlement$/i,
  /^\/api\/user\/prescription\/order\/settlement$/i
]

const AUTH_SYNC_API_PATTERNS = [
  /^\/api\/User\/Get$/i,
  /^\/api\/Clinic\/CheckStatus$/i,
  /^\/api\/Clinic\/GetMyClinicDetail$/i
]

let auditRedirecting = false

function pickFirst() {
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i]
    if (value !== undefined && value !== null) {
      return value
    }
  }
  return undefined
}

function getCode(payload = {}) {
  return pickFirst(payload.Code, payload.code)
}

function getMessage(payload = {}) {
  return pickFirst(payload.Message, payload.message, '请求失败')
}

function getResult(payload = {}) {
  return pickFirst(payload.Result, payload.result)
}

function normalizeAuditStatus(value) {
  const status = Number(value)
  return Number.isNaN(status) ? -99 : status
}

function syncAuditCache(payload = {}) {
  const auditStatus = normalizeAuditStatus(
    pickFirst(
      payload.ClinicAuditStatus,
      payload.clinicAuditStatus,
      payload.AuditStatus,
      payload.auditStatus,
      uni.getStorageSync('clinicAuditStatus')
    )
  )
  const rawHasClinicProfile = pickFirst(
    payload.HasClinicProfile,
    payload.hasClinicProfile,
    payload.HasSubmitted,
    payload.hasSubmitted
  )
  const hasClinicProfile = rawHasClinicProfile !== undefined ? !!rawHasClinicProfile : auditStatus !== -99
  const auditRemark = pickFirst(
    payload.AuditRemark,
    payload.auditRemark,
    uni.getStorageSync('clinicAuditRemark'),
    ''
  )
  const canOrder = !!pickFirst(
    payload.CanOrder,
    payload.canOrder,
    auditStatus === 1,
    uni.getStorageSync('canOrder')
  )
  const clinicName = pickFirst(
    payload.ClinicName,
    payload.clinicName,
    payload.OrganizationName,
    payload.organizationName,
    payload.OrgName,
    payload.orgName,
    payload.CompanyName,
    payload.companyName,
    uni.getStorageSync('clinicName'),
    ''
  )

  uni.setStorageSync('hasClinicProfile', hasClinicProfile)
  uni.setStorageSync('clinicAuditStatus', auditStatus)
  uni.setStorageSync('clinicAuditRemark', auditRemark)
  uni.setStorageSync('clinicName', clinicName)
  uni.setStorageSync('canOrder', canOrder)

  const userInfo = uni.getStorageSync('user_info') || {}
  uni.setStorageSync('user_info', {
    ...userInfo,
    ...payload,
    HasClinicProfile: hasClinicProfile,
    ClinicAuditStatus: auditStatus,
    AuditRemark: auditRemark,
    CanOrder: canOrder,
    ClinicName: clinicName
  })
}

function clearSessionCache() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('user_info')
  uni.removeStorageSync('hasClinicProfile')
  uni.removeStorageSync('clinicAuditStatus')
  uni.removeStorageSync('clinicAuditRemark')
  uni.removeStorageSync('clinicName')
  uni.removeStorageSync('canOrder')
}

function getAuditSnapshot() {
  return {
    token: uni.getStorageSync('token'),
    hasClinicProfile: !!uni.getStorageSync('hasClinicProfile'),
    auditStatus: normalizeAuditStatus(uni.getStorageSync('clinicAuditStatus')),
    canOrder: !!uni.getStorageSync('canOrder')
  }
}

function isAuditApproved(snapshot = getAuditSnapshot()) {
  return !!snapshot.token && (snapshot.auditStatus === 1 || snapshot.canOrder)
}

function isGoodsRequest(url = '') {
  return GOODS_API_PATTERNS.some(pattern => pattern.test(url))
}

function getAuditRedirectUrl(snapshot = getAuditSnapshot()) {
  if (snapshot.auditStatus === 0 || snapshot.auditStatus === -1 || snapshot.hasClinicProfile) {
    return '/pages/auth/certStatus'
  }
  return '/pages/auth/certUpload'
}

function redirectToAuditPage(snapshot = getAuditSnapshot(), message = '资质审核通过后才可查看商品和价格') {
  if (auditRedirecting) return

  auditRedirecting = true
  uni.showToast({ title: message, icon: 'none' })

  setTimeout(() => {
    const target = getAuditRedirectUrl(snapshot)
    const pages = getCurrentPages()
    const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : ''

    if (currentRoute !== target) {
      uni.reLaunch({ url: target })
    }

    auditRedirecting = false
  }, 300)
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    if (USE_MOCK) {
      const method = (options.method || 'GET').toUpperCase()
      const mockKey = `${method} ${options.url}`
      if (mockData[mockKey]) {
        setTimeout(() => resolve(mockData[mockKey](options.data || options.params)), 500)
        return
      }
    }

    const fullUrl = options.url.startsWith('http') ? options.url : URL_API + options.url
    const token = uni.getStorageSync('token')
    const storeId = uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945'
    const auditSnapshot = getAuditSnapshot()

    if (token && isGoodsRequest(options.url) && !isAuditApproved(auditSnapshot)) {
      redirectToAuditPage(auditSnapshot)
      reject({ code: 40301, message: '资质审核未通过，禁止查看商品和价格' })
      return
    }

    const headers = {
      'content-type': 'application/json',
      'X-Token': token || '',
      'platform': 'MP-WEIXIN',
      'storeId': storeId,
      ...options.header
    }

    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || options.params,
      header: headers,
      success: (res) => {
        const payload = res.data || {}
        const code = getCode(payload)
        const message = getMessage(payload)
        const result = getResult(payload)

        if (AUTH_SYNC_API_PATTERNS.some(pattern => pattern.test(options.url)) && result) {
          syncAuditCache(result)
        }

        if (res.statusCode === 200) {
          if (code === 50014 || code === 401) {
            clearSessionCache()
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/login/index' })
            }, 1200)
            reject(payload)
            return
          }

          resolve(payload)
          return
        }

        if (res.statusCode === 401) {
          uni.showToast({ title: '无权访问', icon: 'none' })
          reject(res)
          return
        }

        uni.showToast({ title: message || '服务器开小差了', icon: 'none' })
        reject(res)
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

request.get = (url, params, header = {}) => request({ url, method: 'GET', params, header })
request.post = (url, data, header = {}) => request({ url, method: 'POST', data, header })
request.put = (url, data, header = {}) => request({ url, method: 'PUT', data, header })
request.delete = (url, data, header = {}) => request({ url, method: 'DELETE', data, header })

export default request
