<template>
	<view class="container">
		<!-- <view class="top-bar">
			<text class="logo">药多多医药信息服务平台</text>
		</view> -->

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
				<image :src="seckillGoods.urlImageMain || 'https://via.placeholder.com/200x200'" mode="aspectFill" />
				<view class="product-info">
					<text class="name">{{ seckillGoods.goodsName }}</text>
					<text class="price">¥{{ seckillGoods.salePrice }}</text>
					<text class="original-price">¥{{ seckillGoods.linePrice }}</text>
					<view class="tags-row">
						<text class="tag">销量 {{ seckillGoods.goodsSales }}</text>
					</view>
				</view>
				<button class="btn-buy">立即去下单</button>
			</view>
		</view>

		<view class="platform-recommend">
			<view class="section-title">平台精选</view>
			
			<view v-if="loading" style="padding: 20rpx; text-align: center; color: #999;">加载中...</view>
			
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
					
					<view class="spec" v-if="item.packageType">规格: {{ item.packageType }}</view>
					
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
	// 定义API基础路径 (根据文档)
	const BASE_API = 'http://112.126.75.108:5000';

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
					{ icon: '/static/menu/icon_1.png', title: '配药颗粒', path: '/pages/recipe/recipe' },
					{ icon: '/static/menu/icon_2.png', title: '中药饮片', path: '/pages/herb/herb' },
					{ icon: '/static/menu/icon_3.png', title: '中药伴侣', path: '/pages/companion/companion' },
					{ icon: '/static/menu/icon_4.png', title: '调剂煎配', path: '/pages/cook/cook' },
					{ icon: '/static/menu/icon_5.png', title: '药膳汇', path: '/pages/diet/diet' },
					{ icon: '/static/menu/icon_6.png', title: '汤剂', path: '/pages/decoction/decoction' },
					{ icon: '/static/menu/icon_7.png', title: '爆品饮片', path: '/pages/hot/hot' },
					{ icon: '/static/menu/icon_8.png', title: '智能开方', path: '/pages/smart/smart' },
					{ icon: '/static/menu/icon_9.png', title: '膏方', path: '/pages/paste/paste' },
					{ icon: '/static/menu/icon_10.png', title: '会员权益', path: '/pages/member/member' }
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
			// 1. 获取平台精选列表 (对接 /api/Goods/Load)
			loadRecommendList(isRefresh = false) {
				const _this = this;
				_this.loading = true;
				
				return new Promise((resolve) => {
					uni.request({
						// 1. 修改 URL (不要写死 IP，建议用变量，或者改成文档给的路径)
						url: 'http://112.126.75.108:5000/Goods/Load', 
						method: 'GET',
						data: {
						    page: _this.page,      // 动态页码
							limit: _this.limit,    // 每页数量
							bigStatus: 10,         // 固定筛选上架
							sortType: 10,          // 综合排序(这里写死 10 是综合排序，你想改价格排序就改成 30)
						    // 如果首页需要支持搜索或筛选，在这里加参数
						    // 例如: key: '感冒' 
							
							// 如果你想筛选厂家，加这一行 
							// manufacturer: '华润三九'
						},
						success: (res) => {
							if (res.data.code === 200) {
								const list = res.data.result || [];
								if (isRefresh) {
									_this.recommendList = list;
								} else {
									_this.recommendList = _this.recommendList.concat(list);
								}
								// 判断是否还有更多
								_this.hasMore = list.length === _this.limit;
							}
						},
						fail: (err) => {
							console.error('加载失败', err);
							uni.showToast({ title: '网络请求失败', icon: 'none' });
						},
						complete: () => {
							_this.loading = false;
							resolve();
						}
					});
				});
			},
			
			// 2. 获取爆品秒杀商品 (对接 /api/Goods/Load，按销量排序)
			loadSeckillGoods() {
				const _this = this;
				uni.request({
					url: `${BASE_API}/Goods/Load`,
					method: 'GET',
					data: {
						page: 1,
						limit: 1, // 只需要1个展示
						sortType: 60 // 60: 销量降序 (文档规定)
					},
					success: (res) => {
						if (res.data.code === 200 && res.data.result.length > 0) {
							_this.seckillGoods = res.data.result[0];
						}
					}
				});
			},

			// 跳转商品详情 (对接文档: 传 id)
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
				
				// 对接文档：搜索参数 key
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
	/* 保持原有样式，仅增加部分微调 */
	.container {
		width: 100%;
		min-height: 100vh; /* 改为min-height防止内容截断 */
		background-color: #f8f8f8;
		font-size: 14px;
		color: #333;
		padding-bottom: 20rpx;
	}
    
    .tags-row {
        margin-top: 5rpx;
    }

	
	// .top-bar { text-align: center; 
	// padding: 10rpx 0; 
	// font-size: 16px; 
	// font-weight: bold; 
	// background-color: #fff; 
	// border-bottom: 1px solid #eee; 
	// }
	/* 修改外层容器 */
	.search-box {
	    display: flex;
	    align-items: center;
	    margin: 20rpx;
	    height: 72rpx;
	    /* 关键点1：设置胶囊圆角 */
	    border-radius: 36rpx; 
	    /* 关键点2：背景设为蓝色，用 padding 挤出 2rpx 作为“边框” */
	    background-color: #007aff; 
	    padding: 2rpx; 
	    /* 裁剪内部溢出 */
	    overflow: hidden; 
	}
	
	/* 修改输入框区域 */
	.search-input {
	    flex: 1;
	    display: flex;
	    align-items: center;
	    padding-left: 24rpx;
	    height: 100%;
	    
	    /* 关键点3：背景设为白色，盖住底部的蓝色 */
	    background-color: #fff;
	    
	    /* 关键点4：只设置左侧圆角，右侧是直角以便和按钮无缝衔接 */
	    /* 圆角大小建议比父容器小 2rpx (36-2=34)，视觉上更贴合 */
	    border-top-left-radius: 34rpx; 
	    border-bottom-left-radius: 34rpx;
	}
	
	.search-input input {
	    flex: 1;
	    font-size: 28rpx;
	    background: transparent; /* 输入框背景透明 */
	}
	
	/* 修改搜索按钮 */
	.btn-search {
	    width: 140rpx;
	    height: 100%;
	    /* 关键点5：背景也是蓝色，与父容器背景融合 */
	    background-color: #007aff; 
	    color: white;
	    font-size: 28rpx;
	    
	    /* 去掉按钮默认样式 */
	    border-radius: 0; 
	    margin: 0;
	    padding: 0;
	    
	    /* 文字居中 */
	    display: flex;
	    align-items: center;
	    justify-content: center;
	}
	
	/* 消除小程序按钮自带的边框线 (保险起见) */
	.btn-search::after {
	    border: none;
	}
	
	.icon-search {
	    margin-right: 10rpx;
	    font-size: 28rpx;
	    color: #999; /* 图标颜色建议浅一点 */
	}
	.clear-btn { 
		color: #999; 
		font-size: 16px; 
		margin-left: 10rpx;
	}
	.btn-search { 
		background-color: #007aff; 
		color: white; 
		border: none; 
		padding: 0 20rpx; 
		height: 60rpx; 
		line-height: 60rpx; 
		border-radius: 0 10rpx 10rpx 0; 
		font-size: 16px; 
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
	.banner { 
		width: 100%; 
		height: 200rpx; 
		margin: 10rpx 20rpx; 
		border-radius: 10rpx; 
		overflow: hidden; 
	}
	.quick-entry { 
	    display: flex; 
	    flex-wrap: wrap; 
	    /* 去掉 gap，改用宽度控制布局，防止计算误差 */
	    padding: 30rpx 0; 
	    background-color: #fff; 
	    border-radius: 10rpx; 
	    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	    margin: 20rpx; /* 保持外边距 */
	}
	
	/* 修改每一个选项的容器 */
	.entry-item { 
	    width: 25%; /* 保持一行4个 */
	    display: flex; 
	    flex-direction: column; 
	    align-items: center; 
	    justify-content: center;
	    padding: 16rpx 0; /*稍微减小一点上下的内边距 */
	}
	
	/* 修改图片样式 - 变小 */
	.entry-item image { 
	    width: 60rpx; /* 原来是 80rpx，改为 60rpx */
	    height: 60rpx; 
	    margin-bottom: 8rpx; /* 减小图片和文字的间距 */
	    border-radius: 0;
	}
	
	/* 修改文字样式 - 变小 */
	.entry-item text {
	    font-size: 24rpx; /* 原来是 13px(约26rpx)，改为 24rpx (约12px) */
	    color: #333;
	    font-weight: 400; /* 确保文字不要太粗，视觉上也会显得精致小巧一点 */
	}
	
	/* 轮播图容器样式 */
	.banner-swiper {
	    margin: 20rpx 20rpx 0 20rpx; /* 上边距20，左右20，和搜索框对齐 */
	    height: 300rpx;             /* 设定轮播图高度 */
	    border-radius: 16rpx;       /* 圆角效果 */
	    overflow: hidden;           /* 裁剪超出圆角的图片 */
	    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); /* 增加一点立体阴影 */
	}
	
	/* swiper 组件高度需显式设置 */
	.swiper {
	    width: 100%;
	    height: 100%;
	}
	
	.swiper-item-view {
	    width: 100%;
	    height: 100%;
	}
	
	.swiper-img {
	    width: 100%;
	    height: 100%;
	    display: block; /* 消除图片底部空隙 */
	}
	
	.promotion-section { 
		background-color: #fff; 
		border-radius: 10rpx; 
		padding: 20rpx; 
		margin: 10rpx 20rpx; 
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); 
	}
	.section-title { 
		font-size: 18px; 
		font-weight: bold; 
		color: #333; 
	}
	.promotion-item { 
		display: flex; 
		justify-content: space-between; 
		align-items: center; 
		padding: 20rpx 0; 
		border-bottom: 1px solid #eee; 
	}
	.promotion-item:last-child { 
		border-bottom: none; 
	}
	.promotion-item image { 
		width: 120rpx; 
		height: 120rpx; 
		border-radius: 10rpx; 
	}
	.product-info { 
		flex: 1; 
		margin: 0 20rpx; 
	}
	.product-info .name { 
		font-size: 16px; 
		font-weight: bold; 
	}
	.product-info .price { 
		font-size: 18px; 
		color: #007aff; 
		font-weight: bold; 
	}
	.product-info .original-price { 
		font-size: 12px; 
		color: #999; 
		text-decoration: line-through; 
	}
	.product-info .tag { 
		font-size: 12px; 
		color: #000; 
		background-color: #f0f0f0; 
		padding: 2rpx 8rpx; 
		border-radius: 4rpx; 
		margin-right: 8rpx; 
	}
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
	.recommend-list { 
		display: flex; 
		flex-direction: 
		column; gap: 20rpx; 
	}
	.recommend-item { 
		background-color: #f9f9f9; 
		border-radius: 10rpx; 
		padding: 20rpx; 
	}
	.recommend-item .product-name { 
		font-size: 16px; 
		font-weight: bold; 
	}
	.tags { 
		display: flex; 
		gap: 10rpx; 
		margin: 10rpx 0; 
	}
	.tag { 
		font-size: 12px; 
		color: #ff7d00; 
		background-color: #eef6ff; 
		padding: 2rpx 8rpx; 
		border-radius: 4rpx; 
	}
	.spec { 
		font-size: 14px; 
		color: #666; 
	}
	.price-info { 
		display: flex; 
		justify-content: space-between; 
		align-items: center; 
		margin: 10rpx 0; 
	}
	.price { 
		font-size: 16px; 
		color: #007aff; 
		font-weight: bold; 
	}
	.unit-price { 
		font-size: 12px; 
		color: #999; 
	}
	.validity, .code { 
		font-size: 12px; 
		color: #666; 
	}
	.supplier { 
		display: flex; 
		justify-content: space-between; 
		align-items: center; 
		margin: 10rpx 0; 
	}
	.store-link { 
		color: #007aff; 
		font-size: 14px; 
	}
	.remark { 
		background-color: #ffeaea; 
		color: #ff0000; font-size: 12px;
		padding: 5rpx 10rpx; 
		border-radius: 6rpx; 
		margin: 10rpx 0; 
	}
	.cart-action { 
		display: flex; 
		justify-content: space-between; 
		align-items: center; 
		font-size: 12px; 
		color: #999; 
	}
	.add-cart { 
		color: #007aff; 
		font-size: 18px; 
	}
</style>