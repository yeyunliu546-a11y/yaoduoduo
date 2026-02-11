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
        <image :src="item.imageUrl || item.urlImg" mode="aspectFill" class="thumb"></image>
        <view class="content">
          <view class="title u-line-2">{{ item.goodsName }}</view>
          <view class="spec">
             <text v-if="isDispensing">厂家:{{ item.manufacturer }} / 单剂:{{ item.goodsNum }}g</text>
             <text v-else>{{ item.spec || item.skuName }}</text>
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
        <text class="value">¥{{ settlement.totalAmount || '0.00' }}</text>
      </view>
      <view class="cell-item small">
        <text class="label">运费</text>
        <text class="value">¥{{ settlement.freightAmount || '0.00' }}</text>
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
// 引入修改后的 API 文件
import { getOrderSettlement, createOrder } from '@/api/order/order.js';

export default {
  data() {
    return {
      options: {},
      isDispensing: false,
      address: {},
      goodsList: [],
      settlement: { totalAmount: 0, freightAmount: 0, couponAmount: 0, payAmount: 0 },
      prescription: { days: 0, packs: 0 },
      doctorAdvice: '',
      buyerRemark: '',
      submitting: false,
      parsedCartIds: [] // 存储解析后的 ID 数组
    };
  },
  onLoad(options) {
    this.options = options;
    this.isDispensing = options.type === 'dispensing';
    
    // 【关键修复 1】解析 cartIds 参数
    // 上一页传递的是 JSON 字符串 (如 "%5B%22id1%22%2C%22id2%22%5D")
    // 这里需要解码并转回数组
    try {
        if (options.cartIds) {
            const decoded = decodeURIComponent(options.cartIds);
            // 判断是否已经是数组（防止有的页面直接传了数组对象）
            if (Array.isArray(decoded)) {
                this.parsedCartIds = decoded;
            } else if (decoded.startsWith('[')) {
                this.parsedCartIds = JSON.parse(decoded);
            } else {
                // 兼容旧逻辑：如果是逗号分隔字符串
                this.parsedCartIds = decoded.split(',');
            }
        }
    } catch (e) {
        console.error('cartIds 解析失败', e);
        uni.showToast({ title: '参数错误', icon: 'none' });
    }

    if (this.isDispensing) {
        this.prescription.days = options.days || 3;
        this.prescription.packs = options.packs || 2;
        if(options.advice) this.doctorAdvice = decodeURIComponent(options.advice);
    }
    
    this.loadSettlement();
  },
  onShow() {
      const selectedAddr = uni.getStorageSync('selectedAddress');
      if (selectedAddr) {
          this.address = selectedAddr;
          uni.removeStorageSync('selectedAddress');
      }
  },
  methods: {
    loadSettlement() {
      // 【关键修复 2】构造参数时使用解析后的数组
      const params = {
        cartIds: this.parsedCartIds, // 传递 Array<String>
        days: Number(this.prescription.days),
        packs: Number(this.prescription.packs)
      };
      
      // 打印日志方便调试
      console.log('结算请求参数:', params);
      
      uni.showLoading({ title: '计算中...' });
      
      getOrderSettlement(params).then(res => {
        uni.hideLoading();
        if (res.code === 200) {
          const data = res.result || res.data; // 兼容不同后端返回结构
          if (!data) return;

          // 地址回显逻辑
          if (!this.address.id && data.address) {
              this.address = data.address;
          }
          this.goodsList = data.goodsList || data.list || [];
          this.settlement = data;
        } else {
            uni.showToast({ title: res.message || '结算失败', icon: 'none' });
        }
      }).catch(err => {
          uni.hideLoading();
          console.error(err);
      });
    },

    chooseAddress() {
      uni.navigateTo({ url: '/pages/address/index?source=order' });
    },

    submitOrder() {
      if (!this.address.id) return uni.showToast({ title: '请选择收货地址', icon: 'none' });

      this.submitting = true;
      
      const payload = {
        addressId: this.address.id,
        payType: 20, 
        buyerRemark: this.buyerRemark || this.doctorAdvice, 
        // 同样使用解析后的数组
        cartIds: this.parsedCartIds,
        orderType: this.isDispensing ? 2 : 1
      };

      createOrder(payload).then(res => {
        this.submitting = false;
        if (res.code === 200) {
          uni.showToast({ title: '下单成功', icon: 'success' });
          setTimeout(() => {
             uni.redirectTo({ url: '/pages/order/order?status=0' });
          }, 1500);
        } else {
          uni.showToast({ title: res.message || '下单失败', icon: 'none' });
        }
      }).catch(() => { this.submitting = false; });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
.container { padding-bottom: 120rpx; background-color: #f5f5f5; min-height: 100vh; }
.address-section { background: #fff; padding: 30rpx; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; .user-row { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; .mobile { margin-left: 20rpx; color: #666; font-weight: normal; font-size: 26rpx; } } .addr-text { font-size: 26rpx; color: #333; line-height: 1.4; } .addr-empty { display: flex; align-items: center; color: #333; font-size: 28rpx; .icon-box { width: 40rpx; height: 40rpx; background: #2979ff; color: #fff; text-align: center; line-height: 36rpx; border-radius: 8rpx; margin-right: 12rpx; font-weight: bold;} } }
.goods-section { background: #fff; margin-bottom: 20rpx; .prescription-header { padding: 20rpx 30rpx; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center; .tag { background: #e6f1fc; color: #2979ff; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; margin-right: 16rpx;} .usage-info { font-size: 26rpx; color: #333; font-weight: bold; } } .goods-item { display: flex; padding: 20rpx 30rpx; background: #fff; border-bottom: 1px solid #f8f8f8; .thumb { width: 140rpx; height: 140rpx; border-radius: 8rpx; margin-right: 20rpx; background: #f5f5f5;} .content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; .title { font-size: 28rpx; color: #333; } .spec { font-size: 24rpx; color: #999; margin-top: 8rpx; } .price-row { display: flex; justify-content: space-between; margin-top: 10rpx; .price { color: #ff3b30; font-size: 30rpx; font-weight: bold; } .num { color: #999; font-size: 26rpx; } } } } }
.cell-group { background: #fff; margin-bottom: 20rpx; padding: 0 30rpx; .cell-item { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0; border-bottom: 1px solid #f8f8f8; font-size: 28rpx; &:last-child { border-bottom: none; } .label { color: #333; width: 160rpx;} .value { flex: 1; text-align: right; color: #333; } .input { flex: 1; text-align: right; font-size: 28rpx; } .red { color: #ff3b30; } .gray { color: #ccc; } .advice-text { color: #666; font-size: 26rpx; line-height: 1.4; text-align: left;} &.small { padding: 20rpx 0; font-size: 26rpx; .label{color:#666} } } }
.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); z-index: 99; .total-box { .label { font-size: 28rpx; color: #333; } .price-symbol { font-size: 24rpx; color: #ff3b30; font-weight: bold; } .price-num { font-size: 40rpx; color: #ff3b30; font-weight: bold; } } .submit-btn { margin: 0; background: #2979ff; color: #fff; font-size: 30rpx; border-radius: 40rpx; padding: 0 60rpx; height: 76rpx; line-height: 76rpx; } }
</style>