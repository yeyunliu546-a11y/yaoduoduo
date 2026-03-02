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

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getOrderSettlement, getPrescriptionSettlement, createOrder, createPrescriptionOrder } from '@/api/order/order.js';
import { getAvailableCoupons } from '@/api/user/coupon.js';

// --- 响应式状态 ---
const optionsData = ref({});
const isDispensing = ref(false);
const address = ref({});
const goodsList = ref([]);

const settlement = reactive({ totalAmount: '0.00', freightAmount: '0.00', couponAmount: '0.00', payAmount: '0.00' });
const prescription = reactive({ days: 0, packs: 0 });
const doctorAdvice = ref('');
const buyerRemark = ref('');
const submitting = ref(false);
const parsedCartIds = ref([]);

// --- 优惠券状态 ---
const showCouponPopup = ref(false);
const couponList = ref([]); 
const currentCouponId = ref(''); 
const currentCouponName = ref(''); 
const emptyGuid = '00000000-0000-0000-0000-000000000000';
const isManualSelected = ref(false);

// --- 生命周期 ---
onLoad((options) => {
    optionsData.value = options;
    isDispensing.value = options.type === 'dispensing';
    
    try {
        if (options.cartIds) {
            let raw = decodeURIComponent(options.cartIds);
            if (raw.startsWith('[') && raw.endsWith(']')) {
                parsedCartIds.value = JSON.parse(raw);
            } else {
                parsedCartIds.value = raw.split(',');
            }
        }
    } catch (e) {
        parsedCartIds.value = [];
    }
    if (!Array.isArray(parsedCartIds.value)) {
        parsedCartIds.value = [];
    }

    if (isDispensing.value) {
        prescription.days = options.days || 3;
        prescription.packs = options.packs || 2;
        if(options.advice) doctorAdvice.value = decodeURIComponent(options.advice);
    }
    
    loadSettlement();
});

onShow(() => {
    const selectedAddr = uni.getStorageSync('selectedAddress');
    if (selectedAddr) {
        address.value = selectedAddr;
        uni.removeStorageSync('selectedAddress'); 
        loadSettlement();
    }
});

