<template>
  <view class="container">
    <view class="address-section" @click="chooseAddress">
      <view class="addr-content" v-if="address.id">
        <view class="user-row">
          <text class="name">{{ address.name }}</text>
          <text class="mobile">{{ address.mobile }}</text>
        </view>
        <view class="addr-text">
          {{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}
        </view>
      </view>
      <view class="addr-empty" v-else>
        <view class="icon-box">+</view>
        <text>选择收货地址</text>
      </view>
      <u-icon name="arrow-right" color="#ccc"></u-icon>
    </view>

    <view class="goods-section">
      <view class="prescription-header" v-if="isDispensing">
        <view class="tag">处方调剂</view>
        <view class="usage-info">
          用法：共 {{ prescription.days }} 天，每日 {{ prescription.packs }} 包
        </view>
      </view>

      <view class="goods-item" v-for="(item, index) in goodsList" :key="index">
        <image :src="item.imageUrl" mode="aspectFill" class="thumb"></image>
        <view class="content">
          <view class="title u-line-2">{{ item.goodsName }}</view>
          <view class="spec">
             <text v-if="isDispensing">厂家:{{ item.manufacturer }} / 单剂:{{ item.goodsNum }}g</text>
             <text v-else>{{ item.spec }}</text>
          </view>
          <view class="price-row">
            <text class="price">¥{{ item.pricePerGram || item.salePrice }}</text>
            <text class="num" v-if="!isDispensing">x{{ item.goodsNum }}</text>
            <text class="num" v-else>x{{ prescription.days }}天</text>
          </view>
        </view>
      </view>
    </view>

    <view class="cell-group" v-if="isDispensing && doctorAdvice">
        <view class="cell-item">
            <text class="label">医嘱备注</text>
            <text class="value advice-text">{{ doctorAdvice }}</text>
        </view>
    </view>

    <view class="cell-group">
      <view class="cell-item">
        <text class="label">优惠券</text>
        <view class="value red" v-if="settlement.couponAmount > 0">-¥{{ settlement.couponAmount }}</view>
        <view class="value gray" v-else>暂无可用</view>
      </view>
      <view class="cell-item">
        <text class="label">买家留言</text>
        <input class="input" v-model="buyerRemark" placeholder="如有特殊需求请留言" />
      </view>
    </view>

    <view class="cell-group">
      <view class="cell-item small">
        <text class="label">商品总额</text>
        <text class="value">¥{{ settlement.totalAmount }}</text>
      </view>
      <view class="cell-item small">
        <text class="label">运费</text>
        <text class="value">¥{{ settlement.freightAmount }}</text>
      </view>
    </view>

    <view class="footer-bar">
      <view class="total-box">
        <text class="label">实付款：</text>
        <text class="price-symbol">¥</text>
        <text class="price-num">{{ settlement.payAmount || '0.00' }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :loading="submitting">提交订单</button>
    </view>
  </view>
</template>

<script>
// 引用我们刚刚新建的规范API
import { getOrderSettlement, createOrder } from '@/api/order/order.js';

export default {
  data() {
    return {
      options: {},
      isDispensing: false,
      
      // 结算数据
      address: {},
      goodsList: [],
      settlement: {
        totalAmount: 0,
        freightAmount: 0,
        couponAmount: 0,
        payAmount: 0
      },
      prescription: { days: 0, packs: 0 },
      doctorAdvice: '', // 医嘱
      
      // 表单
      buyerRemark: '',
      submitting: false
    };
  },
  onLoad(options) {
    this.options = options;
    // 根据 cart.vue 传来的 type 判断
    this.isDispensing = options.type === 'dispensing';
    
    if (this.isDispensing) {
        this.prescription.days = options.days || 3;
        this.prescription.packs = options.packs || 2;
        if(options.advice) {
            this.doctorAdvice = decodeURIComponent(options.advice);
        }
    }
    
    this.loadSettlement();
  },
  methods: {
    // 1. 加载结算信息
    loadSettlement() {
      const params = {
        cartIds: this.options.cartIds,
        // 关键：将处方参数传给后端算钱
        days: this.prescription.days,
        packs: this.prescription.packs
      };
      
      uni.showLoading({ title: '计算中...' });
      getOrderSettlement(params).then(res => {
        uni.hideLoading();
        if (res.code === 200) {
          const data = res.data;
          this.address = data.address || {};
          this.goodsList = data.goodsList || [];
          this.settlement = data;
        } else {
          uni.showToast({ title: res.message, icon: 'none' });
        }
      }).catch(() => uni.hideLoading());
    },

    // 2. 选择地址
    chooseAddress() {
      // 暂时跳转到地址列表
      uni.navigateTo({
        url: '/pages/address/index?source=order'
      });
    },

    // 3. 提交订单
    submitOrder() {
      if (!this.address.id) {
        return uni.showToast({ title: '请选择收货地址', icon: 'none' });
      }

      this.submitting = true;
      
      const payload = {
        addressId: this.address.id,
        payType: 20, 
        // 备注：如果用户没填留言，自动带入医嘱
        buyerRemark: this.buyerRemark || this.doctorAdvice, 
        cartIds: this.options.cartIds,
        orderType: this.isDispensing ? 2 : 1
      };

      createOrder(payload).then(res => {
        this.submitting = false;
        if (res.code === 200) {
          uni.showToast({ title: '下单成功', icon: 'success' });
          setTimeout(() => {
             // 跳转到订单列表
             uni.redirectTo({ url: '/pages/order/order?status=0' });
          }, 1500);
        } else {
          uni.showToast({ title: res.message, icon: 'none' });
        }
      }).catch(() => {
        this.submitting = false;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.address-section {
  background: #fff;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  
  .user-row {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
    .mobile { margin-left: 20rpx; color: #666; font-weight: normal; font-size: 26rpx; }
  }
  .addr-text { font-size: 26rpx; color: #333; line-height: 1.4; }
  .addr-empty { 
      display: flex; align-items: center; color: #333; font-size: 28rpx;
      .icon-box { width: 40rpx; height: 40rpx; background: #2979ff; color: #fff; text-align: center; line-height: 36rpx; border-radius: 8rpx; margin-right: 12rpx; font-weight: bold;}
  }
}

.goods-section {
  background: #fff;
  margin-bottom: 20rpx;
  
  .prescription-header {
      padding: 20rpx 30rpx; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center;
      .tag { background: #e6f1fc; color: #2979ff; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; margin-right: 16rpx;}
      .usage-info { font-size: 26rpx; color: #333; font-weight: bold; }
  }

  .goods-item {
    display: flex;
    padding: 20rpx 30rpx;
    background: #fff;
    border-bottom: 1px solid #f8f8f8;
    
    .thumb { width: 140rpx; height: 140rpx; border-radius: 8rpx; margin-right: 20rpx; background: #f5f5f5;}
    .content {
      flex: 1; display: flex; flex-direction: column; justify-content: space-between;
      .title { font-size: 28rpx; color: #333; }
      .spec { font-size: 24rpx; color: #999; margin-top: 8rpx; }
      .price-row { 
          display: flex; justify-content: space-between; margin-top: 10rpx;
          .price { color: #ff3b30; font-size: 30rpx; font-weight: bold; }
          .num { color: #999; font-size: 26rpx; }
      }
    }
  }
}

.cell-group {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
  
  .cell-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 26rpx 0;
    border-bottom: 1px solid #f8f8f8;
    font-size: 28rpx;
    
    &:last-child { border-bottom: none; }
    
    .label { color: #333; width: 160rpx;}
    .value { flex: 1; text-align: right; color: #333; }
    .input { flex: 1; text-align: right; font-size: 28rpx; }
    .red { color: #ff3b30; }
    .gray { color: #ccc; }
    .advice-text { color: #666; font-size: 26rpx; line-height: 1.4; text-align: left;} 
    
    &.small { padding: 20rpx 0; font-size: 26rpx; .label{color:#666} }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 99;
  
  .total-box {
    .label { font-size: 28rpx; color: #333; }
    .price-symbol { font-size: 24rpx; color: #ff3b30; font-weight: bold; }
    .price-num { font-size: 40rpx; color: #ff3b30; font-weight: bold; }
  }
  
  .submit-btn {
    margin: 0;
    background: #2979ff;
    color: #fff;
    font-size: 30rpx;
    border-radius: 40rpx;
    padding: 0 60rpx;
    height: 76rpx;
    line-height: 76rpx;
  }
}
</style>