<template>
	<view class="container">
		<view class="search-box">
			<view class="search-input">
				<text class="icon-search">🔍</text>
				<input v-model="searchValue" type="text" placeholder="请输入您需要的药材" @confirm="onSearch"
					@focus="showHistory = true" />
				<text v-if="searchValue" class="clear-btn" @click="clearSearch">✕</text>
			</view>
			<button class="btn-search" @click="onSearch">搜索</button>
		</view>

		<view v-if="showHistory && searchHistory.length > 0" class="search-history">
			<view class="history-title">搜索历史</view>
			<view class="history-list">
				<view v-for="(item, index) in searchHistory" :key="index" class="history-item"
					@click="selectHistory(item)">
					{{ item }}
				</view>
				<view class="clear-history" @click="clearAllHistory">清空</view>
			</view>
		</view>

		<view class="primary-entrances">
					<view class="entrance-card orange-card" @click="jumpToCategory('procurement')">
						<view class="entrance-info">
							<text class="entrance-title">药品采购</text>
							<text class="entrance-desc">正品保障 极速发货</text>
						</view>
						<image src="/static/menu/icon_4.png" mode="aspectFit" class="entrance-icon"></image>
					</view>
					
					<view class="entrance-card blue-card" @click="jumpToCategory('dispensing')">
						<view class="entrance-info">
							<text class="entrance-title">配方颗粒</text>
							<text class="entrance-desc">海量配方 一键采购</text>
						</view>
						<image src="/static/menu/icon_1.png" mode="aspectFit" class="entrance-icon"></image>
					</view>
				</view>

		<view class="promotion-section" v-if="seckillGoods">
			<view class="section-title">爆品秒杀</view>
			<view class="promotion-item" @click="gotoDetail(seckillGoods)">
				<image :src="seckillGoods.imageUrl || seckillGoods.urlImageMain || 'https://via.placeholder.com/200x200'" mode="aspectFill" />
				<view class="product-info">
					<text class="name">{{ seckillGoods.goodsName }}</text>
					<text class="price">¥{{ seckillGoods.salePrice }}</text>
					<text class="original-price" v-if="seckillGoods.linePrice">¥{{ seckillGoods.linePrice }}</text>
					<view class="tags-row">
						<text class="tag">销量 {{ (seckillGoods.salesActual || 0) + (seckillGoods.salesInitial || 0) }}</text>
					</view>
				</view>
				<button class="btn-buy">立即去下单</button>
			</view>
		</view>

		<view class="platform-recommend modern-recommend">
			<view class="modern-header">
				<view class="title-left">
					<text class="main-title">平台精选</text>
					<text class="sub-title">为您甄选优质好药</text>
				</view>
			</view>
			
			<view v-if="loading && recommendList.length === 0" class="loading-state">
				<text>精彩内容加载中...</text>
			</view>
			
			<view class="goods-grid" v-else>
				<view v-for="(item, index) in recommendList" :key="index" class="goods-card" @click="gotoDetail(item)">
					<view class="card-img-box">
						<image :src="item.imageUrl || item.urlImageMain || 'https://via.placeholder.com/300x300?text=暂无图片'" mode="aspectFill" class="card-img"></image>
						<view class="stock-badge" v-if="item.stockTotal > 0 && item.stockTotal < 100">仅剩{{ item.stockTotal }}件</view>
					</view>
					
					<view class="card-info">
						<view class="card-title">{{ item.goodsName }}</view>
						
						<view class="card-tags">
							<text class="tag-item manufacturer" v-if="item.manufacturer">{{ item.manufacturer }}</text>
							<text class="tag-item standard" v-if="item.standard">{{ item.standard }}</text>
						</view>
						
						<view class="card-spec" v-if="item.packageType || item.specification || item.spec">
							规格: {{ item.specification || item.spec || item.packageType }}
						</view>
						
						<view class="card-bottom">
							<view class="price-wrapper">
								<text class="price-symbol">¥</text>
								<text class="price-main">{{ item.salePrice }}</text>
								<text class="price-line" v-if="item.linePrice > item.salePrice">¥{{ item.linePrice }}</text>
							</view>
							<view class="cart-btn-circle">
								<text>+</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="load-more">
				<text class="line"></text>
				<text class="text">{{ hasMore ? '上拉加载更多' : '我是有底线的' }}</text>
				<text class="line"></text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getGoodsList } from '@/api/goods/goods.js';

	export default {
		data() {
			return {
				// 搜索
				searchValue: '',
				showHistory: false,
				searchHistory: uni.getStorageSync('searchHistory') || ['青皮', '大蓟'],
				
				// 数据
				recommendList: [],
				seckillGoods: null,
				
				// 分页
				page: 1,
				limit: 10,
				loading: false,
				hasMore: true
				
				// 🌟 注意：原来的 bannerList 和 quickItems 数据已被我精简移除
			}
		},
		
		onLoad(options) {
			this.loadRecommendList(true);
			this.loadSeckillGoods();
			if (options && options.q) {
				this.searchValue = decodeURIComponent(options.q);
			}
		},
		
		onPullDownRefresh() {
			this.page = 1;
			this.hasMore = true;
			this.loadSeckillGoods();
			this.loadRecommendList(true).then(() => {
				uni.stopPullDownRefresh();
			});
		},
		
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.page++;
				this.loadRecommendList(false);
			}
		},

		methods: {
			// 加载精选列表
			loadRecommendList(isRefresh = false) {
				this.loading = true;
				
				const params = {
					page: this.page,
					limit: this.limit,
					bigStatus: 10,
					sortType: 10 
				};
				
				return getGoodsList(params).then(res => {
					const list = res.result || res.data?.list || [];
					
					if (isRefresh) {
						this.recommendList = list;
					} else {
						this.recommendList = this.recommendList.concat(list);
					}
					
					this.hasMore = list.length === this.limit;
					this.loading = false;
				}).catch(err => {
					console.error('加载失败', err);
					this.loading = false;
				});
			},
			
			// 加载秒杀商品
			loadSeckillGoods() {
				const params = {
					page: 1,
					limit: 1,
					sortType: 60 // 销量降序
				};
				
				getGoodsList(params).then(res => {
					const list = res.result || res.data?.list || [];
					if (list.length > 0) {
						this.seckillGoods = list[0];
					}
				}).catch(err => {
					console.error('获取秒杀商品失败', err);
				});
			},

			gotoDetail(item) {
				if (!item || !item.id) return;
				uni.navigateTo({
					url: `/pages/good/detail?id=${item.id}`
				});
			},

			onSearch() {
				if (!this.searchValue.trim()) return;
				
				if (!this.searchHistory.includes(this.searchValue)) {
					this.searchHistory.unshift(this.searchValue);
					if (this.searchHistory.length > 10) this.searchHistory.pop();
					uni.setStorageSync('searchHistory', this.searchHistory);
				}
				this.showHistory = false;
				
				uni.navigateTo({
					url: `/pages/search/search?key=${encodeURIComponent(this.searchValue)}`
				});
			},
			
			clearSearch() { this.searchValue = ''; },
			clearAllHistory() { 
				this.searchHistory = []; 
				uni.removeStorageSync('searchHistory');
			},
			selectHistory(keyword) {
				this.searchValue = keyword;
				this.onSearch();
			},
			goToPage(path) {
				uni.navigateTo({ url: path });
			},
			jumpToCategory(type) {
							const app = getApp();
							if (!app.globalData) {
								app.globalData = {};
							}
							// 将目标分类类型存入全局变量
							app.globalData.categoryType = type;
							
							// 使用 switchTab 切换到底部导航栏页面
							uni.switchTab({
								url: '/pages/category/category'
							});
						}
		}
	}
