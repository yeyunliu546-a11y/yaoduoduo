<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ loginMode === 'sms' ? '手机号登录' : '账号/手机号登录' }}</text>
      <text class="desc" v-if="loginMode === 'sms'">未注册的手机号登录后将自动注册</text>
      <text class="desc" v-else>支持用户名或手机号登录</text>
    </view>

    <view class="form">
      <!-- 账号/手机号输入 -->
      <input 
        v-model="mobile" 
        type="text"
        :placeholder="loginMode === 'sms' ? '请输入手机号码' : '请输入账号或手机号'"
        class="input"
      />

      <!-- 验证码 或 密码 -->
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

      <!-- 密码输入（仅密码模式显示） -->
      <input 
        v-else
        v-model="smsCode" 
        type="password"
        placeholder="请输入密码"
        class="input"
      />

      <!-- 登录按钮 -->
      <button @click="handleLogin" class="login-btn">登录</button>
      
      <!-- 微信一键登录 -->
      <button @click="wechatLogin" class="wechat-login-btn">
        <image src="/static/wechat-icon.png" class="wechat-icon" /> 微信一键登录
      </button>
      
      <!-- 切换登录方式 -->
      <view @click="toggleLoginMode" class="toggle-mode">
        {{ loginMode === 'sms' ? '使用密码登录' : '使用短信验证码登录' }}
      </view>

      <!-- 暂不登录 -->
      <view @click="skipLogin" class="skip">暂不登录</view>
    </view>
  </view>
</template>


