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
 

      <block v-if="loginMode === 'sms'">
        <view class="input-group">
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
      </block>

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
      </block>

      <view class="agreement-box">
        <view class="checkbox-wrap" @click="isAgree = !isAgree">
          <u-icon v-if="isAgree" name="checkmark-circle-fill" color="#2979ff" size="36"></u-icon>
          <view v-else class="circle-icon"></view>
        </view>
        <view class="agreement-text">
          <text @click="isAgree = !isAgree">我已仔细阅读并同意</text>
          <text class="link" @click.stop="goToAgreement('service')">《用户服务协议》</text>
          <text @click="isAgree = !isAgree">与</text>
          <text class="link" @click.stop="goToAgreement('privacy')">《隐私政策》</text>
        </view>
      </view>

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
import md5Module from '@/uview-ui/libs/function/md5.js';
export default {
  data() {
    return {
      loginMode: 'sms', // 'sms' | 'password'
      isAgree: false,
      
      mobile: '',
      smsCode: '',
      password: '',
      
      captchaCode: '',      
      captchaBase64: '',    
      captchaId: '',        
      
      smsVerifyCodeId: '', 
      isSending: false,
      countdown: 60,

      showService: false,
      serviceList: [
        { text: '在线客服 (工作日 9:00-18:00)', subText: '解答您的操作疑问' },
        { text: '拨打热线电话: 400-XXX-XXXX', color: '#2979ff' }
      ]
    }
  },
  computed: {
    canSend() {
      return /^1[3-9]\d{9}$/.test(this.mobile)
    }
  },
  onLoad() {
    // 🌟 统一处理：无论何种模式，进入页面一律加载图形验证码
    this.refreshCaptcha();
  },
  onShow() {
    const token = uni.getStorageSync('token');
    if (token) {
        const status = uni.getStorageSync('clinicAuditStatus');
        const hasProfile = uni.getStorageSync('hasClinicProfile');
        
        if (status === -99 || !hasProfile) {
            uni.reLaunch({ url: '/pages/auth/certUpload' });
            return;
        }
        if (status === 0 || status === -1) {
            uni.reLaunch({ url: '/pages/auth/certStatus' });
            return;
        }
    }
  },
  methods: {
    goToAgreement(type) {
      uni.navigateTo({
        url: `/pages/login/agreement?type=${type}` 
      });
    },

    handleServiceClick(index) {
        if (index === 0) {
            uni.showToast({ title: '请在小程序“我的”页面联系在线客服', icon: 'none' });
        } else if (index === 1) {
            uni.makePhoneCall({
                phoneNumber: '400-123-4567' 
            });
        }
    },

    async refreshCaptcha() {
      try {
        const res = await apiAuth.getImageCaptcha();
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
      this.captchaCode = ''; // 🌟 切换模式时清空已输入的图形码
      this.refreshCaptcha();
    },

    wechatLogin() {
      if (!this.isAgree) {
        return uni.showToast({ title: '请先仔细阅读并勾选同意下方协议', icon: 'none' });
      }

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

    async handleSendSms() {
          if (!this.canSend) return uni.showToast({ title: '手机号格式不正确', icon: 'none' });
          if (!this.captchaCode || !this.captchaId) {
              return uni.showToast({ title: '请先输入图形验证码', icon: 'none' });
          }
          
          try {
            this.isSending = true;
            const res = await apiAuth.sendSmsCode({ 
                Mobile: this.mobile,
                VerifyCodeId: this.captchaId,
                VerifyCode: this.captchaCode
            });
    
            // 兼容 Result 和 result，如果为空给个空对象防报错
            const result = res.Result || res.result || {};
    
            if (res.Code === 200 || res.code === 200) {
                
                // 🌟 核心兼容：把后端可能返回的所有大小写全抓一遍！
                const fetchedId = result.SmsVerifyCodeId || result.smsVerifyCodeId || result.VerifyCodeId || result.verifyCodeId;
                
                if (!fetchedId) {
                    console.error('致命异常：后端没有返回短信验证码ID', res);
                    this.isSending = false;
                    return uni.showToast({ title: '获取验证码异常，请重试', icon: 'none' });
                }
    
                // 赋值
                this.smsVerifyCodeId = fetchedId;
                uni.showToast({ title: '发送成功', icon: 'success' });
                
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
                this.refreshCaptcha();
                this.captchaCode = '';
            }
          } catch (e) {
            this.isSending = false;
            console.error(e);
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        },

    async handleLogin() {
      if (!this.isAgree) {
        return uni.showToast({ title: '请先仔细阅读并勾选同意下方协议', icon: 'none' });
      }

      if (!this.mobile) return uni.showToast({ title: '请输入账号/手机号', icon: 'none' });
      
      uni.showLoading({ title: '登录中...' });
      
      try {
              let res;
              if (this.loginMode === 'sms') {
                 // 🌟 第一道防线：强拦截！如果没有拿到 ID，说明用户没点获取或者获取失败，不准去调登录接口
                 if (!this.smsVerifyCodeId) {
                     uni.hideLoading();
                     return uni.showToast({ title: '请先点击获取短信验证码', icon: 'none' });
                 }
                 
                 if (!this.smsCode) {
                     uni.hideLoading();
                     return uni.showToast({ title: '请输入短信验证码', icon: 'none' });
                 }
                 
                 res = await this.$store.dispatch('LoginByPhone', { 
                     Mobile: this.mobile, 
                     SmsCode: this.smsCode,
                     
                     // 🌟 第二道防线：不管后端要大写还是小写，我们双管齐下全传过去！
                     SmsVerifyCodeId: this.smsVerifyCodeId,
                     smsVerifyCodeId: this.smsVerifyCodeId 
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
           
                      // 🌟 获取剥离出来的 MD5 函数
                      let safeMd5 = typeof md5Module === 'function' ? md5Module : (md5Module.md5 || md5Module.default || (uni.$u && uni.$u.md5));
                      
                      if (typeof safeMd5 !== 'function') {
                          uni.hideLoading();
                          return uni.showToast({ title: '加密模块异常', icon: 'none' });
                      }
           
                      // 🌟 把密码用 MD5 加密后再传给后端！
                      res = await this.$store.dispatch('LoginByPassword', { 
                          AppKey: 'MP-WEIXIN', 
                          Account: this.mobile,  
                          Password: safeMd5(this.password), // 👈 核心修改：加密了！
                          VerifyCodeId: this.captchaId,
                          VerifyCode: this.captchaCode
                      });
        }

        this.processLoginResult(res);

      } catch (err) {
        uni.hideLoading();
        console.error('登录异常', err);
        // 任何登录报错，强制刷新图形验证码
        this.refreshCaptcha(); 
        this.captchaCode = '';
        
        let msg = err.Message || err.message || '登录失败';
        uni.showToast({ title: msg, icon: 'none' });
      }
    },

    processLoginResult(res) {
        uni.hideLoading();
        
        const code = res.Code !== undefined ? res.Code : res.code;
        const result = res.Result || res.result;

        if (code === 200 && result) {
            uni.showToast({ title: '登录成功', icon: 'success' });
            
            const hasProfile = result.HasClinicProfile !== undefined ? result.HasClinicProfile : result.hasClinicProfile;
            const status = result.ClinicAuditStatus !== undefined ? result.ClinicAuditStatus : result.clinicAuditStatus;
            const remark = result.AuditRemark || result.auditRemark || '';

            uni.setStorageSync('clinicAuditStatus', status);
            uni.setStorageSync('clinicAuditRemark', remark);
            uni.setStorageSync('hasClinicProfile', hasProfile);

            setTimeout(() => {
                if (!hasProfile || status === -99) {
                    uni.showModal({
                        title: '提示',
                        content: '请先完善诊所资料才能进入系统',
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
            this.refreshCaptcha();
            this.captchaCode = '';
        }
    }
  }
}
</script>

<style lang="scss">
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

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 480rpx;
  background: linear-gradient(180deg, rgba(41, 121, 255, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
  z-index: 0;
}

.header {
  position: relative;
  z-index: 1;
  margin-top: 180rpx; 
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
  
  .input-icon { margin-right: 16rpx; }
  .input-box { flex: 1; font-size: 30rpx; color: #333; height: 100%; }
  .placeholder { color: #c0c4cc; }
  
  .sms-btn {
    font-size: 28rpx;
    color: #2979ff;
    padding-left: 20rpx;
    border-left: 1px solid #e4e7ed;
    height: 40rpx;
    line-height: 40rpx;
    &.disabled { color: #999; }
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

.agreement-box {
  display: flex;
  align-items: flex-start;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  padding: 0 10rpx;
  
  .checkbox-wrap {
    padding-right: 12rpx;
    padding-top: 4rpx;
    
    .circle-icon {
      width: 34rpx;
      height: 34rpx;
      border: 2rpx solid #c0c4cc;
      border-radius: 50%;
      box-sizing: border-box;
    }
  }
  
  .agreement-text {
    flex: 1;
    font-size: 24rpx;
    color: #999;
    line-height: 1.6;
    
    .link {
      color: #2979ff;
      display: inline;
    }
  }
}

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
  margin-top: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(41, 121, 255, 0.3);
  border: none;
  &::after { border: none; }
}

.btn-hover { opacity: 0.8; transform: scale(0.98); }

.divider-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50rpx 0 10rpx;
  .line { flex: 1; height: 1px; background-color: #f0f0f0; }
  .text { font-size: 24rpx; color: #999; margin: 0 30rpx; }
}

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
  .text { margin-left: 12rpx; }
  &::after { border: none; }
}

.action-row {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  .toggle-mode { font-size: 28rpx; color: #666; }
}

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
    .link { color: #2979ff; margin-left: 8rpx; font-weight: bold; }
  }
}
</style>