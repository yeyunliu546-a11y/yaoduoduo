import {
	AccessToken,
	UserId
} from '@/store/mutation-types'
import storage from '@/utils/storage.js'
import * as apiLogin from '@/api/login/login.js'

const USER_INFO_KEY = 'user_info'

const user = {
	state: {
		token: '',
		userId: null,
		userInfo: {}
	},

	mutations: {
		SET_TOKEN: (state, value) => {
			state.token = value
		},
		SET_USER_ID: (state, value) => {
			state.userId = value
		},
		SET_USER_INFO: (state, value) => {
			state.userInfo = value
		}
	},

	actions: {
		// 统一处理登录成功逻辑
		LoginSuccess({ commit }, loginResult) {
			const token = loginResult.Token || loginResult.token
			const userId = loginResult.UserId || loginResult.userId
			
			const expiryTime = 30 * 86400

			// 1. 存 Token (使用 storage 工具)
			storage.set(AccessToken, token, expiryTime)
			
			// 【关键修复】强制存一个 'token' 键，确保 certUpload.vue 能用 uni.getStorageSync('token') 读到
			uni.setStorageSync('token', token) 

			commit('SET_TOKEN', token)

			// 2. 存 UserID
			storage.set(UserId, userId, expiryTime)
			commit('SET_USER_ID', userId)

			// 3. 存 UserInfo
			storage.set(USER_INFO_KEY, loginResult, expiryTime)
			commit('SET_USER_INFO', loginResult)
		},

		// 手机验证码登录
		LoginByPhone({ dispatch }, data) {
			return new Promise((resolve, reject) => {
				apiLogin.loginByPhone(data).then(res => {
					if (res.code === 200 || res.Code === 200) {
						dispatch('LoginSuccess', res.Result || res.result)
						resolve(res)
					} else {
						reject(res)
					}
				}).catch(reject)
			})
		},

		// 账号密码登录
		LoginByPassword({ dispatch }, data) {
			return new Promise((resolve, reject) => {
				apiLogin.loginByPassword(data).then(res => {
					if (res.code === 200 || res.Code === 200) {
						dispatch('LoginSuccess', res.Result || res.result)
						resolve(res)
					} else {
						reject(res)
					}
				}).catch(reject)
			})
		},

		// 微信一键登录
		LoginByWechat({ dispatch }, data) {
			return new Promise((resolve, reject) => {
				apiLogin.loginByWechat(data).then(res => {
					if (res.code === 200 || res.Code === 200) {
						dispatch('LoginSuccess', res.Result || res.result)
						resolve(res)
					} else {
						reject(res)
					}
				}).catch(reject)
			})
		},

		// 退出登录
		Logout({ commit }) {
			return new Promise((resolve) => {
				storage.remove(UserId)
				storage.remove(AccessToken)
				storage.remove(USER_INFO_KEY)
				uni.removeStorageSync('token') // 清除强制存的 token
				
				commit('SET_TOKEN', '')
				commit('SET_USER_ID', null)
				commit('SET_USER_INFO', {})
				resolve()
			})
		}
	}
}

export default user