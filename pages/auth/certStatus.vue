<template>
  <view class="container">
    <!-- 页面头部 -->
    <view class="custom-nav">
      <text class="title">审核状态</text>
    </view>

    <!-- 状态展示区域 -->
    <view class="status-card">
      <!-- 待审核 -->
      <view v-if="auditStatus === 'pending'" class="status-pending">
        <view class="status-icon">
          <text class="icon">⏳</text>
        </view>
        <text class="status-text">您的资质正在审核中</text>
        <text class="status-desc">我们会在1-3个工作日内完成审核，请耐心等待</text>
      </view>

      <!-- 审核通过 -->
      <view v-else-if="auditStatus === 'approved'" class="status-approved">
        <view class="status-icon">
          <text class="icon">✅</text>
        </view>
        <text class="status-text">资质审核通过</text>
        <text class="status-desc">恭喜您，资质审核已通过！</text>
      </view>

      <!-- 审核不通过 -->
      <view v-else-if="auditStatus === 'rejected'" class="status-rejected">
        <view class="status-icon">
          <text class="icon">❌</text>
        </view>
        <text class="status-text">资质审核不通过</text>
        <text class="status-desc">审核不通过原因：</text>
        <text class="reject-reason">{{ auditReason }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button 
        v-if="auditStatus === 'rejected'" 
        @click="reuploadCert" 
        class="action-btn reupload"
      >
        重新上传资质
      </button>
      
      <button 
        @click="goToHome" 
        class="action-btn primary"
      >
        {{ auditStatus === 'rejected' ? '返回首页' : '前往首页' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      auditStatus: 'pending', // 审核状态：pending(待审核)/approved(通过)/rejected(不通过)
      auditReason: '' // 审核不通过原因
    }
  },

  onLoad(options) {
    // 读取本地缓存的审核状态（实际项目从后端接口获取）
    const auditStatus = uni.getStorageSync('auditStatus') || 'pending'
    const auditReason = uni.getStorageSync('auditReason') || ''
    
    this.auditStatus = auditStatus
    this.auditReason = auditReason
  },

  methods: {
    // 重新上传资质（跳回上传页）
    reuploadCert() {
      uni.navigateTo({ url: '/pages/auth/certUpload' })
    },

    // 前往首页
    goToHome() {
      uni.setStorageSync('hasAuth', true) // 标记已认证
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.custom-nav {
  text-align: center;
  padding: 20rpx 0;
  background-color: white;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.status-card {
  background-color: white;
  border-radius: 10rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.status-icon {
  margin-bottom: 30rpx;
}

.icon {
  font-size: 100rpx;
}

.status-text {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.status-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.reject-reason {
  display: block;
  font-size: 28rpx;
  color: #ff6b6b;
  background-color: #fff5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-top: 20rpx;
}

.status-pending .status-text {
  color: #ff9500;
}

.status-approved .status-text {
  color: #34c759;
}

.status-rejected .status-text {
  color: #ff3b30;
}

.action-buttons {
  padding: 0 40rpx;
}

.action-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #007aff;
  color: white;
}

.action-btn.reupload {
  background-color: #ff9500;
  color: white;
}
</style>

