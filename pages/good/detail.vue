<template>
	<view class="container" v-if="goodsInfo.id">
		<scroll-view class="scroll-container" scroll-y>
			<swiper class="goods-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
				<swiper-item v-for="(item, index) in goodsInfo.listImg" :key="index">
					<image :src="item.filePath" mode="aspectFill" class="swiper-img" @click="previewImage(index)"></image>
				</swiper-item>
			</swiper>

			<view class="info-section">
				<view class="price-row">
					<view class="main-price">
						<text class="symbol">¥</text>
						<text class="num">{{ currentSku.salePrice || '0.00' }}</text>
					</view>
					<view class="sub-info" v-if="currentSku.linePrice > currentSku.salePrice">
						<text class="line-price">¥{{ currentSku.linePrice }}</text>
					</view>
				</view>
				
				<view class="product-name">{{ goodsInfo.goodsName }}</view>
				
				<view class="tags-row">
					<text class="tag manufacturer" v-if="goodsInfo.manufacturer">{{ goodsInfo.manufacturer }}</text>
					<text class="tag standard" v-if="goodsInfo.standard">{{ goodsInfo.standard }}</text>
					<text class="tag package" v-if="goodsInfo.packageType">{{ goodsInfo.packageType }}</text>
				</view>

				<view class="meta-row">
					<view class="meta-item">
						<text class="label">规格：</text>
						<text class="value">{{ currentSku.skuName || '默认规格' }}</text>
					</view>
					<view class="meta-item">
						<text class="label">装量：</text>
						<text class="value">{{ formatWeight(currentSku.goodsWeight) }}</text>
					</view>
					<view class="meta-item">
						<text class="label">库存：</text>
						<text class="value">{{ currentSku.stockNum }}件</text>
					</view>
				</view>
				
				<view class="remark" v-if="goodsInfo.subTitle">
					<text class="iconfont icon-info"></text>
					{{ goodsInfo.subTitle }}
				</view>
			</view>

			<view class="desc-section">
				<view class="section-title">—— 商品详情 ——</view>
				<view class="desc-content">
					<block v-for="(img, idx) in goodsInfo.listImgDetail" :key="idx">
						<image :src="img.filePath" mode="widthFix" class="detail-img"></image>
					</block>
					
					<view v-if="(!goodsInfo.listImgDetail || goodsInfo.listImgDetail.length === 0)" class="empty-desc">
						暂无图文详情
					</view>
				</view>
			</view>
			
			<view style="height: 120rpx;"></view>
		</scroll-view>

		<view class="action-bar">
			<view class="total-info">
				<text class="label">总计:</text>
				<text class="price">¥{{ currentSku.salePrice || '0.00' }}</text>
			</view>
			<view class="btn-group">
				<button class="btn-cart" @click="addToCart">加入购物车</button>
				<button class="btn-buy" @click="buyNow">立即购买</button>
			</view>
		</view>
	</view>
	
	<view v-else class="loading-state">
		<text>加载中...</text>
	</view>
</template>

