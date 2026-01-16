<template>
	<view class="container">
		<view class="page-title">收货地址</view>
		
		<view class="form-wrapper">
			<u-form :model="form" ref="uForm" label-width="140rpx">
				<u-form-item label="姓名" prop="name">
					<u-input v-model="form.name" placeholder="请输入收货人姓名" />
				</u-form-item>
				<u-form-item label="电话" prop="phone">
					<u-input v-model="form.phone" placeholder="请输入收货人手机号" />
				</u-form-item>
				<u-form-item label="地区" prop="listRegion">
					<select-region ref="sRegion" v-model="form.listRegion" />
				</u-form-item>
				<u-form-item label="详细地址" prop="detail" :border-bottom="false">
					<u-input v-model="form.detail" placeholder="街道门牌、楼层等信息" />
				</u-form-item>
			</u-form>
		</view>
		
		<view class="footer">
			<view class="btn-wrapper">
				<view class="btn-item btn-item-main" :class="{ disabled }" @click="handleSubmit()">保存</view>
			</view>
		</view>
	</view>
</template>

<script>
	import SelectRegion from '@/components/select-region/select-region'
	
	// 【关键修改】手动引入 uView 组件，绕过 easycom 可能的配置失效问题
	import uForm from '@/uview-ui/components/u-form/u-form.vue';
	import uFormItem from '@/uview-ui/components/u-form-item/u-form-item.vue';
	import uInput from '@/uview-ui/components/u-input/u-input.vue';

	export default {
		components: {
			SelectRegion,
			// 注册组件
			uForm,
			uFormItem,
			uInput
		},
		data() {
			return {
				addressId: null,
				form: {
					name: '',
					phone: '',
					listRegion: [],
					detail: ''
				},
				rules: {
					name: [{
						required: true,
						message: '请输入姓名',
						trigger: ['blur', 'change']
					}],
					phone: [{
						required: true,
						message: '请输入手机号',
						trigger: ['blur', 'change']
					}],
					listRegion: [{
						required: true,
						message: '请选择省市区',
						trigger: ['change'],
						type: 'array'
					}],
					detail: [{
						required: true,
						message: '请输入详细地址',
						trigger: ['blur', 'change']
					}],
				},
				isLoading: true,
				disabled: false
			}
		},

		onLoad(options) {
			this.addressId = options.addressId
			this.getDetail(options.addressId)
		},

		onReady() {
			this.$nextTick(() => {
				// 此时组件已手动注册，refs 应该能找到了
				if (this.$refs.uForm) {
					this.$refs.uForm.setRules(this.rules)
				} else {
                    // 如果还是找不到，可能是 uView 目录路径不对
					console.error('错误：依然找不到 uForm 组件，请检查 uview-ui 文件夹是否存在于项目根目录');
				}
			})
		},

		methods: {
			getDetail(addressId) {
				uni.showLoading({ title: '加载中' });
				setTimeout(() => {
					const localList = uni.getStorageSync('mock_address_list') || [];
					const detail = localList.find(item => item.addressId == addressId);

					if (detail) {
						this.form.name = detail.name;
						this.form.phone = detail.phone;
						this.form.detail = detail.detail;
						this.form.listRegion = [{
							label: detail.province,
							value: detail.provinceId
						}, {
							label: detail.city,
							value: detail.cityId
						}, {
							label: detail.region,
							value: detail.regionId
						}];
					} else {
						uni.showToast({ title: '地址不存在', icon: 'none' });
					}
					
					this.isLoading = false;
					uni.hideLoading();
				}, 300);
			},

			handleSubmit() {
				const _this = this
				if (_this.disabled) {
					return false
				}
				
				if (!_this.$refs.uForm) {
					uni.showToast({ title: '表单加载失败', icon: 'none' });
					return;
				}

				_this.$refs.uForm.validate(valid => {
					if (valid) {
						_this.disabled = true
						uni.showLoading({ title: '保存中' });
						
						setTimeout(() => {
							let localList = uni.getStorageSync('mock_address_list') || [];
							const index = localList.findIndex(item => item.addressId == _this.addressId);

							if (index !== -1) {
								localList[index].name = _this.form.name;
								localList[index].phone = _this.form.phone;
								localList[index].detail = _this.form.detail;
								if(_this.form.listRegion && _this.form.listRegion.length >= 3) {
									localList[index].province = _this.form.listRegion[0].label;
									localList[index].city = _this.form.listRegion[1].label;
									localList[index].region = _this.form.listRegion[2].label;
									localList[index].provinceId = _this.form.listRegion[0].value;
									localList[index].cityId = _this.form.listRegion[1].value;
									localList[index].regionId = _this.form.listRegion[2].value;
								}
								uni.setStorageSync('mock_address_list', localList);
								uni.hideLoading();
								uni.showToast({ title: '修改成功', icon: 'none' });
								setTimeout(() => {
									uni.navigateBack();
									_this.disabled = false;
								}, 800);
							} else {
								uni.showToast({ title: '保存失败', icon:'none' });
								_this.disabled = false;
							}
						}, 500);
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background: #f7f8fa;
	}
	.page-title {
		width: 94%;
		margin: 0 auto;
		padding-top: 40rpx;
		font-size: 28rpx;
		color: rgba(69, 90, 100, 0.6);
	}
	.form-wrapper {
		margin: 20rpx auto 20rpx auto;
		padding: 0 40rpx;
		width: 94%;
		box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
		border-radius: 16rpx;
		background: #fff;
	}
	.footer {
		margin-top: 80rpx;
		.btn-wrapper {
			height: 100%;
			padding: 0 20rpx;
		}
		.btn-item {
			flex: 1;
			font-size: 28rpx;
			height: 86rpx;
			color: #fff;
			border-radius: 50rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.btn-item-main {
			background: linear-gradient(to right, #f9211c, #ff6335);
			color: #fff;
			&.disabled {
				opacity: 0.6;
			}
		}
	}
</style>