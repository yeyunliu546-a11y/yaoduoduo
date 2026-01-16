<template>
	<view v-if="!isLoading" class="container">

		<view class="goods-detail b-f dis-flex flex-dir-row">
			<view class="left">
				<image class="goods-image" :src="sku.skuImageUrl"></image>
			</view>
			<view class="right dis-flex flex-box flex-dir-column flex-x-around">
				<view class="goods-name">
					<text class="twoline-hide">{{ sku.goodsName }}</text>
				</view>
				<view class="dis-flex col-9 f-24">
					<view class="flex-box">
						<view class="goods-props clearfix">
							<text>{{ sku.skuName }}</text>
						</view>
					</view>
					<text class="t-r">×{{ sku.quantity }}</text>
				</view>
			</view>
		</view>

		<view class="row-service b-f m-top20">
			<view class="row-title">服务类型</view>
			<view class="service-switch dis-flex">
				<view class="switch-item" v-for="(item, index) in RefundTypeEnum.data" :key="index"
					:class="{ active: formData.refundType == item.value }" @click="onSwitchService(item.value)">
					{{ item.name }}</view>
			</view>
		</view>

		<view class="row-textarea b-f m-top20">
			<view class="row-title">申请原因</view>
			<view class="refundDescription">
				<textarea class="textarea" v-model="formData.refundDescription" maxlength="2000"
					placeholder="请详细填写申请原因，注意保持商品的完好，建议您先与卖家沟通" placeholderStyle="color:#ccc"></textarea>
			</view>
		</view>

		<view v-if="formData.refundType == RefundTypeEnum.RETURN.value" class="row-money b-f m-top20 dis-flex">
			<view class="row-title">退款金额</view>
			<view class="money col-m">￥{{ sku.payPrice }}</view>
		</view>

		<view class="row-voucher b-f m-top20">
			<view class="row-title">上传凭证 (最多6张)</view>
			<view class="image-list">
				<view class="image-preview" v-for="(image, imageIndex) in listImage" :key="imageIndex">
					<text class="image-delete iconfont icon-cuowu" @click="deleteImage(imageIndex)"></text>
					<image class="image" mode="aspectFill" :src="image.path"></image>
				</view>
				<view v-if="listImage.length < maxImageLength" class="image-picker" @click="chooseImage()">
					<text class="choose-icon iconfont icon-paizhao"></text>
					<text class="choose-text">上传图片</text>
				</view>
			</view>
		</view>

		<view class="footer-fixed">
			<view class="btn-wr_thiser">
				<view class="btn-item btn-item-main" :class="{ disabled }" @click="handleSubmit()">确认提交</view>
			</view>
		</view>

	</view>
</template>

