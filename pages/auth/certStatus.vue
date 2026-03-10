<template>
  <view class="container">
    <view class="custom-nav">
      <text class="title">审核状态</text>
    </view>

    <view class="status-card">
      <view v-if="auditStatus === 0" class="status-pending">
        <view class="status-icon"><text class="icon">⏳</text></view>
        <text class="status-text">您的资质正在审核中</text>
        <text class="status-desc">我们会在1-3个工作日内完成审核，请耐心等待</text>
      </view>

      <view v-else-if="auditStatus === -1" class="status-rejected">
        <view class="status-icon"><text class="icon">❌</text></view>
        <text class="status-text">资质审核不通过</text>
        <text class="status-desc">审核不通过原因：</text>
        <text class="reject-reason">{{ auditReason || '资料不符合要求，请修改后重试' }}</text>
      </view>
      
      <view v-else-if="auditStatus === 1" class="status-approved">
        <view class="status-icon"><text class="icon">✅</text></view>
        <text class="status-text">资质审核通过</text>
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
// 引入获取最新用户详情的接口（需确保路径和方法名正确，参考了你的 user.vue）
import { getDetail } from '@/api/user/user.js'

export default {
  data() {
    return {
      auditStatus: 0, 
      auditReason: '' 
    }
  },
  onShow() {
    // 从本地读取登录时存入的真实状态
    this.auditStatus = uni.getStorageSync('clinicAuditStatus') || 0;
    this.auditReason = uni.getStorageSync('clinicAuditRemark') || '';
    
    // 如果已经通过，直接放行
    if (this.auditStatus === 1) {
        this.goToHome();
    }
  },
  methods: {
    reuploadCert() {
      uni.redirectTo({ url: '/pages/auth/certUpload?status=-1' })
    },
    
    // 🌟 主动向后端查询最新状态
    refreshStatus() {
      uni.showLoading({ title: '查询中...' });
      getDetail().then(res => {
        uni.hideLoading();
        if(res.code === 200 && res.result) {
          const status = res.result.ClinicAuditStatus !== undefined ? res.result.ClinicAuditStatus : res.result.clinicAuditStatus;
          const remark = res.result.AuditRemark || res.result.auditRemark || '';
          
          // 更新本地缓存和视图
          uni.setStorageSync('clinicAuditStatus', status);
          uni.setStorageSync('clinicAuditRemark', remark);
          this.auditStatus = status;
          this.auditReason = remark;
          
          if (status === 1) {
              uni.showToast({ title: '审核已通过！', icon: 'success' });
              setTimeout(() => { this.goToHome(); }, 1500);
          } else if (status === -1) {
              uni.showToast({ title: '审核被驳回', icon: 'none' });
          } else {
              uni.showToast({ title: '仍在审核中，请稍候', icon: 'none' });
          }
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({ title: '网络异常', icon: 'none' });
      });
    },

    // 未审核通过的人，不能干等着，给个退出登录的出口
    handleLogout() {
        uni.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if(res.confirm) {
                    this.$store.dispatch('Logout').then(() => {
                        uni.reLaunch({ url: '/pages/login/index' });
                    });
                }
            }
        });
    },

    goToHome() {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style>
/* 保持原有样式，新增 plain 按钮样式 */
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