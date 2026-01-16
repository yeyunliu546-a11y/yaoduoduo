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
	
	// 【关键修复 1】手动引入 uView 核心组件，防止组件不显示
	import uForm from '@/uview-ui/components/u-form/u-form.vue';
	import uFormItem from '@/uview-ui/components/u-form-item/u-form-item.vue';
	import uInput from '@/uview-ui/components/u-input/u-input.vue';

	export default {
		components: {
			SelectRegion,
			// 【关键修复 2】注册组件
			uForm,
			uFormItem,
			uInput
		},
		data() {
			return {
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
				disabled: false
			}
		},

		onReady() {
			this.$nextTick(() => {
				// 此时组件已手动注册，refs 应该能找到了
				if (this.$refs.uForm) {
					this.$refs.uForm.setRules(this.rules)
				} else {
					console.error('错误：依然找不到 uForm 组件');
				}
			})
		},

		methods: {
			// 表单提交
			handleSubmit() {
				const _this = this;
				if (_this.disabled) {
					return false;
				}

				if (!_this.$refs.uForm) {
					uni.showToast({ title: '表单加载中，请稍后', icon: 'none' });
					return;
				}

				_this.$refs.uForm.validate(valid => {
					if (valid) {
						_this.disabled = true;
						uni.showLoading({ title: '保存中' });

						setTimeout(() => {
							// 1. 获取现有数据
							let localList = uni.getStorageSync('mock_address_list') || [];

							// 2. 构造新数据
							let province = '', city = '', region = '';
							let provinceId = 0, cityId = 0, regionId = 0;
							
							if (_this.form.listRegion && _this.form.listRegion.length >= 3) {
								province = _this.form.listRegion[0].label;
								city = _this.form.listRegion[1].label;
								region = _this.form.listRegion[2].label;
								provinceId = _this.form.listRegion[0].value;
								cityId = _this.form.listRegion[1].value;
								regionId = _this.form.listRegion[2].value;
							}

							const newItem = {
								addressId: new Date().getTime(),
								name: _this.form.name,
								phone: _this.form.phone,
								province: province,
								city: city,
								region: region,
								detail: _this.form.detail,
								provinceId: provinceId,
								cityId: cityId,
								regionId: regionId,
								isDefault: 0 
							};

							// 3. 如果是第一条数据，强制设为默认
							if (localList.length === 0) {
								newItem.isDefault = 1;
							}

							// 4. 存入
							localList.push(newItem);
							uni.setStorageSync('mock_address_list', localList);

							uni.hideLoading();
							uni.showToast({
								title: '添加成功',
								icon: 'none'
							});

							// 5. 返回上一页
							setTimeout(() => {
								uni.navigateBack();
								_this.disabled = false;
							}, 800);

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