<script>
import * as apiAuth from '@/api/login/login.js'
export default {
  data() {
    return {
      mobile: '',
      smsCode: '',
      isSending: false,
      countdown: 60,
	  loginMode:'sms'
    }
  },
  computed: {
    canSend() {
      const phoneReg = /^1[3-9]\d{9}$/
      return phoneReg.test(this.mobile)
    }
  },
  methods: {
    async sendSmsCode() {
      if (!this.canSend) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }

      this.isSending = true
      console.log('发送短信到:', this.mobile)
      uni.showToast({ title: '验证码已发送（模拟）', icon: 'none' })

      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
          this.isSending = false
          this.countdown = 60
        }
      }, 1000)
    },
	/*  调用真实后端端口时
	import * as apiCaptcha from '@/api/sys/captcha' // 引入你已有的 API 模块
	async sendSmsCode() {
	  if (!this.canSend) {
		uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
		return
	  }

	  // 如果有图形验证码，先获取并让用户输入（可选）
	  // 这里假设你不需要图形验证码，直接发短信
	  try {
		this.isSending = true
		await apiCaptcha.sendSmsCaptcha({ phone: this.mobile })
		uni.showToast({ title: '验证码已发送', icon: 'success' })

		// 启动倒计时
		const timer = setInterval(() => {
		  this.countdown--
		  if (this.countdown <= 0) {
			clearInterval(timer)
			this.isSending = false
			this.countdown = 60
		  }
		}, 1000)
	  } catch (err) {
		console.error('发送失败', err)
		uni.showToast({ 
		  title: err.message || '发送失败，请稍后重试', 
		  icon: 'none' 
		})
		this.isSending = false
	  }
	},	
	
	注意：如果后端要求先校验图形验证码，你需要：
		先调 getImageCaptcha() 获取图片和 uuid
		在界面上显示图形验证码
		用户输入后，连同 phone, imageCaptcha, uuid 一起提交
	*/
	
	toggleLoginMode(){
		this.loginMode = this.loginMode === 'sms' ? 'password' : 'sms'
		    // 切换时清空验证码/密码（可选）
		    this.smsCode = ''
		    // 如果从密码切回短信，重置倒计时状态
		    if (this.loginMode === 'sms') {
		      this.isSending = false
		      this.countdown = 60
			}
	},
	
	//登陆逻辑
    handleLogin() {
      if (!this.mobile || !this.smsCode) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
	  
	  if (this.loginMode === 'sms') {
		console.log('短信登录:', this.mobile, this.smsCode)
	  } else {
		console.log('密码登录:', this.mobile, this.smsCode)
	  }
      
      uni.setStorageSync('user_token', 'mock_token_123')
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      // ✅ 修改：根据认证状态跳转
      setTimeout(() => {
        this.navigateToAfterLogin()
      }, 1000)
    },
	/*真实后端登录逻辑
	// 假设你有一个登录 API 模块
	import * as apiAuth from '@/api/auth'
	
	async handleLogin() {
	  if (!this.mobile || !this.smsCode) {
		uni.showToast({ title: '请填写完整信息', icon: 'none' })
		return
	  }

	  try {
		let res
		if (this.loginMode === 'sms') {
		  // 短信登录
		  res = await apiAuth.loginBySms({
			phone: this.mobile,
			code: this.smsCode
		  })
		} else {
		  // 账号密码登录
		  res = await apiAuth.loginByPassword({
			username: this.mobile, // 可能是手机号或用户名
			password: this.smsCode
		  })
		}

		// 保存 token 和用户信息
		uni.setStorageSync('user_token', res.data.token)
		uni.setStorageSync('user_info', res.data.user)

		uni.showToast({ title: '登录成功', icon: 'success' })
		setTimeout(() => {
		  this.navigateToAfterLogin()
		}, 1000)
	  } catch (err) {
		uni.showToast({ 
		  title: err.message || '登录失败', 
		  icon: 'none' 
		})
	  }
	},
	
	需要创建/api/auth.js,类似：
	import request from '@/utils/request'
	export function loginBySms(data) {
	  return request.post('/auth/login/sms', data)
	}
	export function loginByPassword(data) {
	  return request.post('/auth/login/password', data)
	}
	*/
	
    //修改：微信一键登录（判断认证状态）
    // wechatLogin() {
    //   uni.getUserProfile({
    //     desc: '用于登录药多多',
    //     success: (res) => {
    //       const { nickName, avatarUrl } = res.userInfo
    //       console.log('微信授权成功', { nickName, avatarUrl })

    //       // 保存用户信息
    //       uni.setStorageSync('user_info', {
    //         nickName,
    //         avatarUrl,
    //         loginType: 'wechat'
    //       })
    //       uni.setStorageSync('user_token', 'wechat_mock_token')

    //       uni.showToast({ title: '微信登录成功', icon: 'success' })

    //       //关键修改：根据认证状态跳转
    //       setTimeout(() => {
    //         this.navigateToAfterLogin()
    //       }, 1000)
    //     },
    //     fail: (err) => {
    //       console.error('用户拒绝授权或授权失败:', err)
    //       uni.showToast({ title: '已取消授权', icon: 'none' })
    //     }
    //   })
    // },
	//真实后端微信登录逻辑
    wechatLogin() {
      uni.getUserProfile({
        desc: '用于展示您的头像和昵称',
        success: (profileRes) => {
          const { nickName, avatarUrl, gender } = profileRes.userInfo
    
          uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
              try {
                console.log('【发送登录请求】', {
                  wxCode: loginRes.code,
                  nickName,
                  avatarUrl,
                  gender: gender === '男' ? 1 : 2,
                  appKey: 'wxapp'
                })
    
                const res = await apiAuth.loginByWechat({
                  wxCode: loginRes.code,
                  nickName,        // 建议加上（后端很可能需要）
                  avatarUrl,       // 建议加上
                  gender: gender === '男' ? 1 : 2,
                  appKey: 'wxapp'
                })
    
                console.log('【登录成功响应】', res)
    
                //修正：全部从 res.result 读取
                uni.setStorageSync('token', res.token)
                uni.setStorageSync('user_info', res) // 整个 result 存起来
    
                uni.showToast({ title: '微信登录成功', icon: 'success' })
                setTimeout(() => this.navigateToAfterLogin(), 1000)
              } catch (err) {
                console.error('【服务端登录失败】', err)
                // 显示更具体的错误（如果后端返回了 message）
                const errMsg = err?.data?.message || '服务端登录失败，请重试'
                uni.showToast({ title: errMsg, icon: 'none', duration: 3000 })
              }
            },
            fail: () => {
              uni.showToast({ title: '获取微信登录凭证失败', icon: 'none' })
            }
          })
        },
        fail: (err) => {
          console.error('getUserProfile fail:', err)
          uni.showToast({ title: '授权失败，请重试', icon: 'none' })
        }
      })
    },
	//后端需要用 code 调用微信接口换取 openid，再创建/绑定用户。
	

    //新增：登录后跳转逻辑
    navigateToAfterLogin() {
      // 检查用户是否已认证（这里用本地存储模拟，实际应从后端获取）
      const hasCertified = uni.getStorageSync('hasCertified') || false
      
      if (hasCertified) {
        // 已认证 → 跳转首页
        uni.switchTab({ url: '/pages/index/index' })
      } else {
        // 未认证 → 跳转资质上传页面
        uni.navigateTo({ url: '/pages/auth/certUpload' })
      }
    },
	/*真实后端登录跳转逻辑
	navigateToAfterLogin() {
	  const user = uni.getStorageSync('user_info')
	  if (user && user.certified) {
	    uni.switchTab({ url: '/pages/index/index' })
	  } else {
	    uni.navigateTo({ url: '/pages/auth/certUpload' })
	  }
	},
	*/

    //修改：暂不登录（跳转到首页，而不是资质上传）
    skipLogin() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style>
.container {
  padding: 40rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.desc {
  font-size: 28rpx;
  color: #999;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.sms-row {
  display: flex;
  gap: 20rpx;
}

.sms-input {
  flex: 1;
  margin-bottom: 0;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  background: #007aff;
  color: white;
  border-radius: 8rpx;
  margin-top: 40rpx;
}

.toggle-mode {
  text-align: center;
  margin-top: 20rpx;
  color: #007aff;
  font-size: 28rpx;
}

.wechat-login-btn {
  width: 100%;
  height: 80rpx;
  background: #07c160; /* 微信绿 */
  color: white;
  border-radius: 8rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.wechat-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
}

.skip {
  text-align: center;
  margin-top: 40rpx;
  color: #007aff;
}
</style>