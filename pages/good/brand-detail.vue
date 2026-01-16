<template>
	<view class="brand-detail-container">
		<!-- 顶部导航栏 -->
		<view class="top-bar">
			<view class="back-btn" @click="goBack">
				<text>↩️</text>
			</view>
			<text class="brand-title">{{ brandName }}</text>
			<text class="brand-desc">在售品种 {{ productCount }} 个</text>
		</view>

		<!-- 品牌信息区 -->
		<view class="brand-info">
			<image src="/static/logo.png" class="brand-logo" mode="aspectFill"></image>
			<view class="brand-content">
				<text class="brand-name">{{ brandName }}</text>
				<text class="brand-tag">✓ 您已开户</text>
				<text class="brand-description">
					在售品种{{ productCount }}个，500元以上起批，包邮，48小时发货（节假日顺延），默认顺丰。
				</text>
				<text class="review-count">⭐ 客户评价(307)</text>
				<text class="detail-link" @click="gotoBrandDetailPage">品牌详情 >></text>
			</view>
		</view>

		<!-- 搜索框 -->
		<view class="search-box">
			<view class="search-input">
				<text class="icon-search">🔍</text>
				<input
					v-model="keyword"
					type="text"
					placeholder="请输入您需要的药材"
					@confirm="onSearch"
				/>
				<button class="btn-search" @click="onSearch">搜索</button>
			</view>
		</view>

		<!-- 筛选条件 -->
		<view class="filter-bar">
			<view class="filter-group">
				<picker @change="onPackageChange" :value="selectedPackage" :range="packageOptions">
					<text>{{ selectedPackage }}</text>
				</picker>
			</view>
			<view class="filter-group">
				<picker @change="onValidityChange" :value="selectedValidity" :range="validityOptions">
					<text>{{ selectedValidity }}</text>
				</picker>
			</view>
			<view class="filter-tags">
				<text
					v-for="(tag, idx) in ['国标', '省标', '其他']"
					:key="idx"
					class="tag"
					:class="{ active: selectedTags.includes(tag) }"
					@click="toggleTag(tag)"
				>{{ tag }}</text>
			</view>
		</view>
		
		
		<!-- 商品列表 -->
		<view class="product-list">
			<view
				v-for="(product, idx) in filteredProducts"
				:key="idx"
				class="product-item"
				@click="gotoDetail(product)"
			>
				<view class="product-name">{{ product.name }}</view>
				<view class="tags">
					<text v-for="t in product.tags" :key="t" class="tag">{{ t }}</text>
				</view>
				<view class="spec">{{ product.spec }}</view>
				<view class="price">¥{{ product.price }}</view>
				<view class="unit-price">相当于每g饮片 ¥{{ product.unitPrice }}</view>
				<view class="code">医保代码: {{ product.code }}</view>
				<view class="expire">有效期: {{ product.expire }}</view>
				<view class="actions">
					<text class="copy-btn">📋 复制</text>
					<text class="cart-btn">🛒 加购</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			brandName: '',
			keyword: '',
			selectedPackage: '全部包装',
			selectedValidity: '全部效期',
			selectedTags: [],
			packageOptions: ['全部包装', '大包装', '小包装', '瓶装'],
			validityOptions: ['全部效期', '1年内', '2年内', '3年以上'],
			productData: {
				'上药好护士(自厚生)': [
					{
						name: '青皮(个青皮)',
						spec: '1.43g/5.00g',
						price: '0.75',
						unitPrice: '0.15',
						code: 'T00083063100105...',
						expire: '2026-08-31',
						tags: ['国标', '小包装']
					},
					{
						name: '醋青皮(个青皮)',
						spec: '1.71g/6.00g',
						price: '0.94',
						unitPrice: '0.16',
						code: 'T00083015200105...',
						expire: '2026-08-31',
						tags: ['国标', '小包装']
					},
					{
						name: '青皮(四花青皮)',
						spec: '2.86g/10.00g',
						price: '1.64',
						unitPrice: '0.16',
						code: 'T00083063100103...',
						expire: '2026-12-31',
						tags: ['国标', '小包装']
					},
					{
						name: '青皮(个青皮)(大包装)',
						spec: '100g/300g',
						price: '52.48',
						unitPrice: '72.38',
						code: 'T00083063100104...',
						expire: '2027-01-31',
						tags: ['国标', '大包装']
					}
				]
			}
		};
	},
	computed: {
	  filteredProducts() {
	    let products = this.productData[this.brandName] || [];
	    
	    // 1. 模糊搜索（支持中文和拼音）
	    if (this.keyword) {
	      products = products.filter(p => 
	        p.name.includes(this.keyword) || 
	        p.spec.includes(this.keyword)
	      );
	    }
	
	    // 2. 包装筛选
	    if (this.selectedPackage !== '全部包装') {
	      products = products.filter(p => p.spec.includes(this.selectedPackage));
	    }
	
	    // 3. 效期筛选（假设 expire 是日期字符串）
	    if (this.selectedValidity !== '全部效期') {
	      products = products.filter(p => {
	        const date = new Date(p.expire);
	        const now = new Date();
	        const diffYears = (date.getFullYear() - now.getFullYear());
	        return diffYears === 1 || diffYears === 2 || diffYears >= 3;
	      });
	    }
	
	    // 4. 标签筛选
	    if (this.selectedTags.length > 0) {
	      products = products.filter(p => 
	        this.selectedTags.some(t => p.tags?.includes(t))
	      );
	    }
	
	    // 5. 拼音排序（按名字首字母）
	    return products.sort((a, b) => a.name.localeCompare(b.name));
	  },
	  productCount() {
	    return this.filteredProducts.length;
	  }
	},
	onLoad(options) {
		this.brandName = decodeURIComponent(options.brandName);
		if (!this.productData[this.brandName]) {
			uni.showToast({ title: '暂无该厂家数据', icon: 'none' });
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		onSearch() {
		    // 触发搜索，无需额外操作，因为 keyword 变化会自动更新 filteredProducts
		    // 你可以加个提示
		    if (!this.keyword) {
		      uni.showToast({ title: '请输入药材名称', icon: 'none' });
		      return;
		    }
		    // 可选：清空其他筛选条件（如不希望）
		    // this.selectedPackage = '全部包装';
		},
		onPackageChange(e) {
			this.selectedPackage = this.packageOptions[e.detail.value];
		},
		onValidityChange(e) {
			this.selectedValidity = this.validityOptions[e.detail.value];
		},
		toggleTag(tag) {
			const idx = this.selectedTags.indexOf(tag);
			if (idx === -1) {
				this.selectedTags.push(tag);
			} else {
				this.selectedTags.splice(idx, 1);
			}
		},
		gotoBrandDetailPage() {
			uni.navigateTo({
				url: `/pages/brand-detail-page/brand-detail-page?brand=${encodeURIComponent(this.brandName)}`
			});
		},
		gotoDetail(product) {
		  uni.navigateTo({
		    url: `/pages/good/detail?name=${encodeURIComponent(product.name)}&spec=${encodeURIComponent(product.spec)}&price=${product.price}&unitPrice=${product.unitPrice}&code=${product.code}&expire=${product.expire}`
		  });
		}
	}
};
</script>

