<template>
	<view class="container">
		<view class="page-title">修改收货地址</view>
		
		<view class="form-wrapper">
			<u-form :model="form" ref="uForm" label-width="140rpx">
				<u-form-item label="姓名" prop="Name">
					<u-input v-model="form.Name" placeholder="请输入收货人姓名" />
				</u-form-item>
				<u-form-item label="电话" prop="Phone">
					<u-input v-model="form.Phone" placeholder="请输入收货人手机号" />
				</u-form-item>
				<u-form-item label="地区" prop="ListRegion">
					<select-region v-model="form.ListRegion" />
				</u-form-item>
				<u-form-item label="详细地址" prop="Detail" :border-bottom="false">
					<u-input v-model="form.Detail" placeholder="街道门牌、楼层等信息" />
				</u-form-item>
			</u-form>
		</view>
		
		<view class="footer">
			<view class="btn-wrapper">
				<u-button 
					type="error" 
					shape="circle" 
					:disabled="submitDisabled" 
					:loading="loading" 
					@click="handleSubmit"
				>保存修改</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import * as AddressApi from '@/api/user/userAddress.js'

	export default {
		data() {
			return {
				addressId: '', // 地址ID
				form: {
					Id: '',
					Name: '',
					Phone: '',
					ListRegion: [],
					Detail: ''
				},
				rules: {
					Name: [{
						required: true,
						message: '请输入姓名',
						trigger: ['blur', 'change']
					}],
					Phone: [{
						required: true,
						message: '请输入手机号',
						trigger: ['blur', 'change']
					}, {
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: '手机号格式不正确',
						trigger: ['blur', 'change']
					}],
					ListRegion: [{
						required: true,
						message: '请选择省市区',
						trigger: ['change'],
						type: 'array'
					}],
					Detail: [{
						required: true,
						message: '请输入详细地址',
						trigger: ['blur', 'change']
					}]
				},
				loading: false,
				submitDisabled: false
			}
		},
		onLoad(options) {
			if (options.id) {
				this.addressId = options.id;
				this.getDetail();
			} else {
				uni.showToast({ title: '参数错误', icon: 'none' });
				setTimeout(() => uni.navigateBack(), 1500);
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			// 获取地址详情并回显
			async getDetail() {
				uni.showLoading({ title: '加载中...' });
				try {
					const res = await AddressApi.getDetail(this.addressId);
					if (res.Code === 200) {
						const data = res.Result;
						// 转换回显数据
						this.form = {
							Id: data.Id,
							Name: data.Name,
							Phone: data.Phone,
							Detail: data.Detail,
							// 根据文档，回显时需要构造 ListRegion 数组供组件使用
							ListRegion: [
								{ Label: data.Province, Value: data.ProvinceId },
								{ Label: data.City, Value: data.CityId },
								{ Label: data.Region, Value: data.RegionId }
							]
						};
					}
				} catch (e) {
					console.error('获取详情失败:', e);
				} finally {
					uni.hideLoading();
				}
			},

			// 提交修改
			handleSubmit() {
				this.$refs.uForm.validate(async (valid) => {
					if (!valid) return;

					this.loading = true;
					this.submitDisabled = true;
					uni.showLoading({ title: '更新中...', mask: true });

					try {
						const res = await AddressApi.addOrUpdate(this.form);
						if (res.Code === 200) {
							uni.showToast({ title: '修改成功', icon: 'success' });
							setTimeout(() => uni.navigateBack(), 1200);
						} else {
							uni.showToast({ title: res.Message || '修改失败', icon: 'none' });
							this.submitDisabled = false;
						}
					} catch (e) {
						uni.showToast({ title: '网络错误', icon: 'none' });
						this.submitDisabled = false;
					} finally {
						this.loading = false;
						uni.hideLoading();
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background: #f7f8fa;
	}

	.page-title {
		width: 90%;
		margin: 0 auto;
		padding-top: 40rpx;
		font-size: 28rpx;
		color: rgba(69, 90, 100, 0.6);
	}

	.form-wrapper {
		margin: 20rpx auto;
		padding: 0 40rpx;
		width: 94%;
		border-radius: 16rpx;
		background: #fff;
		box-sizing: border-box;
	}

	.footer {
		margin-top: 80rpx;
		padding: 0 40rpx;

		.btn-wrapper {
			width: 100%;
		}
	}
</style>