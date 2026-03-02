<template>
	<view class="page-container">
		
		<view class="global-header-fixed">
			<view class="custom-search-area">
				<view class="search-bar">
					<u-icon name="search" color="#999" size="32"></u-icon>
					<input 
						class="search-input" 
						:placeholder="businessType === 'procurement' ? '搜成品药 (如感冒灵)' : '搜配方颗粒 (如柴胡)'" 
						v-model="keyword"
						confirm-type="search"
						@confirm="onSearch"
					/>
					<view class="clear-icon" v-if="keyword" @click.stop="onClearSearch">
						<u-icon name="close-circle-fill" color="#ccc" size="32"></u-icon>
					</view>
				</view>
				<view class="search-btn" @click="onSearch">搜索</view>
			</view>

			<view class="business-switch-box">
				<view class="switch-capsule">
					<view class="switch-item" :class="{ active: businessType === 'procurement' }" @click="switchBusiness('procurement')">药品采购</view>
					<view class="switch-item" :class="{ active: businessType === 'dispensing' }" @click="switchBusiness('dispensing')">处方调剂</view>
				</view>
			</view>
		</view>

		<scroll-view scroll-y scroll-with-animation class="left-menu-fixed">
			<view class="u-tab-item" :class="{ 'u-tab-item-active': selectedFilter.manufacturer === '' }" @click="onSelectManufacturer('')">
				<text class="u-line-1">全部厂家</text>
			</view>
			<block v-if="filterOptions.manufacturers && filterOptions.manufacturers.length > 0">
				<view v-for="(item, index) in filterOptions.manufacturers" :key="index" class="u-tab-item"
					:class="{ 'u-tab-item-active': selectedFilter.manufacturer === item }" @click="onSelectManufacturer(item)">
					<text class="u-line-1">{{ item }}</text>
				</view>
			</block>
			<view style="height: 100rpx;"></view> </scroll-view>

		<view class="right-tools-fixed">
			<view class="safe-filter-bar">
				<view class="filter-item" @click="showPkgSelect = true">
					<text class="u-line-1">{{ selectedFilter.packageType || '全部包装' }}</text>
					<u-icon name="arrow-down" color="#999" size="24" margin-left="6"></u-icon>
				</view>
				<view class="filter-item" @click="showStdSelect = true">
					<text class="u-line-1">{{ selectedFilter.standard || '全部标准' }}</text>
					<u-icon name="arrow-down" color="#999" size="24" margin-left="6"></u-icon>
				</view>
			</view>

			<view class="sort-toolbar">
				<view class="sort-btn" :class="{active: currentSort === 'default'}" @click="onSort('default')">综合</view>
				<view class="sort-btn" :class="{active: currentSort === 'sales'}" @click="onSort('sales')">
					销量 <view class="css-icon-box"><view class="css-arrow down" :class="{active: currentSort === 'sales'}"></view></view>
				</view>
				<view class="sort-btn" :class="{active: currentSort === 'price'}" @click="onSort('price')">
					价格 
					<view class="css-icon-box">
						<view class="css-arrow up" :class="{active: currentSort === 'price' && sortOrder === 'asc'}"></view>
						<view class="css-arrow down" :class="{active: currentSort === 'price' && sortOrder === 'desc'}"></view>
					</view>
				</view>
			</view>
		</view>

		<view class="right-list-native">
			<view class="page-view">
				<view v-if="keyword" class="search-tip">搜索: "{{keyword}}" 的结果</view>
				<view v-if="isLoading && goodsList.length === 0" class="loading-center">
					<u-loading mode="flower" size="60"></u-loading>
				</view>
				<u-empty v-if="!isLoading && goodsList.length === 0" mode="list" text="暂无商品" margin-top="100"></u-empty>

				<view class="class-item" v-for="(item, index) in goodsList" :key="index" @click="goToDetail(item.id)">
					<view class="item-img">
						<u-image width="140rpx" height="140rpx" :src="item.imageUrl" mode="aspectFill">
							<template v-slot:error>
								<image src="/static/empty.png" style="width: 100%; height: 100%;"></image>
							</template>
						</u-image>
					</view>
					<view class="item-info">
						<view class="item-title u-line-2">
							<text v-if="businessType === 'dispensing'" class="type-tag">颗粒</text>
							{{ item.goodsName }}
						</view>
						<view class="item-desc">
							<text>规格: {{ item.specification || item.spec || '--' }}</text>
							<text class="ml-10">厂家: {{ item.manufacturer }}</text>
						</view>
						<view class="item-tags">
							<u-tag :text="item.standard" type="success" size="mini" mode="light" v-if="item.standard" class="mr-10"/>
							<u-tag :text="item.packageType" type="primary" size="mini" mode="light" v-if="item.packageType"/>
						</view>
						<view class="item-price-row">
							<view class="price-box">
								<text class="price-symbol">¥</text>
								<text v-if="businessType === 'dispensing'" class="price-num">{{ item.pricePerGram || item.salePrice }}</text>
								<text v-else class="price-num">{{ item.salePrice }}</text>
								<text v-if="businessType === 'dispensing'" class="unit-text">/g</text>
							</view>
							<view class="cart-box" @click.stop="addToCart(item)">
								<text class="sales">已售{{ (item.salesActual || 0) + (item.salesInitial || 0) }}</text>
								<view class="add-btn-circle" :class="{ 'dispensing-btn': businessType === 'dispensing' }">+</view>
							</view>
						</view>
					</view>
				</view>
				<u-loadmore :status="loadStatus" v-if="goodsList.length > 0" margin-top="30" margin-bottom="50"></u-loadmore>
			</view>
		</view>

		<u-select v-model="showPkgSelect" :list="packageOptions" title="选择包装类型" @confirm="onPkgConfirm"></u-select>
		<u-select v-model="showStdSelect" :list="standardOptions" title="选择执行标准" @confirm="onStdConfirm"></u-select>

	</view>
