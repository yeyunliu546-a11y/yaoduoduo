<template>
	<view class="u-wrap">
		<view class="header-container">
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
					<view class="clear-icon" v-if="keyword" @tap="onClearSearch">
						<u-icon name="close-circle-fill" color="#ccc" size="32"></u-icon>
					</view>
				</view>
				<view class="search-btn" @tap="onSearch">搜索</view>
			</view>

			<view class="business-switch-box">
				<view class="switch-capsule">
					<view 
						class="switch-item" 
						:class="{ active: businessType === 'procurement' }"
						@tap="switchBusiness('procurement')"
					>
						药品采购
					</view>
					<view 
						class="switch-item" 
						:class="{ active: businessType === 'dispensing' }"
						@tap="switchBusiness('dispensing')"
					>
						处方调剂
					</view>
				</view>
			</view>
		</view>

		<view class="u-menu-wrap">
			<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
				<view class="u-tab-item" :class="{ 'u-tab-item-active': selectedFilter.manufacturer === '' }"
					@tap="onSelectManufacturer('')">
					<text class="u-line-1">全部厂家</text>
				</view>
				<block v-if="filterOptions.manufacturers && filterOptions.manufacturers.length > 0">
					<view v-for="(item, index) in filterOptions.manufacturers" :key="index" class="u-tab-item"
						:class="{ 'u-tab-item-active': selectedFilter.manufacturer === item }"
						@tap="onSelectManufacturer(item)">
						<text class="u-line-1">{{ item }}</text>
					</view>
				</block>
			</scroll-view>

			<view class="right-box">
				<view class="fixed-header">
					<view class="sort-toolbar">
						<view class="sort-btn" :class="{active: currentSort === 'default'}" @click="onSort('default')">综合</view>
						
						<view class="sort-btn" :class="{active: currentSort === 'sales'}" @click="onSort('sales')">
							销量 
							<view class="css-icon-box">
								<view class="css-arrow up" :class="{active: currentSort === 'sales' && sortOrder === 'asc'}"></view>
								<view class="css-arrow down" :class="{active: currentSort === 'sales' && sortOrder === 'desc'}"></view>
							</view>
						</view>
						
						<view class="sort-btn" :class="{active: currentSort === 'price'}" @click="onSort('price')">
							价格 
							<view class="css-icon-box">
								<view class="css-arrow up" :class="{active: currentSort === 'price' && sortOrder === 'asc'}"></view>
								<view class="css-arrow down" :class="{active: currentSort === 'price' && sortOrder === 'desc'}"></view>
							</view>
						</view>
						
						<view class="sort-btn filter-btn" @click="openFilter">
							筛选 <u-icon name="list" size="28" color="#666" style="margin-left: 8rpx;"></u-icon>
						</view>
					</view>
				</view>

				<scroll-view scroll-y class="right-content" @scrolltolower="onReachBottomRight">
					<view class="page-view">
						<view v-if="keyword" class="search-tip">搜索: "{{keyword}}" 的结果</view>
						<view v-if="isLoading && goodsList.length === 0" class="loading-center">
							<u-loading mode="flower"></u-loading>
						</view>
						<u-empty v-if="!isLoading && goodsList.length === 0" mode="list" text="暂无商品" margin-top="100"></u-empty>

						<view class="class-item" v-for="(item, index) in goodsList" :key="index" @tap="goToDetail(item.id)">
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
                                    <text>规格: {{ item.spec }}</text>
                                    <text class="ml-10">厂家: {{ item.manufacturer }}</text>
                                </view>
								<view class="item-tags">
									<u-tag :text="item.standard" type="success" size="mini" mode="light" v-if="item.standard" class="mr-10"/>
									<u-tag :text="item.packageType" type="primary" size="mini" mode="light" v-if="item.packageType"/>
								</view>
								<view class="item-price-row">
									<view class="price-box">
                                        <text class="price-symbol">¥</text>
                                        <text class="price-num">{{ item.salePrice }}</text>
										<text v-if="businessType === 'dispensing'" class="unit-text">/g</text>
                                        <view class="vip-tag">协议价</view>
                                    </view>
									<view class="cart-box" @tap.stop="addToCart(item)">
                                        <text class="sales">已售{{ item.sales || 0 }}</text>
										<view class="add-btn-circle" :class="{ 'dispensing-btn': businessType === 'dispensing' }">+</view>
                                    </view>
								</view>
							</view>
						</view>
						<u-loadmore :status="loadStatus" v-if="goodsList.length > 0" margin-top="30" margin-bottom="30"></u-loadmore>
						<view style="height: 50rpx"></view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="custom-mask" v-if="showFilter" @click="closeFilter" @touchmove.stop.prevent></view>
		
		<view class="custom-drawer" :class="{ 'show': showFilter }" @touchmove.stop.prevent>
			<view class="drawer-container">
				<view class="drawer-header">筛选</view>
				
				<scroll-view scroll-y class="drawer-scroll">
					<view class="drawer-content">
						<view class="filter-block" v-if="filterOptions.packageTypes && filterOptions.packageTypes.length > 0">
							<view class="block-title">包装类型</view>
							<view class="tag-box">
								<view 
									class="tag-item" 
									:class="{ active: tempFilter.packageType === item }"
									v-for="(item, index) in filterOptions.packageTypes" 
									:key="`pkg-${index}`"
									@tap="onTempSelect('packageType', item)"
								>
									{{ item }}
								</view>
							</view>
						</view>

						<view class="filter-block" v-if="filterOptions.standards && filterOptions.standards.length > 0">
							<view class="block-title">执行标准</view>
							<view class="tag-box">
								<view 
									class="tag-item" 
									:class="{ active: tempFilter.standard === item }"
									v-for="(item, index) in filterOptions.standards" 
									:key="`std-${index}`"
									@tap="onTempSelect('standard', item)"
								>
									{{ item }}
								</view>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="drawer-footer">
					<view class="drawer-btn reset" @click="resetFilter">重置</view>
					<view class="drawer-btn confirm" @click="confirmFilter">确定</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import * as GoodsApi from '@/api/goods/goods.js';
	import { addCart } from '@/api/goods/cart.js';

	export default {
		data() {
			return {
				businessType: 'procurement',
				keyword: '', 
				filterOptions: { manufacturers: [], packageTypes: [], standards: [] },
				selectedFilter: { manufacturer: '', packageType: '', standard: '' },
				tempFilter: { packageType: '', standard: '' },
				showFilter: false,
				
                currentSort: 'default',
                sortOrder: 'desc',      
				goodsList: [],
				page: 1, limit: 10,
				isLoading: false, loadStatus: 'loadmore',
			}
		},
		onLoad() {
			this.loadFilterOptions();
			this.loadGoodsData(true);
		},
		methods: {
			// 打开筛选
			openFilter() {
				console.log("手动打开抽屉");
				// 同步当前选中状态到临时状态
				this.tempFilter.packageType = this.selectedFilter.packageType;
				this.tempFilter.standard = this.selectedFilter.standard;
				this.showFilter = true;
			},
			
			// 关闭筛选
			closeFilter() {
				this.showFilter = false;
			},

			switchBusiness(type) {
				if (this.businessType === type) return;
				this.businessType = type;
				this.keyword = '';
				this.selectedFilter = { manufacturer: '', packageType: '', standard: '' };
				this.tempFilter = { packageType: '', standard: '' };
				this.currentSort = 'default';
				this.goodsList = []; 
				this.loadFilterOptions();
				this.loadGoodsData(true);
			},

			loadFilterOptions() {
				GoodsApi.getFilterOptions({ businessType: this.businessType }).then(res => {
                    if(res.code === 200 && res.result) this.filterOptions = res.result;
				});
			},

			loadGoodsData(reset = false) {
				if (reset) {
					this.page = 1; this.goodsList = []; this.loadStatus = 'loading';
				}
				this.isLoading = true;

                const params = {
                    page: this.page, limit: this.limit, keyword: this.keyword,
					businessType: this.businessType,
                    manufacturer: this.selectedFilter.manufacturer,
                    packageType: this.selectedFilter.packageType,
                    standard: this.selectedFilter.standard,
                    sortField: this.currentSort, sortOrder: this.sortOrder
                };

				GoodsApi.getGoodsListByWhere(params).then(res => {
					const list = res.data?.list || res.result || [];
					this.goodsList = [...this.goodsList, ...list];
					this.isLoading = false;
                    this.loadStatus = list.length < this.limit ? 'nomore' : 'loadmore';
				}).catch(err => {
                    this.isLoading = false; this.loadStatus = 'nomore';
                });
			},

			onSelectManufacturer(name) {
				if (this.selectedFilter.manufacturer === name) return;
				this.selectedFilter.manufacturer = name;
				this.loadGoodsData(true);
			},

			onTempSelect(key, value) {
				if (this.tempFilter[key] === value) {
					this.tempFilter[key] = '';
				} else {
					this.tempFilter[key] = value;
				}
			},
			resetFilter() {
				this.tempFilter = { packageType: '', standard: '' };
			},
			confirmFilter() {
				this.selectedFilter.packageType = this.tempFilter.packageType;
				this.selectedFilter.standard = this.tempFilter.standard;
				this.showFilter = false; // 关闭抽屉
				this.loadGoodsData(true);
			},

            onSort(type) {
                if (this.currentSort === type) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort = type; this.sortOrder = 'desc'; 
                }
                this.loadGoodsData(true);
            },
			onSearch() {
                this.selectedFilter = { manufacturer: '', packageType: '', standard: '' };
                this.currentSort = 'default';
				this.loadGoodsData(true);
			},
            onClearSearch() {
                this.keyword = '';
                this.loadGoodsData(true);
            },
			onReachBottomRight() {
                if(this.loadStatus === 'nomore') return;
                this.page++;
                this.loadGoodsData();
			},
			goToDetail(id) { uni.navigateTo({ url: `/pages/good/detail?id=${id}` }); },
            addToCart(item) {
                uni.showLoading({ title: '加入中' });
                addCart({ goodsSkuId: item.id, goodsNum: 1 }).then(res => {
                    uni.hideLoading();
                    if(res.code === 200) uni.showToast({ title: '已加入', icon: 'success' });
                    else uni.showToast({ title: res.message || '失败', icon: 'none' });
                }).catch(() => { uni.hideLoading(); uni.showToast({ title: '失败', icon: 'none' }); });
            }
		}
	}
