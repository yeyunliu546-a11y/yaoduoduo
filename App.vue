<script>
const AUDIT_WHITE_LIST = [
  '/pages/login/index',
  '/pages/login/agreement',
  '/pages/auth/certUpload',
  '/pages/auth/certStatus',
  '/pages/user/user',
  '/pages/user/personal/index',
  '/pages/help/index'
]

const GOODS_RESTRICTED_ROUTES = [
  '/pages/index/index',
  '/pages/category/category',
  '/pages/search/search',
  '/pages/good/detail',
  '/pages/good/brand-detail',
  '/pages/cart/cart'
]

let routeGuardInited = false
let auditRedirecting = false
let loginRedirecting = false

function normalizeAuditStatus(value) {
  const status = Number(value)
  return Number.isNaN(status) ? -99 : status
}

function getAuditSnapshot() {
  return {
    token: uni.getStorageSync('token'),
    hasClinicProfile: !!uni.getStorageSync('hasClinicProfile'),
    auditStatus: normalizeAuditStatus(uni.getStorageSync('clinicAuditStatus')),
    canOrder: !!uni.getStorageSync('canOrder')
  }
}

function getAuditRedirectUrl(snapshot = getAuditSnapshot()) {
  if (snapshot.auditStatus === 0 || snapshot.auditStatus === -1 || snapshot.hasClinicProfile) {
    return '/pages/auth/certStatus'
  }
  return '/pages/auth/certUpload'
}

function isWhiteRoute(url = '') {
  return AUDIT_WHITE_LIST.some(item => url.startsWith(item))
}

function isRestrictedRoute(url = '') {
  return GOODS_RESTRICTED_ROUTES.some(item => url.startsWith(item))
}

function canViewGoods(snapshot = getAuditSnapshot()) {
  return !!snapshot.token && (snapshot.auditStatus === 1 || snapshot.canOrder)
}

function redirectToLogin() {
  if (loginRedirecting) {
    return
  }

  loginRedirecting = true
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' })
    loginRedirecting = false
  }, 30)
}

function ensureAuditRouteAccess(url = '') {
  const cleanUrl = (url || '').split('?')[0]
  const snapshot = getAuditSnapshot()

  if (!snapshot.token) {
    if (cleanUrl && !isWhiteRoute(cleanUrl)) {
      redirectToLogin()
      return false
    }
    return true
  }

  if (canViewGoods(snapshot)) {
    return true
  }

  if (!isRestrictedRoute(cleanUrl)) {
    return true
  }

  if (auditRedirecting) {
    return false
  }

  auditRedirecting = true
  uni.showToast({ title: '资质审核通过后才可查看商品和价格', icon: 'none' })

  setTimeout(() => {
    uni.reLaunch({ url: getAuditRedirectUrl(snapshot) })
    auditRedirecting = false
  }, 300)

  return false
}

export default {
  onLaunch() {
    this.initRouteGuard()
    this.handleInitialGuard()
  },
  onShow() {
    this.handleInitialGuard()
  },
  methods: {
    initRouteGuard() {
      if (routeGuardInited) return
      routeGuardInited = true

      ;['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].forEach(method => {
        uni.addInterceptor(method, {
          invoke: (args) => ensureAuditRouteAccess(args.url || '')
        })
      })
    },

    handleInitialGuard() {
      try {
        const guardCurrentRoute = () => {
          const token = uni.getStorageSync('token')
          const pages = getCurrentPages()
          const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : ''

          if (!currentRoute) {
            return
          }

          if (!token) {
            if (!isWhiteRoute(currentRoute)) {
              redirectToLogin()
            }
            return
          }

          if (!isWhiteRoute(currentRoute)) {
            ensureAuditRouteAccess(currentRoute)
          }
        }

        guardCurrentRoute()
        setTimeout(guardCurrentRoute, 80)
      } catch (e) {
        console.error('全局资质拦截异常', e)
      }
    }
  }
}
</script>

<style lang="scss">
@import "@/uview-ui/index.scss";
@import "/static/iconfont/iconfont.scss";

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

image {
  display: block;
}
</style>
