<template>
  <view class="container">
    <view class="tabs-box">
      <u-tabs :list="statusList" :is-scroll="false" :current="currentStatus" @change="changeStatus" active-color="#2979ff"></u-tabs>
    </view>

    <view class="order-list">
      <view class="order-item" v-for="(item, index) in orderList" :key="item.id" @click="goDetail(item)">
        <view class="header">
          <view class="order-no">
             <text class="tag prescription" v-if="item.orderType === 2">处方</text>
             <text class="tag purchase" v-else>采购</text>
             <text class="no">单号：{{ item.orderNo }}</text>
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
            <view class="price" v-if="goods.salePrice">¥{{ goods.salePrice }}</view>
            <view class="num">x{{ goods.goodsNum }}</view>
          </view>
        </view>
        
        <view class="total-row">
          <text>共{{ item.totalNum }}件商品 实付：</text>
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
import { getOrderList, payOrder } from '@/api/order/order.js';
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
          const val = parseInt(option.status);
          const statusMap = [0, 10, 30, 40, 80];
          const indexByValue = statusMap.indexOf(val);
          this.currentStatus = indexByValue !== -1 ? indexByValue : 0;
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
        orderType: 0 
      };

      if (this.currentStatus !== 0) {
          params.orderStatus = statusMap[this.currentStatus];
      }

      getOrderList(params).then(res => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
        
        if (res.code === 200) {
          const rawList = res.result || res.data?.list || res.data || [];
          
          const list = rawList.map(order => {
              // 1. 尝试获取真实的商品列表
              let rawGoods = order.listSku || order.OrderSkus || order.goodsList || order.ListGoods || order.list || [];
              
              // 2. 【核心修复】如果没拿到列表，但有 firstImage (说明是聚合简化接口)
              // 手动构造一个"虚拟商品"用于展示
              if (rawGoods.length === 0 && order.firstImage) {
                  rawGoods = [{
                      isVirtual: true, // 标记
                      imageUrl: order.firstImage,
                      // 使用 dosageDesc (服用说明) 或 orderTypeName (订单类型) 作为商品名替代
                      goodsName: order.dosageDesc || order.orderTypeName || '商品详情见订单',
                      spec: order.createTime, // 显示创建时间或其他信息
                      quantity: order.itemCount || 1,
                      salePrice: '' // 列表页不显示单价，只看总价
                  }];
              }

              return {
                  id: order.id || order.Id,
                  orderNo: order.orderNo || order.OrderNo,
                  orderType: order.orderType || 1,
                  orderStatus: order.orderStatus || order.OrderStatus,
                  orderStatusName: order.orderStatusName || this.getStatusName(order.orderStatus),
                  payPrice: order.payPrice || order.PayPrice || 0,
                  totalNum: order.itemCount || rawGoods.length, // 优先用接口返回的总数
                  
                  // 商品映射
                  goodsList: rawGoods.map(g => {
                      const entity = g.sku || g;
                      return {
                          goodsName: g.isVirtual ? g.goodsName : (entity.goodsName || entity.GoodsName || '未知商品'),
                          spec: g.isVirtual ? g.spec : (entity.spec || entity.skuName || '默认规格'),
                          imageUrl: entity.imageUrl || entity.urlImg || entity.GoodsImage || entity.skuUrlImage || '/static/default-goods.png',
                          pricePerGram: entity.pricePerGram,
                          salePrice: g.isVirtual ? '' : (entity.unitPrice || entity.salePrice || 0),
                          goodsNum: g.goodsNum || g.quantity || 1
                      };
                  })
              };
          });

          this.orderList = [...this.orderList, ...list];
          this.loadStatus = list.length < 10 ? 'nomore' : 'loadmore';
        }
      }).catch(() => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      });
    },
    
    getStatusName(status) {
        const map = { 10: '待付款', 30: '待发货', 40: '待收货', 80: '已完成', '-1': '已取消' };
        return map[status] || '未知状态';
    },

    goDetail(item) {
      uni.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=${item.orderType}` });
    },
    
    handlePay(item) {
        uni.showLoading({ title: '支付中...' });
        payOrder({ orderId: item.id }).then(res => {
            uni.hideLoading();
            if(res.code === 200) {
                uni.showToast({ title: '支付成功', icon: 'success' });
                setTimeout(() => {
                    this.refreshList();
                }, 1000);
            } else {
                uni.showToast({ title: res.message || '支付失败', icon: 'none' });
            }
        });
    },
    
    cancelOrder(item) {
        uni.showToast({ title: '暂不支持取消', icon: 'none' });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 保持原有样式 */
.container { background-color: #f5f5f5; min-height: 100vh; }
.tabs-box { background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #f5f5f5; }
.order-list { padding: 20rpx; }
.order-item { 
  background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; 
  .header { 
    display: flex; justify-content: space-between; margin-bottom: 20rpx; font-size: 26rpx;
    .order-no { 
      color: #666; display: flex; align-items: center; 
      .tag { font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 12rpx;}
      .prescription { background: #e6f1fc; color: #2979ff; border: 1px solid #a3d0fd; }
      .purchase { background: #fff7e6; color: #ff9900; border: 1px solid #ffe58f; }
      .no { font-weight: 500; color: #333; }
    }
    .status { color: #2979ff; font-weight: bold; }
  }
  .goods-box { 
    display: flex; margin-bottom: 20rpx;
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
  .total-row { 
    text-align: right; border-top: 1px solid #f9f9f9; padding-top: 20rpx; font-size: 26rpx; color: #333;
    .price { font-size: 32rpx; color: #333; font-weight: bold; margin-left: 10rpx;}
  }
  .action-box { 
    display: flex; justify-content: flex-end; margin-top: 20rpx;
    .btn { 
      width: 160rpx; height: 60rpx; line-height: 60rpx; text-align: center; border-radius: 30rpx; font-size: 26rpx; margin-left: 20rpx;
      &.plain { border: 1px solid #ccc; color: #666; }
      &.primary { background: #2979ff; color: #fff; border: 1px solid #2979ff; }
    }
  }
}
</style>