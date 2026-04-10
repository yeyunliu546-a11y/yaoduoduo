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
				<text class="setting-title">{{ userStatus.hasPhone ? '手机号换绑' : '绑定手机号' }}</text>
				<view class="right-box">
					<text class="value-text">{{ maskPhone(userInfo.phone) }}</text>
					<u-icon name="arrow-right" color="#999" size="28" margin-left="10"></u-icon>
				</view>
			</view>

			<view class="setting-row card" @click="openPwdPopup">
				<text class="setting-title">{{ userStatus.hasPassword ? '修改密码' : '设置密码' }}</text>
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
				<view class="popup-title">{{ userStatus.hasPassword ? '修改登录密码' : '设置登录密码' }}</view>
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
					<u-button type="primary" shape="circle" @click="submitChangePwd">
						{{ userStatus.hasPassword ? '确认修改并重新登录' : '确认设置并重新登录' }}
					</u-button>
				</view>
			</view>
		</u-popup>

		<u-popup v-model="showPhonePopup" mode="bottom" border-radius="24" closeable>
			<view class="popup-container">
				<view class="popup-title">{{ !userStatus.hasPhone ? '绑定手机号' : (phoneStep === 1 ? '验证原手机号' : '绑定新手机号') }}</view>
				
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
					<u-button v-if="phoneStep === 2" type="primary" shape="circle" @click="submitChangePhone">
						{{ !userStatus.hasPhone ? '确认绑定' : '确认换绑' }}
					</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { 
	getDetail, getCaptcha, sendSmsCaptcha, 
	changeUserInfo, changeName, setReplacePhone, changePassword, getMyStatus 
} from '@/api/user/user.js' // 🌟 移除了 bindMobile，加入了 getMyStatus

 import md5Module from '@/uview-ui/libs/function/md5.js';