<style lang="scss" scoped>
.brand-detail-container {
	width: 100%;
	height: 100vh;
	background-color: #f8f8f8;
	font-size: 14px;
	color: #333;
}

.top-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	background-color: #fff;
	border-bottom: 1px solid #eee;
}

.back-btn {
	font-size: 20rpx;
	cursor: pointer;
}

.brand-title {
	font-size: 16px;
	font-weight: bold;
}

.brand-desc {
	font-size: 12px;
	color: #666;
}

.brand-info {
	background-color: #fff;
	padding: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	margin-bottom: 20rpx;
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
}

.brand-logo {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
}

.brand-content {
	flex: 1;
}

.brand-name {
	font-size: 16px;
	font-weight: bold;
}

.brand-tag {
	color: #00b400;
	font-size: 12px;
}

.brand-description {
	font-size: 12px;
	color: #666;
	margin: 10rpx 0;
}

.review-count {
	color: #00a7ff;
	font-size: 12px;
}

.detail-link {
	color: #999;
	font-size: 12px;
	cursor: pointer;
}

.search-box {
	margin: 20rpx 20rpx 0;
	background-color: #00a7ff;
	border-radius: 10rpx;
	overflow: hidden;
}

.search-input {
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	height: 60rpx;
	background-color: #fff;
	border-radius: 10rpx;
	box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.search-input input {
	flex: 1;
	font-size: 16px;
	outline: none;
	border: none;
}

.btn-search {
	background-color: #00a7ff;
	color: white;
	border: none;
	padding: 0 20rpx;
	height: 60rpx;
	line-height: 60rpx;
	border-radius: 0 10rpx 10rpx 0;
	font-size: 16px;
}

.filter-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 20rpx 20rpx 0;
	gap: 10rpx;
}

.filter-group {
	flex: 1;
	text-align: center;
}

.filter-tags {
	display: flex;
	gap: 10rpx;
}

.tag {
	font-size: 12px;
	color: #666;
	padding: 2rpx 8rpx;
	border-radius: 4rpx;
	background-color: #f0f0f0;
	cursor: pointer;
	&.active {
		color: #00a7ff;
		background-color: #ffeaea;
	}
}


.product-list {
	padding: 20rpx;
}

.product-item {
	background-color: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	margin-bottom: 10rpx;
}

.product-name {
	font-size: 14px;
	font-weight: bold;
}

.tags {
	display: flex;
	gap: 5rpx;
	margin: 5rpx 0;
}

.tag {
	font-size: 10px;
	color: #00b400;
	background-color: #e8f5e8;
	padding: 2rpx 6rpx;
	border-radius: 4rpx;
}

.spec {
	font-size: 12px;
	color: #666;
}

.price {
	font-size: 16px;
	color: #00a7ff;
	font-weight: bold;
}

.unit-price {
	font-size: 12px;
	color: #999;
}

.code {
	font-size: 12px;
	color: #666;
}

.expire {
	font-size: 12px;
	color: #999;
}

.actions {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: #999;
}

.copy-btn,
.cart-btn {
	cursor: pointer;
}
</style>
