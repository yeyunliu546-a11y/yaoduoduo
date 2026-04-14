<template>
  <view class="container">
    <view class="custom-nav">
      <text class="title">审核状态</text>
    </view>

    <view class="status-card">
      <view v-if="auditStatus === 0" class="status-pending">
        <view class="status-icon"><text class="icon">⏳</text></view>
        <text class="status-text">您的资质正在审核中</text>
        <text class="status-desc">我们会在 1-3 个工作日内完成审核，请耐心等待</text>
      </view>

      <view v-else-if="auditStatus === -1" class="status-rejected">
        <view class="status-icon"><text class="icon">✕</text></view>
        <text class="status-text">资质审核未通过</text>
        <text class="status-desc">审核未通过原因：</text>
        <text class="reject-reason">{{ auditReason || '资料不符合要求，请修改后重新提交' }}</text>
      </view>

      <view v-else-if="auditStatus === 1" class="status-approved">
        <view class="status-icon"><text class="icon">✓</text></view>
        <text class="status-text">资质审核已通过</text>
        <text class="status-desc">正在为您跳转到首页...</text>
      </view>
    </view>

    <view class="action-buttons">
      <button v-if="auditStatus === -1" @click="reuploadCert" class="action-btn reupload">重新上传资质</button>
      <button v-if="auditStatus === 0" @click="refreshStatus" class="action-btn primary">刷新审核状态</button>
      <button @click="handleLogout" class="action-btn plain">退出当前账号</button>
    </view>
  </view>
</template>

<script>
import { getClinicStatus, getClinicDetail } from '@/api/user/user.js'

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

function getResult(payload = {}) {
  return pickFirst(payload.Result, payload.result)
}

function normalizeAuditState(statusRes = {}, detailRes = {}) {
  const hasSubmitted = !!pickFirst(
    statusRes.HasSubmitted,
    statusRes.hasSubmitted,
    statusRes.HasClinicProfile,
    statusRes.hasClinicProfile,
    uni.getStorageSync('hasClinicProfile')
  )

  const status = Number(pickFirst(
    statusRes.AuditStatus,
    statusRes.auditStatus,
    statusRes.ClinicAuditStatus,
    statusRes.clinicAuditStatus,
    detailRes.AuditStatus,
    detailRes.auditStatus,
    detailRes.ClinicAuditStatus,
    detailRes.clinicAuditStatus,
    -99
  ))

  const finalStatus = Number.isNaN(status) ? -99 : status
  const remark = pickFirst(
    statusRes.AuditRemark,
    statusRes.auditRemark,
    detailRes.AuditRemark,
    detailRes.auditRemark,
    ''
  )
  const clinicName = pickFirst(
    detailRes.ClinicName,
    detailRes.clinicName,
    uni.getStorageSync('clinicName'),
    ''
  )

  uni.setStorageSync('clinicAuditStatus', finalStatus)
  uni.setStorageSync('clinicAuditRemark', remark)
  uni.setStorageSync('hasClinicProfile', hasSubmitted)
  uni.setStorageSync('clinicName', clinicName)

  const userInfo = uni.getStorageSync('user_info') || {}
  uni.setStorageSync('user_info', {
    ...userInfo,
    ...statusRes,
    ...detailRes,
    HasClinicProfile: hasSubmitted,
    ClinicAuditStatus: finalStatus,
    AuditRemark: remark,
    ClinicName: clinicName
  })

  return {
    hasSubmitted,
    status: finalStatus,
    remark
  }
}

export default {
  data() {
    return {
      auditStatus: 0,
      auditReason: ''
    }
  },
  onShow() {
    this.loadAuditStatus()
  },
  methods: {
    async loadAuditStatus() {
      uni.showLoading({ title: '查询中...' })

      try {
        const statusRes = await getClinicStatus({}, { load: false })
        const statusCode = getCode(statusRes)
        const statusData = statusCode === 200 ? (getResult(statusRes) || {}) : {}

        let detailData = {}
        if (statusData.HasSubmitted || statusData.hasSubmitted || statusData.AuditStatus !== undefined || statusData.auditStatus !== undefined) {
          try {
            const detailRes = await getClinicDetail({}, { load: false })
            const detailCode = getCode(detailRes)
            detailData = detailCode === 200 ? (getResult(detailRes) || {}) : {}
          } catch (e) {
            detailData = {}
          }
        }

        uni.hideLoading()

        const auditState = normalizeAuditState(statusData, detailData)

        if (!auditState.hasSubmitted || auditState.status === -99) {
          uni.redirectTo({ url: '/pages/auth/certUpload' })
          return
        }

        this.auditStatus = auditState.status
        this.auditReason = auditState.remark

        if (auditState.status === 1) {
          uni.showToast({ title: '审核已通过', icon: 'success' })
          setTimeout(() => {
            this.goToHome()
          }, 1200)
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络异常', icon: 'none' })
      }
    },

    reuploadCert() {
      uni.redirectTo({ url: '/pages/auth/certUpload?status=-1' })
    },

    refreshStatus() {
      this.loadAuditStatus()
    },

    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.$store.dispatch('Logout').then(() => {
              uni.reLaunch({ url: '/pages/login/index' })
            })
          }
        }
      })
    },

    goToHome() {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style>
.container { padding: 20rpx; background-color: #f5f5f5; min-height: 100vh; }
.custom-nav { text-align: center; padding: 20rpx 0; background-color: white; margin-bottom: 20rpx; }
.title { font-size: 36rpx; font-weight: bold; }
.status-card { background-color: white; border-radius: 10rpx; padding: 60rpx 40rpx; text-align: center; margin-bottom: 40rpx; }
.status-icon { margin-bottom: 30rpx; }
.icon { font-size: 100rpx; }
.status-text { display: block; font-size: 36rpx; font-weight: bold; margin-bottom: 20rpx; }
.status-desc { display: block; font-size: 28rpx; color: #666; margin-bottom: 20rpx; }
.reject-reason { display: block; font-size: 28rpx; color: #ff6b6b; background-color: #fff5f5; padding: 20rpx; border-radius: 8rpx; margin-top: 20rpx; }
.status-pending .status-text { color: #ff9500; }
.status-approved .status-text { color: #34c759; }
.status-rejected .status-text { color: #ff3b30; }
.action-buttons { padding: 0 40rpx; }
.action-btn { width: 100%; height: 88rpx; line-height: 88rpx; border-radius: 44rpx; margin-bottom: 30rpx; font-size: 30rpx; font-weight: bold; }
.action-btn.primary { background-color: #2979ff; color: white; }
.action-btn.reupload { background-color: #ff9500; color: white; }
.action-btn.plain { background-color: #ffffff; color: #666; border: 1px solid #dcdfe6; }
.action-btn.plain::after { border: none; }
</style>
