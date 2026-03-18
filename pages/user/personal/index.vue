<template>
	<view class="container">
		<view class="action-section">
			<view class="setting-row card" @click="handleAvatarEdit">
				<text class="setting-title">头像编辑</text>
				<view class="right-box">
					<u-avatar :src="userInfo.urlAvater || '/static/default-avatar.png'" size="64"></u-avatar>
					<u-icon name="arrow-right" color="#999" size="28" margin-left="10"></u-icon>
				</view>
			</view>

			<view class="setting-row card" @click="showNameModal = true">
				<text class="setting-title">机构名称</text>
				<view class="right-box">
					<text class="value-text">{{ userInfo.nickName || '未设置' }}</text>
					<u-icon name="arrow-right" color="#999" size="28" margin-left="10"></u-icon>
				</view>
			</view>

			<view class="setting-row card" @click="openPhonePopup">
				<text class="setting-title">手机号换绑</text>
				<view class="right-box">
					<text class="value-text">{{ maskPhone(userInfo.phone) }}</text>
					<u-icon name="arrow-right" color="#999" size="28" margin-left="10"></u-icon>
				</view>
			</view>

			<view class="setting-row card" @click="openPwdPopup">
				<text class="setting-title">修改密码</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
		</view>

		<u-modal v-model="showNameModal" title="修改机构名称" show-cancel-button @confirm="submitChangeName" :async-close="true">
			<view class="modal-inner">
				<u-input v-model="editForm.name" placeholder="请输入新的机构名称" border clearable />
			</view>
		</u-modal>

		<u-popup v-model="showPwdPopup" mode="bottom" border-radius="24" closeable>
			<view class="popup-container">
				<view class="popup-title">修改登录密码</view>
				<view class="form-box">
					<u-field v-model="userInfo.phone" label="手机号" disabled />
					
					<u-field v-model="editForm.verifyCode" label="图形码" placeholder="请输入右侧验证码" :clearable="false">
						<template slot="right">
							<image :src="captcha.base64Str" class="captcha-img" @click="refreshCaptcha" mode="aspectFit"></image>
						</template>
					</u-field>
					
					<u-field v-model="editForm.smsCode" label="验证码" placeholder="请输入短信验证码" type="number" maxlength="6">
						<template slot="right">
							<u-button size="mini" type="primary" :disabled="smsTimer > 0" @click="sendSms('pwd')">
								{{ smsTimer > 0 ? `${smsTimer}s后重新获取` : '获取验证码' }}
							</u-button>
						</template>
					</u-field>
					
					<u-field v-model="editForm.newPassword" label="新密码" placeholder="请输入新密码(6-20位)" password />
					<u-field v-model="editForm.confirmPassword" label="确认密码" placeholder="请再次输入新密码" password />
				</view>
				<view class="btn-box">
					<u-button type="primary" shape="circle" @click="submitChangePwd">确认修改并重新登录</u-button>
				</view>
			</view>
		</u-popup>

		<u-popup v-model="showPhonePopup" mode="bottom" border-radius="24" closeable>
			<view class="popup-container">
				<view class="popup-title">{{ phoneStep === 1 ? '验证原手机号' : '绑定新手机号' }}</view>
				
				<view class="form-box" v-if="phoneStep === 1">
					<u-field v-model="userInfo.phone" label="原手机号" disabled />
					<u-field v-model="editForm.verifyCode" label="图形码" placeholder="请输入右侧验证码">
						<template slot="right">
							<image :src="captcha.base64Str" class="captcha-img" @click="refreshCaptcha" mode="aspectFit"></image>
						</template>
					</u-field>
					<u-field v-model="editForm.oldSmsCode" label="验证码" placeholder="请输入短信验证码" type="number">
						<template slot="right">
							<u-button size="mini" type="primary" :disabled="smsTimer > 0" @click="sendSms('oldPhone')">
								{{ smsTimer > 0 ? `${smsTimer}s后获取` : '获取验证码' }}
							</u-button>
						</template>
					</u-field>
				</view>

				<view class="form-box" v-if="phoneStep === 2">
					<u-field v-model="editForm.newPhone" label="新手机号" placeholder="请输入新手机号" type="number" maxlength="11" />
					<u-field v-model="editForm.verifyCode" label="图形码" placeholder="请输入右侧验证码">
						<template slot="right">
							<image :src="captcha.base64Str" class="captcha-img" @click="refreshCaptcha" mode="aspectFit"></image>
						</template>
					</u-field>
					<u-field v-model="editForm.newSmsCode" label="验证码" placeholder="请输入短信验证码" type="number">
						<template slot="right">
							<u-button size="mini" type="primary" :disabled="smsTimer > 0" @click="sendSms('newPhone')">
								{{ smsTimer > 0 ? `${smsTimer}s后获取` : '获取验证码' }}
							</u-button>
						</template>
					</u-field>
				</view>

				<view class="btn-box">
					<u-button v-if="phoneStep === 1" type="primary" shape="circle" @click="nextPhoneStep">下一步</u-button>
					<u-button v-if="phoneStep === 2" type="primary" shape="circle" @click="submitChangePhone">确认换绑</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
