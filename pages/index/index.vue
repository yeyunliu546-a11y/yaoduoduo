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

		<view class="banner-swiper">
		    <swiper 
		        class="swiper" 
		        circular 
		        :indicator-dots="true" 
		        :autoplay="true" 
		        :interval="3000" 
		        :duration="500"
		        indicator-active-color="#007aff"
		        indicator-color="rgba(255, 255, 255, 0.6)"
		    >
		        <swiper-item v-for="(item, index) in bannerList" :key="index">
		            <view class="swiper-item-view">
		                <image :src="item.image" mode="aspectFill" class="swiper-img"></image>
		            </view>
		        </swiper-item>
		    </swiper>
		</view>

		<view class="quick-entry">
			<view class="entry-item" v-for="(item, index) in quickItems" :key="index" @click="goToPage(item.path)">
				<image :src="item.icon" mode="aspectFill" />
				<text>{{ item.title }}</text>
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
	// 保持你原有的逻辑，完全不修改！
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
				hasMore: true,
				
				// 轮播图
				bannerList: [
				    { image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' },
				    { image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' },
				    { image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' }
				],
				
				// 菜单
				quickItems: [
					{ icon: '/static/menu/icon_1.png', title: '配药颗粒', path: '/pages/category/category?type=2' },
					{ icon: '/static/menu/icon_2.png', title: '中药饮片', path: '/pages/category/category?type=1' },
					{ icon: '/static/menu/icon_3.png', title: '中药伴侣', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_4.png', title: '调剂煎配', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_5.png', title: '药膳汇', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_6.png', title: '汤剂', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_7.png', title: '爆品饮片', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_8.png', title: '智能开方', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_9.png', title: '膏方', path: '/pages/category/category' },
					{ icon: '/static/menu/icon_10.png', title: '会员权益', path: '/pages/user/user' }
				]
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
			}
		}
	}
</script>

<style lang="scss">
	/* --- 原有基础样式保持不变 --- */
	.container { width: 100%; min-height: 100vh; background-color: #f8f8f8; font-size: 14px; color: #333; padding-bottom: 20rpx; }
	.search-box { display: flex; align-items: center; margin: 20rpx; height: 72rpx; border-radius: 36rpx; background-color: #007aff; padding: 2rpx; overflow: hidden; }
	.search-input { flex: 1; display: flex; align-items: center; padding-left: 24rpx; height: 100%; background-color: #fff; border-top-left-radius: 34rpx; border-bottom-left-radius: 34rpx; }
	.search-input input { flex: 1; font-size: 28rpx; background: transparent; }
	.btn-search { width: 140rpx; height: 100%; background-color: #007aff; color: white; font-size: 28rpx; border-radius: 0; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; }
	.btn-search::after { border: none; }
	.icon-search { margin-right: 10rpx; font-size: 28rpx; color: #999; }
	.clear-btn { color: #999; font-size: 16px; margin-left: 10rpx; }
	.search-history { background-color: #fff; border-radius: 10rpx; margin: 10rpx 20rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
	.history-title { font-size: 16px; padding: 10rpx 20rpx; color: #333; border-bottom: 1px solid #eee; }
	.history-list { display: flex; flex-wrap: wrap; gap: 10rpx; padding: 10rpx 20rpx; }
	.history-item { background-color: #f0f0f0; border-radius: 6rpx; padding: 5rpx 10rpx; font-size: 14px; color: #333; }
	.clear-history { color: #007aff; font-size: 14px; margin-top: 10rpx; text-align: center; padding: 10rpx; }
	.quick-entry { display: flex; flex-wrap: wrap; padding: 30rpx 0; background-color: #fff; border-radius: 16rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); margin: 20rpx; }
	.entry-item { width: 25%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16rpx 0; }
	.entry-item image { width: 80rpx; height: 80rpx; margin-bottom: 12rpx; border-radius: 0; }
	.entry-item text { font-size: 24rpx; color: #333; font-weight: 400; }
	.banner-swiper { margin: 20rpx 20rpx 0 20rpx; height: 300rpx; border-radius: 16rpx; overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05); }
	.swiper { width: 100%; height: 100%; }
	.swiper-item-view { width: 100%; height: 100%; }
	.swiper-img { width: 100%; height: 100%; display: block; }
	
	.promotion-section { background-color: #fff; border-radius: 16rpx; padding: 24rpx; margin: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); }
	.section-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
	.promotion-item { display: flex; justify-content: space-between; align-items: center; padding: 10rpx 0; }
	.promotion-item image { width: 160rpx; height: 160rpx; border-radius: 12rpx; background: #f5f5f5;}
	.product-info { flex: 1; margin: 0 20rpx; display: flex; flex-direction: column;}
	.product-info .name { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;}
	.product-info .price { font-size: 36rpx; color: #ff3b30; font-weight: bold; }
	.product-info .original-price { font-size: 22rpx; color: #999; text-decoration: line-through; margin-left: 10rpx;}
	.product-info .tags-row { margin-top: 10rpx;}
	.product-info .tag { font-size: 20rpx; color: #ff9900; background-color: #fff5e6; padding: 4rpx 10rpx; border-radius: 6rpx; }
	.btn-buy { background: linear-gradient(135deg, #007aff, #0055ff); color: white; border: none; padding: 0 30rpx; height: 60rpx; line-height: 60rpx; border-radius: 30rpx; font-size: 24rpx; font-weight: bold; box-shadow: 0 4rpx 10rpx rgba(0,122,255,0.3); margin: 0;}

	/* ======================================= */
	/* 👇 全新的双排瀑布流商品卡片样式 👇 */
	/* ======================================= */
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
		width: 48.5%; /* 双排核心 */
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
		height: 340rpx; /* 1:1 图片比例 */
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
			background: rgba(255, 59, 48, 0.8);
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
		height: 80rpx; /* 固定两行高度 */
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
		overflow: hidden; /* 防止标签过多撑开卡片 */
		
		.tag-item {
			font-size: 20rpx;
			padding: 2rpx 8rpx;
			border-radius: 6rpx;
			white-space: nowrap;
			
			&.manufacturer { color: #666; background: #f5f5f5; }
			&.standard { color: #007aff; background: #eaf2ff; }
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
		margin-top: auto; /* 将价格和按钮推到底部 */
	}

	.price-wrapper {
		display: flex;
		align-items: baseline;
		color: #ff3b30;
		
		.price-symbol { font-size: 24rpx; font-weight: bold; }
		.price-main { font-size: 36rpx; font-weight: 800; margin-left: 2rpx; }
		.price-line { font-size: 20rpx; color: #ccc; text-decoration: line-through; margin-left: 8rpx; font-weight: normal; }
	}

	.cart-btn-circle {
		width: 48rpx;
		height: 48rpx;
		background: linear-gradient(135deg, #007aff, #0055ff);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.3);
		
		text {
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			line-height: 1;
			margin-top: -4rpx; /* 微调加号居中 */
		}
	}

	/* 底部加载状态 */
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