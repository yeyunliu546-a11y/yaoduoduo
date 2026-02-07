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

		<view class="platform-recommend">
			<view class="section-title">平台精选</view>
			
			<view v-if="loading && recommendList.length === 0" style="padding: 20rpx; text-align: center; color: #999;">加载中...</view>
			
			<view class="recommend-list" v-else>
				<view v-for="(item, index) in recommendList" :key="index" class="recommend-item"
					@click="gotoDetail(item)">
					<view class="product-name">{{ item.goodsName }}</view>
					
					<view class="tags-row" style="display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0;">
					  <text v-if="item.manufacturer" style="font-size: 20rpx; color: #666; background: #f5f5f5; padding: 2rpx 8rpx; border-radius: 4rpx;">{{ item.manufacturer }}</text>
					  <text v-if="item.standard" style="font-size: 20rpx; color: #007aff; background: #eaf2ff; padding: 2rpx 8rpx; border-radius: 4rpx;">{{ item.standard }}</text>
					  <text v-if="item.packageType" style="font-size: 20rpx; color: #ff9900; background: #fff5e6; padding: 2rpx 8rpx; border-radius: 4rpx;">{{ item.packageType }}</text>
					</view>
					
					<view class="tags">
						<text class="tag" v-if="item.standard">{{ item.standard }}</text>
						<text class="tag" v-if="item.packageType">{{ item.packageType }}</text>
					</view>
					
					<view class="spec" v-if="item.packageType">规格: {{ item.specification || item.spec || item.packageType }}</view>
					
					<view class="price-info">
						<text class="price">¥{{ item.salePrice }}</text>
					</view>
					
					<view class="supplier">
						<text>{{ item.manufacturer }}</text>
						<text class="store-link">进店>></text>
					</view>
					
					<view class="remark" v-if="item.stockTotal < 100">
						仅剩 {{ item.stockTotal }} 件
					</view>
					
					<view class="cart-action">
						<text class="add-cart">🛒</text>
						<text class="total-price" v-if="item.linePrice > item.salePrice">原价 ¥{{ item.linePrice }}</text>
					</view>
				</view>
			</view>
			
			<view class="load-more" style="text-align: center; padding: 20rpx; color: #999;">
				{{ hasMore ? '上拉加载更多' : '—— 我是有底线的 ——' }}
			</view>
		</view>
	</view>
</template>

