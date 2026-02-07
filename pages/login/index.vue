<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ loginMode === 'sms' ? '手机号登录' : '账号/手机号登录' }}</text>
      <text class="desc" v-if="loginMode === 'sms'">未注册的手机号登录后将自动注册</text>
      <text class="desc" v-else>支持用户名或手机号登录</text>
    </view>

    <view class="form">
      <input 
        v-model="mobile" 
        type="text"
        :placeholder="loginMode === 'sms' ? '请输入手机号码' : '请输入账号或手机号'"
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
          @click="sendSmsCode"
          class="sms-btn"
        >
          {{ isSending ? `(${countdown}s)` : '获取验证码' }}
        </button>
      </view>

      <input 
        v-else
        v-model="smsCode" 
        type="password"
        placeholder="请输入密码"
        class="input"
      />

      <button @click="handleLogin" class="login-btn">登录</button>
      
      <button @click="wechatLogin" class="wechat-login-btn">
        <image src="/static/wechat-icon.png" class="wechat-icon" /> 微信一键登录
      </button>
      <view @click="toggleLoginMode" class="toggle-mode">
        {{ loginMode === 'sms' ? '使用密码登录' : '使用短信验证码登录' }}
      </view>

      <view @click="skipLogin" class="skip">暂不登录</view>
    </view>
  </view>
</template>

<script>
// 【修改点1】引入真实的 API 模块
import * as apiAuth from '@/api/login/login.js'

