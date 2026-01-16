<template>
  <view class="container">
    <view v-if="list.length" class="coupon-list">
      <view class="coupon-item" v-for="(item, index) in list" :key="index">
        <view class="item-wrapper"
          :class="[ item.status==10 ? 'color-' + color[index % color.length] : 'color-gray' ]">
          <view class="coupon-type">{{item.strCouponType}}</view>
          <view class="tip dis-flex flex-dir-column flex-x-center">
            <view>
              <text class="f-30">￥</text>
              <text class="money">{{ item.reducePrice }}</text>
            </view>
            <text class="pay-line">满{{ item.minPrice }}元可用</text>
          </view>
          <view class="split-line"></view>
          <view class="content dis-flex flex-dir-column flex-x-between">
            <view class="title oneline-hide">{{ item.name }}</view>
            <view class="bottom dis-flex flex-y-center">
              <view class="time flex-box">
                <text v-if="item.expireType == 10">领取{{ item.expireDay }}天内有效</text>
                <text v-if="item.expireType == 20">
                  <block v-if="item.startTime === item.endTime">{{ item.startTime }} 当天有效</block>
                  <block v-else>{{ item.startTime }}~{{ item.endTime }}</block>
                </text>
              </view>
              <view class="receive" v-if="item.status==10" @click="receive(item.id)">
                <text>立即领取</text>
              </view>
              <view v-else class="receive state">
                <text>{{ item.strStatus }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <empty v-if="!list.length" :isLoading="isLoading" />
  </view>
</template>

<script>
  // import * as CouponApi from '@/api/user/coupon' // [模拟修改] 注释掉后端API
  import { CouponTypeEnum } from '@/common/enum/coupon'
  import Empty from '@/components/empty'

  const color = ['red', 'blue', 'violet', 'yellow']

  export default {
    components: {
      Empty
    },
    data() {
      return {
        // 枚举类
        CouponTypeEnum,
        // 颜色组
        color,
        // 优惠券列表
        list: [],
        // 正在加载中
        isLoading: true
      }
    },

    onLoad(options) {
      // 获取优惠券列表
      this.getCouponList()
    },

    methods: {

      /**
       * [模拟] 获取优惠券列表
       */
      getCouponList(load = true) {
        const app = this
        if(load) app.isLoading = true;
        
        // 模拟网络延迟 0.5秒
        setTimeout(() => {
          // 构造模拟数据
          const mockList = [
            {
              id: 101,
              name: '新人全场通用红包',
              strCouponType: '全场券',
              reducePrice: '10.00',
              minPrice: '100.00',
              status: 10, // 10: 可领取
              strStatus: '立即领取',
              expireType: 10, // 10: 天数
              expireDay: 7
            },
            {
              id: 102,
              name: '限时满减福利券',
              strCouponType: '满减券',
              reducePrice: '50.00',
              minPrice: '300.00',
              status: 10,
              strStatus: '立即领取',
              expireType: 20, // 20: 时间段
              startTime: '2023-12-01',
              endTime: '2023-12-31'
            },
            {
              id: 103,
              name: '仅限感冒类药品使用',
              strCouponType: '品类券',
              reducePrice: '5.00',
              minPrice: '20.00',
              status: 20, // 20: 已领取
              strStatus: '已领取',
              expireType: 10,
              expireDay: 30
            },
            {
              id: 104,
              name: '大额店铺优惠券',
              strCouponType: '店铺券',
              reducePrice: '100.00',
              minPrice: '999.00',
              status: 30, // 30: 已抢光
              strStatus: '已抢光',
              expireType: 20,
              startTime: '2023-11-01',
              endTime: '2023-11-15'
            }
          ];
          
          app.list = mockList;
          app.isLoading = false;
        }, 500);
      },

      // [模拟] 立即领取
      receive(couponId) {
        const app = this
        uni.showLoading({ title: '领取中...' });
        
        setTimeout(() => {
          // 1. 在列表中找到该优惠券
          const index = app.list.findIndex(item => item.id === couponId);
          
          if(index !== -1) {
            // 2. 修改状态为已领取
            // 注意：这里为了界面刷新，直接修改对象属性可能需要$set，或者直接替换
            app.list[index].status = 20;
            app.list[index].strStatus = '已领取';
            
            uni.hideLoading();
            // 提示成功 (如果没有 app.$success，改用 uni.showToast)
            if (app.$success) {
               app.$success('领取成功');
            } else {
               uni.showToast({ title: '领取成功', icon: 'success' });
            }
          }
        }, 600);
      }

    }
  }
</script>

<style lang="scss" scoped>
  .coupon-list {
    padding: 20rpx;
  }

  .coupon-item {
    position: relative;
    overflow: hidden;
    margin-bottom: 22rpx;
  }

  .item-wrapper {
    width: 100%;
    display: flex;
    background: #fff;
    border-radius: 8rpx;
    color: #fff;
    height: 180rpx;

    .coupon-type {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
      width: 128rpx;
      padding: 3px 0;
      background: #a771ff;
      font-size: 20rpx;
      text-align: center;
      color: #ffffff;
      transform: rotate(45deg);
      transform-origin: 64rpx 64rpx;
    }

    &.color-blue {
      background: linear-gradient(-125deg, #57bdbf, #2f9de2);
    }

    &.color-red {
      background: linear-gradient(-128deg, #ff6d6d, #ff3636);
    }

    &.color-violet {
      background: linear-gradient(-113deg, #ef86ff, #b66ff5);

      .coupon-type {
        background: #55b5ff;
      }
    }

    &.color-yellow {
      background: linear-gradient(-141deg, #f7d059, #fdb054);
    }

    &.color-gray {
      background: linear-gradient(-113deg, #bdbdbd, #a2a1a2);

      .coupon-type {
        background: #9e9e9e;
      }
    }

    .content {
      flex: 1;
      padding: 30rpx 20rpx;
      border-radius: 8px 0 0 8px;

      .title {
        width: 400rpx;
        font-size: 32rpx;
      }

      .bottom {
        .time {
          font-size: 24rpx;
        }

        .receive {
          height: 46rpx;
          width: 122rpx;
          line-height: 46rpx;
          text-align: center;
          border: 1px solid #fff;
          border-radius: 30rpx;
          color: #fff;
          font-size: 24rpx;

          &.state {
            border: none;
          }
        }
      }
    }

    .tip {
      position: relative;
      flex: 0 0 32%;
      text-align: center;
      border-radius: 0 8px 8px 0;

      .money {
        font-weight: bold;
        font-size: 52rpx;
      }

      .pay-line {
        font-size: 22rpx;
      }
    }

    .split-line {
      position: relative;
      flex: 0 0 0;
      border-left: 4rpx solid #fff;
      margin: 0 5px 0 3px;
      background: #fff;

      &:before,
      {
        border-radius: 0 0 16rpx 16rpx;
        top: 0;
      }

      &:after {
        border-radius: 16rpx 16rpx 0 0;
        bottom: 0;
      }

      &:before,
      &:after {
        content: '';
        position: absolute;
        width: 24rpx;
        height: 12rpx;
        background: #f7f7f7;
        left: -14rpx;
        z-index: 1;
      }
    }
  }
</style>