<script>
	// 【修改】引入 API 模块，不再写死 URL
	import * as GoodsApi from '@/api/goods/goods.js';

	export default {
		data() {
			return {
				// 搜索相关
				searchValue: '',
				showHistory: false,
				searchHistory: uni.getStorageSync('searchHistory') || ['青皮', '大蓟'], // 从本地缓存读
				
				// 数据列表
				recommendList: [], // 平台精选数据
				seckillGoods: null, // 爆品秒杀数据（取销量第一）
				
				// 分页控制
				page: 1,
				limit: 10,
				loading: false,
				hasMore: true,
				
				bannerList: [
				    // 图1：中药/草本风格 (契合中药饮片/配药)
				    { image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' },
				    // 图2：药房/药品风格 (契合西药/购药)
				    { image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' },
				    // 图3：医生/问诊风格 (契合名医坐诊/服务)
				    { image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=300&q=80' }
				],
				
				// 静态菜单 (保持不变)
				quickItems: [
					{ icon: '/static/menu/icon_1.png', title: '配药颗粒', path: '/pages/category/category?type=2' }, // 示例跳转
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
			// 初始化加载
			this.loadRecommendList(true);
			this.loadSeckillGoods();
			
			// 处理外部传参搜索
			if (options && options.q) {
				this.searchValue = decodeURIComponent(options.q);
			}
		},
		
		// 监听下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.hasMore = true;
			this.loadSeckillGoods();
			this.loadRecommendList(true).then(() => {
				uni.stopPullDownRefresh();
			});
		},
		
		// 监听触底加载更多
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.page++;
				this.loadRecommendList(false);
			}
		},

		methods: {
			// 1. 获取平台精选列表 (使用 API 模块)
			loadRecommendList(isRefresh = false) {
				this.loading = true;
				
				// 构造参数
				const params = {
					page: this.page,
					limit: this.limit,
					bigStatus: 10,  // 筛选上架商品
					sortType: 10    // 综合排序
				};
				
				// 【核心修改】调用封装的 API，不再写死 URL
				return GoodsApi.getGoodsListByWhere(params).then(res => {
					// 兼容处理：文档说 result 是数组，但有时候后端会包一层 data
					// 这里的逻辑兼容了 { code: 200, result: [...] } 和 { code: 200, data: { list: [...] } }
					const list = res.result || res.data?.list || [];
					
					if (isRefresh) {
						this.recommendList = list;
					} else {
						this.recommendList = this.recommendList.concat(list);
					}
					
					// 判断是否还有更多
					this.hasMore = list.length === this.limit;
					this.loading = false;
				}).catch(err => {
					console.error('加载失败', err);
					uni.showToast({ title: '加载失败', icon: 'none' });
					this.loading = false;
				});
			},
			
			// 2. 获取爆品秒杀商品 (使用 API 模块，按销量降序)
			loadSeckillGoods() {
				const params = {
					page: 1,
					limit: 1,
					sortType: 60 // 60: 销量降序 (对应文档)
				};
				
				GoodsApi.getGoodsListByWhere(params).then(res => {
					const list = res.result || res.data?.list || [];
					if (list.length > 0) {
						this.seckillGoods = list[0];
					}
				}).catch(err => {
					console.error('获取秒杀商品失败', err);
				});
			},

			// 跳转商品详情
			gotoDetail(item) {
				if (!item || !item.id) return;
				uni.navigateTo({
					url: `/pages/good/detail?id=${item.id}` // 传递真实ID
				});
			},

			// 搜索逻辑
			onSearch() {
				if (!this.searchValue.trim()) return;
				
				// 保存历史
				if (!this.searchHistory.includes(this.searchValue)) {
					this.searchHistory.unshift(this.searchValue);
					if (this.searchHistory.length > 10) this.searchHistory.pop();
					uni.setStorageSync('searchHistory', this.searchHistory);
				}
				
				this.showHistory = false;
				
				// 跳转搜索页 (参数名为 key，与后端文档对齐)
				uni.navigateTo({
					url: `/pages/search/search?key=${encodeURIComponent(this.searchValue)}`
				});
			},
			
			// 其他辅助方法
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
	/* 保持原有样式 */
	.container {
		width: 100%;
		min-height: 100vh;
		background-color: #f8f8f8;
		font-size: 14px;
		color: #333;
		padding-bottom: 20rpx;
	}
    
    .tags-row {
        margin-top: 5rpx;
    }

	/* 修改外层容器 */
	.search-box {
	    display: flex;
	    align-items: center;
	    margin: 20rpx;
	    height: 72rpx;
	    border-radius: 36rpx; 
	    background-color: #007aff; 
	    padding: 2rpx; 
	    overflow: hidden; 
	}
	
	/* 修改输入框区域 */
	.search-input {
	    flex: 1;
	    display: flex;
	    align-items: center;
	    padding-left: 24rpx;
	    height: 100%;
	    background-color: #fff;
	    border-top-left-radius: 34rpx; 
	    border-bottom-left-radius: 34rpx;
	}
	
	.search-input input {
	    flex: 1;
	    font-size: 28rpx;
	    background: transparent;
	}
	
	/* 修改搜索按钮 */
	.btn-search {
	    width: 140rpx;
	    height: 100%;
	    background-color: #007aff; 
	    color: white;
	    font-size: 28rpx;
	    border-radius: 0; 
	    margin: 0;
	    padding: 0;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	}
	
	.btn-search::after { border: none; }
	
	.icon-search {
	    margin-right: 10rpx;
	    font-size: 28rpx;
	    color: #999;
	}
	.clear-btn { 
		color: #999; 
		font-size: 16px; 
		margin-left: 10rpx;
	}
	.search-history { 
		background-color: #fff; 
		border-radius: 10rpx; 
		margin: 10rpx 20rpx; 
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	}
	.history-title { 
		font-size: 16px; 
		padding: 10rpx 20rpx; 
		color: #333; 
		border-bottom: 1px solid #eee; 
	}
	.history-list { 
		display: flex; 
		flex-wrap: wrap; 
		gap: 10rpx; 
		padding: 10rpx 20rpx; 
	}
	.history-item { 
		background-color: #f0f0f0; 
		border-radius: 6rpx; 
		padding: 5rpx 10rpx; 
		font-size: 14px; 
		color: #333; 
	}
	.clear-history { 
		color: #007aff; 
		font-size: 14px; 
		margin-top: 10rpx; 
		text-align: center; 
		padding: 10rpx; 
	}
	.quick-entry { 
	    display: flex; 
	    flex-wrap: wrap; 
	    padding: 30rpx 0; 
	    background-color: #fff; 
	    border-radius: 10rpx; 
	    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	    margin: 20rpx; 
	}
	
	.entry-item { 
	    width: 25%;
	    display: flex; 
	    flex-direction: column; 
	    align-items: center; 
	    justify-content: center;
	    padding: 16rpx 0;
	}
	
	.entry-item image { 
	    width: 60rpx;
	    height: 60rpx; 
	    margin-bottom: 8rpx;
	    border-radius: 0;
	}
	
	.entry-item text {
	    font-size: 24rpx;
	    color: #333;
	    font-weight: 400;
	}
	
	.banner-swiper {
	    margin: 20rpx 20rpx 0 20rpx;
	    height: 300rpx;
	    border-radius: 16rpx;
	    overflow: hidden;
	    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.swiper { width: 100%; height: 100%; }
	.swiper-item-view { width: 100%; height: 100%; }
	.swiper-img { width: 100%; height: 100%; display: block; }
	
	.promotion-section { 
		background-color: #fff; 
		border-radius: 10rpx; 
		padding: 20rpx; 
		margin: 10rpx 20rpx; 
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	}
	.section-title { font-size: 18px; font-weight: bold; color: #333; }
	.promotion-item { 
		display: flex; 
		justify-content: space-between; 
		align-items: center; 
		padding: 20rpx 0; 
		border-bottom: 1px solid #eee; 
	}
	.promotion-item:last-child { border-bottom: none; }
	.promotion-item image { width: 120rpx; height: 120rpx; border-radius: 10rpx; }
	.product-info { flex: 1; margin: 0 20rpx; }
	.product-info .name { font-size: 16px; font-weight: bold; }
	.product-info .price { font-size: 18px; color: #007aff; font-weight: bold; }
	.product-info .original-price { font-size: 12px; color: #999; text-decoration: line-through; }
	.product-info .tag { font-size: 12px; color: #000; background-color: #f0f0f0; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 8rpx; }
	.btn-buy { 
		background-color: #007aff; 
		color: white; 
		border: none; 
		padding: 10rpx 20rpx; 
		border-radius: 6rpx; 
		font-size: 14px; 
	}
	.platform-recommend { 
		background-color: #fff; 
		border-radius: 10rpx; 
		padding: 20rpx; 
		margin: 10rpx 20rpx; 
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	}
	.recommend-list { display: flex; flex-direction: column; gap: 20rpx; }
	.recommend-item { background-color: #f9f9f9; border-radius: 10rpx; padding: 20rpx; }
	.recommend-item .product-name { font-size: 16px; font-weight: bold; }
	.tags { display: flex; gap: 10rpx; margin: 10rpx 0; }
	.tag { font-size: 12px; color: #ff7d00; background-color: #eef6ff; padding: 2rpx 8rpx; border-radius: 4rpx; }
	.spec { font-size: 14px; color: #666; }
	.price-info { display: flex; justify-content: space-between; align-items: center; margin: 10rpx 0; }
	.price { font-size: 16px; color: #007aff; font-weight: bold; }
	.unit-price { font-size: 12px; color: #999; }
	.validity, .code { font-size: 12px; color: #666; }
	.supplier { display: flex; justify-content: space-between; align-items: center; margin: 10rpx 0; }
	.store-link { color: #007aff; font-size: 14px; }
	.remark { background-color: #ffeaea; color: #ff0000; font-size: 12px; padding: 5rpx 10rpx; border-radius: 6rpx; margin: 10rpx 0; }
	.cart-action { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999; }
	.add-cart { color: #007aff; font-size: 18px; }
</style>