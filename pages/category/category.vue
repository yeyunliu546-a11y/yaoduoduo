<!-- pages/category/category.vue -->
<template>
	<view class="container">
		<!-- 顶部标题 -->
		<!-- <view class="top-bar">
			<text class="title">品类：</text>
		</view> -->

		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input">
				<text class="icon-search">🔍</text>
				<input
					v-model="globalKeyword"
					type="text"
					placeholder="请输入您需要的药材"
					@confirm="onGlobalSearch"
				/>
				<button class="btn-search" @click="onGlobalSearch">搜索</button>
			</view>
		</view>

		<!-- 主体内容 -->
		<view class="main-content">
			<!-- 左侧导航 -->
			<view class="left-nav">
				<view
					v-for="(item, index) in leftNavItems"
					:key="index"
					class="nav-item"
					:class="{ active: currentCategory === item.value }"
					@click="switchCategory(item.value)"
				>
					{{ item.label }}
				</view>
			</view>

			<!-- 右侧厂家列表 -->
			<view class="right-content">
				<view v-for="(brand, idx) in brands" :key="idx" class="brand-item" @click="gotoBrandDetail(brand)">
					<text class="brand-name">{{ brand.name }}</text>
					<text class="brand-stats">在售大包{{ brand.bigBag }}，在售小包{{ brand.smallBag }}</text>
					<text class="brand-sold">已售{{ brand.sold }}</text>
					<text class="view-all">查看全部</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentCategory: '颗粒',
			globalKeyword: '',
			leftNavItems: [
				{ label: '颗粒', value: '颗粒' },
				{ label: '饮片', value: '饮片' },
				{ label: '中成药', value: '中成药' },
				{ label: '养生膏方', value: '养生膏方' },
				{ label: '调剂中心', value: '调剂中心' }
			],
			brands: [
				{
					name: '上药好护士(自厚生)',
					bigBag: 518,
					smallBag: 635,
					sold: 5728667
				},
				{
					name: '天地恒一(恒安)',
					bigBag: 109,
					smallBag: 366,
					sold: 733096
				},
				{
					name: '恒安芙林',
					bigBag: 0,
					smallBag: 318,
					sold: 7308673
				}
			]
		};
	},
	methods: {
		switchCategory(category) {
			this.currentCategory = category;
		},
		onGlobalSearch() {
			uni.showToast({ title: '全局搜索暂未实现' });
		},
		gotoBrandDetail(brand) {
			uni.navigateTo({
				url: `/pages/good/brand-detail?brandName=${encodeURIComponent(brand.name)}`
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	width: 100%;
	height: 100vh;
	background-color: #f8f8f8;
	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

// .top-bar {
// 	text-align: center;
// 	padding: 20rpx 0;
// 	background-color: #fff;
// 	border-bottom: 1px solid #eee;
// 	font-size: 16px;
// 	font-weight: bold;
// 	color: #333;
// }

.search-box {
	padding: 20rpx;
	background-color: #007aff;
}

.search-input {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 10rpx;
	padding: 0 20rpx;
	height: 60rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.search-input input {
	flex: 1;
	font-size: 16px;
	padding: 0;
	margin: 0;
	outline: none;
	border: none;
}

.btn-search {
	background-color: #007aff;
	color: white;
	border: none;
	font-size: 14px;
	padding: 0 20rpx;
	height: 100%;
	line-height: 60rpx;
	border-radius: 0 10rpx 10rpx 0;
}

.main-content {
	display: flex;
	height: calc(100vh - 140rpx); /* 减去顶部和搜索栏高度 */
	overflow: hidden;
}

.left-nav {
	width: 180rpx;
	background-color: #fff;
	border-right: 1px solid #eee;
	overflow-y: auto;
}

.nav-item {
	padding: 24rpx 0;
	text-align: center;
	font-size: 14px;
	color: #666;
	border-bottom: 1px solid #f5f5f5;
	cursor: pointer;
}

.nav-item.active {
	color: #007aff;
	font-weight: bold;
	background-color: #fff9f0;
}

.right-content {
	flex: 1;
	padding: 20rpx;
	overflow-y: auto;
}

.brand-item {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	position: relative;
}

.brand-name {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.brand-stats,
.brand-sold {
	font-size: 12px;
	color: #888;
	display: block;
	margin-bottom: 6rpx;
}

.view-all {
	color: #007aff;
	font-size: 14px;
	position: absolute;
	right: 24rpx;
	bottom: 24rpx;
}
</style>
