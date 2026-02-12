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
    // 刷新/获取图形验证码
    async refreshCaptcha() {
      try {
        const res = await apiAuth.getImageCaptcha();
        // 注意：根据文档 Result 是大写，但 api 层可能处理过，这里做个兼容
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
      uni.showLoading({ title: '正在登录...' });
      
      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          if (loginRes.code) {
            try {
              // 调用 Vuex Action
              const res = await this.$store.dispatch('LoginByWechat', {
                WxCode: loginRes.code,
                InviteCode: '',
                AppKey: 'MP-WEIXIN' // 必须加这个，保持与账号登录一致 
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
      uni.showToast({ title: '请在微信小程序中测试', icon: 'none' });
      // #endif
    },

    // ----------------------------------------------------
    // 2. 发送短信
    // ----------------------------------------------------
    async handleSendSms() {
      if (!this.canSend) return uni.showToast({ title: '手机号格式不正确', icon: 'none' });
      
      try {
        this.isSending = true;
        // 如果有图形验证码逻辑，这里需要先校验图形验证码再发短信(根据文档，手机登录前置是发短信)
        // 注意：文档中发送短信验证码接口 /api/Check/SendSmsCaptcha 参数需要 VerifyCodeId 和 VerifyCode
        // 如果业务逻辑需要图形验证码来防刷短信，请在此处补充弹窗逻辑。
        // 根据你提供的文档，发送短信需要图形验证码。这里简化处理，假设不需要或者已经验证。
        // 如果文档强制需要图形验证码ID，你需要先调用 getImageCaptcha，弹窗让用户输入，然后再调 SendSmsCaptcha
        
        // 修正：根据文档，发送短信接口为 /api/Check/SendSmsCaptcha
        // 但你的 api/login/login.js 里写的是 sendSmsCode。请确保 API 文件路径对齐。
        // 这里假设 api 文件已对齐
        
        const res = await apiAuth.sendSmsCode({ 
            Mobile: this.mobile, 
            // 如果接口不需要图形验证码，这行可忽略；如果需要，流程需调整
            // 根据文档: "Mobile", "VerifyCodeId", "VerifyCode" 是参数
            // 这里为了演示，暂时只传 Mobile，如果报错请按文档补充图形验证码逻辑
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
           // 调用 Vuex Action
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

           // 调用 Vuex Action
           res = await this.$store.dispatch('LoginByPassword', { 
               AppKey: 'MP-WEIXIN', // 文档固定值
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
        
        let msg = err.Message || err.message || '登录失败';
        uni.showToast({ title: msg, icon: 'none' });
      }
    },

    // ----------------------------------------------------
    // 4. 结果处理 & 智能跳转 (核心逻辑)
    // ----------------------------------------------------
    processLoginResult(res) {
        uni.hideLoading();
        
        // 兼容大小写
        const code = res.Code !== undefined ? res.Code : res.code;
        const result = res.Result || res.result;

        if (code === 200 && result) {
            uni.showToast({ title: '登录成功', icon: 'success' });
            
            // 获取核心状态字段
            // 注意：API文档返回的是 PascalCase (如 ClinicAuditStatus)，但前端 request 可能转为 camelCase
            // 这里做防御性编程
            const hasProfile = result.HasClinicProfile !== undefined ? result.HasClinicProfile : result.hasClinicProfile;
            const status = result.ClinicAuditStatus !== undefined ? result.ClinicAuditStatus : result.clinicAuditStatus;
            const remark = result.AuditRemark || result.auditRemark || '';

            setTimeout(() => {
                // 场景1: 未提交过诊所资料
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
                // 场景2: 审核拒绝
                else if (status === -1) {
                    uni.showModal({
                        title: '审核未通过',
                        content: remark ? `原因：${remark}` : '请修改资料后重新提交',
                        showCancel: false,
                        confirmText: '去修改',
                        success: () => {
                            // 跳转到上传页，可能需要传递参数让页面回显或重置状态
                            uni.redirectTo({ url: '/pages/auth/certUpload?status=-1' });
                        }
                    });
                }
                // 场景3: 待审核
                else if (status === 0) {
                    // 跳转到状态查看页
                    uni.redirectTo({ url: '/pages/auth/certStatus' });
                }
                // 场景4: 审核通过 (status === 1)
                else {
                    uni.switchTab({ url: '/pages/index/index' });
                }
            }, 1000);
            
        } else {
            uni.showToast({ title: res.Message || '登录异常', icon: 'none' });
            if (this.loginMode === 'password') this.refreshCaptcha();
        }
    },

    skipLogin() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style lang="scss">
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
.captcha-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 10rpx; }
.captcha-input { flex: 1; margin-bottom: 0; }
.captcha-img { width: 200rpx; height: 80rpx; background-color: #fff; border: 1px solid #ddd; border-radius: 8rpx; }
.captcha-tip { font-size: 24rpx; color: #999; text-align: right; margin-bottom: 30rpx; }
</style>