export default {
	data() {
		return {
			userInfo: { nickName: '', phone: '', urlAvater: '' },
			// 🌟 新增：用户账户状态
			userStatus: { hasPhone: false, hasPassword: false }, 
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
	onShow() { 
		this.loadUserInfo(); 
		this.loadUserStatus(); // 🌟 每次进入页面，获取最新状态
	},
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
		
		// 🌟 新增：获取账户核心状态
		loadUserStatus() {
			getMyStatus().then(res => {
				if (res.code === 200 && res.result) {
					this.userStatus.hasPhone = res.result.hasPhone;
					this.userStatus.hasPassword = res.result.hasPassword;
				}
			}).catch(err => console.log('获取状态失败', err));
		},
		
		maskPhone(phone) { return phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'; },
		
		refreshCaptcha() {
			getCaptcha().then(res => {
				if (res.code === 200 && res.result) {
					let base64 = res.result.base64Str || res.result.Base64Str;
					if (base64 && !base64.startsWith('data:image')) {
						base64 = 'data:image/png;base64,' + base64;
					}
					this.captcha = {
						verifyCodeId: res.result.verifyCodeId || res.result.VerifyCodeId,
						base64Str: base64
					};
				}
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
			
			sendSmsCaptcha({
			    mobile: mobile,
			    verifyCodeId: this.captcha.verifyCodeId,
			    verifyCode: this.editForm.verifyCode
			}).then(res => {
			    uni.hideLoading();
			    if (res.code === 200) {
			        uni.showToast({ title: '发送成功', icon: 'success' });
			        
			        // 🌟 核心兼容修复：把后端可能返回的所有大小写字段全捕获一遍！
			        const returnedId = res.result.smsVerifyCodeId || 
			                           res.result.SmsVerifyCodeId || 
			                           res.result.verifyCodeId || 
			                           res.result.VerifyCodeId;
			                           
			        if (!returnedId) {
			            console.error('致命异常：后端验证码接口没有返回任何相关的 ID 字段！', res.result);
			        }
			
			        // 赋值给对应的表单字段
			        if (type === 'pwd') this.editForm.smsVerifyCodeId = returnedId;
			        if (type === 'oldPhone') this.editForm.oldSmsVerifyCodeId = returnedId;
			        if (type === 'newPhone') this.editForm.newSmsVerifyCodeId = returnedId;
			        
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
					const uploadApi = 'https://www.yaoduoduo.top/api/FileUpload/UploadImg'; 
					uni.uploadFile({
						url: uploadApi, 
						filePath: chooseRes.tempFilePaths[0],
						name: 'files', 
						header: { 
							'X-Token': uni.getStorageSync('token') || '', 
							'platform': 'MP-WEIXIN',
							'storeId': uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945'
						},
						success: (uploadRes) => {
							let data;
							if (typeof uploadRes.data === 'string') {
								if (!uploadRes.data.trim()) {
									uni.hideLoading();
									return uni.showToast({ title: '上传接口未响应', icon: 'none' });
								}
								try { data = JSON.parse(uploadRes.data); } 
								catch (e) { uni.hideLoading(); return uni.showToast({ title: '上传服务异常', icon: 'none' }); }
							} else { data = uploadRes.data; }
							
							if (data.code === 200 && data.result && data.result.length > 0) {
								const imageInfo = data.result[0];
								changeUserInfo({ 
									name: this.userInfo.nickName || '', 
									urlAvater: imageInfo.filePath 
								}).then(res => {
									uni.hideLoading();
									if (res.code === 200) {
										this.userInfo.urlAvater = imageInfo.filePath;
										uni.showToast({ title: '头像修改成功', icon: 'success' });
									} else {
										uni.showToast({ title: res.message || '保存头像失败', icon: 'none' });
									}
								}).catch(() => uni.hideLoading());
							} else {
								uni.hideLoading();
								uni.showToast({ title: data.message || '上传失败', icon: 'none' });
							}
						},
						fail: (err) => {
							uni.hideLoading();
							uni.showToast({ title: '网络或上传异常', icon: 'none' });
						}
					});
				}
			});
		},
		
		submitChangeName() {
			if (!this.editForm.name.trim()) return uni.showToast({ title: '机构名称不能为空', icon: 'none' });
			changeUserInfo({ 
				name: this.editForm.name, 
				urlAvater: this.userInfo.urlAvater || ''
			}).then(res => {
				this.showNameModal = false;
				if (res.code === 200) {
					uni.showModal({ title: '修改成功', content: '修改机构名称需要重新登录生效', showCancel: false, success: () => this.forceLogout() });
				} else { uni.showToast({ title: res.message || '修改失败', icon: 'none' }); }
			});
		},

		openPhonePopup() {
			// 🌟 基于后端的标志位来决定步骤
			this.phoneStep = this.userStatus.hasPhone ? 1 : 2; 
			
			this.editForm.verifyCode = ''; 
			this.editForm.oldSmsCode = '';
			this.editForm.newPhone = '';
			this.editForm.newSmsCode = '';
			this.refreshCaptcha(); 
			this.showPhonePopup = true;
		},
		
		nextPhoneStep() {
			if (!this.editForm.oldSmsCode) return uni.showToast({ title: '请输入短信验证码', icon: 'none' });
			this.phoneStep = 2; this.editForm.verifyCode = ''; this.smsTimer = 0;
			clearInterval(this.intervalId); this.refreshCaptcha(); 
		},
		
		submitChangePhone() {
			if (!this.editForm.newPhone || !this.editForm.newSmsCode) return uni.showToast({ title: '请填写完整', icon: 'none' });
			
			// 🌟 统一使用 setReplacePhone，通过 hasPhone 判断是否传老手机号参数
			let params = {
				newPhone: this.editForm.newPhone,
				newSmsVerifyCodeId: this.editForm.newSmsVerifyCodeId,
				newSmsCode: this.editForm.newSmsCode
			};

			// 如果已绑定手机号，则加上老手机的验证信息
			if (this.userStatus.hasPhone) {
				params.oldPhone = this.userInfo.phone;
				params.oldSmsVerifyCodeId = this.editForm.oldSmsVerifyCodeId;
				params.oldSmsCode = this.editForm.oldSmsCode;
			}

			setReplacePhone(params).then(res => {
				if (res.code === 200) {
					this.showPhonePopup = false; 
					uni.showToast({ title: this.userStatus.hasPhone ? '手机号换绑成功' : '手机号绑定成功' }); 
					this.loadUserInfo(); 
					this.loadUserStatus(); // 刷新状态
				} else { 
					uni.showToast({ title: res.message, icon: 'none' }); 
				}
			});
		},

		openPwdPopup() {
			// 🌟 强拦截：没有手机号不让设密码！强制引导去绑定！
			if (!this.userStatus.hasPhone) {
				return uni.showModal({
					title: '提示',
					content: '为了账户安全，请先绑定手机号再设置密码',
					confirmText: '去绑定',
					success: (res) => {
						if (res.confirm) {
							this.openPhonePopup(); 
						}
					}
				});
			}

			this.editForm.verifyCode = ''; this.editForm.smsCode = ''; this.editForm.newPassword = ''; this.editForm.confirmPassword = '';
			this.refreshCaptcha(); this.showPwdPopup = true;
		},
		
		submitChangePwd() {
		    const { smsCode, newPassword, confirmPassword, smsVerifyCodeId } = this.editForm;
		    
		    // 🌟 第一道防线：强拦截！如果没有拿到 ID，绝对不让它发请求去后端丢人
		    if (!smsVerifyCodeId) return uni.showToast({ title: '请先点击获取短信验证码', icon: 'none' });
		    if (!smsCode) return uni.showToast({ title: '请输入短信验证码', icon: 'none' });
		    if (newPassword.length < 6) return uni.showToast({ title: '新密码不能少于6位', icon: 'none' });
		    if (newPassword !== confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' });
		    
		    let safeMd5 = typeof md5Module === 'function' ? md5Module : (md5Module.md5 || md5Module.default || (uni.$u && uni.$u.md5));
		    
		    if (typeof safeMd5 !== 'function') {
		        return uni.showToast({ title: '加密模块异常，请联系技术支持', icon: 'none' });
		    }
		
		    changePassword({
		        phone: this.userInfo.phone, 
		        
		        // 🌟 第二道防线：大小写双管齐下！不管后端兄弟写的是大写S还是小写s，统统喂给他！
		        smsVerifyCodeId: smsVerifyCodeId, 
		        SmsVerifyCodeId: smsVerifyCodeId, 
		        
		        smsCode: smsCode,
		        newPassword: safeMd5(newPassword),       
		        confirmPassword: safeMd5(confirmPassword) 
		    }).then(res => {
		        if (res.code === 200) {
		            this.showPwdPopup = false;
		            uni.showModal({ title: '设置成功', content: '密码保存成功，请重新登录', showCancel: false, success: () => this.forceLogout() });
		        } else { 
		            uni.showToast({ title: res.message, icon: 'none' }); 
		        }
		    });
		},
		
		forceLogout() {
			this.$store.dispatch('Logout').then(() => { uni.reLaunch({ url: '/pages/login/index' }); });
		}
	}
}
</script>

<style lang="scss" scoped>
.container { padding: 40rpx 24rpx; background-color: #f5f7fa; min-height: 100vh; }
.action-section { 
	.setting-row { 
		display: flex; justify-content: space-between; align-items: center; 
		padding: 32rpx 36rpx; margin-bottom: 24rpx; 
		background-color: #fff; border-radius: 24rpx; 
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03); 
		.setting-title { font-size: 30rpx; color: #333; font-weight: 500; } 
		.right-box { display: flex; align-items: center; .value-text { font-size: 28rpx; color: #666; } } 
		&:active { background-color: #f9f9f9; } 
	} 
}
.modal-inner { padding: 40rpx; }
.popup-container { 
	padding: 40rpx 30rpx; background-color: #fff; 
	.popup-title { font-size: 36rpx; font-weight: bold; text-align: center; margin-bottom: 40rpx; color: #333; } 
	.form-box { margin-bottom: 50rpx; .captcha-img { width: 180rpx; height: 64rpx; background-color: #f5f5f5; border-radius: 8rpx; } } 
	.btn-box { padding: 0 20rpx; } 
}
</style>