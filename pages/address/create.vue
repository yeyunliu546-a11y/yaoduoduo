<template>
	<view class="container">
		<view class="page-title">新增收货地址</view>
		
		<view class="form-wrapper">
			<u-form :model="form" ref="uForm" label-width="140rpx">
				<u-form-item label="姓名" prop="Name">
					<u-input v-model="form.Name" placeholder="请输入收货人姓名" />
				</u-form-item>
				
				<u-form-item label="电话" prop="Phone">
					<u-input v-model="form.Phone" placeholder="请输入收货人手机号" type="number" />
				</u-form-item>
				
				<u-form-item label="地区" prop="RegionDisplay">
					<u-input 
						v-model="form.RegionDisplay" 
						placeholder="请选择省市区" 
						disabled 
						@click="showPicker = true" 
					/>
					<u-icon slot="right" name="arrow-right" color="#ccc" size="28" @click="showPicker = true" />
				</u-form-item>
				
				<u-form-item label="详细地址" prop="Detail" :border-bottom="false">
					<u-input v-model="form.Detail" placeholder="街道门牌、楼层等信息" />
				</u-form-item>
			</u-form>
		</view>
		
		<u-picker
			v-model="showPicker"
			mode="region"
			@confirm="handleRegionConfirm"
		></u-picker>
		
		<view class="footer">
			<view class="btn-wrapper">
				<u-button 
					type="error" 
					shape="circle" 
					:loading="loading" 
					:disabled="loading"
					@click="handleSubmit"
				>保存收货地址</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 收货地址新增页面
	 * 对接文档：收货地址管理API对接文档.md
	 */
	import * as AddressApi from '@/api/user/userAddress.js'

	export default {
		data() {
			return {
				showPicker: false,
				loading: false,
				// 表单模型：遵循 API 文档 PascalCase 规范
				form: {
					Name: '',
					Phone: '',
					Detail: '',
					ListRegion: [],    // 接口要求的 [{Value, Label}] 结构
					RegionDisplay: ''  // 用于前端页面回显
				},
				rules: {
					Name: [{ required: true, message: '请输入收货人姓名', trigger: ['blur', 'change'] }],
					Phone: [
						{ required: true, message: '请输入联系电话', trigger: ['blur', 'change'] },
						{ 
							validator: (rule, value) => this.$u.test.mobile(value), 
							message: '手机号格式不正确', 
							trigger: ['blur', 'change'] 
						}
					],
					RegionDisplay: [{ required: true, message: '请选择地区', trigger: ['change'] }],
					Detail: [{ required: true, message: '请输入详细地址', trigger: ['blur', 'change'] }]
				}
			}
		},
		onReady() {
			// 设置校验规则
			if (this.$refs.uForm) {
				this.$refs.uForm.setRules(this.rules);
			}
		},
		methods: {
			/**
			 * 地区选择确定回调
			 */
			handleRegionConfirm(e) {
				console.log('Picker 选择原始数据:', e);
				
				const pName = e.province.label || e.province.name || '';
				const cName = e.city.label || e.city.name || '';
				const aName = e.area.label || e.area.name || '';
				
				const pValue = e.province.value || e.province.id || '';
				const cValue = e.city.value || e.city.id || '';
				const aValue = e.area.value || e.area.id || '';

				this.form.RegionDisplay = `${pName} ${cName} ${aName}`;
				this.form.ListRegion = [
					{ Value: pValue, Label: pName },
					{ Value: cValue, Label: cName },
					{ Value: aValue, Label: aName }
				];
			},

			/**
			 * 提交表单 - 修复逻辑核心点
			 */
			handleSubmit() {
				this.$refs.uForm.validate(async (valid) => {
					if (!valid) return;

					this.loading = true;
					uni.showLoading({ title: '正在保存...', mask: true });

					try {
						const postData = {
							Name: this.form.Name,
							Phone: this.form.Phone,
							Detail: this.form.Detail,
							ListRegion: this.form.ListRegion
						};

						// 调用后端 API
						const res = await AddressApi.addOrUpdate(postData);
						
						// 1. 调试日志：确认数据类型
						console.log('保存接口返回:', res, 'Code类型:', typeof res.Code || typeof res.code);

						// 2. 弱类型判断与大小写兼容
						const responseCode = res.Code !== undefined ? res.Code : res.code;
						
						if (responseCode == 200) {
							uni.showToast({ title: '添加成功', icon: 'success' });
							// 成功后跳转
							setTimeout(() => {
								uni.navigateBack();
							}, 1200);
						} else {
							// 业务逻辑错误，手动弹出后端返回的 Message
							uni.showToast({ 
								title: res.Message || res.message || '操作失败', 
								icon: 'none' 
							});
						}
					} catch (err) {
						// 3. 异常处理：弹出具体错误
						console.error('请求发生异常:', err);
						uni.showToast({ 
							title: err.Message || err.errMsg || '请求异常', 
							icon: 'none' 
						});
					} finally {
						// 4. Loading 保护：统一在最后关闭，避免重复调用 hideLoading
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
		padding: 40rpx 30rpx 20rpx;
		font-size: 28rpx;
		color: #909399;
	}

	.form-wrapper {
		margin: 0 30rpx;
		padding: 0 30rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.footer {
		margin-top: 80rpx;
		padding: 0 60rpx;
	}
</style>