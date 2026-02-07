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
      
      // 图形验证码字段
      captchaCode: '',      
      captchaBase64: '',    
      captchaId: '',        
      
      smsVerifyCodeId: '', 
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
          let base64 = res.result.base64Str;
          if (!base64.startsWith('data:image')) {
            base64 = 'data:image/png;base64,' + base64;
          }
          this.captchaBase64 = base64;
          this.captchaId = res.result.verifyCodeId;
        }
      } catch (e) {
        console.error('获取验证码失败', e);
      }
    },

    toggleLoginMode() {
      this.loginMode = this.loginMode === 'sms' ? 'password' : 'sms';
      if (this.loginMode === 'password') {
        this.refreshCaptcha();
      }
    },

    // ----------------------------------------------------
        // 1. 微信一键登录 (修正版：直接登录，自动注册)
        // ----------------------------------------------------
        wechatLogin() {
          // #ifdef MP-WEIXIN
          uni.showLoading({ title: '正在登录...' });
          
          // 1. 获取微信 Code
          uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
              console.log('微信 loginRes:', loginRes); 
              
              if (loginRes.code) {
                try {
                  // 2. 构造参数 (只需 Code 和 InviteCode)
                  const params = {
                    WxCode: loginRes.code,
                    InviteCode: '' 
                  };
                  
                  console.log('调用后端登录:', params);
    
                  // 3. 调用后端接口
                  const res = await apiAuth.loginByWechat(params);
                  console.log('后端响应:', res);
    
                  // 4. 处理结果
                  this.processLoginResult(res);
                  
                } catch (err) {
                  uni.hideLoading();
                  console.error('API调用失败:', err);
                  uni.showToast({ title: '登录请求失败', icon: 'none' });
                }
              } else {
                uni.hideLoading();
                uni.showToast({ title: '获取微信Code失败', icon: 'none' });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              console.error('uni.login 失败:', err);
              uni.showToast({ title: '无法连接微信', icon: 'none' });
            }
          });
          // #endif
          
          // #ifndef MP-WEIXIN
          uni.showToast({ title: '请在微信小程序中测试', icon: 'none' });
          // #endif
        },
    // ----------------------------------------------------
    // 2. 发送短信
    // ----------------------------------------------------
    async handleSendSms() {
      if (!this.canSend) return;
      try {
        this.isSending = true;
        const res = await apiAuth.sendSmsCode({ 
            Mobile: this.mobile, 
            Type: 'Login' 
        });

        if (res.code === 200) {
            uni.showToast({ title: '发送成功', icon: 'success' });
            if (res.result && res.result.smsVerifyCodeId) {
                this.smsVerifyCodeId = res.result.smsVerifyCodeId;
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
            uni.showToast({ title: res.message || '发送失败', icon: 'none' });
        }
      } catch (e) {
        this.isSending = false;
      }
    },

    // ----------------------------------------------------
    // 3. 账号/短信登录
    // ----------------------------------------------------
    async handleLogin() {
      if (!this.mobile) return uni.showToast({ title: '请输入账号', icon: 'none' });
      
      uni.showLoading({ title: '登录中...' });
      
      try {
        let res;
        if (this.loginMode === 'sms') {
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
           if (!this.password) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入密码', icon: 'none' });
           }
           if (!this.captchaCode || !this.captchaId) {
               uni.hideLoading();
               return uni.showToast({ title: '请输入图形验证码', icon: 'none' });
           }

           // 使用 MP-WEIXIN
           res = await apiAuth.loginByPassword({ 
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
        if (this.loginMode === 'password') this.refreshCaptcha(); // 失败刷新验证码
        
        // 提取错误信息
        let msg = '登录失败';
        if (err.data && err.data.message) msg = err.data.message;
        else if (err.message) msg = err.message;
        
        uni.showToast({ title: msg, icon: 'none' });
      }
    },

    // ----------------------------------------------------
    // 结果处理 & 跳转
    // ----------------------------------------------------
    processLoginResult(res) {
        uni.hideLoading();
        
        // 只要有 token 就算成功
        if (res.code === 200 && res.result && res.result.token) {
            const data = res.result;
            
            uni.setStorageSync('token', data.token);
            uni.setStorageSync('user_info', data.userInfo || data);
            
            uni.showToast({ title: '登录成功', icon: 'success' });
            
            // 延迟跳转
            setTimeout(() => {
                const status = data.clinicAuditStatus;
                // -99: 未提交资质
                if (status === -99) {
                    uni.navigateTo({ url: '/pages/auth/certUpload' });
                } 
                // 0: 待审核
                else if (status === 0) {
                    uni.navigateTo({ url: '/pages/auth/certStatus' });
                } 
                // -1: 拒绝
                else if (status === -1) {
                    uni.navigateTo({ url: '/pages/auth/certUpload?status=-1' });
                } 
                // 1: 通过 (或其它状态) -> 首页
                else {
                    uni.switchTab({ url: '/pages/index/index' });
                }
            }, 1000);
            
        } else {
            // 处理业务失败 (如 code 500)
            uni.showToast({ title: res.message || '登录失败', icon: 'none' });
            if (this.loginMode === 'password') this.refreshCaptcha();
        }
    },

    skipLogin() {
      uni.switchTab({ url: '/pages/index/index' });
    }
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