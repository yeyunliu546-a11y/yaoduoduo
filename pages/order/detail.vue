<template>
  <view class="container">
    <block v-if="orderInfo.id">
      
      <view class="header-bg">
        <view class="status-wrap">
          <u-icon :name="statusIcon" color="#fff" size="56" class="status-icon"></u-icon>
          <view class="status-text-box">
            <view class="status-name">{{ orderInfo.orderStatusName }}</view>
            <view class="status-desc" v-if="orderInfo.orderStatus === 10">
              需付款: ¥{{ orderInfo.payPrice }}，请尽快支付
            </view>
            <view class="status-desc" v-else-if="orderInfo.expressNo">
              快递单号: {{ orderInfo.expressNo }}
            </view>
            <view class="status-desc" v-else>
              感谢您对药多多YDD的支持
            </view>
          </view>
        </view>
      </view>

      <view class="main-content">
        
        <view class="card address-card">
          <view class="loc-icon-box">
             <u-icon name="map-fill" color="#fff" size="30"></u-icon>
          </view>
          <view class="addr-info">
            <view class="user-row">
              <text class="name">{{ orderInfo.receiverName }}</text>
              <text class="phone">{{ orderInfo.receiverPhone }}</text>
            </view>
            <view class="addr-text">{{ orderInfo.receiverAddress }}</view>
          </view>
        </view>

        <view class="card goods-card">
          <view class="shop-header">
             <u-icon name="home" color="#333" size="34"></u-icon>
             <text class="shop-name">药多多 {{ isPrescription ? '调剂中心' : '自营商城' }}</text>
          </view>

          <view class="prescription-info" v-if="isPrescription">
              <text class="tag">处方调剂</text>
              <text class="usage">{{ orderInfo.dosageDesc }}</text>
          </view>
          
          <view class="goods-item" v-for="(item, index) in orderInfo.goodsList" :key="index">
            <image :src="item.imageUrl" mode="aspectFill" class="thumb"></image>
            <view class="content">
              <view class="title u-line-2">{{ item.goodsName }}</view>
              <view class="spec">{{ item.spec }}</view>
              <view class="price-row">
                <text class="price"><text class="symbol">¥</text>{{ item.salePrice }}</text>
                <text class="num">x{{ item.goodsNum }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="!orderInfo.goodsList || orderInfo.goodsList.length === 0" class="empty-goods">
              <view>⚠️ 该订单缺乏商品详细数据</view>
              <view class="sub-tip">请联系后端排查详情接口返回值</view>
          </view>

          <view class="total-row" v-if="orderInfo.payPrice">
             <text class="label">实付款</text>
             <text class="total-price"><text class="symbol">¥</text>{{ orderInfo.payPrice }}</text>
          </view>
        </view>

        <view class="card info-card">
          <view class="card-title">订单信息</view>
          <view class="cell">
            <text class="label">订单编号</text>
            <view class="value-box">
               <text class="value">{{ orderInfo.orderNo }}</text>
               <text class="copy-btn" @click="copyText(orderInfo.orderNo)">复制</text>
            </view>
          </view>
          <view class="cell">
            <text class="label">下单时间</text>
            <text class="value">{{ orderInfo.createTime }}</text>
          </view>
          <view class="cell" v-if="orderInfo.payTime">
            <text class="label">支付时间</text>
            <text class="value">{{ orderInfo.payTime }}</text>
          </view>
          <view class="cell" v-if="isPrescription && orderInfo.medicalAdvice">
            <text class="label">医嘱备注</text>
            <text class="value">{{ orderInfo.medicalAdvice }}</text>
          </view>
          <view class="cell" v-if="orderInfo.buyerRemark">
            <text class="label">买家留言</text>
            <text class="value">{{ orderInfo.buyerRemark }}</text>
          </view>
        </view>
      </view>

      <view class="footer-bar">
        <view class="btn plain" v-if="orderInfo.orderStatus === 10" @click="handleCancel">取消订单</view>
        <view class="btn plain" v-if="orderInfo.orderStatus === 20" @click="handleApplyRefund">申请退款</view>
        <view class="btn primary" v-if="orderInfo.orderStatus === 10" @click="handlePay">立即支付</view>
        <view class="btn primary" v-if="orderInfo.orderStatus === 30" @click="handleReceive">确认收货</view>
      </view>
    </block>
    
    <u-loading-page :loading="loading"></u-loading-page>

  </view>
</template>

<script>
import { 
    getOrderDetail, getPrescriptionDetail, 
    payOrder, payPrescriptionOrder, 
    confirmReceive, confirmPrescriptionReceive,
    cancelOrder, cancelPrescriptionOrder,
    applyCancelOrder
} from '@/api/order/order.js';

export default {
  data() {
    return {
      orderId: '',
      orderType: 1, 
      loading: true,
      orderInfo: {}
    };
  },
  computed: {
      isPrescription() { return parseInt(this.orderType) === 2; },
      
      statusIcon() {
          const status = this.orderInfo?.orderStatus;
          if (status === 10) return 'clock-fill'; 
          if (status === 20) return 'car-fill';   
          if (status === 30) return 'gift-fill';  
          if (status === 80) return 'checkmark-circle-fill'; 
          if (status === -20 || status === -30) return 'close-circle-fill'; 
          return 'order';
      }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.orderType = options.type || 1;
      this.loadDetail();
    } else {
      uni.showToast({ title: '订单参数错误', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  },
  methods: {
    copyText(text) {
        uni.setClipboardData({
            data: String(text),
            success: () => { uni.showToast({ title: '复制成功', icon: 'none' }); }
        });
    },

    loadDetail() {
      this.loading = true;
      const api = this.isPrescription ? getPrescriptionDetail(this.orderId) : getOrderDetail(this.orderId);
      
      api.then(res => {
        this.loading = false;
        const code = res.code !== undefined ? res.code : res.Code;
        if (code === 200) {
          const data = res.result || res.data || res.Result;
          this.isPrescription ? this.handlePrescriptionData(data) : this.handleProcurementData(data);
        } else {
            uni.showToast({ title: res.message || res.Message || '获取详情失败', icon: 'none' });
        }
      }).catch(() => this.loading = false);
    },
    
    aggregateGoods(rawGoodsList, defaultSpec) {
        const grouped = [];
        const map = {};
        
        rawGoodsList.forEach(g => {
            const sku = g.sku || g.goods || g;
            const name = sku.GoodsName || sku.goodsName || g.goodsName || g.GoodsName || '未知商品';
            const spec = sku.SkuName || sku.skuName || sku.spec || g.specification || g.spec || defaultSpec;
            const imageUrl = sku.skuImageUrl || g.skuImageUrl || sku.ImageUrl || sku.GoodsImg || sku.imageUrl || sku.skuUrlImage || g.imageUrl || g.urlImg || '/static/empty.png';
            const salePrice = sku.SalePrice || sku.PayPrice || sku.unitPrice || sku.salePrice || sku.price || g.unitPrice || g.salePrice || g.price || 0;
            const num = Number(sku.Quantity || sku.quantity || g.quantity || g.goodsNum || g.buyNum || 1);
            
            const uniqueKey = `${name}_${spec}`;
            
            if (map[uniqueKey]) {
                map[uniqueKey].goodsNum += num;
            } else {
                map[uniqueKey] = {
                    goodsName: name, spec: spec, imageUrl: imageUrl,
                    salePrice: Number(salePrice).toFixed(2), goodsNum: num
                };
                grouped.push(map[uniqueKey]);
            }
        });
        return grouped;
    },

    handlePrescriptionData(data) {
        if(!data) return;
        const rawGoods = data.listSku || data.goodsList || data.listGoods || data.OrderSkus || data.ListSku || data.items || [];
        const addr = data.address || data.AddressInfo || data;
        let fullAddress = addr.fullAddress || addr.FullAddress || addr.receiverAddress || data.receiverAddress || '';
        if (!fullAddress && (addr.province || addr.Province || addr.city || addr.City)) {
            fullAddress = `${addr.province || addr.Province || ''}${addr.city || addr.City || ''}${addr.district || addr.District || ''} ${addr.detail || addr.Detail || addr.address || addr.Address || ''}`;
        }
        
        this.orderInfo = {
            id: data.id || data.Id, orderNo: data.orderNo || data.OrderNo,
            orderStatus: data.orderStatus !== undefined ? data.orderStatus : data.OrderStatus,
            orderStatusName: this.getStatusName(data.orderStatus !== undefined ? data.orderStatus : data.OrderStatus),
            createTime: data.createTime || data.CreateTime, payTime: data.payTime || data.PayTime,
            payPrice: data.payPrice || data.PayPrice || 0, expressNo: data.expressNo || data.ExpressNo,
            dosageDesc: data.dosageDesc || data.DosageDesc || `共服${data.dosageDays || data.DosageDays || 0}天`,
            medicalAdvice: data.medicalAdvice || data.MedicalAdvice, buyerRemark: data.buyerRemark || data.BuyerRemark,
            receiverName: addr.name || addr.Name || addr.receiverName || data.receiverName || addr.consignee || '',
            receiverPhone: addr.phone || addr.Phone || addr.receiverPhone || addr.mobile || data.receiverPhone || data.mobile || '',
            receiverAddress: fullAddress,
            goodsList: this.aggregateGoods(rawGoods, '配方颗粒')
        };
    },
    
    handleProcurementData(data) {
        if(!data) return;
        const rawGoods = data.OrderSkus || data.ListSku || data.listSku || data.goodsList || data.listGoods || data.orderGoodsList || data.items || [];
        const addr = data.addressInfo || data.orderAddressInfo || data.AddressInfo || data.OrderAddressInfo || data.address || data;
        let fullAddress = addr.fullAddress || addr.FullAddress || addr.receiverAddress || data.receiverAddress || '';
        if (!fullAddress && (addr.province || addr.Province || addr.city || addr.City)) {
            fullAddress = `${addr.province || addr.Province || ''}${addr.city || addr.City || ''}${addr.district || addr.District || ''} ${addr.detail || addr.Detail || addr.address || addr.Address || ''}`;
        }
        
        this.orderInfo = {
            id: data.Id || data.id, orderNo: data.OrderNo || data.orderNo,
            orderStatus: data.OrderStatus !== undefined ? data.OrderStatus : data.orderStatus,
            orderStatusName: this.getStatusName(data.OrderStatus !== undefined ? data.OrderStatus : data.orderStatus),
            createTime: data.CreateTime || data.createTime, payTime: data.PayTime || data.payTime,
            payPrice: data.payPrice || data.PayPrice || data.orderPayPrice || 0, 
            expressNo: data.ExpressNo || data.expressNo, buyerRemark: data.BuyerRemark || data.buyerRemark,
            receiverName: addr.name || addr.Name || addr.receiverName || data.receiverName || addr.consignee || '',
            receiverPhone: addr.phone || addr.Phone || addr.receiverPhone || addr.mobile || data.receiverPhone || data.mobile || '',
            receiverAddress: fullAddress,
            goodsList: this.aggregateGoods(rawGoods, '默认规格')
        };
    },
    
    getStatusName(status) {
        const map = { '-30': '已取消', '-20': '申请取消', '10': '待付款', '20': '待发货', '30': '待收货', '80': '已完成' };
        return map[String(status)] || '未知状态';
    },
    
    // 🌟 原生 API 支付：你指定的纯净版本
    handlePay() {
        uni.showLoading({ title: '获取支付信息...', mask: true });
        
        let payApi = this.isPrescription 
            ? payPrescriptionOrder({ orderId: this.orderId, payType: 20, appKey: 'MP-WEIXIN' })
            : payOrder({ OrderId: this.orderId, PayType: 20, AppKey: 'MP-WEIXIN', orderId: this.orderId, payType: 20, appKey: 'MP-WEIXIN' });

        payApi.then(res => {
            uni.hideLoading();
            const code = res.code !== undefined ? res.code : res.Code;

            if(code === 200) {
                const result = res.result || res.Result || res.data || {};
                
                // 1. 提取核心支付参数
                const payData = result.payData || {};
                const signData = payData.signData || result.signData;
                const paySig = payData.paySig || result.paySig;
                const signature = payData.signature || result.signature;
                
                // 2. 提取后端返回的模式（如果没有，默认零售 B2B 模式）
                const mode = result.mode || 'retail_pay_goods';

                if (signData && paySig && signature) {
                    console.log('====== 发起最纯净的原生 API 支付 ======');
                    console.log('参数:', { mode, signData, paySig, signature });

                    // 👇 纯裸调！只传官方要求的 4 个核心参数
                    wx.requestCommonPayment({
                        mode: mode,
                        signData: signData,
                        paySig: paySig,
                        signature: signature,
                        success: (payRes) => {
                            console.log('====== 原生 API 支付成功 ======', payRes);
                            uni.showToast({ title: '支付成功', icon: 'success' });
                            setTimeout(() => { this.loadDetail(); }, 1500);
                        },
					fail: (err) => {
                             // 精准判断：只要包含 cancel，就是用户主动取消，不是代码报错！
                             if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
                                 uni.showToast({ title: '您已取消支付', icon: 'none' });
                             } else {
                                 console.error('====== 原生 API 支付异常 ======', err);
                                 uni.showToast({ title: '支付环境异常，请重试', icon: 'none' });
                             }
                         }
                    });

                } else {
                    uni.showToast({ title: '后台返回支付参数不完整', icon: 'none' });
                }
            } else {
                uni.showToast({ title: res.message || res.Message || '获取参数失败', icon: 'none' });
            }
        }).catch(err => {
            uni.hideLoading();
            uni.showToast({ title: '网络异常', icon: 'none' });
        });
    },
    
    handleReceive() {
        uni.showModal({
            title: '提示', content: '确认收货?',
            success: (r) => {
                if(r.confirm) {
                    uni.showLoading();
                    let promise = this.isPrescription ? confirmPrescriptionReceive({ orderId: this.orderId }) : confirmReceive({ OrderId: this.orderId });
                    promise.then(res => {
                        uni.hideLoading();
                        const code = res.code !== undefined ? res.code : res.Code;
                        if(code === 200) {
                            uni.showToast({ title: '收货成功' });
                            this.loadDetail();
                        } else { uni.showToast({ title: res.message || res.Message || '操作失败', icon: 'none' }); }
                    }).catch(() => uni.hideLoading());
                }
            }
        });
    },
    
    handleCancel() {
        uni.showModal({
            title: '提示', content: '确认取消订单?',
            success: (r) => {
                if(r.confirm) {
                    uni.showLoading();
                    let promise = this.isPrescription ? cancelPrescriptionOrder({ orderId: this.orderId }) : cancelOrder({ OrderId: this.orderId, Reason: '用户取消' });
                    promise.then(res => {
                        uni.hideLoading();
                        const code = res.code !== undefined ? res.code : res.Code;
                        if(code === 200) {
                            uni.showToast({ title: '已取消' });
                            this.loadDetail(); 
                        } else { uni.showToast({ title: res.message || res.Message || '取消失败', icon: 'none' }); }
                    }).catch(() => uni.hideLoading());
                }
            }
        });
    },

    handleApplyRefund() {
        uni.showModal({
            title: '申请退款', editable: true, placeholderText: '请输入退款理由', content: '确定要申请退款吗？',
            success: (res) => {
                if(res.confirm) {
                    const reason = res.content || '用户申请退款';
                    applyCancelOrder({ OrderId: this.orderId, Reason: reason }).then(r => {
                        const code = r.code !== undefined ? r.code : r.Code;
                        if(code === 200) {
                            uni.showToast({ title: '申请提交成功' });
                            this.loadDetail();
                        } else { uni.showToast({ title: r.message || r.Message || '申请失败', icon: 'none' }); }
                    });
                }
            }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container { 
  background-color: #f5f7fa; 
  min-height: 100vh; 
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.header-bg { 
  background: linear-gradient(135deg, #2979ff 0%, #518cff 100%); 
  height: 280rpx;
  padding: 40rpx 40rpx 0; 
  box-sizing: border-box;
}

.status-wrap {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  
  .status-icon {
      margin-right: 20rpx;
      opacity: 0.9;
  }
  
  .status-text-box {
      color: #fff;
      .status-name { 
          font-size: 38rpx; 
          font-weight: bold; 
          margin-bottom: 8rpx; 
          letter-spacing: 2rpx;
      }
      .status-desc { 
          font-size: 24rpx; 
          opacity: 0.85; 
      }
  }
}

.main-content {
    position: relative;
    z-index: 2;
    margin-top: -80rpx; 
    padding: 0 24rpx;
    padding-bottom: 120rpx; 
}

.card { 
  background: #fff; 
  border-radius: 20rpx; 
  padding: 30rpx; 
  margin-bottom: 24rpx; 
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03); 
}

.address-card {
    display: flex;
    align-items: center;
    
    .loc-icon-box {
        width: 60rpx;
        height: 60rpx;
        background: linear-gradient(135deg, #2979ff, #629eff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        flex-shrink: 0;
        box-shadow: 0 4rpx 10rpx rgba(41, 121, 255, 0.3);
    }
    
    .addr-info {
        flex: 1;
        .user-row { 
            font-size: 30rpx; 
            font-weight: bold; 
            margin-bottom: 8rpx; 
            color: #333;
            .phone { 
                margin-left: 20rpx; 
                font-weight: normal; 
                color: #666; 
                font-size: 26rpx; 
            }
        }
        .addr-text { 
            color: #666; 
            font-size: 26rpx; 
            line-height: 1.5; 
        }
    }
}

.goods-card {
    .shop-header {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        padding-bottom: 20rpx;
        border-bottom: 1px solid #f5f5f5;
        
        .shop-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            margin-left: 12rpx;
        }
    }

    .prescription-info {
        padding-bottom: 20rpx; margin-bottom: 20rpx; border-bottom: 1px dotted #f0f0f0;
        .tag { background: #e6f1fc; color: #2979ff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 8rpx; margin-right: 16rpx;}
        .usage { font-size: 26rpx; color: #333; font-weight: bold;}
    }

    .goods-item { 
      display: flex; 
      margin-bottom: 30rpx; 
      &:last-child { margin-bottom: 20rpx; }
      
      .thumb { 
          width: 160rpx; 
          height: 160rpx; 
          border-radius: 12rpx; 
          margin-right: 24rpx; 
          background: #f9f9f9; 
          border: 1px solid #f0f0f0;
      }
      
      .content { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          padding: 4rpx 0;
          
        .title { font-size: 28rpx; color: #333; font-weight: 500; line-height: 1.4;}
        .spec { font-size: 24rpx; color: #999; margin-top: 8rpx; background: #f5f7fa; align-self: flex-start; padding: 2rpx 12rpx; border-radius: 6rpx;}
        .price-row { 
            display: flex; justify-content: space-between; align-items: baseline; margin-top: 12rpx;
            .price { 
                color: #fa3534; font-weight: bold; font-size: 32rpx; 
                .symbol { font-size: 24rpx; margin-right: 4rpx; font-weight: normal; }
            }
            .num { color: #999; font-size: 26rpx; }
        }
      }
    }
    
    .empty-goods {
        text-align: center; padding: 40rpx 0; color:#999; font-size:24rpx; background: #f9f9f9; border-radius: 12rpx; margin-bottom: 20rpx;
        .sub-tip { font-size: 20rpx; margin-top: 8rpx; }
    }
    
    .total-row {
        display: flex;
        justify-content: flex-end;
        align-items: baseline;
        padding-top: 24rpx;
        border-top: 1px solid #f5f5f5;
        
        .label { font-size: 26rpx; color: #333; margin-right: 12rpx; }
        .total-price {
            color: #fa3534; font-size: 36rpx; font-weight: bold;
            .symbol { font-size: 24rpx; margin-right: 4rpx;}
        }
    }
}

.info-card {
    .card-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 24rpx;
        border-left: 6rpx solid #2979ff;
        padding-left: 16rpx;
        line-height: 1;
    }
    
    .cell { 
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; font-size: 26rpx;
      &:last-child { margin-bottom: 0; }
      .label { color: #999; flex-shrink: 0; }
      .value-box { display: flex; align-items: center; }
      .value { color: #333; max-width: 450rpx; text-align: right; word-break: break-all; }
      
      .copy-btn {
          margin-left: 16rpx;
          font-size: 20rpx;
          color: #2979ff;
          background: #e6f1fc;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
      }
    }
}

.footer-bar { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  background: rgba(255, 255, 255, 0.98); 
  backdrop-filter: blur(10px);
  height: 110rpx; 
  display: flex; 
  align-items: center; 
  justify-content: flex-end; 
  padding: 0 30rpx; 
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.04); 
  z-index: 99;
  
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  
  .btn { 
      width: 180rpx; 
      height: 72rpx; 
      line-height: 72rpx; 
      text-align: center; 
      border-radius: 36rpx; 
      font-size: 28rpx; 
      margin-left: 20rpx; 
      font-weight: 500;
      
    &.plain { 
        border: 1px solid #dcdfe6; 
        color: #606266; 
        background: #fff;
    }
    
    &.primary { 
        background: linear-gradient(135deg, #2979ff 0%, #4792ff 100%); 
        color: #fff; 
        box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.3);
    }
  }
}
</style>