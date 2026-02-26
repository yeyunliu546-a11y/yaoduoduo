<template>
  <view class="login-container">
    <view class="top-bg"></view>
    
    <view class="header">
      <text class="title">药多多线上平台</text>
      <text class="subtitle">欢迎登录，{{ loginMode === 'sms' ? '请进行手机验证' : '请输入账号和密码' }}</text>
    </view>

    <view class="form-box">
      <view class="input-group">
        <u-icon name="account" color="#c0c4cc" size="40" class="input-icon"></u-icon>
        <input 
          v-model="mobile" 
          type="text"
          :placeholder="loginMode === 'sms' ? '请输入手机号码' : '请输入账号/手机号'"
          class="input-box"
          placeholder-class="placeholder"
        />
      </view>

      <view v-if="loginMode === 'sms'" class="input-group">
        <u-icon name="lock" color="#c0c4cc" size="40" class="input-icon"></u-icon>
        <input 
          v-model="smsCode" 
          type="number"
          maxlength="6"
          placeholder="请输入短信验证码"
          class="input-box"
          placeholder-class="placeholder"
        />
        <view class="sms-btn" :class="{ 'disabled': isSending || !canSend }" @click="handleSendSms">
          {{ isSending ? `${countdown}s后重发` : '获取验证码' }}
        </view>
      </view>

      <block v-else>
        <view class="input-group">
          <u-icon name="lock" color="#c0c4cc" size="40" class="input-icon"></u-icon>
          <input 
            v-model="password" 
            type="password"
            placeholder="请输入密码"
            class="input-box"
            placeholder-class="placeholder"
          />
        </view>
        
        <view class="input-group">
          <u-icon name="photo" color="#c0c4cc" size="40" class="input-icon"></u-icon>
          <input 
            v-model="captchaCode" 
            placeholder="请输入图形验证码"
            class="input-box"
            placeholder-class="placeholder"
          />
          <image 
            :src="captchaBase64" 
            class="captcha-img" 
            mode="aspectFit"
            @click="refreshCaptcha"
          />
        </view>
        <view class="captcha-tip" @click="refreshCaptcha">看不清？点击换一张</view>
      </block>

      <button class="primary-btn" hover-class="btn-hover" @click="handleLogin">
        {{ loginMode === 'sms' ? '验证码登录' : '密 码 登 录' }}
      </button>

      <view class="divider-box">
        <text class="line"></text>
        <text class="text">或者</text>
        <text class="line"></text>
      </view>

      <button class="wechat-login-btn" hover-class="btn-hover" @click="wechatLogin">
        <u-icon name="weixin-fill" color="#ffffff" size="44"></u-icon>
        <text class="text">微信一键登录</text>
      </button>

      <view class="action-row">
        <text class="toggle-mode" @click="toggleLoginMode">
          {{ loginMode === 'sms' ? '切换为账号密码登录' : '切换为手机验证码登录' }}
        </text>
      </view>
    </view>

    <view class="footer-area">
      <view class="service-tip" @click="showService = true">
        遇到问题？<text class="link">联系客服</text>
      </view>
    </view>

    <u-action-sheet 
      :list="serviceList" 
      v-model="showService" 
      @click="handleServiceClick"
      border-radius="24"
      cancel-text="取消"
    ></u-action-sheet>

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
      
      // 图形验证码字段
      captchaCode: '',      
      captchaBase64: '',    
      captchaId: '',        
      
      smsVerifyCodeId: '', 
      isSending: false,
      countdown: 60,

      // --- 客服组件相关数据 ---
      showService: false,
      serviceList: [
        { text: '在线客服 (工作日 9:00-18:00)', subText: '解答您的操作疑问' },
        { text: '拨打热线电话: 400-XXX-XXXX', color: '#2979ff' } // TODO: 修改为真实的客服电话
      ]
    }
  },
  computed: {
    canSend() {
      // 简单校验手机号
      return /^1[3-9]\d{9}$/.test(this.mobile)
    }
  },
  onLoad() {
    // 如果默认是密码登录，需要加载图形验证码
    if (this.loginMode === 'password') {
      this.refreshCaptcha();
    }
  },
  methods: {
    // ----------------------------------------------------
    // 客服列表点击处理
    // ----------------------------------------------------
    handleServiceClick(index) {
        if (index === 0) {
            // 在线客服逻辑 (可调整为跳转在线聊天页面)
            uni.showToast({ title: '请在小程序“我的”页面联系在线客服', icon: 'none' });
        } else if (index === 1) {
            // 拨打电话
            uni.makePhoneCall({
                phoneNumber: '400-123-4567' // TODO: 替换为实际客服电话
            });
        }
    },

    // 刷新/获取图形验证码
    async refreshCaptcha() {
      try {
        const res = await apiAuth.getImageCaptcha();
        // 兼容大小写
        const result = res.Result || res.result; 
        if (res.Code === 200 || res.code === 200) {
          let base64 = result.Base64Str || result.base64Str;
          if (!base64.startsWith('data:image')) {
            base64 = 'data:image/png;base64,' + base64;
          }
          this.captchaBase64 = base64;
          this.captchaId = result.VerifyCodeId || result.verifyCodeId;
        }
      } catch (e) {
        console.error('获取验证码失败', e);
        uni.showToast({ title: '验证码获取失败', icon: 'none' });
      }
    },

    toggleLoginMode() {
      this.loginMode = this.loginMode === 'sms' ? 'password' : 'sms';
      if (this.loginMode === 'password') {
        this.refreshCaptcha();
      }
    },

    // ----------------------------------------------------
    // 1. 微信一键登录
    // ----------------------------------------------------
    wechatLogin() {
      // #ifdef MP-WEIXIN
      uni.showLoading({ title: '正在拉起微信授权' });
      
      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          if (loginRes.code) {
            try {
              const res = await this.$store.dispatch('LoginByWechat', {
                WxCode: loginRes.code,
                InviteCode: '',
                AppKey: 'MP-WEIXIN' 
              });
              this.processLoginResult(res);
            } catch (err) {
              uni.hideLoading();
              console.error('登录API失败:', err);
              uni.showToast({ title: err.Message || '登录请求失败', icon: 'none' });
            }
          } else {
            uni.hideLoading();
            uni.showToast({ title: '获取微信Code失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: '无法连接微信', icon: 'none' });
        }
      });
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在微信小程序中测试该功能', icon: 'none' });
      // #endif
    },

    // ----------------------------------------------------
    // 2. 发送短信
    // ----------------------------------------------------
    async handleSendSms() {
      if (!this.canSend) return uni.showToast({ title: '手机号格式不正确', icon: 'none' });
      
      try {
        this.isSending = true;
        const res = await apiAuth.sendSmsCode({ 
            Mobile: this.mobile
        });

        const result = res.Result || res.result;

        if (res.Code === 200 || res.code === 200) {
            uni.showToast({ title: '发送成功', icon: 'success' });
            if (result && result.SmsVerifyCodeId) {
                this.smsVerifyCodeId = result.SmsVerifyCodeId;
            } else if (result && result.smsVerifyCodeId) {
                this.smsVerifyCodeId = result.smsVerifyCodeId;
            }
            
            let timer = setInterval(() => {
                this.countdown--;
                if (this.countdown <= 0) {
                    clearInterval(timer);
                    this.isSending = false;
                    this.countdown = 60;
                }
            }, 1000);
        } else {
            this.isSending = false;
            uni.showToast({ title: res.Message || res.message || '发送失败', icon: 'none' });
        }
      } catch (e) {
        this.isSending = false;
        console.error(e);
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // ----------------------------------------------------
    // 3. 账号/短信登录
    // ----------------------------------------------------
    async handleLogin() {
      if (!this.mobile) return uni.showToast({ title: '请输入账号/手机号', icon: 'none' });
      
      uni.showLoading({ title: '登录中...' });
      
      try {
        let res;
        if (this.loginMode === 'sms') {
           if (!this.smsCode) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入验证码', icon: 'none' });
           }
           res = await this.$store.dispatch('LoginByPhone', { 
               Mobile: this.mobile, 
               SmsCode: this.smsCode,
               SmsVerifyCodeId: this.smsVerifyCodeId
           });
        } else {
           if (!this.password) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入密码', icon: 'none' });
           }
           if (!this.captchaCode || !this.captchaId) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入图形验证码', icon: 'none' });
           }

           res = await this.$store.dispatch('LoginByPassword', { 
               AppKey: 'MP-WEIXIN', 
               Account: this.mobile,  
               Password: this.password, 
               VerifyCodeId: this.captchaId,
               VerifyCode: this.captchaCode
           });
        }

        this.processLoginResult(res);

      } catch (err) {
        uni.hideLoading();
        console.error('登录异常', err);
        if (this.loginMode === 'password') this.refreshCaptcha(); 
        
        let msg = err.Message || err.message || '登录失败';
        uni.showToast({ title: msg, icon: 'none' });
      }
    },

    // ----------------------------------------------------
    // 4. 结果处理 & 智能跳转 (核心逻辑)
    // ----------------------------------------------------
    processLoginResult(res) {
        uni.hideLoading();
        
        const code = res.Code !== undefined ? res.Code : res.code;
        const result = res.Result || res.result;

        if (code === 200 && result) {
            uni.showToast({ title: '登录成功', icon: 'success' });
            
            const hasProfile = result.HasClinicProfile !== undefined ? result.HasClinicProfile : result.hasClinicProfile;
            const status = result.ClinicAuditStatus !== undefined ? result.ClinicAuditStatus : result.clinicAuditStatus;
            const remark = result.AuditRemark || result.auditRemark || '';

            setTimeout(() => {
                if (!hasProfile || status === -99) {
                    uni.showModal({
                        title: '提示',
                        content: '请先完善诊所资料才能下单',
                        showCancel: false,
                        confirmText: '去填写',
                        success: () => {
                            uni.redirectTo({ url: '/pages/auth/certUpload' });
                        }
                    });
                }
                else if (status === -1) {
                    uni.showModal({
                        title: '审核未通过',
                        content: remark ? `原因：${remark}` : '请修改资料后重新提交',
                        showCancel: false,
                        confirmText: '去修改',
                        success: () => {
                            uni.redirectTo({ url: '/pages/auth/certUpload?status=-1' });
                        }
                    });
                }
                else if (status === 0) {
                    uni.redirectTo({ url: '/pages/auth/certStatus' });
                }
                else {
                    uni.switchTab({ url: '/pages/index/index' });
                }
            }, 1000);
            
        } else {
            uni.showToast({ title: res.Message || '登录异常', icon: 'none' });
            if (this.loginMode === 'password') this.refreshCaptcha();
        }
    }
  }
}
</script>

