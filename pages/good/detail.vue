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
						<text class="value">{{ currentSku.skuName || goodsInfo.specification || '默认规格' }}</text>
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
	// 【修改】使用 API 模块
	import { getGoodsDetail } from '@/api/goods/goods.js';
	import { addCart } from '@/api/goods/cart.js';

	export default {
		data() {
			return {
				goodsId: '',
				goodsInfo: {},    
				currentSku: {},   
				loading: true
			};
		},
		onLoad(options) {
			if (options.id) {
				this.goodsId = options.id;
				this.loadDetail();
			} else {
				uni.showToast({ title: '商品不存在', icon: 'none' });
			}
		},
		methods: {
			loadDetail() {
				// 调用 API
				getGoodsDetail(this.goodsId).then(res => {
					// 兼容 Result 结构
					if (res.code === 200 && res.result) {
						const result = res.result;
						this.goodsInfo = result;
						
						// 默认选中第一个 SKU
						if (result.listSku && result.listSku.length > 0) {
							this.currentSku = result.listSku[0];
						} else {
							// 构造默认 SKU 避免报错
							this.currentSku = {
								salePrice: result.salePrice,
								linePrice: result.linePrice,
								stockNum: result.stockTotal,
								skuName: result.specification || result.spec
							};
						}
						this.loading = false;
					} else {
						uni.showToast({ title: res.message || '获取失败', icon: 'none' });
					}
				});
			},

			previewImage(current) {
				if (!this.goodsInfo.listImg) return;
				const urls = this.goodsInfo.listImg.map(item => item.filePath);
				uni.previewImage({
					current: current,
					urls: urls
				});
			},

			addToCart() {
				uni.showLoading({ title: '加入中' });
				// 【修改】调用购物车 API
				const params = {
					goodsSkuId: this.goodsInfo.id, // 这里如果列表 ID 就是 SPU ID，且没有 SKU，则传 ID。有 SKU 则传 currentSku.id
					goodsNum: 1
				};
				
				addCart(params).then(res => {
					uni.hideLoading();
					if (res.code === 200) {
						uni.showToast({ title: '已加入购物车', icon: 'success' });
					} else {
						uni.showToast({ title: res.message || '加入失败', icon: 'none' });
					}
				});
			},

			buyNow() {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* 样式保持不变 */
	.container { background-color: #f8f8f8; min-height: 100vh; }
	.goods-swiper { width: 100%; height: 750rpx; background-color: #fff; }
	.swiper-img { width: 100%; height: 100%; }
	.info-section { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
	.price-row { display: flex; align-items: baseline; margin-bottom: 20rpx; .main-price { color: #ff4400; font-weight: bold; .symbol { font-size: 28rpx; } .num { font-size: 48rpx; } } .line-price { margin-left: 20rpx; font-size: 24rpx; color: #999; text-decoration: line-through; } }
	.product-name { font-size: 32rpx; font-weight: bold; color: #333; line-height: 1.4; margin-bottom: 20rpx; }
	.tags-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 24rpx; .tag { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; } .manufacturer { color: #666; background: #f5f5f5; } .standard { color: #007aff; background: #eaf2ff; } .package { color: #ff9900; background: #fff5e6; } }
	.meta-row { background-color: #fafafa; padding: 20rpx; border-radius: 8rpx; .meta-item { display: flex; margin-bottom: 10rpx; font-size: 26rpx; &:last-child { margin-bottom: 0; } .label { color: #999; width: 100rpx; } .value { color: #333; } } }
	.remark { margin-top: 20rpx; font-size: 24rpx; color: #e6a23c; background: #fdf6ec; padding: 10rpx 20rpx; border-radius: 8rpx; }
	.desc-section { background: #fff; padding-bottom: 40rpx; .section-title { padding: 30rpx 0; text-align: center; font-size: 28rpx; color: #999; display: flex; justify-content: center; align-items: center; &::before, &::after { content: ''; width: 60rpx; height: 1px; background: #eee; margin: 0 20rpx; } } .detail-img { width: 100%; display: block; } .empty-desc { text-align: center; padding: 50rpx; color: #ccc; } }
	.action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; height: 100rpx; display: flex; align-items: center; padding: 0 20rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); z-index: 99; padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); .total-info { flex: 1; font-size: 28rpx; .label { color: #333; margin-right: 10rpx; } .price { color: #ff4400; font-weight: bold; font-size: 32rpx; } } .btn-group { display: flex; height: 72rpx; button { margin: 0; padding: 0 30rpx; line-height: 72rpx; font-size: 28rpx; border-radius: 0; &::after { border: none; } } .btn-cart { background: #ffaa00; color: #fff; border-top-left-radius: 36rpx; border-bottom-left-radius: 36rpx; } .btn-buy { background: #ff4400; color: #fff; border-top-right-radius: 36rpx; border-bottom-right-radius: 36rpx; } } }
	.loading-state { text-align: center; padding-top: 200rpx; color: #999; }
</style>