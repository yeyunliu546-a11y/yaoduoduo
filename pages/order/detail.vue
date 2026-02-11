<template>
  <view class="container">
    <block v-if="orderInfo.id">
      <view class="status-header">
        <view class="status-text">{{ orderInfo.orderStatusName }}</view>
        <view class="status-desc" v-if="orderInfo.orderStatus===10">请在30分钟内完成支付</view>
      </view>

      <view class="address-card">
        <view class="user-row">
          <text class="name">{{ orderInfo.receiverName }}</text>
          <text class="phone">{{ orderInfo.receiverPhone }}</text>
        </view>
        <view class="addr-text">{{ orderInfo.receiverAddress }}</view>
      </view>

      <view class="goods-card">
        <view class="prescription-info" v-if="isPrescription">
            <text class="tag">处方</text>
            <text>{{ orderInfo.dosageDesc }}</text>
        </view>
        
        <view class="goods-item" v-for="(item, index) in orderInfo.goodsList" :key="index">
          <image :src="item.imageUrl" mode="aspectFill" class="thumb"></image>
          <view class="content">
            <view class="title u-line-2">{{ item.goodsName }}</view>
            <view class="spec">{{ item.spec }}</view>
            <view class="price-row">
              <text class="price">¥{{ item.salePrice }}</text>
              <text class="num">x{{ item.goodsNum }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="info-card">
        <view class="cell">
          <text class="label">订单编号</text>
          <text class="value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="cell">
          <text class="label">下单时间</text>
          <text class="value">{{ orderInfo.createTime }}</text>
        </view>
        <view class="cell">
          <text class="label">支付方式</text>
          <text class="value">在线支付</text>
        </view>
        <view class="cell" v-if="isPrescription && orderInfo.medicalAdvice">
          <text class="label">医嘱</text>
          <text class="value">{{ orderInfo.medicalAdvice }}</text>
        </view>
      </view>

      <view class="footer-bar" v-if="orderInfo.orderStatus === 10">
        <view class="btn plain">取消订单</view>
        <view class="btn primary" @click="handlePay">立即支付</view>
      </view>
    </block>
    
    <u-loading-page :loading="loading"></u-loading-page>
  </view>
</template>

<script>
import { getOrderDetail, getPrescriptionDetail, payOrder } from '@/api/order/order.js';

export default {
  data() {
    return {
      orderId: '',
      orderType: 1, // 1采购 2处方
      loading: true,
      orderInfo: {}
    };
  },
  computed: {
      isPrescription() { return parseInt(this.orderType) === 2; }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      // 接收列表传来的类型，默认普通订单
      this.orderType = options.type || 1; 
      this.loadDetail();
    } else {
      uni.showToast({ title: '订单参数错误', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  },
  methods: {
    loadDetail() {
      this.loading = true;
      
      // 分流调用 API
      const api = this.isPrescription ? getPrescriptionDetail(this.orderId) : getOrderDetail(this.orderId);
      
      api.then(res => {
        this.loading = false;
        if (res.code === 200) {
          const data = res.result || res.data;
          
          if(this.isPrescription) {
              this.handlePrescriptionData(data);
          } else {
              this.handleProcurementData(data);
          }
        } else {
            uni.showToast({ title: res.message || '获取详情失败', icon: 'none' });
        }
      }).catch(err => {
        this.loading = false;
        console.error(err);
      });
    },
    
    // 处理处方详情数据
    handlePrescriptionData(data) {
        const rawGoods = data.listSku || [];
        this.orderInfo = {
            id: data.id,
            orderNo: data.orderNo,
            orderStatus: data.orderStatus,
            orderStatusName: data.orderStatusName,
            createTime: data.createTime,
            // 处方特有
            dosageDesc: data.dosageDesc || `共服${data.dosageDays}天`,
            medicalAdvice: data.medicalAdvice,
            
            receiverName: data.address?.name || '',
            receiverPhone: data.address?.phone || '',
            receiverAddress: data.address?.fullAddress || '',
            
            goodsList: rawGoods.map(g => ({
               goodsName: g.goodsName,
               spec: `单剂:${g.goodsWeight}g`,
               imageUrl: g.urlImg || '/static/default-goods.png',
               salePrice: g.unitPrice,
               goodsNum: 1 // 处方单品数量显示逻辑通常不同，这里暂显示1
            }))
        };
    },
    
    // 处理采购详情数据
    handleProcurementData(data) {
        const rawGoods = data.orderSkus || data.listGoods || [];
        this.orderInfo = {
            id: data.id || data.Id,
            orderNo: data.orderNo || data.OrderNo,
            orderStatus: data.orderStatus || data.OrderStatus,
            orderStatusName: this.getStatusName(data.orderStatus || data.OrderStatus),
            createTime: data.createTime || data.CreateTime,
            
            receiverName: data.receiverName || data.ReceiverName || data.name || '',
            receiverPhone: data.receiverPhone || data.ReceiverPhone || data.phone || '',
            receiverAddress: data.receiverAddress || data.ReceiverAddress || data.address || '',
            
            goodsList: rawGoods.map(g => ({
               goodsName: g.goodsName || g.GoodsName,
               spec: g.skuName || g.SkuName || '默认规格',
               imageUrl: g.imageUrl || g.skuUrlImage || g.urlImg || '/static/default-goods.png',
               salePrice: g.salePrice || g.SalePrice || 0,
               goodsNum: g.quantity || g.GoodsNum || 1
            }))
        };
    },
    
    getStatusName(status) {
        const map = { 10: '待付款', 30: '待发货', 40: '待收货', 80: '已完成', '-1': '已取消' };
        return map[status] || '未知状态';
    },
    
    handlePay() {
        uni.showLoading({ title: '支付中...' });
        payOrder({ orderId: this.orderId }).then(res => {
            uni.hideLoading();
            if(res.code === 200) {
                uni.showToast({ title: '支付成功', icon: 'success' });
                this.loadDetail(); 
            }
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.container { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 120rpx; }
.status-header { background: #2979ff; color: #fff; padding: 40rpx 30rpx; 
  .status-text { font-size: 36rpx; font-weight: bold; margin-bottom: 10rpx; }
  .status-desc { font-size: 26rpx; opacity: 0.8; }
}
.address-card, .goods-card, .info-card { background: #fff; margin: 20rpx; padding: 30rpx; border-radius: 16rpx; }
.user-row { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; 
  .phone { margin-left: 20rpx; font-weight: normal; color: #666; font-size: 26rpx; }
}
.addr-text { color: #666; font-size: 26rpx; line-height: 1.4; }

.prescription-info {
    padding-bottom: 20rpx; margin-bottom: 20rpx; border-bottom: 1px solid #f8f8f8;
    .tag { background: #e6f1fc; color: #2979ff; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; margin-right: 16rpx;}
    font-size: 26rpx; color: #333; font-weight: bold;
}

.goods-item { display: flex; margin-bottom: 30rpx; 
  &:last-child { margin-bottom: 0; }
  .thumb { width: 160rpx; height: 160rpx; border-radius: 12rpx; margin-right: 20rpx; background: #f9f9f9; }
  .content { flex: 1; display: flex; flex-direction: column; justify-content: space-between;
    .title { font-size: 28rpx; color: #333; }
    .spec { font-size: 24rpx; color: #999; }
    .price-row { display: flex; justify-content: space-between; 
      .price { color: #333; font-weight: bold; font-size: 30rpx; }
      .num { color: #999; font-size: 26rpx; }
    }
  }
}

.cell { display: flex; justify-content: space-between; margin-bottom: 20rpx; font-size: 26rpx;
  &:last-child { margin-bottom: 0; }
  .label { color: #999; }
  .value { color: #333; max-width: 70%; text-align: right;}
}

.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; height: 100rpx; display: flex; align-items: center; justify-content: flex-end; padding: 0 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  .btn { width: 180rpx; height: 72rpx; line-height: 72rpx; text-align: center; border-radius: 36rpx; font-size: 28rpx; margin-left: 20rpx;
    &.plain { border: 1px solid #ccc; color: #666; }
    &.primary { background: #2979ff; color: #fff; }
  }
}
</style>