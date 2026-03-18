<template>
  <view class="container">
    <view class="search-header">
      <u-search 
        v-model="keyword" 
        placeholder="请输入商品名称" 
        :show-action="true" 
        action-text="搜索" 
        :animation="true"
        @search="onSearch"
        @custom="onSearch"
        @clear="onClear"
      ></u-search>
    </view>

    <view class="sort-bar">
      <view class="sort-item" :class="{ active: currentSort === 'default' }" @click="handleSort('default')">综合</view>
      <view class="sort-item" :class="{ active: currentSort === 'sales' }" @click="handleSort('sales')">销量</view>
      <view class="sort-item price-sort" :class="{ active: currentSort === 'price' }" @click="handleSort('price')">
        <text>价格</text>
        <view class="icon-box">
          <u-icon name="arrow-up-fill" size="16" :color="priceSort === 'asc' && currentSort === 'price' ? '#2979ff' : '#ccc'"></u-icon>
          <u-icon name="arrow-down-fill" size="16" :color="priceSort === 'desc' && currentSort === 'price' ? '#2979ff' : '#ccc'"></u-icon>
        </view>
      </view>
    </view>

    <view class="page-view">
      <view v-if="isLoading && list.length === 0" class="loading-center">
        <u-loading mode="flower" size="60"></u-loading>
      </view>
      
      <u-empty v-if="!isLoading && list.length === 0" mode="search" text="暂无搜索结果" margin-top="100"></u-empty>

      <view class="class-item" v-for="(item, index) in list" :key="index" @click="goToDetail(item.id)">
        <view class="item-img">
          <u-image width="140rpx" height="140rpx" :src="item.imageUrl || item.urlImageMain || '/static/default-goods.png'" mode="aspectFill">
            <template v-slot:error>
              <image src="/static/empty.png" style="width: 100%; height: 100%;"></image>
            </template>
          </u-image>
        </view>
        <view class="item-info">
          <view class="item-title u-line-2">
            <text v-if="item.goodsType === 2" class="type-tag">颗粒</text>
            {{ item.goodsName }}
          </view>
          <view class="item-desc">
            <text>规格: {{ item.specification || item.spec || '--' }}</text>
            <text class="ml-10">厂家: {{ item.manufacturer || '--' }}</text>
          </view>
          <view class="item-tags">
            <u-tag :text="item.packageType" type="primary" size="mini" mode="light" v-if="item.packageType && item.goodsType !== 2" class="mr-10"/>
            <u-tag :text="`${item.minOrderQuantity || item.MinOrderQuantity || 1}${item.goodsType === 2 ? 'g' : '件'}起批`" type="warning" size="mini" mode="light" v-if="(item.minOrderQuantity || item.MinOrderQuantity) > 1"/>
          </view>
          <view class="item-price-row">
            <view class="item-price">
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ item.salePrice }}</text>
            </view>
            <view class="sales-text">销量 {{ (item.salesActual || 0) + (item.salesInitial || 0) }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <u-loadmore :status="loadStatus" v-if="list.length > 0" margin-top="30" margin-bottom="30"></u-loadmore>
  </view>
</template>

<script>
// 🌟 修复 Bug: 引入正确的 getGoodsList 方法
import { getGoodsList } from '@/api/goods/goods.js';

export default {
  data() {
    return {
      keyword: '',
      list: [],
      page: 1,
      limit: 10,
      
      currentSort: 'default',
      priceSort: 'desc',      
      
      isLoading: false,
      loadStatus: 'loadmore'
    };
  },
  
  onLoad(options) {
    if (options.key) {
      this.keyword = decodeURIComponent(options.key);
      this.loadData(true);
    }
  },
  
  onReachBottom() {
    if (this.loadStatus === 'loadmore') {
      this.page++;
      this.loadData();
    }
  },
  
  methods: {
    loadData(reset = false) {
      if (reset) {
        this.page = 1;
        this.list = [];
        this.loadStatus = 'loading';
      }
      this.isLoading = true;

      let sortType = 10;
      if (this.currentSort === 'sales') {
        sortType = 60;
      } else if (this.currentSort === 'price') {
        sortType = this.priceSort === 'asc' ? 30 : 20;
      }

      // 🌟 修复 Bug: 修正搜索参数，兼容多字段
      const params = {
        page: this.page,
        limit: this.limit,
        keyword: this.keyword, 
        key: this.keyword,
        goodsName: this.keyword,
        sortType: sortType,
        bigStatus: 10      
      };

      // 🌟 修复 Bug: 使用全局通用的列表接口
      getGoodsList(params).then(res => {
        const curList = res.result || res.data?.list || [];
        
        if (reset) {
          this.list = curList;
        } else {
          this.list = [...this.list, ...curList];
        }
        
        this.isLoading = false;
        this.loadStatus = curList.length < this.limit ? 'nomore' : 'loadmore';
      }).catch(err => {
        this.isLoading = false;
        this.loadStatus = 'nomore';
        console.error('搜索失败', err);
      });
    },

    onSearch(val) {
      this.keyword = val;
      this.loadData(true);
    },
    
    onClear() {
      this.keyword = '';
      this.list = [];
      this.loadStatus = 'nomore';
    },

    handleSort(type) {
      if (type === 'price') {
        if (this.currentSort === 'price') {
          this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSort = 'price';
          this.priceSort = 'desc'; 
        }
      } else {
        if (this.currentSort === type) return;
        this.currentSort = type;
      }
      this.loadData(true);
    },

    goToDetail(id) {
      uni.navigateTo({ url: `/pages/good/detail?id=${id}` });
    }
  }
};
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background-color: #f8f8f8; padding-bottom: 20rpx; }
.search-header { background-color: #fff; padding: 20rpx; position: sticky; top: 0; z-index: 10; }
.sort-bar { display: flex; background-color: #fff; padding: 20rpx 0; border-bottom: 1px solid #f5f5f5; .sort-item { flex: 1; text-align: center; font-size: 28rpx; color: #333; display: flex; justify-content: center; align-items: center; &.active { color: #2979ff; font-weight: bold; } .icon-box { display: flex; flex-direction: column; margin-left: 6rpx; } } }
.page-view { padding: 0 24rpx; background-color: #fff; min-height: calc(100vh - 180rpx); }
.loading-center { padding: 50rpx; display: flex; justify-content: center; }

/* 完美移植自分类页的商品卡片样式 */
.class-item {
	display: flex; padding: 24rpx 0; border-bottom: 1px solid #f5f5f5;
	&:active { background-color: #f9f9f9; }
	.item-img { width: 140rpx; height: 140rpx; border-radius: 12rpx; overflow: hidden; background-color: #f5f5f5; margin-right: 24rpx; flex-shrink: 0; }
	.item-info {
		flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;
		.item-title { font-size: 28rpx; color: #333; font-weight: bold; line-height: 40rpx; .type-tag { display: inline-block; background-color: #2979ff; color: #fff; font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 6rpx; margin-right: 10rpx; font-weight: normal; vertical-align: middle; margin-top: -4rpx; } }
		.item-desc { font-size: 22rpx; color: #999; margin-top: 8rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; .ml-10 { margin-left: 20rpx; } }
		.item-tags { display: flex; flex-wrap: wrap; margin-top: 8rpx; .mr-10 { margin-right: 10rpx; margin-bottom: 6rpx; } }
		.item-price-row {
			display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10rpx;
			.item-price { color: #fa3534; font-weight: bold; display: flex; align-items: baseline; .price-symbol { font-size: 24rpx; } .price-num { font-size: 36rpx; } }
			.sales-text { font-size: 22rpx; color: #999; }
		}
	}
}
</style>