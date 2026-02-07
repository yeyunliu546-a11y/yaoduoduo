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

    <view class="goods-list">
      <view v-if="isLoading && list.length === 0" class="loading-center">
        <u-loading mode="flower"></u-loading>
      </view>
      
      <u-empty v-if="!isLoading && list.length === 0" mode="search" text="暂无搜索结果" margin-top="100"></u-empty>

      <view 
        class="goods-item" 
        v-for="(item, index) in list" 
        :key="index"
        @click="goToDetail(item.id)"
      >
        <view class="image-wrapper">
          <u-image width="100%" height="100%" :src="item.imageUrl" mode="aspectFill">
            <template v-slot:error>
              <image src="/static/empty.png" style="width: 100%; height: 100%;"></image>
            </template>
          </u-image>
        </view>
        <view class="info-wrapper">
          <view class="title u-line-2">{{ item.goodsName }}</view>
          <view class="tags">
             <u-tag :text="item.manufacturer" type="info" size="mini" mode="light" v-if="item.manufacturer" class="tag"/>
             <u-tag :text="item.spec || item.specification" type="warning" size="mini" mode="light" v-if="item.spec || item.specification" class="tag"/>
          </view>
          <view class="price-row">
            <view class="price">
              <text class="symbol">¥</text>
              <text class="num">{{ item.salePrice }}</text>
            </view>
            <view class="sales">销量 {{ (item.salesActual || 0) + (item.salesInitial || 0) }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <u-loadmore :status="loadStatus" v-if="list.length > 0" margin-top="30" margin-bottom="30"></u-loadmore>
  </view>
</template>

<script>
// 【修改点1】引入 API 模块，不再写死 URL
import * as GoodsApi from '@/api/goods/goods.js';

export default {
  data() {
    return {
      keyword: '',
      list: [],
      page: 1,
      limit: 10,
      
      // 排序相关
      currentSort: 'default', // default, sales, price
      priceSort: 'desc',      // asc, desc
      
      isLoading: false,
      loadStatus: 'loadmore'
    };
  },
  
  onLoad(options) {
    // 接收首页传过来的参数 key
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
    // 【修改点2】使用 API 调用
    loadData(reset = false) {
      if (reset) {
        this.page = 1;
        this.list = [];
        this.loadStatus = 'loading';
      }
      this.isLoading = true;

      // 计算 sortType (10=综合, 20=价格降, 30=价格升, 60=销量降)
      let sortType = 10;
      if (this.currentSort === 'sales') {
        sortType = 60;
      } else if (this.currentSort === 'price') {
        sortType = this.priceSort === 'asc' ? 30 : 20;
      }

      const params = {
        page: this.page,
        limit: this.limit,
        key: this.keyword, // 搜索关键词
        sortType: sortType,
        bigStatus: 10      // 仅搜索上架商品
      };

      GoodsApi.getGoodsListByWhere(params).then(res => {
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
        // 如果当前已经是价格排序，则切换升降序
        if (this.currentSort === 'price') {
          this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSort = 'price';
          this.priceSort = 'desc'; // 默认降序
        }
      } else {
        // 切换到其他排序
        if (this.currentSort === type) return;
        this.currentSort = type;
      }
      this.loadData(true);
    },

    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/good/detail?id=${id}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 20rpx;
}

.search-header {
  background-color: #fff;
  padding: 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sort-bar {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
  
  .sort-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    
    &.active {
      color: #2979ff;
      font-weight: bold;
    }
    
    .icon-box {
      display: flex;
      flex-direction: column;
      margin-left: 6rpx;
    }
  }
}

.goods-list {
  padding: 20rpx;
}

.loading-center {
  padding: 50rpx;
  display: flex;
  justify-content: center;
}

.goods-item {
  display: flex;
  background-color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  
  .image-wrapper {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 20rpx;
  }
  
  .info-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .title {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
    
    .tags {
      margin-top: 10rpx;
      display: flex;
      flex-wrap: wrap;
      
      .tag {
        margin-right: 10rpx;
        margin-bottom: 10rpx;
      }
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      
      .price {
        color: #ff3b30;
        font-weight: bold;
        
        .symbol { font-size: 24rpx; }
        .num { font-size: 32rpx; }
      }
      
      .sales {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>