<script>
	// 定义API基础路径
	const BASE_API = 'http://112.126.75.108:5000';

	export default {
		data() {
			return {
				goodsId: '',
				goodsInfo: {},    // 存放完整的商品信息对象
				currentSku: {},   // 当前选中的SKU信息（价格、库存、重量等）
				loading: true
			};
		},
		onLoad(options) {
			// 1. 获取URL传过来的 id
			if (options.id) {
				this.goodsId = options.id;
				this.loadGoodsDetail();
			} else {
				uni.showToast({ title: '商品不存在', icon: 'none' });
			}
		},
		methods: {
			// 获取详情数据
			loadGoodsDetail() {
				const _this = this;
				uni.request({
					url: `${BASE_API}/Goods/Get`, // 对接文档: /api/Goods/Get
					method: 'GET',
					data: {
						id: _this.goodsId
					},
					success: (res) => {
						if (res.data.code === 200) {
							const result = res.data.result;
							_this.goodsInfo = result;
							
							// 默认选中第一个 SKU 用于显示价格和规格
							if (result.listSku && result.listSku.length > 0) {
								_this.currentSku = result.listSku[0];
							}
							
							_this.loading = false;
						} else {
							uni.showToast({ title: res.data.message || '获取详情失败', icon: 'none' });
						}
					},
					fail: () => {
						uni.showToast({ title: '网络请求失败', icon: 'none' });
					}
				});
			},

			// 重量格式化工具：克转千克
			formatWeight(g) {
				if (!g) return '0g';
				if (g >= 1000) {
					return (g / 1000).toFixed(1) + 'kg';
				}
				return g + 'g';
			},

			// 图片预览
			previewImage(current) {
				const urls = this.goodsInfo.listImg.map(item => item.filePath);
				uni.previewImage({
					current: current,
					urls: urls
				});
			},

			addToCart() {
				uni.showToast({ title: '加入购物车成功', icon: 'success' });
				// 这里后续对接购物车API
			},

			buyNow() {
				uni.showToast({ title: '发起购买', icon: 'none' });
				// 这里后续跳转订单确认页
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* 轮播图 */
	.goods-swiper {
		width: 100%;
		height: 750rpx; /* 正方形大图 */
		background-color: #fff;
	}
	.swiper-img {
		width: 100%;
		height: 100%;
	}

	/* 信息卡片 */
	.info-section {
		background: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		margin-bottom: 20rpx;
		
		.main-price {
			color: #ff4400;
			font-weight: bold;
			.symbol { font-size: 28rpx; }
			.num { font-size: 48rpx; }
		}
		
		.line-price {
			margin-left: 20rpx;
			font-size: 24rpx;
			color: #999;
			text-decoration: line-through;
		}
	}

	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		line-height: 1.4;
		margin-bottom: 20rpx;
	}

	/* 标签样式 */
	.tags-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 24rpx;
		
		.tag {
			font-size: 22rpx;
			padding: 4rpx 12rpx;
			border-radius: 6rpx;
		}
		.manufacturer { color: #666; background: #f5f5f5; }
		.standard { color: #007aff; background: #eaf2ff; }
		.package { color: #ff9900; background: #fff5e6; }
	}

	/* 规格/库存等元数据 */
	.meta-row {
		background-color: #fafafa;
		padding: 20rpx;
		border-radius: 8rpx;
		
		.meta-item {
			display: flex;
			margin-bottom: 10rpx;
			font-size: 26rpx;
			
			&:last-child { margin-bottom: 0; }
			
			.label { color: #999; width: 100rpx; }
			.value { color: #333; }
		}
	}

	.remark {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #e6a23c;
		background: #fdf6ec;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
	}

	/* 详情部分 */
	.desc-section {
		background: #fff;
		padding-bottom: 40rpx;
		
		.section-title {
			padding: 30rpx 0;
			text-align: center;
			font-size: 28rpx;
			color: #999;
			display: flex;
			justify-content: center;
			align-items: center;
			
			&::before, &::after {
				content: '';
				width: 60rpx;
				height: 1px;
				background: #eee;
				margin: 0 20rpx;
			}
		}
		
		.detail-img {
			width: 100%;
			display: block; // 消除图片间隙
		}
		
		.empty-desc {
			text-align: center;
			padding: 50rpx;
			color: #ccc;
		}
	}

	/* 底部操作栏 */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		height: 100rpx;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
		z-index: 99;
		/* 适配iPhone X底部安全区 */
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		
		.total-info {
			flex: 1;
			font-size: 28rpx;
			.label { color: #333; margin-right: 10rpx; }
			.price { color: #ff4400; font-weight: bold; font-size: 32rpx; }
		}
		
		.btn-group {
			display: flex;
			height: 72rpx;
			
			button {
				margin: 0;
				padding: 0 30rpx;
				line-height: 72rpx;
				font-size: 28rpx;
				border-radius: 0;
				
				&::after { border: none; }
			}
			
			.btn-cart {
				background: #ffaa00;
				color: #fff;
				border-top-left-radius: 36rpx;
				border-bottom-left-radius: 36rpx;
			}
			
			.btn-buy {
				background: #ff4400;
				color: #fff;
				border-top-right-radius: 36rpx;
				border-bottom-right-radius: 36rpx;
			}
		}
	}
	
	.loading-state {
		text-align: center;
		padding-top: 200rpx;
		color: #999;
	}
</style>