</script>

<style lang="scss" scoped>
	page { height: 100vh; overflow: hidden; background-color: #f8f8f8; }
	.u-wrap { height: calc(100vh - var(--window-top)); display: flex; flex-direction: column; overflow: hidden; }

	.header-container { background-color: #fff; border-bottom: 1px solid #f2f2f2; flex-shrink: 0; z-index: 100; }
	.custom-search-area { padding: 16rpx 24rpx; display: flex; align-items: center; }
	.search-bar { flex: 1; height: 64rpx; background-color: #f2f2f2; border-radius: 32rpx; display: flex; align-items: center; padding: 0 20rpx; }
	.search-input { flex: 1; margin-left: 10rpx; font-size: 28rpx; height: 100%; color: #333; }
	.search-btn { margin-left: 20rpx; font-size: 28rpx; color: #2979ff; font-weight: bold; }
	.clear-icon { padding: 10rpx; display: flex; align-items: center; }

	.business-switch-box { padding: 0 24rpx 16rpx; display: flex; justify-content: center; 
		.switch-capsule { display: flex; background-color: #f5f5f5; border-radius: 36rpx; padding: 4rpx; width: 100%; 
			.switch-item { flex: 1; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 28rpx; color: #666; border-radius: 32rpx; transition: all 0.3s; 
				&.active { background-color: #2979ff; color: #fff; font-weight: bold; box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.3); } } } }

	.u-menu-wrap { flex: 1; display: flex; overflow: hidden; height: 100%; min-height: 0; }
	.u-tab-view { width: 180rpx; height: 100%; background-color: #f6f6f6; flex-shrink: 0; }
	.u-tab-item { height: 100rpx; background: #f6f6f6; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: #444; border-bottom: 1px solid #f0f0f0; padding: 0 10rpx; }
	.u-tab-item-active { position: relative; color: #2979ff; font-size: 28rpx; font-weight: 600; background: #fff; }
	.u-tab-item-active::before { content: ""; position: absolute; border-left: 4px solid #2979ff; height: 32rpx; left: 0; top: 34rpx; }

	.right-box { flex: 1; background-color: #fff; height: 100%; display: flex; flex-direction: column; position: relative; }
    .fixed-header { background-color: #fff; border-bottom: 1px solid #f8f8f8; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.02); flex-shrink: 0; z-index: 9; }
    
    .sort-toolbar { display: flex; justify-content: space-around; padding: 16rpx 0; background: #fff; border-top: 1px solid #f8f8f8;
        .sort-btn { font-size: 28rpx; color: #666; display: flex; align-items: center; height: 40rpx;
            &.active { color: #2979ff; font-weight: bold; }
			&.filter-btn { border-left: 1px solid #eee; padding-left: 30rpx; }
            
            .css-icon-box { display: flex; flex-direction: column; justify-content: center; margin-left: 8rpx; height: 100%; }
			.css-arrow { width: 0; height: 0; border: 8rpx solid transparent; margin: 1rpx 0; }
			.css-arrow.up { border-bottom-color: #ccc; border-top-width: 0; }
			.css-arrow.down { border-top-color: #ccc; border-bottom-width: 0; }
			
			.css-arrow.up.active { border-bottom-color: #2979ff; }
			.css-arrow.down.active { border-top-color: #2979ff; }
		} 
	}

	.right-content { flex: 1; height: 0; }
	.page-view { padding: 16rpx; }
	.class-item { display: flex; margin-bottom: 30rpx; background-color: #fff; padding: 20rpx; border-radius: 12rpx; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03); border-bottom: 1px solid #f8f8f8; .item-img { width: 140rpx; height: 140rpx; border-radius: 8rpx; overflow: hidden; border: 1px solid #f0f0f0; margin-right: 20rpx; flex-shrink: 0; } .item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; .item-title { font-size: 28rpx; color: #333; font-weight: bold; line-height: 1.4; .type-tag { display: inline-block; font-size: 20rpx; color: #fff; background: #ff9900; padding: 0 6rpx; border-radius: 4rpx; margin-right: 8rpx; vertical-align: middle; } } .item-desc { font-size: 22rpx; color: #999; margin-top: 6rpx; .ml-10 { margin-left: 10rpx; } } .item-tags { margin-top: 8rpx; .mr-10 { margin-right: 10rpx; } } .item-price-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10rpx; .price-box { display: flex; align-items: baseline; .price-symbol { color: #ff3b30; font-size: 24rpx; } .price-num { color: #ff3b30; font-size: 32rpx; font-weight: bold; } .unit-text { font-size: 22rpx; color: #999; margin-left: 2rpx; } .vip-tag { font-size: 18rpx; color: #bfa170; border: 1px solid #bfa170; padding: 0 6rpx; border-radius: 4rpx; margin-left: 10rpx; transform: scale(0.9); } } .cart-box { display: flex; align-items: center; .sales { font-size: 20rpx; color: #ccc; } .add-btn-circle { width: 50rpx; height: 50rpx; background: #2979ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 12rpx; box-shadow: 0 2rpx 6rpx rgba(41, 121, 255, 0.3); color: #fff; font-size: 40rpx; font-weight: bold; line-height: 1; padding-bottom: 4rpx; &.dispensing-btn { background: #ff9900; box-shadow: 0 2rpx 6rpx rgba(255, 153, 0, 0.3); } } } } } }
	.loading-center { padding: 50rpx; display: flex; justify-content: center; }

	/* --- 手写抽屉样式 (纯 CSS 实现，不依赖 u-popup) --- */
	
	/* 遮罩层 */
	.custom-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 998; /* 确保在商品列表之上 */
	}
	
	/* 抽屉本体 */
	.custom-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 80%; /* 抽屉宽度 */
		background-color: #fff;
		z-index: 999; /* 在遮罩层之上 */
		transform: translateX(100%); /* 默认移出屏幕外 */
		transition: transform 0.3s ease; /* 滑动动画 */
		
		&.show {
			transform: translateX(0); /* 显示时滑入 */
		}
		
		.drawer-container {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
		}
		
		.drawer-header {
			height: 88rpx;
			line-height: 88rpx;
			text-align: center;
			font-size: 32rpx;
			font-weight: bold;
			border-bottom: 1px solid #f0f0f0;
		}
		
		.drawer-scroll {
			flex: 1;
			height: 0;
			padding: 24rpx;
		}
		
		.filter-block {
			margin-bottom: 40rpx;
			
			.block-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 20rpx;
			}
			
			.tag-box {
				display: flex;
				flex-wrap: wrap;
				
				.tag-item {
					min-width: 160rpx;
					height: 64rpx;
					line-height: 64rpx;
					text-align: center;
					background-color: #f6f6f6;
					border-radius: 32rpx;
					font-size: 26rpx;
					color: #666;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
					padding: 0 20rpx;
					border: 1px solid transparent;
					
					&.active {
						background-color: #e6f1fc;
						color: #2979ff;
						font-weight: 500;
						border-color: #2979ff;
					}
				}
			}
		}
		
		.drawer-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 30rpx;
			border-top: 1px solid #f0f0f0;
			background-color: #fff;
            /* 适配底部安全区 */
            padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
            padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
			
			.drawer-btn {
				width: 48%;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				border-radius: 40rpx;
				font-size: 28rpx;
				
				&.reset {
					background-color: #f6f6f6;
					color: #666;
				}
				&.confirm {
					background-color: #2979ff;
					color: #fff;
				}
			}
		}
	}
</style>