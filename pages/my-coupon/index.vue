<template>
  <view class="container">
    <view class="tabs-box">
      <u-tabs :list="tabList" :is-scroll="false" :current="currentTab" @change="changeTab" active-color="#2979ff"></u-tabs>
    </view>
    
    <view class="coupon-list">
      <view class="coupon-item" :class="{'gray': item.status !== 10}" v-for="(item, index) in list" :key="item.id || index">
        <view class="left-box" :class="{ 'discount-bg': item.type === 20 }">
          <view class="price-row">
            <template v-if="item.type === 10">
              <text class="symbol">¥</text>
              <text class="num">{{ item.money }}</text>
            </template>
            <template v-else>
              <text class="num">{{ item.discount }}</text>
              <text class="symbol">折</text>
            </template>
          </view>
          <view class="condition">
            {{ item.minPoint > 0 ? `满${item.minPoint}元可用` : '无门槛' }}
          </view>
        </view>
        
        <view class="right-box">
          <view class="info">
            <view class="title-row">
              <view class="tag" v-if="item.applyGoodsType === 1">采购</view>
              <view class="tag purple" v-else-if="item.applyGoodsType === 2">调剂</view>
              <view class="tag blue" v-else>通用</view>
              <text class="title u-line-1">{{ item.name }}</text>
            </view>
            <view class="desc u-line-1" v-if="item.remarks">{{ item.remarks }}</view>
            <view class="date">有效期至：{{ formatDate(item.endTime) }}</view>
          </view>
          
          <view class="status-icon" v-if="item.status === -20">
            <u-icon name="checkbox-mark" color="#ccc" size="40"></u-icon>
            <text>已使用</text>
          </view>
          <view class="status-icon" v-if="item.status === -10">
            <text>已过期</text>
          </view>
          
          <view class="btn-box" v-if="item.status === 10">
            <u-button size="mini" shape="circle" type="primary" @click="goHome">去使用</u-button>
          </view>
        </view>
      </view>
      
      <u-empty v-if="!isLoading && list.length === 0" mode="coupon" margin-top="100"></u-empty>
      <u-loadmore v-if="list.length > 0" :status="loadStatus" margin-top="30" margin-bottom="30"></u-loadmore>
    </view>
  </view>
</template>

<script>
import { getMyCouponList } from '@/api/user/coupon.js';

export default {
  data() {
    return {
      tabList: [
        { name: '未使用', value: 10 },
        { name: '已使用', value: -20 },
        { name: '已过期', value: -10 }
      ],
      currentTab: 0,
      list: [],
      page: 1,
      limit: 10,
      isLoading: true,
      loadStatus: 'loadmore'
    };
  },
  onLoad() {
    this.loadData();
  },
  onPullDownRefresh() {
    this.refresh();
  },
  onReachBottom() {
    if (this.loadStatus === 'nomore' || this.loadStatus === 'loading') return;
    this.page++;
    this.loadData();
  },
  methods: {
    formatDate(val) {
        if (!val) return '';
        // 【兼容性修复】
        const safeVal = typeof val === 'string' ? val.replace(/-/g, '/') : val;
        const date = new Date(safeVal);
        if (isNaN(date.getTime())) return val; 
        
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}.${m}.${d}`;
    },

    changeTab(index) {
      this.currentTab = index;
      this.refresh();
    },
    refresh() {
      this.page = 1;
      this.list = [];
      this.loadStatus = 'loading';
      this.loadData();
    },

    normalizeData(item) {
        return {
            id: item.Id || item.id,
            name: item.Name || item.name,
            type: item.CouponType || item.couponType || 10,
            
            // 【关键修复】
            money: Number(item.reducePrice || item.ReducePrice || item.Money || item.money || 0),
            discount: Number(item.discountRate || item.DiscountRate || item.Discount || item.discount || 0),
            minPoint: Number(item.minPrice || item.MinPrice || item.MinPoint || item.minPoint || 0),
            
            applyGoodsType: item.ApplyGoodsType || item.applyGoodsType || 0,
            remarks: item.describe || item.Describe || item.Remarks || item.remarks || '',
            status: item.Status || item.status, 
            endTime: item.EndTime || item.endTime
        };
    },

    loadData() {
      const status = this.tabList[this.currentTab].value;
      this.loadStatus = 'loading';
      
      getMyCouponList({ page: this.page, limit: this.limit, status }).then(res => {
        uni.stopPullDownRefresh();
        this.isLoading = false;
        
        if (res.code === 200) {
          let rawList = [];
          if (Array.isArray(res.result)) {
              rawList = res.result;
          } else if (res.result && Array.isArray(res.result.list)) {
              rawList = res.result.list;
          } else if (res.data && Array.isArray(res.data.list)) {
              rawList = res.data.list;
          }
          
          const cleanList = rawList.map(item => this.normalizeData(item));
          
          if (this.page === 1) {
              this.list = cleanList;
          } else {
              const newItems = cleanList.filter(n => !this.list.some(o => o.id === n.id));
              this.list = [...this.list, ...newItems];
          }
          
          if (cleanList.length < this.limit) {
              this.loadStatus = 'nomore';
          } else {
              this.loadStatus = 'loadmore';
          }
        } else {
            this.loadStatus = 'nomore';
        }
      }).catch(() => {
        this.isLoading = false;
        this.loadStatus = 'nomore';
        uni.stopPullDownRefresh();
      });
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
};
</script>

<style lang="scss" scoped>
.container { background-color: #f5f5f5; min-height: 100vh; }
.tabs-box { background: #fff; position: sticky; top: 0; z-index: 10; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02); }
.coupon-list { padding: 20rpx; padding-bottom: 40rpx;}
.coupon-item {
  display: flex; background: #fff; border-radius: 12rpx; overflow: hidden; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  &.gray {
    .left-box { background: #ccc; &.discount-bg { background: #ccc; } }
    .right-box .info .title { color: #999; }
    .right-box .info .tag { background: #f5f5f5; color: #999; border: 1px solid #eee; }
  }
  .left-box {
    width: 200rpx; background: linear-gradient(135deg, #2979ff 0%, #609df8 100%);
    color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center;
    position: relative;
    &.discount-bg { background: linear-gradient(135deg, #ff9f43 0%, #feca57 100%); }
    .price-row {
      margin-bottom: 10rpx;
      .symbol { font-size: 24rpx; margin-right: 4rpx; }
      .num { font-size: 56rpx; font-weight: bold; }
    }
    .condition { font-size: 22rpx; opacity: 0.9; }
    &::after {
      content: ''; position: absolute; right: -8rpx; top: 0; bottom: 0; width: 16rpx;
      background: radial-gradient(circle, #fff 8rpx, transparent 0) 0 0/16rpx 16rpx;
    }
  }
  .right-box {
    flex: 1; padding: 20rpx 24rpx; display: flex; align-items: center; justify-content: space-between;
    .info {
      flex: 1; margin-right: 20rpx;
      .title-row {
        display: flex; align-items: center; margin-bottom: 12rpx;
        .tag { 
          font-size: 20rpx; background: #e6f1fc; color: #2979ff; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 10rpx; flex-shrink: 0;
          &.purple { background: #f9f0ff; color: #722ed1; }
          &.blue { background: #e6f7ff; color: #1890ff; }
        }
        .title { font-size: 30rpx; font-weight: bold; color: #333; }
      }
      .desc { font-size: 24rpx; color: #999; margin-bottom: 12rpx; }
      .date { font-size: 22rpx; color: #ccc; }
    }
    .status-icon {
      color: #ccc; font-size: 24rpx; text-align: center;
    }
  }
}
</style>