// 集中管理用户身份认证数据（token、userId）
// 封装登录/登出逻辑：调用后端 API → 成功后更新 store + 缓存（localStorage）
// 解耦组件与认证逻辑：页面只需调用 this.$store.dispatch('LoginByPhoneCode', ...)，无需关心细节
// 关键点：
// 登录成功后通过 loginSuccess() 函数 同时更新 Vuex 状态 + 持久化存储（storage.set）
// 退出时 清除缓存 + 重置 Vuex 状态



import {
	AccessToken,
	UserId
} from '@/store/mutation-types'
import storage from '@/utils/storage.js'
import * as apiLogin from '@/api/login/login.js'

// 登陆成功后执行
const loginSuccess = (commit, userInfo) => {

	var userId = userInfo.userId;
	var token = userInfo.token;
	// 过期时间30天
	const expiryTime = 30 * 86400
	// 保存tokne和userId到缓存
	storage.set(UserId, userId, expiryTime)
	storage.set(AccessToken, token, expiryTime)
	// 记录到store全局变量
	commit('SetToken', token)
	commit('SetUserId', userId)
}

const user = {
	// state: 存储用户核心信息
	state: {
		// 用户认证token
		token: '',
		// 用户ID
		userId: null
	},
	
	// mutations: 同步修改用户状态
	mutations: {
		SetToken: (state, value) => {
			state.token = value
		},
		SetUserId: (state, value) => {
			state.userId = value
		}
	},

	// actions: 异步操作（如登录、退出）
	actions: {

		// 用户登录(普通登录: 输入手机号和验证码)
		LoginByPhoneCode({
			commit
		}, data) {
			return new Promise((resolve, reject) => {
				apiLogin.loginByPhoneCode(data)
					.then(res => {
						const result = res.result
						loginSuccess(commit, result)
						resolve(res)
					})
					.catch(reject)
			})
		},

		// 微信小程序一键授权登录(获取用户基本信息)
		loginWx({
			commit
		}, data) {
			return new Promise((resolve, reject) => {
				apiLogin.loginWx(data, {
						isPrompt: false
					})
					.then(res => {
						var result = res.result
						loginSuccess(commit, result)
						resolve(result)
					})
					.catch(reject)
			})
		},

		// 微信小程序一键授权登录(授权手机号)
		bindWxPhone({
			commit
		}, data) {
			return new Promise((resolve, reject) => {
				apiLogin.bindWxPhone(data, {
						isPrompt: false
					})
					.then(res => {
						const result = res.result
						// loginSuccess(commit, result)
						resolve(res)
					})
					.catch(reject)
			})
		},

		// 退出登录
		Logout({
			commit
		}, data) {
			const store = this
			return new Promise((resolve, reject) => {
				// apiLogin.logout().then(res=>{

				storage.remove(UserId)
				storage.remove(AccessToken)
				// 记录到store全局变量
				commit('SetToken', null)
				commit('SetUserId', null)
				resolve()


				// })
			})
		}

	}
}

export default user