<style lang="scss">
/* 强行接管整个页面的背景色 */
page {
  background-color: #ffffff;
  height: 100%;
}

.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶部装饰背景 */
.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 480rpx;
  background: linear-gradient(180deg, rgba(41, 121, 255, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
  z-index: 0;
}

/* 标题区 */
.header {
  position: relative;
  z-index: 1;
  margin-top: 180rpx; /* 避开状态栏 */
  margin-bottom: 80rpx;
  
  .title {
    font-size: 52rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
    letter-spacing: 2rpx;
  }
  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}

/* 核心表单区 */
.form-box {
  position: relative;
  z-index: 1;
}

.input-group {
  display: flex;
  align-items: center;
  height: 100rpx;
  background-color: #f6f7f9;
  border-radius: 50rpx;
  margin-bottom: 36rpx;
  padding: 0 30rpx;
  
  .input-icon {
    margin-right: 16rpx;
  }
  
  .input-box {
    flex: 1;
    font-size: 30rpx;
    color: #333;
    height: 100%;
  }
  
  .placeholder {
    color: #c0c4cc;
  }
  
  .sms-btn {
    font-size: 28rpx;
    color: #2979ff;
    padding-left: 20rpx;
    border-left: 1px solid #e4e7ed;
    height: 40rpx;
    line-height: 40rpx;
    
    &.disabled {
      color: #999;
    }
  }
  
  .captcha-img {
    width: 180rpx;
    height: 64rpx;
    border-radius: 32rpx;
    margin-left: 20rpx;
    background-color: #fff;
  }
}

.captcha-tip {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: -16rpx;
  margin-bottom: 30rpx;
  padding-right: 20rpx;
}

/* 主操作按钮 */
.primary-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #5b8ff9, #2979ff);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;
  box-shadow: 0 8rpx 20rpx rgba(41, 121, 255, 0.3);
  border: none;
  
  &::after { border: none; }
}

.btn-hover {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 分割线 */
.divider-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50rpx 0 10rpx;
  
  .line {
    flex: 1;
    height: 1px;
    background-color: #f0f0f0;
  }
  
  .text {
    font-size: 24rpx;
    color: #999;
    margin: 0 30rpx;
  }
}

/* 微信一键登录按钮 */
.wechat-login-btn {
  width: 100%;
  height: 96rpx;
  background-color: #07c160;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rpx;
  box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.3);
  border: none;
  
  .text {
    margin-left: 12rpx;
  }
  
  &::after { border: none; }
}

/* 账号切换区 */
.action-row {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  
  .toggle-mode {
    font-size: 28rpx;
    color: #666;
  }
}

/* 底部区域 */
.footer-area {
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom);
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
  
  .service-tip {
    text-align: center;
    font-size: 26rpx;
    color: #999;
    
    .link {
      color: #2979ff;
      margin-left: 8rpx;
      font-weight: bold;
    }
  }
}
</style>