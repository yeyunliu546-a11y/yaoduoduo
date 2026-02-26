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
      <view class="cell-item" @click="openCouponPopup">
        <text class="label">优惠券</text>
        <view class="value-box">
            <view class="value red" v-if="parseFloat(settlement.couponAmount) > 0 && currentCouponId !== emptyGuid">
                <text v-if="currentCouponName" class="coupon-name">[{{currentCouponName}}] </text>
                -¥{{ settlement.couponAmount }}
            </view>
            <view class="value gray" v-else-if="currentCouponId === emptyGuid">
                不使用优惠券
            </view>
            <view class="value gray" v-else>
                {{ couponList.length > 0 ? '有' + couponList.length + '张可用' : '暂无可用' }}
            </view>
        </view>
        <u-icon name="arrow-right" color="#ccc" size="26"></u-icon>
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

    <u-popup v-model="showCouponPopup" mode="bottom" border-radius="24" height="800">
        <view class="popup-container">
            <view class="popup-header">
                <text class="title">选择优惠券</text>
                <u-icon name="close" color="#999" @click="showCouponPopup = false"></u-icon>
            </view>
            <scroll-view scroll-y class="popup-content">
                <view class="no-use-row" @click="clearCoupon">
                    <text>不使用优惠券</text>
                    <u-icon name="checkbox-mark" color="#2979ff" size="36" v-if="currentCouponId === emptyGuid"></u-icon>
                    <u-icon name="checkbox-blank-circle" color="#ccc" size="36" v-else></u-icon>
                </view>

                <view class="coupon-item" 
                      v-for="(item, index) in couponList" 
                      :key="item.id" 
                      @click="selectCoupon(item)"
                >
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
                        <view class="date">{{ formatDate(item.endTime) }} 到期</view>
                      </view>
                      <view class="check-box">
                          <u-icon name="checkbox-mark" color="#2979ff" size="40" v-if="currentCouponId === item.id"></u-icon>
                          <u-icon name="checkbox-blank-circle" color="#eee" size="40" v-else></u-icon>
                      </view>
                    </view>
                </view>
                
                <u-empty v-if="couponList.length === 0" text="暂无可用优惠券" margin-top="50"></u-empty>
            </scroll-view>
        </view>
    </u-popup>

  </view>
</template>

