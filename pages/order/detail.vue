<template>
  <view v-if="!isLoading" class="container">
    <view class="header">
      <view class="order-status">
        <text class="status-icon" v-if="order.orderStatus==10">⏳</text>
        <text class="status-icon" v-if="order.orderStatus==20">📦</text>
        <text class="status-text">{{ order.state_text }}</text>
      </view>
    </view>

    <view class="delivery-address i-card">
      <view class="link-man">
        <text class="name">{{ order.addressInfo.name }}</text>
        <text class="phone">{{ order.addressInfo.phone }}</text>
      </view>
      <view class="address">
        <text class="region">{{ order.addressInfo.fullAddress }}</text>
      </view>
    </view>

    <view class="goods-list i-card">
      <view class="shop-title">
         <text class="store-icon">🏭</text> {{ order.storeName }}
      </view>
      
      <view class="goods-item" v-for="(sku, idx) in order.listSku" :key="idx">
        <view class="goods-main">
          <view class="goods-image">
            <image class="image" :src="sku.skuImageUrl" mode="aspectFill"></image>
          </view>
          
          <view class="goods-content">
            <view class="goods-title">
              <text class="twoline-hide">{{ sku.goodsName }}</text>
            </view>
            
            <view class="goods-tags" v-if="sku.tags && sku.tags.length">
               <text v-for="(tag, tIndex) in sku.tags" :key="tIndex" 
                     class="tag" 
                     :class="getTagClass(tag)">{{ tag }}</text>
            </view>
            
            <view class="goods-props">
              <text>规格：{{ sku.skuName }}</text>
            </view>
            
            <view class="goods-sub-info" v-if="sku.unitPriceStr">
               <text>{{ sku.unitPriceStr }}</text>
            </view>
            <view class="goods-sub-info" v-if="sku.expiryDate">
               <text>有效期：{{ sku.expiryDate }}</text>
            </view>
          </view>
          
          <view class="goods-trade">
            <view class="goods-price">
              <text class="unit">￥</text>
              <text class="value">{{ sku.salePrice }}</text>
            </view>
            <view class="goods-num"><text>×{{ sku.quantity }}</text></view>
          </view>
        </view>
      </view>
    </view>

    <view class="order-info i-card">
      <view class="info-item">
        <view class="item-lable">订单编号</view>
        <view class="item-content"><text>{{ order.orderNo }}</text></view>
      </view>
      <view class="info-item">
        <view class="item-lable">下单时间</view>
        <view class="item-content"><text>{{ order.createTime }}</text></view>
      </view>
    </view>

    <view class="trade-info i-card">
      <view class="info-item">
        <view class="item-lable">商品总额</view>
        <view class="item-content"><text>￥{{ order.totalPrice }}</text></view>
      </view>
      <view class="info-item">
        <view class="item-lable">运费</view>
        <view class="item-content"><text>+￥0.00</text></view>
      </view>
      <view class="trade-total">
        <text class="lable">实付款</text>
        <view class="goods-price">
          <text class="unit">￥</text>
          <text class="value">{{ order.payPrice }}</text>
        </view>
      </view>
    </view>
    
    <view class="footer-fixed">
       <view class="btn-wrapper">
         <view class="btn-item">联系商家</view>
         <view class="btn-item active">再次购买</view>
       </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      isLoading: true,
      order: {}
    }
  },

  onLoad(options) {
    this.orderId = options.orderId
    this.getMockDetail()
  },

  methods: {
    getTagClass(tagName) {
      if (tagName.includes('国标')) return 'tag-blue';
      if (tagName.includes('省标')) return 'tag-blue';
      if (tagName.includes('小包装') || tagName.includes('大包装') || tagName.includes('瓶装')) return 'tag-green';
      if (tagName.includes('近效期')) return 'tag-red';
      return 'tag-blue'; 
    },
	
    // 模拟详情数据
    getMockDetail() {
      this.isLoading = true;
      setTimeout(() => {
        // 1. 先定义一个临时的对象 mockObj (不要直接用 this.order，防止报错)
        let mockObj = {
          id: this.orderId,
          storeName: '劲牌持正堂旗舰店',
          orderNo: 'ORDER' + new Date().getTime(),
          createTime: '2025-12-11 19:35:00',
          state_text: '待发货',
          orderStatus: 20, // 默认状态
          totalPrice: '164.00',
          payPrice: '164.00',
          addressInfo: {
            name: '王药师',
            phone: '139****1234',
            fullAddress: '湖北省武汉市某某区康复大药房'
          },
          listSku: [
            {
              goodsName: '大蓟',
              skuName: '2.25g/9g',
              skuImageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Daji',
              salePrice: '0.82',
              quantity: 100,
              tags: ['国标', '小包装'],
              unitPriceStr: '相当于每g饮片￥0.09元',
              expiryDate: '2026-10-18'
            },
            {
              goodsName: '凌霄花(美洲凌霄)',
              skuName: '3.33g/5g',
              skuImageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=LXH',
              salePrice: '0.82',
              quantity: 100,
              tags: ['省标', '瓶装', '近效期'],
              unitPriceStr: '相当于每g饮片￥0.13元',
              expiryDate: '2025-06-01'
            }
          ]
        };
        
        // 2. 特殊处理：如果是 1004 号订单，强制改为【待评价】
        // 注意：这里使用的是 mockObj，不是 detail，确保变量名一致
        if (this.orderId == 1004) {
            mockObj.orderStatus = 40;
            mockObj.state_text = '待评价';
        }

        // 3. 最后赋值给页面数据
        this.order = mockObj;
        this.isLoading = false;
      }, 500);
    },
	
	// 底部按钮点击事件
    onGoComment() {
      uni.showToast({ title: '模拟：跳转去评价页面', icon: 'none' });
    },
    onReBuy() {
      uni.showToast({ title: '模拟：已将商品加入购物车', icon: 'none' });
    },
  
    // 其他可能用到的模拟方法也一并修复
    onCancelOrder() {
      uni.showToast({ title: '模拟：订单已取消', icon: 'none' });
    },
    onPay() {
      uni.showToast({ title: '模拟：跳转支付', icon: 'none' });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 详情页样式与列表页保持一致，增加了一些细节 */
.container { padding-bottom: 120rpx; background: #f5f5f5; min-height: 100vh;}
.header { background: linear-gradient(to right, #e8c269, #cfa94d); height: 160rpx; display: flex; align-items: center; padding: 0 40rpx; color: #fff; font-size: 36rpx; font-weight: bold;}
.status-icon { margin-right: 16rpx; font-size: 40rpx; }

.i-card { background: #fff; margin: 20rpx; padding: 30rpx; border-radius: 16rpx; box-shadow: 0 1rpx 5rpx rgba(0,0,0,0.02);}
.delivery-address { margin-top: -30rpx; position: relative; z-index: 1;}
.link-man { font-size: 32rpx; font-weight: bold; margin-bottom: 12rpx; color: #333;}
.address { color: #666; font-size: 26rpx; line-height: 1.4;}

.shop-title { 
  font-weight: bold; font-size: 30rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #f8f8f8; margin-bottom: 20rpx; display: flex; align-items: center;
  .store-icon { margin-right: 10rpx; }
}

/* 商品布局 */
.goods-item { margin-bottom: 30rpx; border-bottom: 1rpx solid #fcfcfc; padding-bottom: 20rpx;}
.goods-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0;}
.goods-main { display: flex; }
.goods-image { width: 160rpx; height: 160rpx; border-radius: 8rpx; overflow: hidden; margin-right: 20rpx; flex-shrink: 0;}
.goods-image .image { width: 100%; height: 100%; background: #f8f8f8;}

.goods-content { flex: 1; margin-right: 10rpx;}
.goods-title { font-size: 28rpx; color: #333; margin-bottom: 10rpx;}

/* 标签样式复用 */
.goods-tags {
  display: flex; flex-wrap: wrap; margin-bottom: 10rpx;
  .tag {
    font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; margin-right: 10rpx; margin-bottom: 6rpx; border: 1px solid;
    &.tag-blue { color: #1890ff; border-color: #1890ff; }
    &.tag-green { color: #52c41a; border-color: #52c41a; }
    &.tag-red { color: #fa2209; border-color: #fa2209; background: #fff0f0;}
  }
}
.goods-props { color: #999; font-size: 24rpx; margin-bottom: 6rpx;}
.goods-sub-info { font-size: 22rpx; color: #4ab7bd; margin-bottom: 4rpx;}

.goods-trade { text-align: right; min-width: 120rpx;}
.goods-price { font-size: 30rpx; font-weight: bold; color: #fa2209; margin-bottom: 10rpx; .unit{font-size: 24rpx;}}
.goods-num { color: #999; font-size: 24rpx;}

.info-item { display: flex; justify-content: space-between; font-size: 26rpx; margin-bottom: 16rpx; color: #666;}
.trade-total { display: flex; justify-content: flex-end; align-items: baseline; padding-top: 20rpx; border-top: 1rpx solid #f8f8f8;}
.trade-total .lable { font-size: 28rpx; margin-right: 10rpx; color: #333;}
.trade-total .value { font-size: 36rpx; color: #fa2209; font-weight: bold;}

/* 底部按钮 */
.footer-fixed {
  position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 20rpx 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  .btn-wrapper { display: flex; justify-content: flex-end; }
  .btn-item {
    padding: 14rpx 34rpx; border: 1rpx solid #ddd; border-radius: 34rpx; font-size: 28rpx; color: #666; margin-left: 20rpx;
    &.active { border-color: #fa2209; color: #fa2209; background: #fff5f5;}
  }
}
</style>