</template>

<script>
	import * as GoodsApi from '@/api/goods/goods.js';
	import { addCart, addPrescriptionCart } from '@/api/goods/cart.js';

	export default {
		data() {
			return {
				businessType: 'procurement', 
				keyword: '', 
				filterOptions: { manufacturers: [] },
				
				// 安全选择器的数据
				showPkgSelect: false,
				showStdSelect: false,
				packageOptions: [{label: '全部包装', value: ''}],
				standardOptions: [{label: '全部标准', value: ''}],
				selectedFilter: { manufacturer: '', packageType: '', standard: '' },
				
                currentSort: 'default',
                sortOrder: 'desc',      
				goodsList: [],
				page: 1, limit: 10,
				isLoading: false, loadStatus: 'loadmore'
			}
		},
		onLoad(options) {
            if (options && options.type) {
                this.businessType = options.type;
            }
			this.loadFilterOptions();
			this.loadGoodsData(true);
		},
        onShow() {
            const app = getApp();
            if (app.globalData && app.globalData.categoryType) {
                if (this.businessType !== app.globalData.categoryType) {
                    this.switchBusiness(app.globalData.categoryType);
                }
                app.globalData.categoryType = null;
            }
        },
		// 【重要修复】利用原生触底事件代替 scroll-view 的 @scrolltolower
		onReachBottom() {
			if(this.loadStatus === 'nomore') return;
			this.page++;
			this.loadGoodsData();
		},
		methods: {
			switchBusiness(type) {
				if (this.businessType === type) return;
				this.businessType = type;
				this.keyword = '';
				this.selectedFilter = { manufacturer: '', packageType: '', standard: '' };
				this.currentSort = 'default';
				this.goodsList = []; 
				this.loadFilterOptions();
				this.loadGoodsData(true);
			},

			loadFilterOptions() {
				const goodsType = this.businessType === 'dispensing' ? 2 : 1;
				GoodsApi.getFilterOptions({ goodsType: goodsType }).then(res => {
                    if(res.code === 200 && res.result) {
						this.filterOptions = res.result;
						
						let pkgTypes = [{label: '全部包装', value: ''}];
						if(res.result.packageTypes) {
							res.result.packageTypes.forEach(item => { pkgTypes.push({label: item, value: item}); });
						}
						this.packageOptions = pkgTypes;

						let stds = [{label: '全部标准', value: ''}];
						if(res.result.standards) {
							res.result.standards.forEach(item => { stds.push({label: item, value: item}); });
						}
						this.standardOptions = stds;
					}
				}).catch(err => { console.error("加载筛选条件失败", err); });
			},

			// 选择器回调
			onPkgConfirm(arr) {
				this.selectedFilter.packageType = arr[0].value;
				this.loadGoodsData(true);
			},
			onStdConfirm(arr) {
				this.selectedFilter.standard = arr[0].value;
				this.loadGoodsData(true);
			},

			loadGoodsData(reset = false) {
				if (reset) {
					this.page = 1; this.goodsList = []; this.loadStatus = 'loading';
				}
				this.isLoading = true;

                let sortType = 10;
                if (this.currentSort === 'price') {
                    sortType = this.sortOrder === 'asc' ? 30 : 20;
                } else if (this.currentSort === 'sales') {
                    sortType = 60; 
                }

                const goodsType = this.businessType === 'dispensing' ? 2 : 1;

                const params = {
                    page: this.page, 
                    limit: this.limit, 
                    key: this.keyword,
                    goodsType: goodsType,
                    manufacturer: this.selectedFilter.manufacturer,
                    packageType: this.selectedFilter.packageType,
                    standard: this.selectedFilter.standard,
                    sortType: sortType 
                };

				GoodsApi.getGoodsList(params).then(res => {
					const list = res.result || res.data?.list || [];
					this.goodsList = [...this.goodsList, ...list];
					this.isLoading = false;
                    this.loadStatus = list.length < this.limit ? 'nomore' : 'loadmore';
				}).catch(err => {
                    console.error(err);
                    this.isLoading = false; this.loadStatus = 'nomore';
                });
			},

			onSelectManufacturer(name) {
				if (this.selectedFilter.manufacturer === name) return;
				this.selectedFilter.manufacturer = name;
				this.loadGoodsData(true);
			},
            onSort(type) {
                if (type === 'sales') {
                    this.currentSort = 'sales'; this.sortOrder = 'desc';
                } else if (type === 'price') {
                    if (this.currentSort === 'price') this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                    else { this.currentSort = 'price'; this.sortOrder = 'desc'; }
                } else {
                    this.currentSort = 'default';
                }
                this.loadGoodsData(true);
            },
			onSearch() {
                this.selectedFilter = { manufacturer: '', packageType: '', standard: '' };
                this.currentSort = 'default';
				this.loadGoodsData(true);
			},
            onClearSearch() { this.keyword = ''; this.loadGoodsData(true); },
			goToDetail(id) { 
                uni.navigateTo({ url: `/pages/good/detail?id=${id}` }); 
            },
            
            // 加入购物车逻辑
            addToCart(item) {
                uni.showLoading({ title: '添加中...' });
                
                const targetId = item.id || item.goodsId || item.GoodsId || item.skuId;
                const targetSkuId = item.skuId || targetId;

                if (!targetId) {
                    uni.hideLoading();
                    return uni.showToast({ title: '商品数据异常', icon: 'none' });
                }

                if (GoodsApi && typeof GoodsApi.getGoodsDetail === 'function') {
                    GoodsApi.getGoodsDetail(targetId).then(res => {
                        if (res.code === 200 && res.result && res.result.listSku) {
                            const skus = res.result.listSku;
                            if (skus.length === 1) {
                                this.executeAddCart(skus[0].id);
                            } else if (skus.length > 1) {
                                uni.hideLoading();
                                uni.navigateTo({ url: `/pages/good/detail?id=${targetId}` });
                            } else {
                                this.executeAddCart(targetSkuId);
                            }
                        } else {
                            this.executeAddCart(targetSkuId);
                        }
                    }).catch(err => {
                        this.executeAddCart(targetSkuId);
                    });
                } else {
                    this.executeAddCart(targetSkuId);
                }
            },

            executeAddCart(skuId) {
                if (this.businessType === 'dispensing') {
                    addPrescriptionCart({ goodsSkuId: skuId, goodsWeight: 10 }).then(res => {
                        uni.hideLoading();
                        if(res.code === 200 || res.Code === 200) uni.showToast({ title: '已加10g', icon: 'success' });
                        else uni.showToast({ title: res.message || res.Message || '添加失败', icon: 'none' });
                    }).catch(err => {
                        uni.hideLoading();
                        uni.showToast({ title: '网络异常', icon: 'none' });
                    });
                } else {
                    addCart({ goodsSkuId: skuId, goodsNum: 1 }).then(res => {
                        uni.hideLoading();
                        if(res.code === 200 || res.Code === 200) uni.showToast({ title: '已加入', icon: 'success' });
                        else uni.showToast({ title: res.message || res.Message || '添加失败', icon: 'none' });
                    }).catch(err => {
                        uni.hideLoading();
                        uni.showToast({ title: '网络异常', icon: 'none' });
                    });
                }
            }
		}
	}