<script>
import { getOrderSettlement, getPrescriptionSettlement, createOrder, createPrescriptionOrder } from '@/api/order/order.js';
import { getAvailableCoupons } from '@/api/user/coupon.js';

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
      parsedCartIds: [],
      
      // 优惠券相关
      showCouponPopup: false,
      couponList: [], 
      currentCouponId: '', 
      currentCouponName: '', 
      // 空GUID，用于标记"不使用"
      emptyGuid: '00000000-0000-0000-0000-000000000000',
      
      // 标记是否是用户手动选择（如果是，则不再被后端覆盖）
      isManualSelected: false
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
          // 地址变了可能影响运费，重新拉一次，但要保持用户选的券
          this.loadSettlement();
      }
  },
  
  methods: {
    formatDate(val) {
        if (!val) return '';
        const safeVal = typeof val === 'string' ? val.replace(/-/g, '/') : val;
        const date = new Date(safeVal);
        if (isNaN(date.getTime())) return val; 
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}.${m}.${d}`;
    },

    normalizeCoupon(item) {
        return {
            id: item.Id || item.id,
            name: item.Name || item.name,
            type: item.CouponType || item.couponType || 10,
            money: Number(item.reducePrice || item.ReducePrice || item.Money || item.money || item.CouponMoney || 0),
            discount: Number(item.discountRate || item.DiscountRate || item.Discount || item.discount || 0),
            minPoint: Number(item.minPrice || item.MinPrice || item.MinPoint || item.minPoint || 0),
            applyGoodsType: item.ApplyGoodsType || item.applyGoodsType || 0,
            endTime: item.EndTime || item.endTime,
            isAvailable: true 
        };
    },

    getIdsString() {
        const rawList = JSON.parse(JSON.stringify(this.parsedCartIds));
        return rawList.join(',');
    },

    loadSettlement() {
      uni.showLoading({ title: '计算中...', mask: true });
      const idsStr = this.getIdsString();
      
      const commonParams = { couponId: '' }; // 初始化只传空，让后端给默认值

      let promise;
      if (this.isDispensing) {
          const params = {
              cartIds: idsStr, 
              dosageDays: Number(this.prescription.days), 
              dailyPackages: Number(this.prescription.packs),
              addressId: this.address.id || '',
              ...commonParams
          };
          promise = getPrescriptionSettlement(params);
      } else {
          const params = { 
              StrCartIds: idsStr,
              addressId: this.address.id || '',
              ...commonParams 
          };
          promise = getOrderSettlement(params);
      }
      
      promise.then(res => {
          uni.hideLoading();
          if(res.code === 200 || res.Code === 200) {
              const data = res.result || res.data || res.Result;
              if (this.isDispensing) {
                  this.handlePrescriptionData(data);
              } else {
                  this.handleProcurementData(data);
              }
              // 结算数据回来后，再拉取可用优惠券
              this.loadCoupons();
          } else {
              uni.showToast({ title: res.message || '结算失败', icon: 'none' });
          }
      }).catch(() => uni.hideLoading());
    },

    loadCoupons() {
        if(!this.settlement.totalAmount || this.settlement.totalAmount == 0) return;

        const goodsItems = this.goodsList.map(item => ({
            GoodsId: item.goodsId, 
            GoodsType: this.isDispensing ? 2 : 1, 
            Count: item.num || 1
        }));

        const payload = {
            OrderAmount: Number(this.settlement.totalAmount),
            GoodsItems: goodsItems
        };

        getAvailableCoupons(payload).then(res => {
            if (res.code === 200) {
                let list = [];
                const r = res.result;
                if (r) {
                    if (Array.isArray(r.availableCoupons)) list = r.availableCoupons;
                    else if (Array.isArray(r.list)) list = r.list;
                    else if (Array.isArray(r)) list = r;
                }
                
                this.couponList = list.map(item => this.normalizeCoupon(item));
                
                // 如果用户还没有手动选过券，尝试应用后端推荐
                if (!this.isManualSelected) {
                    // 后端可能会在 getAvailableCoupons 返回 bestCouponId
                    if (r && r.bestCouponId) {
                        this.currentCouponId = r.bestCouponId;
                        this.currentCouponName = r.bestCouponName || '';
                        // 刷新一下金额（因为loadSettlement里的可能不准）
                        const bestCoupon = this.couponList.find(c => c.id === r.bestCouponId);
                        if(bestCoupon) this.applyCouponLocally(bestCoupon);
                    }
                }
            }
        });
    },

    // 核心：处理基础数据
    handleBaseData(data) {
        const priceInfo = data.priceInfo || data.order || {};
        
        // 1. 设置基础金额（不含优惠）
        this.settlement.totalAmount = priceInfo.totalGoodsPrice || priceInfo.orderTotalPrice || data.totalAmount || 0;
        this.settlement.freightAmount = priceInfo.freightPrice || priceInfo.freightMoney || data.freightPrice || 0;
        
        // 2. 如果用户还没手动操作，暂时信任后端的计算结果
        if (!this.isManualSelected) {
            this.settlement.payAmount = priceInfo.payPrice || priceInfo.orderPayPrice || data.payPrice || 0;
            this.settlement.couponAmount = priceInfo.couponPrice || priceInfo.couponMoney || data.couponAmount || 0;
        } else {
            // 如果用户已经手动操作过，立刻重新执行本地计算，防止后端覆盖
            this.recalcLocalPrice();
        }

        if (!this.address.id && data.address) this.address = data.address;
    },

    handlePrescriptionData(data) {
        if(!data) return;
        const list = data.listGoods || data.list || data.goodsList || [];
        this.goodsList = list.map(item => ({
            goodsId: item.goodsId || item.id,
            goodsName: item.goodsName || item.GoodsName,
            imageUrl: item.urlImg || item.goodsImage || '/static/default-goods.png',
            manufacturer: item.manufacturer || '配方颗粒',
            weight: item.goodsWeight || 0,
            price: item.unitPrice || 0,
            num: 1
        }));
        this.handleBaseData(data);
    },

    handleProcurementData(data) {
        if(!data) return;
        const rawList = data.listGoods || [];
        this.goodsList = rawList.map(item => {
            const sku = item.sku || {};
            return {
                goodsId: sku.id || item.goodsId,
                goodsName: sku.goodsName || '未知商品',
                imageUrl: sku.skuUrlImage || sku.urlImg || '/static/default-goods.png',
                spec: sku.skuName || '默认规格',
                price: sku.salePrice || 0,
                num: item.quantity || 1
            };
        });
        this.handleBaseData(data);
    },

    chooseAddress() {
      uni.navigateTo({ url: '/pages/address/index?source=order' });
    },
    
    openCouponPopup() {
        this.showCouponPopup = true;
    },
    
    // 【核心】前端本地计算：选中优惠券
    selectCoupon(item) {
        if (this.currentCouponId === item.id) return;
        
        this.isManualSelected = true; // 标记为手动模式
        this.currentCouponId = item.id;
        this.currentCouponName = item.name;
        
        this.applyCouponLocally(item);
        this.showCouponPopup = false;
    },
    
    // 【核心】前端本地计算：应用优惠
    applyCouponLocally(item) {
        let deduction = 0;
        const goodsTotal = Number(this.settlement.totalAmount);
        
        if (item.type === 10) { // 满减
            deduction = item.money;
        } else if (item.type === 20) { // 折扣
            // 折扣公式：商品总价 * (1 - 折扣率/10)
            const rate = item.discount;
            if (rate > 0 && rate < 10) {
                deduction = goodsTotal * (1 - rate / 10);
            }
        }
        
        // 优惠不能超过商品总价
        if (deduction > goodsTotal) deduction = goodsTotal;
        
        this.settlement.couponAmount = deduction.toFixed(2);
        this.recalcLocalPrice();
    },
    
    // 【核心】前端本地计算：不使用优惠券
    clearCoupon() {
        this.isManualSelected = true; // 标记为手动模式
        this.currentCouponId = this.emptyGuid;
        this.currentCouponName = '';
        this.settlement.couponAmount = '0.00';
        
        this.recalcLocalPrice();
        this.showCouponPopup = false;
    },
    
    // 【核心】本地重算最终支付价
    recalcLocalPrice() {
        const total = Number(this.settlement.totalAmount);
        const freight = Number(this.settlement.freightAmount);
        const coupon = Number(this.settlement.couponAmount);
        
        let pay = total + freight - coupon;
        if (pay < 0) pay = 0;
        
        this.settlement.payAmount = pay.toFixed(2);
    },

    submitOrder() {
      if (!this.address.id) return uni.showToast({ title: '请选择收货地址', icon: 'none' });

      this.submitting = true;
      const idsStr = this.getIdsString();

      const commonPayload = {
          addressId: this.address.id,
          buyerRemark: this.buyerRemark,
          payType: 20, 
          appKey: 'MP-WEIXIN',
          // 提交订单时，如果是 emptyGuid，传给后端
          UserCouponId: this.currentCouponId 
      };

      let promise;
      
      if (this.isDispensing) {
          promise = createPrescriptionOrder({
              ...commonPayload,
              cartIds: idsStr,
              dosageDays: Number(this.prescription.days),
              dailyPackages: Number(this.prescription.packs),
              medicalAdvice: this.doctorAdvice
          });
      } else {
          promise = createOrder({
              ...commonPayload,
              cartIds: idsStr, 
              StrCartIds: idsStr,
              orderType: 1
          });
      }

      promise.then(res => {
        this.submitting = false;
        
        const code = res.code !== undefined ? res.code : res.Code;
        if (code === 200) {
          const result = res.result || res.data || res.Result || {};
          
          if (result.hasOwnProperty('isCreatedOrder') && result.isCreatedOrder === false) {
              return uni.showToast({ title: '下单失败，请重试', icon: 'none' });
          }

          const orderId = result.orderId;
          const wxPayParams = result.payParams || result.wxPayParams || result.WxPayParams;
          
          const detailUrl = this.isDispensing 
                            ? `/pages/order/detail?id=${orderId}&type=2` 
                            : `/pages/order/detail?id=${orderId}&type=1`;

          if (wxPayParams && (wxPayParams.timeStamp || wxPayParams.TimeStamp)) {
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
/* 样式保持不变 */
.container { padding-bottom: 120rpx; background-color: #f5f5f5; min-height: 100vh; }
.address-section { background: #fff; padding: 30rpx; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; .user-row { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; .mobile { margin-left: 20rpx; color: #666; font-weight: normal; font-size: 26rpx; } } .addr-text { font-size: 26rpx; color: #333; line-height: 1.4; } .addr-empty { display: flex; align-items: center; color: #333; font-size: 28rpx; .icon-box { width: 40rpx; height: 40rpx; background: #2979ff; color: #fff; text-align: center; line-height: 36rpx; border-radius: 8rpx; margin-right: 12rpx; font-weight: bold;} } }
.goods-section { background: #fff; margin-bottom: 20rpx; .prescription-header { padding: 20rpx 30rpx; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center; .tag { background: #e6f1fc; color: #2979ff; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 6rpx; margin-right: 16rpx;} .usage-info { font-size: 26rpx; color: #333; font-weight: bold; } } .goods-item { display: flex; padding: 20rpx 30rpx; background: #fff; border-bottom: 1px solid #f8f8f8; .thumb { width: 140rpx; height: 140rpx; border-radius: 8rpx; margin-right: 20rpx; background: #f5f5f5;} .content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; .title { font-size: 28rpx; color: #333; } .spec { font-size: 24rpx; color: #999; margin-top: 8rpx; } .price-row { display: flex; justify-content: space-between; margin-top: 10rpx; .price { color: #ff3b30; font-size: 30rpx; font-weight: bold; } .num { color: #999; font-size: 26rpx; } } } } }
.cell-group { background: #fff; margin-bottom: 20rpx; padding: 0 30rpx; .cell-item { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0; border-bottom: 1px solid #f8f8f8; font-size: 28rpx; &:last-child { border-bottom: none; } .label { color: #333; width: 160rpx;} 
  .value-box { flex: 1; text-align: right; display: flex; justify-content: flex-end; align-items: center;}
  .value { color: #333; } 
  .input { flex: 1; text-align: right; font-size: 28rpx; } 
  .red { color: #ff3b30; font-weight: bold; } 
  .gray { color: #ccc; } 
  .coupon-name { font-size: 24rpx; color: #666; font-weight: normal; margin-right: 10rpx; }
  .advice-text { color: #666; font-size: 26rpx; line-height: 1.4; text-align: left;} 
  &.small { padding: 20rpx 0; font-size: 26rpx; .label{color:#666} } } 
}
.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); z-index: 99; .total-box { .label { font-size: 28rpx; color: #333; } .price-symbol { font-size: 24rpx; color: #ff3b30; font-weight: bold; } .price-num { font-size: 40rpx; color: #ff3b30; font-weight: bold; } } .submit-btn { margin: 0; background: #2979ff; color: #fff; font-size: 30rpx; border-radius: 40rpx; padding: 0 60rpx; height: 76rpx; line-height: 76rpx; } }

.popup-container { background: #f5f5f5; height: 100%; display: flex; flex-direction: column; }
.popup-header { background: #fff; padding: 30rpx; text-align: center; position: relative; font-size: 32rpx; font-weight: bold; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.popup-content { flex: 1; padding: 20rpx; overflow-y: auto; }
.no-use-row { background: #fff; padding: 24rpx 30rpx; border-radius: 12rpx; margin-bottom: 20rpx; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx; color: #333; }

.coupon-item {
  display: flex; background: #fff; border-radius: 12rpx; overflow: hidden; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  transition: all 0.2s;
  
  .left-box {
    width: 180rpx; background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
    color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center;
    &.discount-bg { background: linear-gradient(135deg, #ff9f43 0%, #ee5253 100%); }
    .price-row { margin-bottom: 6rpx; .symbol { font-size: 24rpx; } .num { font-size: 48rpx; font-weight: bold; } }
    .condition { font-size: 20rpx; opacity: 0.9; }
  }
  
  .right-box {
    flex: 1; padding: 20rpx; display: flex; align-items: center; justify-content: space-between;
    .info {
      flex: 1; margin-right: 20rpx;
      .title-row {
        display: flex; align-items: center; margin-bottom: 10rpx;
        .tag { font-size: 18rpx; background: #fff2e8; color: #ff9900; padding: 2rpx 6rpx; border-radius: 4rpx; margin-right: 8rpx; flex-shrink: 0; &.purple { background: #f9f0ff; color: #722ed1; } &.blue { background: #e6f7ff; color: #1890ff; } }
        .title { font-size: 28rpx; font-weight: bold; color: #333; }
      }
      .date { font-size: 22rpx; color: #ccc; }
    }
  }
}
</style>