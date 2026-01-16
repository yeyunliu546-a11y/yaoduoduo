<template>
	<view class="container">
		<view class="search-box">
			<view class="search-input">
				<text class="icon-search">🔍</text>
				<input
					v-model="queryParams.key"
					type="text"
					placeholder="请输入您需要的药材"
					@confirm="onSearch"
				/>
				<text v-if="queryParams.key" class="clear-btn" @click="clearSearch">✕</text>
			</view>
			<button class="btn-search" @click="onSearch">搜索</button>
		</view>

		<view class="sort-bar">
			<view
				class="sort-item"
				:class="{ active: currentSortMode === 'default' }"
				@click="handleSortChange('default')"
			>综合</view>
			<view
				class="sort-item"
				:class="{ active: currentSortMode === 'sales' }"
				@click="handleSortChange('sales')"
			>销量</view>
			<view
				class="sort-item price-sort"
				:class="{ active: currentSortMode === 'price_asc' || currentSortMode === 'price_desc' }"
				@click="togglePriceSort"
			>
				价格
				<view class="arrow-group">
					<text :class="{ active: currentSortMode === 'price_asc' }">↑</text>
					<text :class="{ active: currentSortMode === 'price_desc' }">↓</text>
				</view>
			</view>
		</view>

		<view class="result-list">
			<view
				v-for="(item, index) in resultList"
				:key="index"
				class="recommend-item"
				@click="gotoDetail(item.id)"
			>
				<image v-if="item.urlImageMain" :src="item.urlImageMain" mode="aspectFill" class="goods-thumb"></image>
				
				<view class="goods-info-right">
					<view class="product-name">{{ item.goodsName }}</view>
					
					<view class="tags">
						<text class="tag standard" v-if="item.standard">{{ item.standard }}</text>
						<text class="tag package" v-if="item.packageType">{{ item.packageType }}</text>
						<text class="tag manufacturer" v-if="item.manufacturer">{{ item.manufacturer }}</text>
					</view>
					
					<view class="price-info">
						<view class="price-box">
							<text class="price">¥{{ item.salePrice }}</text>
							<text class="old-price" v-if="item.linePrice > item.salePrice">¥{{ item.linePrice }}</text>
						</view>
						<text class="sales-count">已售 {{ item.goodsSales }}</text>
					</view>
					
					<view class="cart-action">
						<text class="stock-info" v-if="item.stockTotal < 100">仅剩 {{ item.stockTotal }} 件</text>
						<text class="add-cart">🛒</text>
					</view>
				</view>
			</view>
		</view>

		<view class="loading-more" v-if="resultList.length > 0">
			{{ hasMore ? '加载中...' : '—— 我是有底线的 ——' }}
		</view>

		<view v-if="resultList.length === 0 && !loading && hasSearched" class="no-result">
			<image src="https://via.placeholder.com/200x200?text=暂无结果" mode="widthFix" />
			<text>未找到“{{ queryParams.key }}”相关商品</text>
		</view>
	</view>
</template>

<script>
// 定义API地址
const BASE_API = 'http://112.126.75.108:5000';

