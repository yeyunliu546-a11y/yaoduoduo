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

			<view class="right-box">
				
				<view class="fixed-header">
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

				<scroll-view scroll-y class="right-content" @scrolltolower="onReachBottomRight">
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
						<view style="height: 50rpx"></view>
					</view>
				</scroll-view>
			</view>
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
                currentSort: 'default', 
                sortOrder: 'desc',     
				goodsList: [],
				page: 1,
				limit: 10,
				isLoading: false,
				loadStatus: 'loadmore',
			}
		},
		onLoad() {
			this.loadFilterOptions();
			this.loadGoodsData(true);
		},
		methods: {
			loadFilterOptions() {
				GoodsApi.getFilterOptions().then(res => {
                    if(res.code === 200) {
                        this.filterOptions = res.result;
                    }
				});
			},

			loadGoodsData(reset = false) {
				if (reset) {
					this.page = 1;
					this.goodsList = [];
					this.loadStatus = 'loading';
				}
				this.isLoading = true;

                const params = {
                    page: this.page,
                    limit: this.limit,
                    keyword: this.keyword,
                    manufacturer: this.selectedFilter.manufacturer,
                    packageType: this.selectedFilter.packageType,
                    standard: this.selectedFilter.standard,
                    sortField: this.currentSort,
                    sortOrder: this.sortOrder
                };

				GoodsApi.getGoodsListByWhere(params).then(res => {
					const list = res.data.list || [];
					this.goodsList = [...this.goodsList, ...list];
					this.isLoading = false;
                    
                    if (list.length < this.limit) {
                        this.loadStatus = 'nomore'; 
                    } else {
                        this.loadStatus = 'loadmore';
                    }
				}).catch(err => {
                    this.isLoading = false;
                    this.loadStatus = 'nomore';
                    console.error('加载失败', err);
                });
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
            onSort(type) {
                if (this.currentSort === type) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort = type;
                    this.sortOrder = 'desc'; 
                }
                this.loadGoodsData(true);
            },
			onSearch() {
				this.loadGoodsData(true);
			},
			
			onReachBottomRight() {
                if(this.loadStatus === 'nomore') return;
                this.page++;
                this.loadGoodsData();
			},
			
			goToDetail(id) {
				uni.navigateTo({ url: `/pages/good/detail?id=${id}` });
			},
            addToCart(item) {
                uni.showLoading({ title: '加购中...' });
                setTimeout(() => {
                    uni.hideLoading();
                    uni.showToast({ title: `已加入: ${item.goodsName}`, icon: 'success' });
                }, 500);
            }
		}
	}
</script>

<style lang="scss" scoped>
	/* 核心修复：锁死页面高度，禁止原生滚动 */
	page {
		height: 100vh; /* 强制满屏 */
		overflow: hidden; /* 禁止溢出滚动 */
	}

	.u-wrap {
		height: 100vh; /* 继承满屏高度 */
		display: flex;
		flex-direction: column;
		overflow: hidden; /* 双重保险 */
	}

	.u-search-box-box {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f2f2f2;
		flex-shrink: 0; /* 防止被挤压 */
	}

	.u-menu-wrap {
		flex: 1; /* 占据剩余所有空间 */
		display: flex;
		overflow: hidden; /* 关键：禁止这个容器本身滚动 */
	}

	/* 左侧导航 */
	.u-tab-view {
		width: 180rpx;
		height: 100%; /* 充满父容器高度 */
		background-color: #f6f6f6;
		flex-shrink: 0; 
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

	/* 右侧整体容器 */
	.right-box {
		flex: 1;
		background-color: #fff;
		height: 100%; /* 充满高度 */
		display: flex;
		flex-direction: column; /* 垂直布局 */
		overflow: hidden; /* 关键：禁止溢出 */
	}
    
    /* 顶部筛选区 (固定) */
    .fixed-header {
        background-color: #fff;
        border-bottom: 1px solid #f0f0f0;
        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
        z-index: 10;
		flex-shrink: 0; /* 防止被挤压 */
    }
    
    /* 滚动列表区 (只允许这里滚) */
    .right-content {
        flex: 1;
		/* 魔法代码：在 flex:1 同时也限制高度为 0，
		   这样它就会乖乖呆在剩余空间里，内部产生滚动条，而不会撑破父容器 */
		height: 0; 
    }
	
    /* 属性筛选样式 */
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

    /* 排序工具栏样式 */
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

	/* 列表样式 */
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