</script>

<style lang="scss" scoped>
	/* ========================================================
	   🛠️ 终极稳健布局：原生页面滚动 + 绝对固定定位
	   ======================================================== */
	page {
		background-color: #f8f8f8;
	}

	.page-container {
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	/* 1. 顶部全局区域：像钉子一样固定在最上面 */
	.global-header-fixed {
		position: fixed;
		top: 0;
		/* #ifdef H5 */
		top: var(--window-top);
		/* #endif */
		left: 0;
		right: 0;
		height: 180rpx; /* 明确高度 */
		background-color: #fff;
		z-index: 100;
		border-bottom: 1px solid #f2f2f2;
	}
	
	.custom-search-area { padding: 16rpx 24rpx; display: flex; align-items: center; }
	.search-bar { flex: 1; height: 64rpx; background-color: #f2f2f2; border-radius: 32rpx; display: flex; align-items: center; padding: 0 20rpx; }
	.search-input { flex: 1; margin-left: 10rpx; font-size: 28rpx; height: 100%; color: #333; }
	.search-btn { margin-left: 20rpx; font-size: 28rpx; color: #2979ff; font-weight: bold; }
	.clear-icon { padding: 10rpx; display: flex; align-items: center; }

	.business-switch-box { padding: 0 24rpx 16rpx; display: flex; justify-content: center; 
		.switch-capsule { display: flex; background-color: #f5f5f5; border-radius: 36rpx; padding: 4rpx; width: 100%; 
			.switch-item { flex: 1; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 28rpx; color: #666; border-radius: 32rpx; transition: all 0.3s; 
				&.active { background-color: #2979ff; color: #fff; font-weight: bold; box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.3); } } } }

	/* 2. 左侧菜单：固定在左边，独立滚动 */
	.left-menu-fixed {
		position: fixed;
		top: 180rpx; /* 避开顶部 */
		/* #ifdef H5 */
		top: calc(var(--window-top) + 180rpx);
		/* #endif */
		left: 0;
		bottom: 0;
		width: 180rpx; /* 明确宽度 */
		background-color: #f6f6f6;
		z-index: 90;
	}
	
	.u-tab-item { height: 100rpx; background: #f6f6f6; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: #444; border-bottom: 1px solid #f0f0f0; padding: 0 10rpx; }
	.u-tab-item-active { position: relative; color: #2979ff; font-size: 28rpx; font-weight: 600; background: #fff; }
	.u-tab-item-active::before { content: ""; position: absolute; border-left: 4px solid #2979ff; height: 32rpx; left: 0; top: 34rpx; }
	.empty-manufacturer { height: 100rpx; display: flex; align-items: center; justify-content: center; color: #999; font-size: 24rpx; }

	/* 3. 右侧顶部工具栏：固定在右上方 */
	.right-tools-fixed {
		position: fixed;
		top: 180rpx;
		/* #ifdef H5 */
		top: calc(var(--window-top) + 180rpx);
		/* #endif */
		left: 180rpx; /* 避开左侧菜单 */
		right: 0;
		height: 150rpx; /* 明确高度 */
		background-color: #fff;
		z-index: 90;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
	}
	
	/* 安全的简约版过滤栏 */
	.safe-filter-bar {
		display: flex;
		height: 80rpx;
		border-bottom: 1px solid #f8f8f8;
		
		.filter-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #333;
			
			/* 增加点击反馈 */
			&:active { background-color: #f5f5f5; }
		}
	}

    .sort-toolbar { 
		display: flex; justify-content: space-around; align-items: center; height: 70rpx; background: #fff; 
        .sort-btn { font-size: 28rpx; color: #666; display: flex; align-items: center; height: 100%;
            &.active { color: #2979ff; font-weight: bold; }
            .css-icon-box { display: flex; flex-direction: column; justify-content: center; margin-left: 8rpx; height: 100%; }
			.css-arrow { width: 0; height: 0; border: 8rpx solid transparent; margin: 1rpx 0; }
			.css-arrow.up { border-bottom-color: #ccc; border-top-width: 0; }
			.css-arrow.down { border-top-color: #ccc; border-bottom-width: 0; }
			.css-arrow.up.active { border-bottom-color: #2979ff; }
			.css-arrow.down.active { border-top-color: #2979ff; }
		} 
	}

	/* 4. 右侧商品列表区：原生滚动，极致丝滑 */
	.right-list-native {
		/* 利用 padding 把内容推到固定区域的下面和右边 */
		padding-top: 330rpx; /* 180 + 150 */
		padding-left: 180rpx;
		min-height: 100vh;
		box-sizing: border-box;
		background-color: #fff;
	}
	
	/* 商品卡片 UI */
	.page-view { padding: 16rpx; }
	.class-item { display: flex; margin-bottom: 30rpx; background-color: #fff; padding: 20rpx; border-radius: 12rpx; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04); border-bottom: 1px solid #f8f8f8; .item-img { width: 140rpx; height: 140rpx; border-radius: 8rpx; overflow: hidden; border: 1px solid #f0f0f0; margin-right: 20rpx; flex-shrink: 0; } .item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; .item-title { font-size: 28rpx; color: #333; font-weight: bold; line-height: 1.4; .type-tag { display: inline-block; font-size: 20rpx; color: #fff; background: #ff9900; padding: 0 6rpx; border-radius: 4rpx; margin-right: 8rpx; vertical-align: middle; } } .item-desc { font-size: 22rpx; color: #999; margin-top: 6rpx; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; .ml-10 { margin-left: 10rpx; } } .item-tags { margin-top: 8rpx; height: 36rpx; overflow: hidden; .mr-10 { margin-right: 10rpx; } } .item-price-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10rpx; .price-box { display: flex; align-items: baseline; .price-symbol { color: #ff3b30; font-size: 24rpx; } .price-num { color: #ff3b30; font-size: 32rpx; font-weight: bold; } .unit-text { font-size: 22rpx; color: #999; margin-left: 2rpx; } } .cart-box { display: flex; align-items: center; .sales { font-size: 20rpx; color: #ccc; } .add-btn-circle { width: 50rpx; height: 50rpx; background: #2979ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 12rpx; box-shadow: 0 2rpx 6rpx rgba(41, 121, 255, 0.3); color: #fff; font-size: 40rpx; font-weight: bold; line-height: 1; padding-bottom: 4rpx; &.dispensing-btn { background: #ff9900; box-shadow: 0 2rpx 6rpx rgba(255, 153, 0, 0.3); } } } } } }
	.loading-center { padding: 50rpx; display: flex; justify-content: center; }
</style>