// --- 方法 ---
const formatDate = (val) => {
    if (!val) return '';
    const safeVal = typeof val === 'string' ? val.replace(/-/g, '/') : val;
    const date = new Date(safeVal);
    if (isNaN(date.getTime())) return val; 
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}.${m}.${d}`;
};

const normalizeCoupon = (item) => {
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
};

const getIdsString = () => {
    return parsedCartIds.value.join(',');
};

const loadSettlement = () => {
    uni.showLoading({ title: '计算中...', mask: true });
    const idsStr = getIdsString();
    
    const commonParams = { couponId: '' }; 

    let promise;
    if (isDispensing.value) {
        const params = {
            cartIds: idsStr, 
            dosageDays: Number(prescription.days), 
            dailyPackages: Number(prescription.packs),
            addressId: address.value.id || '',
            ...commonParams
        };
        promise = getPrescriptionSettlement(params);
    } else {
        const params = { 
            StrCartIds: idsStr,
            addressId: address.value.id || '',
            ...commonParams 
        };
        promise = getOrderSettlement(params);
    }
    
    promise.then(res => {
        uni.hideLoading();
        if(res.code === 200 || res.Code === 200) {
            const data = res.result || res.data || res.Result;
            if (isDispensing.value) {
                handlePrescriptionData(data);
            } else {
                handleProcurementData(data);
            }
            loadCoupons();
        } else {
            uni.showToast({ title: res.message || '结算失败', icon: 'none' });
        }
    }).catch(() => uni.hideLoading());
};

const loadCoupons = () => {
    if(!settlement.totalAmount || settlement.totalAmount == 0) return;

    const goodsItems = goodsList.value.map(item => ({
        GoodsId: item.goodsId, 
        GoodsType: isDispensing.value ? 2 : 1, 
        Count: item.num || 1
    }));

    const payload = {
        OrderAmount: Number(settlement.totalAmount),
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
            
            couponList.value = list.map(item => normalizeCoupon(item));
            
            if (!isManualSelected.value) {
                if (r && r.bestCouponId) {
                    currentCouponId.value = r.bestCouponId;
                    currentCouponName.value = r.bestCouponName || '';
                    const bestCoupon = couponList.value.find(c => c.id === r.bestCouponId);
                    if(bestCoupon) applyCouponLocally(bestCoupon);
                }
            }
        }
    });
};

const handleBaseData = (data) => {
    const priceInfo = data.priceInfo || data.order || {};
    
    settlement.totalAmount = priceInfo.totalGoodsPrice || priceInfo.orderTotalPrice || data.totalAmount || 0;
    settlement.freightAmount = priceInfo.freightPrice || priceInfo.freightMoney || data.freightPrice || 0;
    
    if (!isManualSelected.value) {
        settlement.payAmount = priceInfo.payPrice || priceInfo.orderPayPrice || data.payPrice || 0;
        settlement.couponAmount = priceInfo.couponPrice || priceInfo.couponMoney || data.couponAmount || 0;
    } else {
        recalcLocalPrice();
    }

    if (!address.value.id && data.address) address.value = data.address;
};

const handlePrescriptionData = (data) => {
    if(!data) return;
    const list = data.listGoods || data.list || data.goodsList || [];
    goodsList.value = list.map(item => ({
        goodsId: item.goodsId || item.id,
        goodsName: item.goodsName || item.GoodsName,
        imageUrl: item.urlImg || item.goodsImage || '/static/default-goods.png',
        manufacturer: item.manufacturer || '配方颗粒',
        weight: item.goodsWeight || 0,
        price: item.unitPrice || 0,
        num: 1
    }));
    handleBaseData(data);
};

const handleProcurementData = (data) => {
    if(!data) return;
    const rawList = data.listGoods || [];
    goodsList.value = rawList.map(item => {
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
    handleBaseData(data);
};

const chooseAddress = () => {
    uni.navigateTo({ url: '/pages/address/index?source=order' });
};

const openCouponPopup = () => {
    showCouponPopup.value = true;
};

const selectCoupon = (item) => {
    if (currentCouponId.value === item.id) return;
    
    isManualSelected.value = true;
    currentCouponId.value = item.id;
    currentCouponName.value = item.name;
    
    applyCouponLocally(item);
    showCouponPopup.value = false;
};

const applyCouponLocally = (item) => {
    let deduction = 0;
    const goodsTotal = Number(settlement.totalAmount);
    
    if (item.type === 10) { 
        deduction = item.money;
    } else if (item.type === 20) { 
        const rate = item.discount;
        if (rate > 0 && rate < 10) {
            deduction = goodsTotal * (1 - rate / 10);
        }
    }
    
    if (deduction > goodsTotal) deduction = goodsTotal;
    
    settlement.couponAmount = deduction.toFixed(2);
    recalcLocalPrice();
};

const clearCoupon = () => {
    isManualSelected.value = true;
    currentCouponId.value = emptyGuid;
    currentCouponName.value = '';
    settlement.couponAmount = '0.00';
    
    recalcLocalPrice();
    showCouponPopup.value = false;
};

const recalcLocalPrice = () => {
    const total = Number(settlement.totalAmount);
    const freight = Number(settlement.freightAmount);
    const coupon = Number(settlement.couponAmount);
    
    let pay = total + freight - coupon;
    if (pay < 0) pay = 0;
    
    settlement.payAmount = pay.toFixed(2);
};

const submitOrder = () => {
    if (!address.value.id) return uni.showToast({ title: '请选择收货地址', icon: 'none' });

    submitting.value = true;
    const idsStr = getIdsString();

    const commonPayload = {
        addressId: address.value.id,
        buyerRemark: buyerRemark.value,
        payType: 20, 
        appKey: 'MP-WEIXIN'
    };

    let promise;
    
    if (isDispensing.value) {
        const payload = {
            ...commonPayload,
            cartIds: idsStr,
            dosageDays: Number(prescription.days),
            dailyPackages: Number(prescription.packs),
            medicalAdvice: doctorAdvice.value
        };
        
        if (currentCouponId.value) {
            payload.CouponId = currentCouponId.value;
        }
        
        promise = createPrescriptionOrder(payload);
    } else {
        const payload = {
            ...commonPayload,
            cartIds: idsStr, 
            StrCartIds: idsStr,
            orderType: 1
        };
        
        if (currentCouponId.value) {
            payload.UserCouponId = currentCouponId.value;
        }
        
        promise = createOrder(payload);
    }

    promise.then(res => {
        submitting.value = false;
        
        const code = res.code !== undefined ? res.code : res.Code;
        if (code === 200) {
            const result = res.result || res.data || res.Result || {};
            
            if (result.hasOwnProperty('isCreatedOrder') && result.isCreatedOrder === false) {
                return uni.showToast({ title: '下单失败，请重试', icon: 'none' });
            }

            const orderId = result.orderId || result.OrderId;
            
            // 【核心防漏容错处理】防止嵌套层级问题导致跳过支付
            const wxPayParams = result.payParams || result.wxPayParams || result.WxPayParams || (result.timeStamp || result.TimeStamp ? result : null);
            
            const detailUrl = isDispensing.value 
                            ? `/pages/order/detail?id=${orderId}&type=2` 
                            : `/pages/order/detail?id=${orderId}&type=1`;

            if (wxPayParams && (wxPayParams.timeStamp || wxPayParams.TimeStamp)) {
                callWechatPay(wxPayParams, detailUrl);
            } else {
                uni.showToast({ title: '下单成功', icon: 'success' });
                setTimeout(() => {
                    uni.redirectTo({ url: detailUrl }); 
                }, 1500);
            }
        } else {
            uni.showToast({ title: res.message || res.Message || '下单失败', icon: 'none' });
        }
    }).catch(() => { submitting.value = false; });
};

// 【核心修复：剥离 Vue3 Proxy 代理】
const callWechatPay = (params, detailUrl) => {
    // Vue3 环境下 params 有可能是一个 Proxy 对象，微信 SDK 不识别 Proxy 会直接拦截报 banned
    // 解决方案：使用 String() 强制转换拆解为一个极其干净的普通 JS 对象
    uni.requestPayment({
        provider: 'wxpay',
        timeStamp: String(params.timeStamp || params.TimeStamp),
        nonceStr: String(params.nonceStr || params.NonceStr),
        package: String(params.package || params.Package),
        signType: String(params.signType || params.SignType || 'MD5'),
        paySign: String(params.paySign || params.PaySign),
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