export default {
  data() {
    return {
      mobile: '',
      smsCode: '', // 验证码或密码共用此字段
      isSending: false,
      countdown: 60,
      loginMode: 'sms' // 'sms' | 'password'
    }
  },
  computed: {
    canSend() {
      // 简单的手机号正则
      const phoneReg = /^1[3-9]\d{9}$/
      return phoneReg.test(this.mobile)
    }
  },
  methods: {
    // 【修改点2】发送真实短信验证码
    async sendSmsCode() {
      if (!this.canSend) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }

      try {
        this.isSending = true;
        
        // 调用后端发送接口
        // 注意：后端可能需要的参数名为 phone 或 mobile，这里假设为 form 形式或 json
        const res = await apiAuth.sendSmsCaptcha({ 
            mobile: this.mobile,
            type: 'login' // 部分后端可能需要业务类型
        });

        // 成功提示
        uni.showToast({ title: '验证码已发送', icon: 'success' });

        // 启动倒计时
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
            this.isSending = false;
            this.countdown = 60;
          }
        }, 1000);

      } catch (err) {
        console.error('发送验证码失败:', err);
        this.isSending = false;
        // 如果 request.js 已经处理了 toast，这里可以不写，或者写个兜底
        // uni.showToast({ title: '发送失败，请稍后', icon: 'none' });
      }
    },

    // 切换登录模式
    toggleLoginMode() {
      this.loginMode = this.loginMode === 'sms' ? 'password' : 'sms'
      this.smsCode = ''
      if (this.loginMode === 'sms') {
        this.isSending = false
        this.countdown = 60
      }
    },
    
    // 【修改点3】真实登录逻辑
    async handleLogin() {
      if (!this.mobile || !this.smsCode) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '登录中...' });

      try {
        let res;
        // 1. 根据模式调用不同接口
        if (this.loginMode === 'sms') {
           // 短信登录
           res = await apiAuth.loginBySms({
             mobile: this.mobile, // 或者是 phone: this.mobile，取决于后端
             code: this.smsCode
           });
        } else {
           // 密码登录
           res = await apiAuth.loginByPassword({
             username: this.mobile,
             password: this.smsCode
           });
        }

        uni.hideLoading();

        // 2. 检查返回结果
        // 假设 request.js 已经拦截了非 200 的情况并返回了 res.data
        // 如果后端返回结构是 { code: 200, result: { token: 'xxx' } }
        
        if (res.code === 200) {
            const token = res.result ? res.result.token : res.token;
            
            // 【关键点】这里必须保存为 'token'，因为你的 request.js 读取的是 'token'
            uni.setStorageSync('token', token);
            
            // 可选：保存用户信息
            if(res.result && res.result.user) {
                uni.setStorageSync('user_info', res.result.user);
            }

            uni.showToast({ title: '登录成功', icon: 'success' });
            
            // 3. 跳转逻辑
            setTimeout(() => {
                this.navigateToAfterLogin();
            }, 1000);
        } else {
            uni.showToast({ title: res.message || '登录失败', icon: 'none' });
        }

      } catch (err) {
        uni.hideLoading();
        console.error('登录异常:', err);
        // request.js 可能已经弹窗了，这里可以不用重复弹
      }
    },

    // 微信登录 (真实逻辑)
    wechatLogin() {
      // #ifdef MP-WEIXIN
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: (profileRes) => {
          const { nickName, avatarUrl, gender } = profileRes.userInfo;

          uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
              if (loginRes.code) {
                uni.showLoading({ title: '登录中...' });
                try {
                  // 调用后端微信登录接口
                  const res = await apiAuth.loginByWechat({
                    code: loginRes.code, // 后端用这个换 openid
                    nickName,
                    avatarUrl,
                    gender
                  });
                  
                  uni.hideLoading();

                  if (res.code === 200) {
                      const token = res.result ? res.result.token : res.token;
                      // 保存 Token
                      uni.setStorageSync('token', token);
                      uni.setStorageSync('user_info', res.result || res);
                      
                      uni.showToast({ title: '微信登录成功', icon: 'success' });
                      setTimeout(() => this.navigateToAfterLogin(), 1000);
                  } else {
                      uni.showToast({ title: res.message || '登录失败', icon: 'none' });
                  }
                } catch (err) {
                  uni.hideLoading();
                  console.error(err);
                }
              }
            }
          });
        },
        fail: () => {
          uni.showToast({ title: '您取消了授权', icon: 'none' });
        }
      });
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在微信小程序中使用此功能', icon: 'none' });
      // #endif
    },

    // 登录后跳转
    navigateToAfterLogin() {
      // 直接返回上一页，或者跳转到首页
      // 如果是从购物车跳转过来的，最好用 navigateBack
      const pages = getCurrentPages();
      if (pages.length > 1) {
          uni.navigateBack();
      } else {
          uni.switchTab({ url: '/pages/index/index' });
      }
    },

    // 暂不登录
    skipLogin() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style>
/* 样式保持不变 */
.container { padding: 40rpx; background-color: #f5f5f5; min-height: 100vh; }
.header { text-align: center; margin-bottom: 60rpx; }
.title { font-size: 36rpx; font-weight: bold; display: block; margin-bottom: 20rpx; }
.desc { font-size: 28rpx; color: #999; }
.input { width: 100%; height: 80rpx; border: 1px solid #ddd; border-radius: 8rpx; padding: 0 20rpx; margin-bottom: 30rpx; box-sizing: border-box; background-color: #fff; }
.sms-row { display: flex; gap: 20rpx; }
.sms-input { flex: 1; margin-bottom: 0; }
.sms-btn { height: 80rpx; line-height: 80rpx; font-size: 26rpx; background-color: #e0e0e0; color: #333; padding: 0 20rpx; }
.login-btn { width: 100%; height: 80rpx; background: #007aff; color: white; border-radius: 8rpx; margin-top: 40rpx; line-height: 80rpx; }
.toggle-mode { text-align: center; margin-top: 20rpx; color: #007aff; font-size: 28rpx; }
.wechat-login-btn { width: 100%; height: 80rpx; background: #07c160; color: white; border-radius: 8rpx; margin-top: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.wechat-icon { width: 36rpx; height: 36rpx; margin-right: 16rpx; }
.skip { text-align: center; margin-top: 40rpx; color: #007aff; }
</style>