// 🌟 引入我们刚才在 user.js 里写好的规范化 API
import { 
	getDetail, getCaptcha, sendSmsCaptcha, 
	changeUserInfo, changeName, setReplacePhone, changePassword 
} from '@/api/user/user.js'
import md5 from '@/uview-ui/libs/function/md5.js' 

export default {
	data() {
		return {
			userInfo: { nickName: '', phone: '', urlAvater: '' },
			showNameModal: false, showPwdPopup: false, showPhonePopup: false,
			phoneStep: 1, captcha: { verifyCodeId: '', base64Str: '' },
			smsTimer: 0, intervalId: null,
			editForm: {
				name: '', verifyCode: '',
				smsVerifyCodeId: '', smsCode: '', newPassword: '', confirmPassword: '',
				oldSmsVerifyCodeId: '', oldSmsCode: '', newPhone: '', newSmsVerifyCodeId: '', newSmsCode: ''
			}
		}
	},
	onShow() { this.loadUserInfo(); },
	// 🌟 新增：离开页面时清理定时器，防止内存泄漏
		beforeDestroy() {
			if (this.intervalId) {
				clearInterval(this.intervalId);
			}
		},
	methods: {
		loadUserInfo() {
			getDetail().then(res => {
				if (res.code === 200 && res.result) {
					this.userInfo = res.result;
					this.editForm.name = this.userInfo.nickName; 
				}
			});
		},
		maskPhone(phone) { return phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'; },
		
		refreshCaptcha() {
			getCaptcha().then(res => {
				if (res.code === 200 && res.result) this.captcha = res.result;
			});
		},
		sendSms(type) {
			if (!this.editForm.verifyCode) return uni.showToast({ title: '请先输入图形验证码', icon: 'none' });
			let mobile = this.userInfo.phone;
			if (type === 'newPhone') {
				mobile = this.editForm.newPhone;
				if (!/^1\d{10}$/.test(mobile)) return uni.showToast({ title: '新手机号格式不正确', icon: 'none' });
			}
			uni.showLoading({ title: '发送中...' });
			
			// 🌟 使用封装好的 API
			sendSmsCaptcha({
				mobile: mobile,
				verifyCodeId: this.captcha.verifyCodeId,
				verifyCode: this.editForm.verifyCode
			}).then(res => {
				uni.hideLoading();
				if (res.code === 200) {
					uni.showToast({ title: '发送成功', icon: 'success' });
					if (type === 'pwd') this.editForm.smsVerifyCodeId = res.result.smsVerifyCodeId;
					if (type === 'oldPhone') this.editForm.oldSmsVerifyCodeId = res.result.smsVerifyCodeId;
					if (type === 'newPhone') this.editForm.newSmsVerifyCodeId = res.result.smsVerifyCodeId;
					this.startSmsTimer();
				} else {
					uni.showToast({ title: res.message || '发送失败', icon: 'none' });
					this.refreshCaptcha(); 
					this.editForm.verifyCode = '';
				}
			}).catch(() => uni.hideLoading());
		},
		startSmsTimer() {
			this.smsTimer = 60;
			clearInterval(this.intervalId);
			this.intervalId = setInterval(() => {
				this.smsTimer--;
				if (this.smsTimer <= 0) clearInterval(this.intervalId);
			}, 1000);
		},

		handleAvatarEdit() {
					uni.chooseImage({
						count: 1,
						success: (chooseRes) => {
							uni.showLoading({ title: '上传中...' });
							
							// 🌟 已加上你们代码中的正式后端域名
							const uploadApi = 'https://www.yaoduoduo.top/api/Upload/Image'; 
							
							uni.uploadFile({
								url: uploadApi, 
								filePath: chooseRes.tempFilePaths[0],
								name: 'file', // 通常后端接收图片文件的字段名为 file
								header: { 
									// 🌟 严格对齐你 request.js 中的自定义头部配置
									'X-Token': uni.getStorageSync('token') || '', 
									'platform': 'MP-WEIXIN',
									'storeId': uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945'
								},
								success: (uploadRes) => {
									const data = JSON.parse(uploadRes.data);
									if (data.code === 200) {
										const newAvatarUrl = data.result.url || data.result; 
										
										// 调用我们在 user.js 里封装好的 API 更新头像
										changeUserInfo({ urlAvater: newAvatarUrl }).then(res => {
											uni.hideLoading();
											if (res.code === 200) {
												this.userInfo.urlAvater = newAvatarUrl;
												uni.showToast({ title: '头像修改成功', icon: 'success' });
											}
										});
									} else {
										uni.hideLoading();
										uni.showToast({ title: data.message || '上传失败', icon: 'none' });
									}
								},
								fail: () => {
									uni.hideLoading();
									uni.showToast({ title: '网络异常', icon: 'none' });
								}
							});
						}
					});
				},
		submitChangeName() {
			if (!this.editForm.name.trim()) return uni.showToast({ title: '机构名称不能为空', icon: 'none' });
			// 🌟 使用封装好的 API
			changeName({ name: this.editForm.name }).then(res => {
				this.showNameModal = false;
				if (res.code === 200) {
					uni.showModal({ title: '修改成功', content: '修改机构名称需要重新登录生效', showCancel: false, success: () => this.forceLogout() });
				} else {
					uni.showToast({ title: res.message || '修改失败', icon: 'none' });
				}
			});
		},

		openPhonePopup() {
			this.phoneStep = 1; this.editForm.verifyCode = ''; this.editForm.oldSmsCode = '';
			this.refreshCaptcha(); this.showPhonePopup = true;
		},
		nextPhoneStep() {
			if (!this.editForm.oldSmsCode) return uni.showToast({ title: '请输入短信验证码', icon: 'none' });
			this.phoneStep = 2; this.editForm.verifyCode = ''; this.smsTimer = 0;
			clearInterval(this.intervalId); this.refreshCaptcha(); 
		},
		submitChangePhone() {
			if (!this.editForm.newPhone || !this.editForm.newSmsCode) return uni.showToast({ title: '请填写完整', icon: 'none' });
			// 🌟 使用封装好的 API
			setReplacePhone({
				oldPhone: this.userInfo.phone, oldSmsVerifyCodeId: this.editForm.oldSmsVerifyCodeId, oldSmsCode: this.editForm.oldSmsCode,
				newPhone: this.editForm.newPhone, newSmsVerifyCodeId: this.editForm.newSmsVerifyCodeId, newSmsCode: this.editForm.newSmsCode
			}).then(res => {
				if (res.code === 200) {
					this.showPhonePopup = false; uni.showToast({ title: '手机号换绑成功' }); this.loadUserInfo(); 
				} else { uni.showToast({ title: res.message, icon: 'none' }); }
			});
		},

		openPwdPopup() {
			this.editForm.verifyCode = ''; this.editForm.smsCode = ''; this.editForm.newPassword = ''; this.editForm.confirmPassword = '';
			this.refreshCaptcha(); this.showPwdPopup = true;
		},
		submitChangePwd() {
			const { smsCode, newPassword, confirmPassword, smsVerifyCodeId } = this.editForm;
			if (!smsCode) return uni.showToast({ title: '请输入短信验证码', icon: 'none' });
			if (newPassword.length < 6) return uni.showToast({ title: '新密码不能少于6位', icon: 'none' });
			if (newPassword !== confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' });
            
			// 🌟 使用封装好的 API
			changePassword({
				phone: this.userInfo.phone, smsVerifyCodeId: smsVerifyCodeId, smsCode: smsCode,
				newPassword: md5(newPassword), confirmPassword: md5(confirmPassword)
			}).then(res => {
				if (res.code === 200) {
					this.showPwdPopup = false;
					uni.showModal({ title: '修改成功', content: '密码修改成功，请重新登录', showCancel: false, success: () => this.forceLogout() });
				} else { uni.showToast({ title: res.message, icon: 'none' }); }
			});
		},
		forceLogout() {
			this.$store.dispatch('Logout').then(() => { uni.reLaunch({ url: '/pages/login/index' }); });
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding: 40rpx 24rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 🌟 卡片区：完全复刻 Logout 按钮的独立悬浮质感 */
.action-section {
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 36rpx;
		margin-bottom: 24rpx;
		background-color: #fff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		
		.setting-title {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}

		.right-box {
			display: flex;
			align-items: center;
			
			.value-text {
				font-size: 28rpx;
				color: #666;
			}
		}

		&:active {
			background-color: #f9f9f9;
		}
	}
}

/* 弹窗内部样式 */
.modal-inner {
	padding: 40rpx;
}

.popup-container {
	padding: 40rpx 30rpx;
	background-color: #fff;

	.popup-title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
		color: #333;
	}

	.form-box {
		margin-bottom: 50rpx;
		
		.captcha-img {
			width: 180rpx;
			height: 64rpx;
			background-color: #f5f5f5;
			border-radius: 8rpx;
		}
	}

	.btn-box {
		padding: 0 20rpx;
	}
}
</style>