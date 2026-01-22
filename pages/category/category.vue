<template>
	<view class="u-wrap">
		<view class="u-search-box-box">
			<u-search placeholder="输入药品名称/厂家搜索" :show-action="true" action-text="搜索" bg-color="#f2f2f2" v-model="keyword" @custom="onSearch" @search="onSearch"></u-search>
		</view>

		<view class="u-menu-wrap">
			<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
				<view class="u-tab-item" :class="{ 'u-tab-item-active': selectedFilter.manufacturer === '' }"
					@tap="onSelectManufacturer('')">
					<text class="u-line-1">全部厂家</text>
				</view>
				<view v-for="(item, index) in filterOptions.manufacturers" :key="index" class="u-tab-item"
					:class="{ 'u-tab-item-active': selectedFilter.manufacturer === item }"
					@tap="onSelectManufacturer(item)">
					<text class="u-line-1">{{ item }}</text>
				</view>
			</scroll-view>

			<scroll-view scroll-y class="right-box" @scrolltolower="onReachBottomRight">
				
				<view class="sticky-header">
					<view class="attribute-filter">
						<view class="filter-row" v-if="filterOptions.packageTypes.length > 0">
							<text class="row-label">包装</text>
							<scroll-view scroll-x class="row-scroll">
								<view class="tag-item" :class="{active: selectedFilter.packageType === pkg}" 
									  v-for="(pkg, i) in filterOptions.packageTypes" :key="`p-${i}`" 
									  @tap="onSelectPackage(pkg)">
									{{ pkg }}
								</view>
							</scroll-view>
						</view>
						
						<view class="filter-row" v-if="filterOptions.standards.length > 0">
							<text class="row-label">标准</text>
							<scroll-view scroll-x class="row-scroll">
								<view class="tag-item" :class="{active: selectedFilter.standard === std}" 
									  v-for="(std, i) in filterOptions.standards" :key="`s-${i}`" 
									  @tap="onSelectStandard(std)">
									{{ std }}
								</view>
							</scroll-view>
						</view>
					</view>

					<view class="sort-toolbar">
						<view class="sort-btn" :class="{active: currentSort === 'default'}" @tap="onSort('default')">
							综合
						</view>
						
						<view class="sort-btn" :class="{active: currentSort === 'sales'}" @tap="onSort('sales')">
							销量 
							<view class="sort-icon-box">
								<text class="arrow up" :class="{on: currentSort === 'sales' && sortOrder === 'asc'}">▲</text>
								<text class="arrow down" :class="{on: currentSort === 'sales' && sortOrder === 'desc'}">▼</text>
							</view>
						</view>
						
						<view class="sort-btn" :class="{active: currentSort === 'price'}" @tap="onSort('price')">
							价格 
							<view class="sort-icon-box">
								<text class="arrow up" :class="{on: currentSort === 'price' && sortOrder === 'asc'}">▲</text>
								<text class="arrow down" :class="{on: currentSort === 'price' && sortOrder === 'desc'}">▼</text>
							</view>
						</view>
					</view>
				</view>

				<view class="page-view">
					<view v-if="isLoading && goodsList.length === 0" class="loading-center">
						<u-loading mode="flower"></u-loading>
					</view>
					
					<u-empty v-if="!isLoading && goodsList.length === 0" mode="list" text="暂无商品" margin-top="100"></u-empty>

					<view class="class-item" v-for="(item, index) in goodsList" :key="index" @tap="goToDetail(item.id)">
						<view class="item-img">
							<u-image width="140rpx" height="140rpx" :src="item.imageUrl" mode="aspectFill"></u-image>
						</view>
						<view class="item-info">
							<view class="item-title u-line-2">{{ item.goodsName }}</view>
							
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
                                    <view class="vip-tag">协议价</view>
                                </view>
								<view class="cart-box" @tap.stop="addToCart(item)">
                                    <text class="sales">已售{{ item.sales }}</text>
									<u-icon name="plus-circle-fill" color="#2979ff" size="44"></u-icon>
                                </view>
							</view>
						</view>
					</view>
					
					<u-loadmore :status="loadStatus" v-if="goodsList.length > 0" margin-top="30" margin-bottom="30"></u-loadmore>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import * as GoodsApi from '@/api/goods/goods.js';

	export default {
		data() {
			return {
				keyword: '',
				filterOptions: {
					manufacturers: [],
					packageTypes: [],
					standards: []
				},
				selectedFilter: {
					manufacturer: '',
					packageType: '',
					standard: ''
				},
                // --- 排序状态 ---
                currentSort: 'default', // default, sales, price
                sortOrder: 'desc',      // 通用排序顺序：asc, desc
                
				goodsList: [],
				page: 1,
				limit: 10,
				isLoading: false,
				loadStatus: 'loadmore',
                
                // 模拟数据库
                mockDatabase: [
                    { id: 101, goodsName: '感冒灵颗粒 (热销)', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*9袋', salePrice: 15.50, sales: 5000, imageUrl: '/static/logo.png' },
                    { id: 102, goodsName: '感冒灵颗粒 (便携)', manufacturer: '华润三九', standard: '省标', packageType: '小包', spec: '5g*12袋', salePrice: 9.90, sales: 1200, imageUrl: '/static/logo.png' },
                    { id: 103, goodsName: '板蓝根颗粒', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*20袋', salePrice: 12.00, sales: 800, imageUrl: '/static/logo.png' },
                    { id: 104, goodsName: '六味地黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '120丸/瓶', salePrice: 48.00, sales: 3000, imageUrl: '/static/logo.png' },
                    { id: 105, goodsName: '安宫牛黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '3g*1丸', salePrice: 580.00, sales: 100, imageUrl: '/static/logo.png' },
                    { id: 106, goodsName: '大活络丹', manufacturer: '北京同仁堂', standard: '企标', packageType: '大包', spec: '3.5g*10丸', salePrice: 35.00, sales: 600, imageUrl: '/static/logo.png' },
                    { id: 107, goodsName: '云南白药气雾剂', manufacturer: '云南白药', standard: '国标', packageType: '瓶装', spec: '85g+30g', salePrice: 28.50, sales: 4500, imageUrl: '/static/logo.png' },
                    { id: 108, goodsName: '三七粉', manufacturer: '云南白药', standard: '省标', packageType: '瓶装', spec: '50g/瓶', salePrice: 128.00, sales: 200, imageUrl: '/static/logo.png' },
                    { id: 109, goodsName: '创可贴', manufacturer: '云南白药', standard: '企标', packageType: '小包', spec: '100片/盒', salePrice: 5.00, sales: 9999, imageUrl: '/static/logo.png' },
                    { id: 110, goodsName: '斯达舒', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '24片/盒', salePrice: 22.00, sales: 1500, imageUrl: '/static/logo.png' },
                    { id: 112, goodsName: '藿香正气口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.50, sales: 3200, imageUrl: '/static/logo.png' },
                ]
			}
		},
		onLoad() {
			this.loadFilterOptions();
			this.loadGoodsData(true);
		},
		methods: {
			loadFilterOptions() {
				setTimeout(() => {
					this.filterOptions = {
						manufacturers: ['华润三九', '北京同仁堂', '云南白药', '修正药业', '太极集团'],
						packageTypes: ['大包', '小包', '瓶装', '盒装'],
						standards: ['国标', '省标', '企标']
					};
				}, 200);
			},

			loadGoodsData(reset = false) {
				if (reset) {
					this.page = 1;
					this.goodsList = [];
					this.loadStatus = 'loading';
				}
				this.isLoading = true;

				setTimeout(() => {
                    const { manufacturer, packageType, standard } = this.selectedFilter;
                    
                    let result = this.mockDatabase.filter(item => {
                        const matchBrand = manufacturer ? item.manufacturer === manufacturer : true;
                        const matchPkg = packageType ? item.packageType === packageType : true;
                        const matchStd = standard ? item.standard === standard : true;
                        const matchKeyword = this.keyword ? (item.goodsName.includes(this.keyword) || item.manufacturer.includes(this.keyword)) : true;
                        return matchBrand && matchPkg && matchStd && matchKeyword;
                    });

                    // --- 核心：通用排序逻辑 ---
                    if (this.currentSort !== 'default') {
                        // 升序系数 (1: 升序, -1: 降序)
                        const factor = this.sortOrder === 'asc' ? 1 : -1;
                        
                        result.sort((a, b) => {
                            if (this.currentSort === 'sales') {
                                return (a.sales - b.sales) * factor;
                            } else if (this.currentSort === 'price') {
                                return (a.salePrice - b.salePrice) * factor;
                            }
                            return 0;
                        });
                    }

                    this.goodsList = result;
					this.isLoading = false;
					this.loadStatus = 'nomore'; 
				}, 300);
			},

			onSelectManufacturer(name) {
				if (this.selectedFilter.manufacturer === name) return;
				this.selectedFilter.manufacturer = name;
				this.loadGoodsData(true);
			},

			onSelectPackage(name) {
                this.selectedFilter.packageType = (this.selectedFilter.packageType === name) ? '' : name;
				this.loadGoodsData(true);
			},

			onSelectStandard(name) {
                this.selectedFilter.standard = (this.selectedFilter.standard === name) ? '' : name;
				this.loadGoodsData(true);
			},
            
            // --- 点击排序（通用版）---
            onSort(type) {
                // 如果点的就是当前激活的类型，则反转顺序
                if (this.currentSort === type) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    // 切换新类型，默认降序 (销量和价格通常大家先看最高的或最低的，默认降序符合习惯)
                    this.currentSort = type;
                    this.sortOrder = 'desc'; 
                }
                this.loadGoodsData(true);
            },
			
			onSearch() {
				this.loadGoodsData(true);
			},

			onReachBottomRight() {
			},

			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/good/detail?id=${id}`
				});
			},
            
            // --- 加入购物车 (简单模拟) ---
            addToCart(item) {
                // 1. 检查登录 (模拟)
                // const token = uni.getStorageSync('token');
                // if (!token) return uni.navigateTo({ url: '/pages/login/index' });
                
                // 2. 模拟调用 API
                uni.showLoading({ title: '加购中...' });
                setTimeout(() => {
                    uni.hideLoading();
                    uni.showToast({
                        title: `已加入购物车: ${item.goodsName}`,
                        icon: 'success'
                    });
                    // 这里通常需要调用 store 更新购物车角标
                }, 500);
            }
		}
	}
</script>

<style lang="scss" scoped>
	.u-wrap {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		display: flex;
		flex-direction: column;
	}

	.u-search-box-box {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f2f2f2;
	}

	.u-menu-wrap {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* 左侧导航 */
	.u-tab-view {
		width: 180rpx;
		height: 100%;
		background-color: #f6f6f6;
	}

	.u-tab-item {
		height: 100rpx;
		background: #f6f6f6;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #444;
		border-bottom: 1px solid #f0f0f0;
        padding: 0 10rpx;
	}
	
	.u-tab-item-active {
		position: relative;
		color: #2979ff;
		font-size: 28rpx;
		font-weight: 600;
		background: #fff;
	}
	
	.u-tab-item-active::before {
		content: "";
		position: absolute;
		border-left: 4px solid #2979ff;
		height: 32rpx;
		left: 0;
		top: 34rpx;
	}

	/* 右侧内容 */
	.right-box {
		flex: 1;
		background-color: #fff;
		height: 100%;
        display: flex;
        flex-direction: column;
	}
    
    .sticky-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: #fff;
        border-bottom: 1px solid #f0f0f0;
        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
    }
	
    .attribute-filter {
        padding: 16rpx 20rpx 6rpx;
        
        .filter-row {
            display: flex;
            align-items: center;
            margin-bottom: 14rpx;
            
            .row-label {
                font-size: 24rpx;
                color: #999;
                width: 60rpx;
                flex-shrink: 0;
                font-weight: bold;
            }
            
            .row-scroll {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                
                .tag-item {
                    display: inline-block;
                    font-size: 22rpx;
                    color: #666;
                    background: #f7f7f7;
                    padding: 6rpx 20rpx;
                    border-radius: 6rpx;
                    margin-right: 16rpx;
                    border: 1px solid transparent;
                    
                    &.active {
                        background: #e6f1fc;
                        color: #2979ff;
                        border-color: #a3d3ff;
                    }
                }
            }
        }
    }

    /* 排序工具栏 */
    .sort-toolbar {
        display: flex;
        justify-content: space-around;
        padding: 16rpx 0;
        background: #fff;
        border-top: 1px solid #f8f8f8;
        
        .sort-btn {
            font-size: 28rpx;
            color: #666;
            display: flex;
            align-items: center;
            
            &.active {
                color: #2979ff;
                font-weight: bold;
            }
            
            .sort-icon-box {
                display: flex;
                flex-direction: column;
                margin-left: 6rpx;
                line-height: 1;
                
                .arrow {
                    font-size: 14rpx;
                    color: #ccc;
                    height: 14rpx;
                    &.on { color: #2979ff; }
                }
            }
        }
    }

	/* 商品列表 */
	.page-view {
		padding: 16rpx;
	}

	.class-item {
		display: flex;
		margin-bottom: 30rpx;
		background-color: #fff;
		padding: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
        border-bottom: 1px solid #f8f8f8;
		
		.item-img {
			width: 140rpx;
			height: 140rpx;
            border-radius: 8rpx;
            overflow: hidden;
            border: 1px solid #f0f0f0;
            margin-right: 20rpx;
            flex-shrink: 0;
		}

		.item-info {
			flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
			
			.item-title {
				font-size: 28rpx;
				color: #333;
				font-weight: bold;
                line-height: 1.4;
			}
            
            .item-desc {
                font-size: 22rpx;
                color: #999;
                margin-top: 6rpx;
                .ml-10 { margin-left: 10rpx; }
            }
			
			.item-tags {
				margin-top: 8rpx;
                .mr-10 { margin-right: 10rpx; }
			}
			
			.item-price-row {
				display: flex;
				justify-content: space-between;
				align-items: flex-end;
                margin-top: 10rpx;
				
                .price-box {
                    display: flex;
                    align-items: baseline;
                    .price-symbol { color: #ff3b30; font-size: 24rpx; }
                    .price-num { color: #ff3b30; font-size: 32rpx; font-weight: bold; }
                    
                    .vip-tag {
                        font-size: 18rpx;
                        color: #bfa170;
                        border: 1px solid #bfa170;
                        padding: 0 6rpx;
                        border-radius: 4rpx;
                        margin-left: 10rpx;
                        transform: scale(0.9);
                    }
                }
                
                .cart-box {
                    display: flex;
                    align-items: center;
                    .sales {
                        font-size: 20rpx;
                        color: #ccc;
                        margin-right: 10rpx;
                    }
                }
			}
		}
	}
	
	.loading-center {
		padding: 50rpx;
		display: flex;
		justify-content: center;
	}
</style>