<script>
	import { RefundTypeEnum } from '@/common/enum/order/refund'
	// [模拟修改] 注释掉后端 API
	// import * as UploadApi from '@/api/upload'
	// import * as OrderSKuApi from '@/api/order/orderSku'
	// import * as RefundApi from '@/api/order/orderRefundSku'

	const maxImageLength = 6

	export default {
		data() {
			return {
				// 枚举类
				RefundTypeEnum,
				// 正在加载
				isLoading: true,
				// 订单商品id
				orderSkuId: null,
				// 订单商品详情
				sku: {},
				// 表单数据
				formData: {
					// 图片上传成功的文件ID集
					listImageId: [],
					// 服务类型
					refundType: 10,
					// 申请原因
					refundDescription: ''
				},
				// 用户选择的图片列表
				listImage: [],
				// 最大图片数量
				maxImageLength,
				// 按钮禁用
				disabled: false
			}
		},

		onLoad({ orderSkuId }) {
			this.orderSkuId = orderSkuId
			this.getSkuDetail()
		},

		methods: {

			// [模拟修改] 获取订单商品详情
			getSkuDetail() {
				const _this = this
				_this.isLoading = true
				
				setTimeout(() => {
					// 构造模拟商品数据
					_this.sku = {
						goodsName: '模拟申请商品：纯棉短袖T恤',
						skuName: '白色, XL',
						quantity: 2,
						skuImageUrl: 'https://via.placeholder.com/200x200',
						payPrice: '88.00'
					}
					_this.isLoading = false
				}, 300)
			},

			onSwitchService(value) {
				this.formData.refundType = value
			},

			chooseImage() {
				const _this = this
				const oldlistImage = _this.listImage
				uni.chooseImage({
					count: _this.maxImageLength - oldlistImage.length,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success({ tempFiles }) {
						_this.listImage = oldlistImage.concat(tempFiles)
					}
				});
			},

			deleteImage(imageIndex) {
				this.listImage.splice(imageIndex, 1)
			},

			handleSubmit() {
				const _this = this
				const { listImage } = _this
				if (_this.disabled === true) return false
				_this.disabled = true
				
				if (listImage.length > 0) {
					_this.uploadFile()
						.then(() => _this.onSubmit())
						.catch(err => {
							_this.disabled = false
							console.log('err', err)
						})
				} else {
					_this.onSubmit()
				}
			},

			// [模拟修改] 提交到后端
			onSubmit() {
				const _this = this
				_this.formData.orderSkuId = _this.orderSkuId;
				
				// 模拟提交
				setTimeout(() => {
					_this.$toast('申请提交成功 (模拟)')
					setTimeout(() => {
						_this.disabled = false
						uni.navigateBack()
					}, 1500)
				}, 800)
			},

			// [模拟修改] 上传图片
			uploadFile() {
				const _this = this
				const { listImage } = _this
				return new Promise((resolve, reject) => {
					// 模拟上传成功，返回虚拟文件ID
					setTimeout(() => {
						const mockFileIds = listImage.map((_, index) => 1000 + index)
						_this.formData.listImageId = mockFileIds
						resolve(mockFileIds)
					}, 500)
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.container {
		// 设置ios刘海屏底部横线安全区域
		padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
		padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
	}

	.row-title {
		color: #888;
		margin-bottom: 20rpx;
	}

	// 商品信息
	.goods-detail {
		padding: 24rpx 20rpx;

		.left {
			.goods-image {
				display: block;
				width: 150rpx;
				height: 150rpx;
			}
		}

		.right {
			padding-left: 20rpx;
		}

		.goods-props {
			margin-top: 14rpx;
			height: 40rpx;
			color: #ababab;
			font-size: 24rpx;
			overflow: hidden;

			.goods-props-item {
				display: inline-block;
				margin-right: 14rpx;
				padding: 4rpx 16rpx;
				border-radius: 12rpx;
				background-color: #F5F5F5;
				width: auto;
			}
		}
	}

	/* 服务类型 */
	.row-service {
		padding: 24rpx 20rpx;
	}

	.service-switch {
		.switch-item {
			padding: 6rpx 30rpx;
			margin-right: 25rpx;
			border-radius: 10rpx;
			border: 1px solid rgb(177, 177, 177);
			color: #888;

			&.active {
				color: #fc1e56;
				border: 1px solid #fc1e56;
			}
		}
	}

	/* 申请原因 */
	.row-textarea {
		padding: 24rpx 20rpx;

		.textarea {
			width: 100%;
			height: 220rpx;
			padding: 12rpx;
			border: 1rpx solid #e8e8e8;
			border-radius: 5rpx;
			box-sizing: border-box;
			font-size: 26rpx;
		}
	}

	/* 退款金额 */
	.row-money {
		padding: 24rpx 20rpx;

		.row-title {
			margin-bottom: 0;
			margin-right: 30rpx;
		}
	}

	// 上传凭证
	.row-voucher {
		padding: 24rpx 20rpx;

		.image-list {
			padding: 0 20rpx;
			margin-top: 20rpx;
			margin-bottom: -20rpx;

			&:after {
				clear: both;
				refundDescription: " ";
				display: table;
			}

			.image {
				display: block;
				width: 100%;
				height: 100%;
			}

			.image-picker,
			.image-preview {
				width: 184rpx;
				height: 184rpx;
				margin-right: 30rpx;
				margin-bottom: 30rpx;
				float: left;

				&:nth-child(3n+0) {
					margin-right: 0;
				}
			}

			.image-picker {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				border: 1rpx dashed #ccc;
				color: #ccc;

				.choose-icon {
					font-size: 48rpx;
					margin-bottom: 6rpx;
				}

				.choose-text {
					font-size: 24rpx;
				}
			}

			.image-preview {
				position: relative;

				.image-delete {
					position: absolute;
					top: -15rpx;
					right: -15rpx;
					height: 42rpx;
					width: 42rpx;
					line-height: 42rpx;
					background: rgba(0, 0, 0, 0.64);
					border-radius: 50%;
					color: #fff;
					font-weight: bolder;
					font-size: 22rpx;
					z-index: 10;
					text-align: center;
				}
			}
		}
	}


	// 底部操作栏
	.footer-fixed {
		position: fixed;
		bottom: var(--window-bottom);
		left: 0;
		right: 0;
		z-index: 11;
		box-shadow: 0 -4rpx 40rpx 0 rgba(151, 151, 151, 0.24);
		background: #fff;

		// 设置ios刘海屏底部横线安全区域
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.btn-wr_thiser {
			height: 120rpx;
			display: flex;
			align-items: center;
			padding: 0 20rpx;
		}

		.btn-item {
			flex: 1;
			font-size: 28rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			color: #fff;
			border-radius: 50rpx;
		}

		.btn-item-main {
			background: linear-gradient(to right, #f9211c, #ff6335);

			// 禁用按钮
			&.disabled {
				background: #ff9779;
			}
		}

	}
</style>