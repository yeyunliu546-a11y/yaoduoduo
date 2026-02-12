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
        
        <view class="action-box">
          <block v-if="item.orderStatus === 10">
             <view class="btn plain" @click.stop="handleCancel(item)">取消订单</view>
             <view class="btn primary" @click.stop="handlePay(item)">立即支付</view>
          </block>
          
          <block v-if="item.orderStatus === 20">
             <view class="btn plain" @click.stop="handleApplyRefund(item)">申请退款</view>
          </block>

          <block v-if="item.orderStatus === 30">
             <view class="btn primary" @click.stop="handleReceive(item)">确认收货</view>
          </block>
        </view>
      </view>
      
      <u-empty v-if="!isLoading && orderList.length === 0" mode="order" margin-top="100"></u-empty>
      <u-loadmore v-if="orderList.length > 0" :status="loadStatus" margin-top="30" margin-bottom="30"></u-loadmore>
    </view>
  </view>
</template>

<script>
// 引入所有需要的 API
import { 
    getOrderList, 
    payOrder, 
    confirmReceive, confirmPrescriptionReceive,
    cancelOrder, cancelPrescriptionOrder,
    applyCancelOrder 
} from '@/api/order/order.js';

export default {
  data() {
    return {
      statusList: [{ name: '全部' }, { name: '待付款' }, { name: '待发货' }, { name: '待收货' }, { name: '已完成' }],
      currentStatus: 0,
      orderList: [], 
      page: 1,
      isLoading: false,
      loadStatus: 'loadmore',
      // 标准状态码映射
      statusMapCode: [0, 10, 20, 30, 80] 
    };
  },
  onLoad(option) {
      if(option.status) {
          const val = parseInt(option.status);
          const index = this.statusMapCode.indexOf(val);
          this.currentStatus = index !== -1 ? index : 0;
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
      const params = {
        page: this.page,
        limit: 10,
        orderType: 0 
      };
      if (this.currentStatus !== 0) {
          params.orderStatus = this.statusMapCode[this.currentStatus];
      }

      getOrderList(params).then(res => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
        
        if (res.code === 200) {
          const rawList = res.result || res.data?.list || res.data || [];
          
          const list = rawList.map(order => {
              // 兼容各类商品字段
              let rawGoods = order.OrderSkus || order.listSku || order.goodsList || order.ListGoods || order.list || [];
              
              // 聚合接口兜底逻辑
              if (rawGoods.length === 0 && order.firstImage) {
                  rawGoods = [{
                      isVirtual: true,
                      imageUrl: order.firstImage,
                      goodsName: order.dosageDesc || (order.orderType===2 ? '中药配方颗粒调剂' : '采购商品'),
                      spec: '',
                      salePrice: order.payPrice, 
                      goodsNum: order.itemCount || 1
                  }];
              }

              return {
                  id: order.id || order.Id,
                  orderNo: order.orderNo || order.OrderNo,
                  // 智能识别类型: 2为处方, 1为采购 (CF开头为处方)
                  orderType: order.orderType || (String(order.orderNo || '').startsWith('CF') ? 2 : 1),
                  orderStatus: order.orderStatus || order.OrderStatus,
                  orderStatusName: this.getStatusName(order.orderStatus || order.OrderStatus),
                  payPrice: order.payPrice || order.PayPrice || 0,
                  totalNum: order.itemCount || rawGoods.length,
                  goodsList: rawGoods.map(g => {
                      const entity = g.sku || g;
                      const price = entity.SalePrice || entity.salePrice || entity.unitPrice || entity.price || 0;
                      return {
                          goodsName: g.isVirtual ? g.goodsName : (entity.GoodsName || entity.goodsName),
                          spec: g.isVirtual ? '' : (entity.SkuName || entity.skuName || entity.spec || (order.orderType===2 ? '配方颗粒' : '默认规格')),
                          imageUrl: entity.ImageUrl || entity.imageUrl || entity.urlImg || entity.GoodsImage || entity.skuUrlImage || '/static/default-goods.png',
                          salePrice: price,
                          pricePerGram: entity.PricePerGram || entity.pricePerGram,
                          goodsNum: g.isVirtual ? g.goodsNum : (entity.Quantity || entity.goodsNum || entity.quantity || 1)
                      };
                  })
              };
          });

          this.orderList = [...this.orderList, ...list];
          this.loadStatus = list.length < 10 ? 'nomore' : 'loadmore';
        }
      }).catch(err => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      });
    },
    
    getStatusName(status) {
        const map = { '-30': '已取消', '-20': '申请取消', '10': '待付款', '20': '待发货', '30': '待收货', '80': '已完成' };
        return map[String(status)] || '未知状态';
    },

    goDetail(item) {
      uni.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=${item.orderType}` });
    },
    
    handlePay(item) {
        uni.showLoading({ title: '请求中...' });
        payOrder({ OrderId: item.id }).then(res => {
            uni.hideLoading();
            if(res.code === 200) {
                uni.showToast({ title: '支付成功', icon: 'success' });
                setTimeout(() => { this.refreshList(); }, 1000);
            } else {
                uni.showToast({ title: res.message || '支付失败', icon: 'none' });
            }
        });
    },
    
    // 【核心修复】确认收货分流
    handleReceive(item) {
        uni.showModal({
            title: '提示', content: '确认已收到货物吗？',
            success: (res) => {
                if(res.confirm) {
                    let promise;
                    // 判断订单类型 (CF开头或type=2为处方)
                    const isPrescription = item.orderType == 2 || String(item.orderNo).startsWith('CF');
                    
                    if (isPrescription) {
                        promise = confirmPrescriptionReceive({ orderId: item.id });
                    } else {
                        promise = confirmReceive({ OrderId: item.id });
                    }

                    promise.then(r => {
                        if(r.code === 200) {
                            uni.showToast({ title: '收货成功' });
                            this.refreshList();
                        } else {
                            uni.showToast({ title: r.message || '操作失败', icon: 'none' });
                        }
                    });
                }
            }
        })
    },
    
    // 【核心修复】取消未付款订单分流
    handleCancel(item) {
        uni.showModal({
            title: '提示',
            content: '确定要取消订单吗？',
            success: (res) => {
                if(res.confirm) {
                    let promise;
                    const isPrescription = item.orderType == 2 || String(item.orderNo).startsWith('CF');

                    if (isPrescription) {
                        // 处方取消 (orderId 小写)
                        promise = cancelPrescriptionOrder({ orderId: item.id });
                    } else {
                        // 采购取消 (OrderId 大写)
                        promise = cancelOrder({ OrderId: item.id, Reason: '用户主动取消' });
                    }

                    promise.then(r => {
                        if(r.code === 200) {
                            uni.showToast({ title: '取消成功' });
                            this.refreshList();
                        } else {
                            uni.showToast({ title: r.message || '取消失败', icon: 'none' });
                        }
                    });
                }
            }
        })
    },

    // 【新增】申请退款 (用于已付款订单)
    handleApplyRefund(item) {
        uni.showModal({
            title: '申请退款',
            editable: true,
            placeholderText: '请输入退款理由',
            content: '确定要申请退款吗？',
            success: (res) => {
                if(res.confirm) {
                    const reason = res.content || '用户申请退款';
                    applyCancelOrder({ OrderId: item.id, Reason: reason }).then(r => {
                        if(r.code === 200) {
                            uni.showToast({ title: '申请提交成功' });
                            this.refreshList();
                        } else {
                            uni.showToast({ title: r.message || '申请失败', icon: 'none' });
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
/* 保持原有样式 */
.container { background-color: #f5f5f5; min-height: 100vh; }
.tabs-box { background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #f5f5f5; }
.order-list { padding: 20rpx; }
.order-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; 
  .header { display: flex; justify-content: space-between; margin-bottom: 20rpx; font-size: 26rpx;
    .order-no { color: #666; display: flex; align-items: center; 
       .tag { font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 12rpx;}
       .prescription { background: #e6f1fc; color: #2979ff; border: 1px solid #a3d0fd; }
       .purchase { background: #fff7e6; color: #ff9900; border: 1px solid #ffe58f; }
       .no { font-weight: 500; color: #333; }
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