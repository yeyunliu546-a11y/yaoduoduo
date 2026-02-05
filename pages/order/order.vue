<template>
  <view class="container">
    <view class="tabs-box">
      <u-tabs :list="statusList" :is-scroll="false" :current="currentStatus" @change="changeStatus" active-color="#2979ff"></u-tabs>
    </view>

    <view class="order-list">
      <view class="order-item" v-for="(item, index) in orderList" :key="item.id" @click="goDetail(item.id)">
        <view class="header">
          <view class="order-no">
             <text class="tag" v-if="item.orderType === 2">处方</text>
             订单号：{{ item.orderNo }}
          </view>
          <text class="status">{{ item.orderStatusName }}</text>
        </view>
        
        <view class="goods-box" v-for="(goods, idx) in item.goodsList" :key="idx">
          <image :src="goods.imageUrl" mode="aspectFill" class="thumb"></image>
          <view class="content">
            <view class="title u-line-1">{{ goods.goodsName }}</view>
            <view class="spec">{{ goods.spec }}</view>
          </view>
          <view class="right">
            <view class="price">¥{{ goods.pricePerGram || goods.salePrice }}</view>
            <view class="num">x{{ goods.goodsNum }}</view>
          </view>
        </view>
        
        <view class="total-row">
          <text>共{{ item.goodsList.length }}件商品 实付：</text>
          <text class="price">¥{{ item.payPrice }}</text>
        </view>
        
        <view class="action-box" v-if="item.orderStatus === 10">
          <view class="btn plain" @click.stop="cancelOrder(item)">取消订单</view>
          <view class="btn primary" @click.stop="handlePay(item)">立即支付</view>
        </view>
      </view>
      
      <u-empty v-if="!isLoading && orderList.length === 0" mode="order" margin-top="100"></u-empty>
      <u-loadmore v-if="orderList.length > 0" :status="loadStatus" margin-top="30" margin-bottom="30"></u-loadmore>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '@/api/order/order.js';
// 引入 request 手动调用支付接口 (或者你可以封装到 api/order/order.js)
import request from '@/utils/request/request.js';

export default {
  data() {
    return {
      statusList: [{ name: '全部' }, { name: '待付款' }, { name: '待发货' }, { name: '待收货' }, { name: '已完成' }],
      currentStatus: 0,
      orderList: [], 
      page: 1,
      isLoading: false,
      loadStatus: 'loadmore'
    };
  },
  onLoad(option) {
      if(option.status) {
          this.currentStatus = parseInt(option.status);
      }
  },
  onShow() {
    this.refreshList();
  },
  onPullDownRefresh() {
    this.refreshList();
  },
  onReachBottom() {
    if (this.loadStatus === 'nomore') return;
    this.page++;
    this.loadData();
  },
  methods: {
    changeStatus(index) {
      this.currentStatus = index;
      this.refreshList();
    },
    refreshList() {
      this.page = 1;
      this.orderList = [];
      this.loadStatus = 'loading';
      this.loadData();
    },
    loadData() {
      this.isLoading = true;
      const statusMap = [0, 10, 30, 40, 80];
      const params = {
        page: this.page,
        limit: 10,
        orderStatus: statusMap[this.currentStatus] || 0
      };

      getOrderList(params).then(res => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
        if (res.code === 200) {
          const list = res.result || res.data?.list || [];
          this.orderList = [...this.orderList, ...list];
          this.loadStatus = list.length < 10 ? 'nomore' : 'loadmore';
        }
      }).catch(() => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      });
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/order/detail?id=${id}` });
    },
    
    // [核心] 模拟支付逻辑
    handlePay(item) {
        uni.showLoading({ title: '支付中...' });
        
        // 模拟调用 Mock 支付接口
        request({
            url: '/api/Order/Pay',
            method: 'POST',
            data: { orderId: item.id }
        }).then(res => {
            uni.hideLoading();
            if(res.code === 200) {
                uni.showToast({ title: '支付成功', icon: 'success' });
                // 支付成功后，刷新列表 (订单会从待付款变成待发货)
                setTimeout(() => {
                    this.refreshList();
                }, 1000);
            } else {
                uni.showToast({ title: res.message || '支付失败', icon: 'none' });
            }
        });
    },
    
    cancelOrder(item) {
        uni.showToast({ title: '取消功能暂未开发', icon: 'none' });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式保持不变，复用即可 */
.container { background-color: #f5f5f5; min-height: 100vh; }
.tabs-box { background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #f5f5f5; }
.order-list { padding: 20rpx; }
.order-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; 
  .header { display: flex; justify-content: space-between; margin-bottom: 20rpx; font-size: 26rpx;
    .order-no { color: #666; display: flex; align-items: center; 
       .tag { background: #e6f1fc; color: #2979ff; font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 10rpx;}
    }
    .status { color: #2979ff; font-weight: bold; }
  }
  .goods-box { display: flex; margin-bottom: 20rpx;
    .thumb { width: 140rpx; height: 140rpx; border-radius: 8rpx; background: #f9f9f9; margin-right: 20rpx;}
    .content { flex: 1; 
      .title { font-size: 28rpx; color: #333; margin-bottom: 10rpx;}
      .spec { font-size: 24rpx; color: #999; }
    }
    .right { text-align: right; 
      .price { font-size: 28rpx; color: #333; font-weight: bold; }
      .num { font-size: 24rpx; color: #999; margin-top: 6rpx;}
    }
  }
  .total-row { text-align: right; border-top: 1px solid #f9f9f9; padding-top: 20rpx; font-size: 26rpx; color: #333;
    .price { font-size: 32rpx; color: #333; font-weight: bold; margin-left: 10rpx;}
  }
  .action-box { display: flex; justify-content: flex-end; margin-top: 20rpx;
    .btn { width: 160rpx; height: 60rpx; line-height: 60rpx; text-align: center; border-radius: 30rpx; font-size: 26rpx; margin-left: 20rpx;
      &.plain { border: 1px solid #ccc; color: #666; }
      &.primary { background: #2979ff; color: #fff; border: 1px solid #2979ff; }
    }
  }
}
</style>