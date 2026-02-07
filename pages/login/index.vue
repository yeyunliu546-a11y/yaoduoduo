<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ loginMode === 'sms' ? '手机号登录' : '账号/手机号登录' }}</text>
      <text class="desc">建议使用微信一键登录</text>
    </view>

    <view class="form">
      <input 
        v-model="mobile" 
        type="text"
        :placeholder="loginMode === 'sms' ? '请输入手机号码' : '请输入账号/手机号'"
        class="input"
      />

      <view v-if="loginMode === 'sms'" class="sms-row">
        <input 
          v-model="smsCode" 
          placeholder="请输入短信验证码"
          class="input sms-input"
        />
        <button 
          :disabled="isSending || !canSend" 
          @click="handleSendSms"
          class="sms-btn"
        >
          {{ isSending ? `(${countdown}s)` : '获取验证码' }}
        </button>
      </view>

      <block v-else>
        <input 
          v-model="password" 
          type="password"
          placeholder="请输入密码"
          class="input"
        />
        
        <view class="captcha-row">
          <input 
            v-model="captchaCode" 
            placeholder="请输入右侧验证码"
            class="input captcha-input"
          />
          <image 
            :src="captchaBase64" 
            class="captcha-img" 
            mode="aspectFit"
            @click="refreshCaptcha"
          />
        </view>
        <view class="captcha-tip" @click="refreshCaptcha">看不清？点击图片换一张</view>
      </block>

      <button @click="handleLogin" class="login-btn">登录</button>
      
      <button @click="wechatLogin" class="wechat-login-btn">
        <image src="/static/wechat-icon.png" class="wechat-icon" /> 微信一键登录
      </button>
      <view @click="toggleLoginMode" class="toggle-mode">
        {{ loginMode === 'sms' ? '切换为账号密码登录' : '切换为验证码登录' }}
      </view>

      <view @click="skipLogin" class="skip">暂不登录</view>
    </view>
  </view>
</template>

<script>
import * as apiAuth from '@/api/login/login.js'