export default {
	data() {
		return {
			// 请求参数对象 (对应文档)
			queryParams: {
				key: '',        // 搜索关键词
				page: 1,        // 页码
				limit: 10,      // 每页数量
				sortType: 10,   // 默认综合排序 (10:综合, 20:价格降, 30:价格升, 60:销量降)
				bigStatus: 10   // 只搜上架商品
			},
			
			resultList: [],     // 数据列表
			loading: false,     // 加载中状态
			hasMore: true,      // 是否还有更多数据
			hasSearched: false, // 是否执行过搜索
			currentSortMode: 'default' // 前端用于控制高亮的变量
		};
	},
	onLoad(options) {
		// 接收首页传过来的参数
		if (options.key) {
			this.queryParams.key = decodeURIComponent(options.key);
			this.performSearch(true); // true 代表重置列表
		}
	},
	// 监听触底，加载下一页
	onReachBottom() {
		if (this.hasMore && !this.loading) {
			this.queryParams.page++;
			this.performSearch(false);
		}
	},
	methods: {
		// 执行搜索 (isReset: 是否重置为第一页)
		performSearch(isReset = false) {
			if (isReset) {
				this.queryParams.page = 1;
				this.resultList = [];
				this.hasMore = true;
				this.hasSearched = true;
			}

			this.loading = true;
			
			uni.request({
				url: `${BASE_API}/Goods/Load`, // 对接 /api/Goods/Load
				method: 'GET',
				data: this.queryParams,
				success: (res) => {
					if (res.data.code === 200) {
						const list = res.data.result || [];
						// 追加数据
						this.resultList = this.resultList.concat(list);
						// 判断是否还有下一页
						this.hasMore = list.length === this.queryParams.limit;
					}
				},
				fail: () => {
					uni.showToast({ title: '网络请求失败', icon: 'none' });
				},
				complete: () => {
					this.loading = false;
				}
			});
		},

		// 触发搜索按钮
		onSearch() {
			if (!this.queryParams.key.trim()) return;
			this.performSearch(true);
		},

		// 清空搜索
		clearSearch() {
			this.queryParams.key = '';
			this.resultList = [];
			this.hasSearched = false;
		},

		// 处理综合和销量排序
		handleSortChange(type) {
			if (this.currentSortMode === type) return;
			
			this.currentSortMode = type;
			
			// 映射 API 的 sortType
			if (type === 'default') {
				this.queryParams.sortType = 10; // 综合
			} else if (type === 'sales') {
				this.queryParams.sortType = 60; // 销量降序
			}
			
			this.performSearch(true);
		},

		// 处理价格排序点击 (三态切换或双态切换)
		togglePriceSort() {
			if (this.currentSortMode === 'price_asc') {
				// 如果当前是升序，点一下变降序
				this.currentSortMode = 'price_desc';
				this.queryParams.sortType = 20; // 价格降序
			} else {
				// 其他情况点价格，都变升序
				this.currentSortMode = 'price_asc';
				this.queryParams.sortType = 30; // 价格升序
			}
			this.performSearch(true);
		},

		// 跳转详情页 (关键修改：只传 ID)
		gotoDetail(id) {
			if(!id) return;
			uni.navigateTo({
				// 这里配合我们上一轮修改的 detail.vue，它会根据 id 自己去拉取数据
				url: `/pages/good/detail?id=${id}`
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	background-color: #f8f8f8;
	min-height: 100vh;
}

/* 搜索框样式 */
.search-box {
	display: flex;
	align-items: center;
	margin: 20rpx;
	height: 72rpx;
	background-color: #007aff;
	padding: 2rpx;
	border-radius: 36rpx;
}

.search-input {
	flex: 1;
	display: flex;
	align-items: center;
	padding-left: 24rpx;
	height: 100%;
	background-color: #fff;
	border-top-left-radius: 34rpx;
	border-bottom-left-radius: 34rpx;
	
	input {
		flex: 1;
		font-size: 28rpx;
	}
}

.btn-search {
	width: 140rpx;
	background-color: #007aff;
	color: white;
	font-size: 28rpx;
	height: 100%;
	line-height: 72rpx;
	border-radius: 0;
	margin: 0;
	&::after { border: none; }
}

.clear-btn {
	padding: 0 20rpx;
	color: #999;
	font-size: 32rpx;
}

/* 排序栏 */
.sort-bar {
	display: flex;
	background: #fff;
	padding: 20rpx 0;
	border-bottom: 1px solid #eee;
}

.sort-item {
	flex: 1;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;

	&.active {
		color: #007aff;
		font-weight: bold;
	}

	.arrow-group {
		display: flex;
		flex-direction: column;
		margin-left: 4rpx;
		text {
			font-size: 20rpx;
			line-height: 0.8;
			color: #ccc;
			&.active { color: #007aff; }
		}
	}
}

/* 结果列表 */
.result-list {
	padding: 20rpx;
}

.recommend-item {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	display: flex; /* 改为 flex 布局，支持左图右文 */
}

.goods-thumb {
	width: 180rpx;
	height: 180rpx;
	border-radius: 8rpx;
	margin-right: 20rpx;
	background-color: #eee;
}

.goods-info-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.product-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	line-height: 1.4;
	
	/* 两行省略 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin: 10rpx 0;
	
	.tag {
		font-size: 20rpx;
		padding: 2rpx 8rpx;
		border-radius: 4rpx;
	}
	.standard { color: #007aff; background: #eaf2ff; }
	.package { color: #ff9900; background: #fff5e6; }
	.manufacturer { color: #666; background: #f5f5f5; }
}

.price-info {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	
	.price {
		font-size: 34rpx;
		color: #ff4400;
		font-weight: bold;
	}
	.old-price {
		font-size: 22rpx;
		color: #999;
		text-decoration: line-through;
		margin-left: 10rpx;
	}
	.sales-count {
		font-size: 22rpx;
		color: #999;
	}
}

.cart-action {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
	
	.stock-info {
		font-size: 20rpx;
		color: #ff4400;
	}
	.add-cart {
		font-size: 32rpx;
	}
}

.loading-more {
	text-align: center;
	padding: 20rpx;
	color: #999;
	font-size: 24rpx;
}

.no-result {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 100rpx;
	color: #999;
	
	image {
		width: 200rpx;
		margin-bottom: 20rpx;
	}
}
</style>