</script>

<style lang="scss">
	/* --- 基础样式 --- */
	.container { width: 100%; min-height: 100vh; background-color: #f5f7fa; font-size: 14px; color: #333; padding-bottom: 20rpx; }
	.search-box { display: flex; align-items: center; margin: 20rpx; height: 72rpx; border-radius: 36rpx; background-color: #2979ff; padding: 2rpx; overflow: hidden; box-shadow: 0 4rpx 10rpx rgba(41,121,255,0.2);}
	.search-input { flex: 1; display: flex; align-items: center; padding-left: 24rpx; height: 100%; background-color: #fff; border-top-left-radius: 34rpx; border-bottom-left-radius: 34rpx; }
	.search-input input { flex: 1; font-size: 28rpx; background: transparent; }
	.btn-search { width: 140rpx; height: 100%; background-color: #2979ff; color: white; font-size: 28rpx; border-radius: 0; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; font-weight: bold;}
	.btn-search::after { border: none; }
	.icon-search { margin-right: 10rpx; font-size: 28rpx; color: #999; }
	.clear-btn { color: #999; font-size: 16px; margin-left: 10rpx; }
	.search-history { background-color: #fff; border-radius: 10rpx; margin: 10rpx 20rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
	.history-title { font-size: 16px; padding: 10rpx 20rpx; color: #333; border-bottom: 1px solid #eee; }
	.history-list { display: flex; flex-wrap: wrap; gap: 10rpx; padding: 10rpx 20rpx; }
	.history-item { background-color: #f0f0f0; border-radius: 6rpx; padding: 5rpx 10rpx; font-size: 14px; color: #333; }
	.clear-history { color: #2979ff; font-size: 14px; margin-top: 10rpx; text-align: center; padding: 10rpx; }

	/* ======================================= */
	/* 👇 优化后的双排入口卡片样式 👇 */
	/* ======================================= */
	.primary-entrances {
		display: flex;
		justify-content: space-between;
		padding: 0 20rpx;
		margin: 30rpx 0;
	}

	.entrance-card {
		width: 48%;
		height: 160rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
		transition: transform 0.2s ease;
		
		&:active {
			transform: scale(0.96);
		}

		&.blue-card {
			background: linear-gradient(135deg, #e6f0ff 0%, #f0f5ff 100%);
			box-shadow: 0 6rpx 16rpx rgba(41, 121, 255, 0.08);
			
			.entrance-title { color: #225cb8; }
			.entrance-desc { color: #6b8cbd; }
		}

		&.orange-card {
			background: linear-gradient(135deg, #fff0e5 0%, #fff7f0 100%);
			box-shadow: 0 6rpx 16rpx rgba(255, 136, 0, 0.08);
			
			.entrance-title { color: #c46200; }
			.entrance-desc { color: #cc8e4d; }
		}
	}

	.entrance-info {
		display: flex;
		flex-direction: column;
		z-index: 2;
	}

	.entrance-title {
		font-size: 32rpx;
		font-weight: 900;
		margin-bottom: 8rpx;
		letter-spacing: 2rpx;
	}

	.entrance-desc {
		font-size: 20rpx;
		background: rgba(255, 255, 255, 0.5);
		padding: 4rpx 10rpx;
		border-radius: 6rpx;
	}

	.entrance-icon {
		width: 84rpx;
		height: 84rpx;
		z-index: 2;
	}

	/* ======================================= */
	/* 以下爆品秒杀及商品列表样式保持不变 */
	/* ======================================= */
	.promotion-section { background-color: #fff; border-radius: 16rpx; padding: 24rpx; margin: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); }
	.section-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
	.promotion-item { display: flex; justify-content: space-between; align-items: center; padding: 10rpx 0; }
	.promotion-item image { width: 160rpx; height: 160rpx; border-radius: 12rpx; background: #f5f5f5;}
	.product-info { flex: 1; margin: 0 20rpx; display: flex; flex-direction: column;}
	.product-info .name { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;}
	.product-info .price { font-size: 36rpx; color: #fa3534; font-weight: bold; }
	.product-info .original-price { font-size: 22rpx; color: #999; text-decoration: line-through; margin-left: 10rpx;}
	.product-info .tags-row { margin-top: 10rpx;}
	.product-info .tag { font-size: 20rpx; color: #ff9900; background-color: #fff5e6; padding: 4rpx 10rpx; border-radius: 6rpx; }
	.btn-buy { background: linear-gradient(135deg, #2979ff, #4792ff); color: white; border: none; padding: 0 30rpx; height: 60rpx; line-height: 60rpx; border-radius: 30rpx; font-size: 24rpx; font-weight: bold; box-shadow: 0 4rpx 10rpx rgba(41,121,255,0.3); margin: 0;}

	.modern-recommend {
		margin: 30rpx 20rpx;
	}

	.modern-header {
		display: flex;
		align-items: flex-end;
		margin-bottom: 24rpx;
		padding: 0 10rpx;
		
		.title-left {
			display: flex;
			align-items: baseline;
			
			.main-title {
				font-size: 36rpx;
				font-weight: 800;
				color: #333;
			}
			.sub-title {
				font-size: 22rpx;
				color: #999;
				margin-left: 16rpx;
			}
		}
	}

	.goods-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.goods-card {
		width: 48.5%; 
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s;
		
		&:active {
			transform: scale(0.98);
		}
	}

	.card-img-box {
		width: 100%;
		height: 340rpx; 
		background-color: #f9f9f9;
		position: relative;
		
		.card-img {
			width: 100%;
			height: 100%;
		}
		
		.stock-badge {
			position: absolute;
			bottom: 16rpx;
			left: 16rpx;
			background: rgba(250, 53, 52, 0.8);
			color: #fff;
			font-size: 20rpx;
			padding: 4rpx 12rpx;
			border-radius: 20rpx;
			backdrop-filter: blur(4px);
		}
	}

	.card-info {
		padding: 16rpx 20rpx 20rpx;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.card-title {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		line-height: 40rpx;
		height: 80rpx; 
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		margin-bottom: 12rpx;
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
		margin-bottom: 8rpx;
		height: 32rpx;
		overflow: hidden; 
		
		.tag-item {
			font-size: 20rpx;
			padding: 2rpx 8rpx;
			border-radius: 6rpx;
			white-space: nowrap;
			
			&.manufacturer { color: #666; background: #f5f5f5; }
			&.standard { color: #2979ff; background: #eaf2ff; }
		}
	}

	.card-spec {
		font-size: 22rpx;
		color: #999;
		margin-bottom: 16rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: auto; 
	}

	.price-wrapper {
		display: flex;
		align-items: baseline;
		color: #fa3534;
		
		.price-symbol { font-size: 24rpx; font-weight: bold; }
		.price-main { font-size: 36rpx; font-weight: 800; margin-left: 2rpx; }
		.price-line { font-size: 20rpx; color: #ccc; text-decoration: line-through; margin-left: 8rpx; font-weight: normal; }
	}

	.cart-btn-circle {
		width: 48rpx;
		height: 48rpx;
		background: linear-gradient(135deg, #2979ff, #4792ff);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(41, 121, 255, 0.3);
		
		text {
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			line-height: 1;
			margin-top: -4rpx; 
		}
	}

	.loading-state {
		padding: 60rpx 0;
		text-align: center;
		color: #999;
		font-size: 24rpx;
	}

	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		
		.text {
			font-size: 24rpx;
			color: #b2b2b2;
			margin: 0 20rpx;
		}
		.line {
			width: 60rpx;
			height: 1px;
			background-color: #e5e5e5;
		}
	}
</style>