export default {
  data() {
    return {
      loginMode: 'sms', // 'sms' | 'password'
      
      mobile: '',
      smsCode: '',
      password: '',
      
      // 【新增】图形验证码字段
      captchaCode: '',      // 用户输入的验证码
      captchaBase64: '',    // 图片Base64
      captchaId: '',        // 验证码ID
      
      smsVerifyCodeId: '', // 短信ID
      isSending: false,
      countdown: 60
    }
  },
  computed: {
    canSend() {
      return /^1[3-9]\d{9}$/.test(this.mobile)
    }
  },
  methods: {
    // 刷新/获取图形验证码
    async refreshCaptcha() {
      try {
        const res = await apiAuth.getImageCaptcha();
        if (res.code === 200 && res.result) {
          // 处理 Base64 前缀 (如果后端没返回前缀，手动加上)
          let base64 = res.result.base64Str;
          if (!base64.startsWith('data:image')) {
            base64 = 'data:image/png;base64,' + base64;
          }
          
          this.captchaBase64 = base64;
          this.captchaId = res.result.verifyCodeId;
          
          // 如果是测试环境，后端可能会直接返回 Code，方便测试
          if (res.result.code) {
             console.log('测试环境验证码:', res.result.code);
             // this.captchaCode = res.result.code; // 可选：自动填充
          }
        }
      } catch (e) {
        console.error('获取验证码失败', e);
      }
    },

    toggleLoginMode() {
      this.loginMode = this.loginMode === 'sms' ? 'password' : 'sms';
      // 如果切到密码登录，加载验证码
      if (this.loginMode === 'password') {
        this.refreshCaptcha();
      }
    },

    // 登录逻辑
    async handleLogin() {
      if (!this.mobile) return uni.showToast({ title: '请输入账号', icon: 'none' });
      
      uni.showLoading({ title: '登录中...' });
      
      try {
        let res;
        
        if (this.loginMode === 'sms') {
           // ... 短信登录逻辑保持不变 ...
           if (!this.smsCode) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入验证码', icon: 'none' });
           }
           res = await apiAuth.loginByPhone({ 
               Mobile: this.mobile, 
               SmsCode: this.smsCode,
               SmsVerifyCodeId: this.smsVerifyCodeId
           });
        } else {
           // --- 密码登录逻辑 ---
           if (!this.password) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入密码', icon: 'none' });
           }
           // 【校验】必填的图形验证码
           if (!this.captchaCode || !this.captchaId) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入图形验证码', icon: 'none' });
           }

           // 调用接口，带上所有必填参数
           res = await apiAuth.loginByPassword({ 
               AppKey: 'AppAnchor',       // 必填
               Account: this.mobile,  // 必填
               Password: this.password, // 必填
               VerifyCodeId: this.captchaId, // 必填：验证码ID
               VerifyCode: this.captchaCode  // 必填：用户输入的答案
           });
        }

        this.processLoginResult(res);

      } catch (err) {
        uni.hideLoading();
        console.error('登录异常', err);
        // 如果失败，建议刷新一下验证码
        if (this.loginMode === 'password') this.refreshCaptcha();
        
        const msg = err.data?.message || '登录请求失败';
        uni.showToast({ title: msg, icon: 'none' });
      }
    },

    // ... 其他方法 (sendSms, wechatLogin, processLoginResult) 保持不变 ...
    
    // (为了完整性，这里简略保留 helper 方法)
    processLoginResult(res) {
        uni.hideLoading();
        if (res.code === 200 && res.result) {
            uni.setStorageSync('token', res.result.token);
            uni.setStorageSync('user_info', res.result);
            uni.showToast({ title: '登录成功', icon: 'success' });
            setTimeout(() => {
                const status = res.result.clinicAuditStatus;
                if (status === -99) uni.navigateTo({ url: '/pages/auth/certUpload' });
                else if (status === 0) uni.navigateTo({ url: '/pages/auth/certStatus' });
                else if (status === -1) uni.navigateTo({ url: '/pages/auth/certUpload?status=-1' });
                else uni.switchTab({ url: '/pages/index/index' });
            }, 1000);
        } else {
            uni.showToast({ title: res.message || '登录失败', icon: 'none' });
            if (this.loginMode === 'password') this.refreshCaptcha();
        }
    },
    
    // ... 微信登录等代码保持原样 ...
    wechatLogin() { /* ... */ },
    async handleSendSms() { /* ... */ },
    skipLogin() { uni.switchTab({ url: '/pages/index/index' }); }
  }
}
</script>

<style>
/* ... 原有样式保持不变 ... */
.container { padding: 40rpx; background-color: #f5f5f5; min-height: 100vh; }
.header { text-align: center; margin-bottom: 60rpx; }
.title { font-size: 36rpx; font-weight: bold; margin-bottom: 20rpx; display: block;}
.desc { font-size: 28rpx; color: #999; }
.input { width: 100%; height: 80rpx; border: 1px solid #ddd; border-radius: 8rpx; padding: 0 20rpx; margin-bottom: 30rpx; box-sizing: border-box; background: #fff; }
.sms-row { display: flex; gap: 20rpx; }
.sms-input { flex: 1; margin-bottom: 0; }
.sms-btn { height: 80rpx; line-height: 80rpx; background: #e0e0e0; color: #333; padding: 0 20rpx; font-size: 26rpx; }
.login-btn { width: 100%; height: 80rpx; background: #007aff; color: white; border-radius: 8rpx; margin-top: 40rpx; }
.toggle-mode { text-align: center; margin-top: 20rpx; color: #007aff; font-size: 28rpx; }
.wechat-login-btn { width: 100%; height: 80rpx; background: #07c160; color: white; border-radius: 8rpx; margin-top: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.wechat-icon { width: 36rpx; height: 36rpx; margin-right: 16rpx; }
.skip { text-align: center; margin-top: 40rpx; color: #007aff; }

/* 【新增】验证码样式 */
.captcha-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 10rpx; }
.captcha-input { flex: 1; margin-bottom: 0; }
.captcha-img { width: 200rpx; height: 80rpx; background-color: #fff; border: 1px solid #ddd; border-radius: 8rpx; }
.captcha-tip { font-size: 24rpx; color: #999; text-align: right; margin-bottom: 30rpx; }
</style>