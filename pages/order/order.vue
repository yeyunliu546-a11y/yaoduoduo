<template>
  <view class="container">
    <mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ native: true }" @down="downCallback"
      @up="upCallback">

      <u-tabs :list="tabs" :is-scroll="true" :current="curTab" active-color="#FA2209" :duration="0.2"
        @change="onChangeTab" />

      <view class="order-list">
        <view class="order-item" v-for="(item, index) in list.data" :key="index">
          <view class="item-top">
            <view class="item-top-left">
              <text class="store-icon">🏭</text>
              <text class="store-name">{{ item.storeName }}</text>
              <text class="iconfont icon-arrow-right arrow"></text>
            </view>
            <view class="item-top-right">
              <text class="state-text">{{ item.state_text }}</text>
            </view>
          </view>
          
          <view class="goods-list" @click="handleTargetDetail(item.id)">
            <view class="goods-item" v-for="(goods, idx) in item.listSku" :key="idx">
              <view class="goods-image">
                <image class="image" :src="goods.skuImageUrl" mode="aspectFill"></image>
              </view>
              
              <view class="goods-content">
                <view class="goods-title">
                  <text class="twoline-hide">{{ goods.goodsName }}</text>
                </view>

                <view class="goods-tags" v-if="goods.tags && goods.tags.length">
                  <text v-for="(tag, tIndex) in goods.tags" :key="tIndex" 
                        class="tag" 
                        :class="getTagClass(tag)">{{ tag }}</text>
                </view>

                <view class="goods-props">
                  <text>规格：{{ goods.skuName }}</text>
                  </view>

                <view class="goods-sub-info" v-if="goods.unitPriceStr">
                  <text>{{ goods.unitPriceStr }}</text>
                </view>
                <view class="goods-sub-info" v-if="goods.expiryDate">
                  <text>有效期：{{ goods.expiryDate }}</text>
                </view>
              </view>

              <view class="goods-trade">
                <view class="goods-price">
                  <text class="unit">￥</text>
                  <text class="value">{{ goods.salePrice }}</text>
                </view>
                <view class="goods-num">
                  <text>×{{ goods.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="order-total">
            <text>共{{ item.goodsTotalNum }}件商品，实付款</text>
            <text class="unit">￥</text>
            <text class="money">{{ item.payPrice }}</text>
          </view>

          <view class="order-handle">
            <view class="btn-group clearfix">
              <block v-if="item.orderStatus === 10">
                <view class="btn-item" @click="onCancelOrder(item.id)">取消需求</view>
                <view class="btn-item active" @click="onPay(item.id)">去支付</view>
              </block>
              <block v-if="item.orderStatus === 20">
                <view class="btn-item" @click="onApplyCancelOrder(item.id)">取消订单</view>
                <view class="btn-item active">催发货</view>
              </block>
               <block v-if="item.orderStatus === 30">
                <view class="btn-item active" @click="onReceipt(item.id)">确认收货</view>
              </block>
			  <block v-if="item.orderStatus === 40">
			    <view class="btn-item active" @click="handleTargetComment(item.id)">去评价</view>
			  </block>
            </view>
          </view>

        </view>
      </view>
    </mescroll-body>
  </view>
</template>

<script>
import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'

const tabs = [
  { name: `全部`, value: 0 },
  { name: `待支付`, value: 10 },
  { name: `待发货`, value: 20 },
  { name: `待收货`, value: 30 },
  { name: `待评价`, value: 40 }
]

export default {
  components: { MescrollBody },
  mixins: [MescrollMixin],
  data() {
    return {
      tabs,
      curTab: 0,
      list: { data: [], limit: 10, count: 0 },
      // 模拟数据库：增加了医药相关的字段
      mockDatabase: [
        {
          id: 1005,
          storeName: '劲牌持正堂', 
          orderStatus: 10, 
          state_text: '待支付',
          createTime: '2025-12-11 19:30:00', 
          goodsTotalNum: 100, 
          payPrice: '82.00', 
          listSku: [{
            goodsName: '大蓟',
            skuName: '2.25g/9g',
            skuImageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Daji',
            salePrice: '0.82',
            quantity: 100,
            // --- 新增B端字段 ---
            tags: ['国标', '小包装'], 
            unitPriceStr: '相当于每g饮片￥0.09元',
            expiryDate: '2026-10-18'
          }]
        },
        {
          id: 1006,
          storeName: '凌霄花(美洲凌霄)', 
          orderStatus: 20, 
          state_text: '待发货',
          createTime: '2025-12-11 19:31:00',
          goodsTotalNum: 100, 
          payPrice: '66.00', 
          listSku: [{
            goodsName: '凌霄花(美洲凌霄)',
            skuName: '3.33g/5g',
            skuImageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=LingXiaohua',
            salePrice: '0.66',
            quantity: 100,
            // --- 新增B端字段 ---
            tags: ['省标', '瓶装', '近效期'],
            unitPriceStr: '相当于每g饮片￥0.13元',
            expiryDate: '2025-06-01'
          }]
        },
		{
          id: 1004,
          storeName: '劲牌持正堂', 
          orderStatus: 40, // 👈 待评价
          state_text: '待评价', // 👈 待评价
          createTime: '2025-05-15 10:00:00',
          goodsTotalNum: 100,
          payPrice: '1.2', 
          listSku: [{
            goodsName: '青皮',
            skuName: '省标',
            skuImageUrl: 'https://via.placeholder.com/150',
            salePrice: '120.00',
            quantity: 100,
            tags: ['大包装'], 
            unitPriceStr: '相当于每件￥1.2元',
            expiryDate: '2026-01-01'
          }]
        }
      ]
    }
  },
  onLoad(options) {
    if (options.bigOrderStatus != null) {
      const index = this.tabs.findIndex(item => item.value == options.bigOrderStatus)
      this.curTab = index > -1 ? index : 0
    }
  },
  methods: {
    // 辅助函数：根据标签名返回样式类
    getTagClass(tagName) {
      if (tagName.includes('国标')) return 'tag-blue';
      if (tagName.includes('省标')) return 'tag-blue';
      if (tagName.includes('小包装') || tagName.includes('大包装') || tagName.includes('瓶装')) return 'tag-green';
      if (tagName.includes('近效期')) return 'tag-red';
      return 'tag-blue'; // 默认
    },
    loadList(pageNo) {
        if (pageNo === 1) this.list.data = [];
        const currentStatus = this.tabs[this.curTab].value;
        setTimeout(() => {
            let filteredData = [];
            if (currentStatus === 0) {
                filteredData = this.mockDatabase.filter(item => item.orderStatus !== 99);
            } else if (currentStatus === 99) {
                filteredData = this.mockDatabase.filter(item => item.orderStatus === 99);
            } else {
                filteredData = this.mockDatabase.filter(item => item.orderStatus === currentStatus);
            }
            if (pageNo === 1) {
                this.list.data = filteredData;
            } else {
                this.list.data = this.list.data.concat(filteredData);
            }
            this.mescroll.endSuccess(filteredData.length, false);
        }, 500);
    },
    upCallback(page) {
      this.loadList(page.num);
    },
    onChangeTab(index) {
      this.curTab = index;
      this.list.data = []; 
      this.mescroll.resetUpScroll(); 
    },
    handleTargetDetail(orderId) {
      this.$navTo('pages/order/detail', { orderId });
    },
    // 模拟操作：取消
    onCancelOrder(id) {
      uni.showToast({ title: '模拟：订单 ' + id + ' 已取消', icon: 'none' });
    },
    // 模拟操作：支付
    onPay(id) {
      uni.showToast({ title: '模拟：跳转支付 ' + id, icon: 'none' });
    },
    // 模拟操作：收货
    onReceipt(id) {
      uni.showToast({ title: '模拟：确认收货 ' + id, icon: 'none' });
    },
    // 模拟操作：申请取消
    onApplyCancelOrder(id) {
       uni.showToast({ title: '模拟：申请取消 ' + id, icon: 'none' });
    },
    // 模拟操作：去评价
    handleTargetComment(id) {
      uni.showToast({ title: '模拟：去评价 ' + id, icon: 'none' });
	}
  }
}
</script>

<style lang="scss" scoped>
/* 1. 列表项容器 */
.order-item {
  margin: 20rpx auto;
  padding: 0 30rpx 30rpx; /* 调整padding */
  width: 94%;
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.05);
  border-radius: 16rpx;
  background: #fff;
}

/* 2. 头部店铺条 */
.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  border-bottom: 1rpx solid #f6f6f6;
  margin-bottom: 20rpx;
  
  .item-top-left {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    .store-icon { margin-right: 10rpx; font-size: 28rpx; }
    .arrow { font-size: 24rpx; color: #999; margin-left: 10rpx; margin-top: 4rpx;}
  }
  .state-text { color: #fa2209; font-size: 28rpx;}
}

/* 3. 商品列表区域 */
.goods-list .goods-item {
  display: flex;
  margin-bottom: 30rpx;
  
  .goods-image {
    width: 160rpx;
    height: 160rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
    .image { width: 100%; height: 100%; border-radius: 8rpx; background: #f8f8f8;}
  }
  
  .goods-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-right: 10rpx;
    
    .goods-title {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
      margin-bottom: 8rpx;
    }

    /* 标签样式 (复用购物车) */
    .goods-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 8rpx;
      .tag {
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 4rpx;
        margin-right: 10rpx;
        margin-bottom: 6rpx;
        border: 1px solid;
        
        &.tag-blue { color: #1890ff; border-color: #1890ff; }
        &.tag-green { color: #52c41a; border-color: #52c41a; }
        &.tag-red { color: #fa2209; border-color: #fa2209; background: #fff0f0;}
      }
    }
    
    .goods-props {
      font-size: 24rpx; 
      color: #999; 
      margin-bottom: 6rpx;
    }
    
    /* 辅助信息 (青色小字) */
    .goods-sub-info {
      font-size: 22rpx;
      color: #4ab7bd;
      margin-bottom: 4rpx;
    }
  }
  
  .goods-trade {
    text-align: right;
    min-width: 120rpx;
    .goods-price { 
      color: #fa2209; 
      font-weight: bold; 
      font-size: 30rpx; 
      margin-bottom: 10rpx;
      .unit { font-size: 24rpx; }
    }
    .goods-num { color: #999; font-size: 24rpx;}
  }
}

.order-total {
  text-align: right;
  font-size: 26rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #f8f8f8;
  color: #333;
  .money { font-size: 34rpx; font-weight: bold; color: #fa2209; margin-left: 6rpx;}
}

.order-handle {
  margin-top: 20rpx;
  .btn-group { display: flex; justify-content: flex-end;}
  .btn-item {
    padding: 12rpx 30rpx;
    border: 1rpx solid #ddd;
    border-radius: 30rpx;
    font-size: 26rpx;
    margin-left: 20rpx;
    color: #666;
    &.active { border-color: #fa2209; color: #fa2209; background: #fff5f5;}
  }
}
</style>
