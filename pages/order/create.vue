<template>
  <view class="container">
    <view class="address-section" @click="chooseAddress">
      <view class="addr-content" v-if="address.id">
        <view class="user-row">
          <text class="name">{{ address.name }}</text>
          <text class="mobile">{{ address.phone || address.mobile }}</text>
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
             <text v-if="isDispensing">厂家:{{ item.manufacturer }} / 单剂:{{ item.weight }}g</text>
             <text v-else>{{ item.spec }}</text>
          </view>
          <view class="price-row">
            <text class="price">¥{{ item.price }}</text>
            <text class="num" v-if="!isDispensing">x{{ item.num }}</text>
            <text class="num" v-else>x{{ prescription.days }}天</text>
          </view>
        </view>
      </view>
      
      <view v-if="goodsList.length === 0" style="padding: 30px 0; text-align: center; color: #999; font-size: 24rpx;">
        <view>暂无商品数据</view>
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
        <text class="price-num">{{ settlement.payAmount }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :loading="submitting">提交订单</button>
    </view>
  </view>
</template>

<script>
import { getOrderSettlement, getPrescriptionSettlement, createOrder, createPrescriptionOrder } from '@/api/order/order.js';

export default {
  data() {
    return {
      options: {},
      isDispensing: false,
      address: {},
      goodsList: [],
      settlement: { totalAmount: '0.00', freightAmount: '0.00', couponAmount: '0.00', payAmount: '0.00' },
      prescription: { days: 0, packs: 0 },
      doctorAdvice: '',
      buyerRemark: '',
      submitting: false,
      parsedCartIds: [] 
    };
  },
  onLoad(options) {
    this.options = options;
    this.isDispensing = options.type === 'dispensing';
    
    try {
        if (options.cartIds) {
            let raw = decodeURIComponent(options.cartIds);
            if (raw.startsWith('[') && raw.endsWith(']')) {
                this.parsedCartIds = JSON.parse(raw);
            } else {
                this.parsedCartIds = raw.split(',');
            }
        }
    } catch (e) {
        console.error('解析 cartIds 失败:', e);
        this.parsedCartIds = [];
    }
    if (!Array.isArray(this.parsedCartIds)) {
        this.parsedCartIds = [];
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
    getIdsString() {
        const rawList = JSON.parse(JSON.stringify(this.parsedCartIds));
        return rawList.join(',');
    },

    loadSettlement() {
      uni.showLoading({ title: '准备中...' });
      const idsStr = this.getIdsString();

      if (this.isDispensing) {
          const params = {
              cartIds: idsStr, 
              dosageDays: Number(this.prescription.days), 
              dailyPackages: Number(this.prescription.packs),
              addressId: this.address.id || ''
          };
          
          getPrescriptionSettlement(params).then(res => {
              uni.hideLoading();
              if(res.code === 200 || res.Code === 200) {
                  this.handlePrescriptionData(res.result || res.data || res.Result);
              } else {
                  uni.showToast({ title: res.message || res.Message || '结算失败', icon: 'none' });
              }
          }).catch(() => uni.hideLoading());
          return;
      }

      const params = { StrCartIds: idsStr };
      getOrderSettlement(params).then(res => {
        uni.hideLoading();
        if (res.code === 200 || res.Code === 200) {
          this.handleProcurementData(res.result || res.data || res.Result);
        } else {
            uni.showToast({ title: res.message || res.Message || '结算失败', icon: 'none' });
        }
      }).catch(() => uni.hideLoading());
    },

    handlePrescriptionData(data) {
        if(!data) return;
        const list = data.listGoods || data.list || data.goodsList || [];
        
        this.goodsList = list.map(item => ({
            goodsName: item.goodsName || item.GoodsName,
            imageUrl: item.urlImg || item.goodsImage || '/static/default-goods.png',
            manufacturer: item.manufacturer || '配方颗粒',
            weight: item.goodsWeight || 0,
            price: item.unitPrice || 0,
            num: 1
        }));

        const priceInfo = data.priceInfo || {};
        this.settlement = {
            totalAmount: priceInfo.totalGoodsPrice || data.totalAmount || 0,
            payAmount: priceInfo.payPrice || data.payPrice || 0,
            freightAmount: priceInfo.freightPrice || data.freightPrice || 0,
            couponAmount: 0
        };

        if (!this.address.id && data.address) this.address = data.address;
    },

    handleProcurementData(data) {
        if(!data) return;

        const rawList = data.listGoods || [];
        this.goodsList = rawList.map(item => {
            const sku = item.sku || {};
            return {
                goodsName: sku.goodsName || '未知商品',
                imageUrl: sku.skuUrlImage || sku.urlImg || '/static/default-goods.png',
                spec: sku.skuName || '默认规格',
                price: sku.salePrice || 0,
                num: item.quantity || 1
            };
        });

        const orderInfo = data.order || {};
        this.settlement = {
            totalAmount: orderInfo.orderTotalPrice || 0,
            payAmount: orderInfo.orderPayPrice || 0,
            freightAmount: orderInfo.freightMoney || 0,
            couponAmount: orderInfo.couponMoney || 0
        };

        if (!this.address.id && data.address) this.address = data.address;
    },

    chooseAddress() {
      uni.navigateTo({ url: '/pages/address/index?source=order' });
    },

    submitOrder() {
      if (!this.address.id) return uni.showToast({ title: '请选择收货地址', icon: 'none' });

      this.submitting = true;
      const idsStr = this.getIdsString();

      let promise;
      
      if (this.isDispensing) {
          const payload = {
              cartIds: idsStr,
              addressId: this.address.id,
              dosageDays: Number(this.prescription.days),
              dailyPackages: Number(this.prescription.packs),
              medicalAdvice: this.doctorAdvice,
              buyerRemark: this.buyerRemark,
              payType: 20, // 微信支付
              appKey: 'MP-WEIXIN'
          };
          promise = createPrescriptionOrder(payload);
      } else {
          const payload = {
              addressId: this.address.id,
              buyerRemark: this.buyerRemark, 
              cartIds: idsStr, 
              StrCartIds: idsStr,
              orderType: 1,
              payType: 20, // 微信支付
              appKey: 'MP-WEIXIN'
          };
          promise = createOrder(payload);
      }

      promise.then(res => {
        this.submitting = false;
        
        const code = res.code !== undefined ? res.code : res.Code;
        if (code === 200) {
          const result = res.result || res.data || res.Result || {};
          
          if (result.hasOwnProperty('isCreatedOrder') && result.isCreatedOrder === false) {
              return uni.showToast({ title: '下单失败，请重试', icon: 'none' });
          }

          // 【关键修复1】严格按照后端文档获取 orderId
          const orderId = result.orderId;
          
          // 【关键修复2】提取微信支付参数
          const wxPayParams = result.payParams || result.wxPayParams || result.WxPayParams;
          
          // 【关键修复3】区分详情页 URL (处方单必须带 type=2)
          const detailUrl = this.isDispensing 
                            ? `/pages/order/detail?id=${orderId}&type=2` 
                            : `/pages/order/detail?id=${orderId}&type=1`;

          if (wxPayParams && (wxPayParams.timeStamp || wxPayParams.TimeStamp)) {
              // 有支付参数，唤起微信收银台
              this.callWechatPay(wxPayParams, detailUrl);
          } else {
              uni.showToast({ title: '下单成功', icon: 'success' });
              setTimeout(() => {
                 uni.redirectTo({ url: detailUrl }); 
              }, 1500);
          }
        } else {
          uni.showToast({ title: res.message || res.Message || '下单失败', icon: 'none' });
        }
      }).catch(() => { this.submitting = false; });
    },
    
    // 【修改】唤起微信支付收银台，接收跳转链接作为参数
    callWechatPay(params, detailUrl) {
        uni.requestPayment({
            provider: 'wxpay',
            timeStamp: String(params.timeStamp || params.TimeStamp),
            nonceStr: params.nonceStr || params.NonceStr,
            package: params.package || params.Package,
            signType: params.signType || params.SignType || 'MD5',
            paySign: params.paySign || params.PaySign,
            success: (payRes) => {
                uni.showToast({ title: '支付成功', icon: 'success' });
                setTimeout(() => {
                    uni.redirectTo({ url: detailUrl });
                }, 1500);
            },
            fail: (err) => {
                console.log('支付取消或失败', err);
                uni.showToast({ title: '取消支付', icon: 'none' });
                setTimeout(() => {
                    uni.redirectTo({ url: detailUrl });
                }, 1500);
            }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.container { padding-bottom: 120rpx; background-color: #f5f5f5; min-height: 100vh; }
.address-section { background: #fff; padding: 30rpx; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; .user-row { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; .mobile { margin-left: 20rpx; color: #666; font-weight: normal; font-size: 26rpx; } } .addr-text { font-size: 26rpx; color: #333; line-height: 1.4; } .addr-empty { display: flex; align-items: center; color: #333; font-size: 28rpx; .icon-box { width: 40rpx; height: 40rpx; background: #2979ff; color: #fff; text-align: center; line-height: 36rpx; border-radius: 8rpx; margin-right: 12rpx; font-weight: bold;} } }
.goods-section { background: #fff; margin-bottom: 20rpx; .prescription-header { padding: 20rpx 30rpx; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center; .tag { background: #e6f1fc; color: #2979ff; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; margin-right: 16rpx;} .usage-info { font-size: 26rpx; color: #333; font-weight: bold; } } .goods-item { display: flex; padding: 20rpx 30rpx; background: #fff; border-bottom: 1px solid #f8f8f8; .thumb { width: 140rpx; height: 140rpx; border-radius: 8rpx; margin-right: 20rpx; background: #f5f5f5;} .content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; .title { font-size: 28rpx; color: #333; } .spec { font-size: 24rpx; color: #999; margin-top: 8rpx; } .price-row { display: flex; justify-content: space-between; margin-top: 10rpx; .price { color: #ff3b30; font-size: 30rpx; font-weight: bold; } .num { color: #999; font-size: 26rpx; } } } } }
.cell-group { background: #fff; margin-bottom: 20rpx; padding: 0 30rpx; .cell-item { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0; border-bottom: 1px solid #f8f8f8; font-size: 28rpx; &:last-child { border-bottom: none; } .label { color: #333; width: 160rpx;} .value { flex: 1; text-align: right; color: #333; } .input { flex: 1; text-align: right; font-size: 28rpx; } .red { color: #ff3b30; } .gray { color: #ccc; } .advice-text { color: #666; font-size: 26rpx; line-height: 1.4; text-align: left;} &.small { padding: 20rpx 0; font-size: 26rpx; .label{color:#666} } } }
.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); z-index: 99; .total-box { .label { font-size: 28rpx; color: #333; } .price-symbol { font-size: 24rpx; color: #ff3b30; font-weight: bold; } .price-num { font-size: 40rpx; color: #ff3b30; font-weight: bold; } } .submit-btn { margin: 0; background: #2979ff; color: #fff; font-size: 30rpx; border-radius: 40rpx; padding: 0 60rpx; height: 76rpx; line-height: 76rpx; } }
</style>