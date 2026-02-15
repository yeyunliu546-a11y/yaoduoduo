<template>
  <view class="container">
    <block v-if="orderInfo.id">
      <view class="status-header">
        <view class="status-text">{{ orderInfo.orderStatusName }}</view>
        <view class="status-desc" v-if="orderInfo.orderStatus===10">请尽快完成支付</view>
        <view class="status-desc" v-if="orderInfo.expressNo">快递单号: {{ orderInfo.expressNo }}</view>
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
            <text class="tag">处方调剂</text>
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
      isPrescription() { return parseInt(this.orderType) === 2; }
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
    
    handlePrescriptionData(data) {
        if(!data) return;
        const rawGoods = data.listSku || [];
        this.orderInfo = {
            id: data.id,
            orderNo: data.orderNo,
            orderStatus: data.orderStatus,
            orderStatusName: this.getStatusName(data.orderStatus),
            createTime: data.createTime,
            payTime: data.payTime,
            expressNo: data.expressNo,
            dosageDesc: data.dosageDesc || `共服${data.dosageDays}天`,
            medicalAdvice: data.medicalAdvice,
            buyerRemark: data.buyerRemark,
            receiverName: data.address?.name || '',
            receiverPhone: data.address?.phone || '',
            receiverAddress: data.address?.fullAddress || '',
            goodsList: rawGoods.map(g => ({
               goodsName: g.goodsName,
               spec: '配方颗粒',
               imageUrl: g.urlImg || '/static/default-goods.png',
               salePrice: g.unitPrice,
               goodsNum: 1 
            }))
        };
    },
    
    handleProcurementData(data) {
        if(!data) return;
        const rawGoods = data.OrderSkus || data.ListSku || [];
        const addr = data.AddressInfo || data.OrderAddressInfo || {};
        
        this.orderInfo = {
            id: data.Id || data.id,
            orderNo: data.OrderNo || data.orderNo,
            orderStatus: data.OrderStatus !== undefined ? data.OrderStatus : data.orderStatus,
            orderStatusName: this.getStatusName(data.OrderStatus !== undefined ? data.OrderStatus : data.orderStatus),
            createTime: data.CreateTime || data.createTime,
            payTime: data.PayTime || data.payTime,
            expressNo: data.ExpressNo || data.expressNo,
            buyerRemark: data.BuyerRemark || data.buyerRemark,
            receiverName: addr.Name || addr.name || '',
            receiverPhone: addr.Phone || addr.phone || '',
            receiverAddress: addr.FullAddress || addr.fullAddress || '',
            goodsList: rawGoods.map(g => ({
               goodsName: g.GoodsName || g.goodsName,
               spec: g.SkuName || g.skuName || '默认规格',
               imageUrl: g.ImageUrl || g.GoodsImg || g.imageUrl || '/static/default-goods.png',
               salePrice: g.SalePrice || g.PayPrice || g.salePrice,
               goodsNum: g.Quantity || g.quantity
            }))
        };
    },
    
    getStatusName(status) {
        const map = { '-30': '已取消', '-20': '申请取消', '10': '待付款', '20': '待发货', '30': '待收货', '80': '已完成' };
        return map[String(status)] || '未知状态';
    },
    
    handlePay() {
        uni.showLoading({ title: '获取支付信息...', mask: true });
        
        let payApi;

        if (this.isPrescription) {
            payApi = payPrescriptionOrder({ 
                orderId: this.orderId,
                payType: 20, 
                appKey: 'MP-WEIXIN'
            });
        } else {
            // 双管齐下，大写小写都传，兼容老接口
            payApi = payOrder({ 
                OrderId: this.orderId, 
                PayType: 20,           
                AppKey: 'MP-WEIXIN',   
                orderId: this.orderId, 
                payType: 20,
                appKey: 'MP-WEIXIN'
            });
        }

        payApi.then(res => {
            uni.hideLoading();
            const code = res.code !== undefined ? res.code : res.Code;
            
            if(code === 200) {
                const result = res.result || res.Result || res.data || {};
                const wxPayParams = result.payParams || result.wxPayParams || result;
                
                if (!wxPayParams.timeStamp && !wxPayParams.TimeStamp) {
                    return uni.showToast({ title: '支付参数不完整', icon: 'none' });
                }
                
                uni.requestPayment({
                    provider: 'wxpay',
                    timeStamp: String(wxPayParams.timeStamp || wxPayParams.TimeStamp),
                    nonceStr: wxPayParams.nonceStr || wxPayParams.NonceStr,
                    package: wxPayParams.package || wxPayParams.Package,
                    signType: wxPayParams.signType || wxPayParams.SignType || 'MD5',
                    paySign: wxPayParams.paySign || wxPayParams.PaySign,
                    success: (payRes) => {
                        uni.showToast({ title: '支付成功', icon: 'success' });
                        setTimeout(() => { this.loadDetail(); }, 1500);
                    },
                    fail: (err) => {
                        console.log('支付取消或失败', err);
                        uni.showToast({ title: '已取消支付', icon: 'none' });
                    }
                });
            } else {
                uni.showToast({ title: res.message || res.Message || '获取支付参数失败', icon: 'none' });
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
                    let promise = this.isPrescription 
                        ? confirmPrescriptionReceive({ orderId: this.orderId })
                        : confirmReceive({ OrderId: this.orderId });

                    promise.then(res => {
                        uni.hideLoading();
                        const code = res.code !== undefined ? res.code : res.Code;
                        if(code === 200) {
                            uni.showToast({ title: '收货成功' });
                            this.loadDetail();
                        } else {
                            uni.showToast({ title: res.message || res.Message || '操作失败', icon: 'none' });
                        }
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
                    let promise = this.isPrescription
                        ? cancelPrescriptionOrder({ orderId: this.orderId })
                        : cancelOrder({ OrderId: this.orderId, Reason: '用户取消' });

                    promise.then(res => {
                        uni.hideLoading();
                        const code = res.code !== undefined ? res.code : res.Code;
                        if(code === 200) {
                            uni.showToast({ title: '已取消' });
                            this.loadDetail(); 
                        } else {
                            uni.showToast({ title: res.message || res.Message || '取消失败', icon: 'none' });
                        }
                    }).catch(() => uni.hideLoading());
                }
            }
        });
    },

    handleApplyRefund() {
        uni.showModal({
            title: '申请退款',
            editable: true,
            placeholderText: '请输入退款理由',
            content: '确定要申请退款吗？',
            success: (res) => {
                if(res.confirm) {
                    const reason = res.content || '用户申请退款';
                    applyCancelOrder({ OrderId: this.orderId, Reason: reason }).then(r => {
                        const code = r.code !== undefined ? r.code : r.Code;
                        if(code === 200) {
                            uni.showToast({ title: '申请提交成功' });
                            this.loadDetail();
                        } else {
                            uni.showToast({ title: r.message || r.Message || '申请失败', icon: 'none' });
                        }
                    });
                }
            }
        })
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