<template>
  <view class="container">
    <mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ native: true }" @down="downCallback"
      :up="upOption" @up="upCallback">

      <u-tabs :list="tabs" :is-scroll="false" :current="curTab" active-color="#FA2209" :duration="0.2"
        @change="onChangeTab" />

      <view class="widget-list">
        <view class="widget-detail" v-for="(item, index) in list.data" :key="index">
          <view class="row-block dis-flex flex-y-center">
            <view class="flex-box">{{ item.createTime }}</view>
            <view class="flex-box t-r">
              <text class="col-m">{{ item.strStatus }}</text>
            </view>
          </view>
          <view class="detail-goods row-block dis-flex" @click.stop="handleTargetDetail(item.order_refund_id)">
            <view class="goods-image">
              <image class="image" :src="item.urlSkuThumbnail" mode="aspectFit"></image>
            </view>
            <view class="goods-right flex-box">
              <view class="goods-name">
                <text class="twoline-hide">{{ item.goodsName }}</text>
              </view>
              <view class="goods-props clearfix">
                <view class="goods-props-item" >
                  <text>{{ item.skuName }}</text>
                </view>
              </view>
              <view class="goods-num t-r">
                <text class="f-26 col-8">×{{ item.quantity }}</text>
              </view>
            </view>
          </view>
          <view class="detail-order row-block">
            <view class="item dis-flex flex-x-end flex-y-center">
              <text class="">付款金额：</text>
              <text class="col-m">￥{{ item.amountExpectRefund }}</text>
            </view>
          </view>
          <view class="detail-operate row-block dis-flex flex-x-end flex-y-center">
            <view class="detail-btn btn-detail" @click.stop="handleTargetDetail(item.order_refund_id)">查看详情</view>
          </view>
        </view>
      </view>

    </mescroll-body>

  </view>
</template>

<script>
  import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
  import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
  import { getEmptyPaginateObj, getMoreListData } from '@/core/app'
  // import * as RefundApi from '@/api/order/orderRefundSku' // [模拟修改] 注释API

  // 每页记录数量
  const pageSize = 15

  // tab栏数据
  const tabs = [{
    name: '全部',
    value: 0
  }, {
    name: '待处理',
    value: 10
  }]

  // [模拟修改] 模拟数据源
  const mockRefundList = [
    { 
      order_refund_id: 101, 
      createTime: '2023-12-12 10:00:00', 
      strStatus: '售后审核中', 
      status: 10, // 待处理
      urlSkuThumbnail: 'https://via.placeholder.com/200x200', 
      goodsName: '枸杞', 
      skuName: '小包装', 
      quantity: 100, 
      amountExpectRefund: '29.9' 
    },
    { 
      order_refund_id: 102, 
      createTime: '2023-12-10 14:30:00', 
      strStatus: '同意退货', 
      status: 20, 
      urlSkuThumbnail: 'https://via.placeholder.com/200x200', 
      goodsName: '青皮', 
      skuName: '小包装', 
      quantity: 200, 
      amountExpectRefund: '160.0' 
    }
  ]

  export default {
    components: {
      MescrollBody
    },
    mixins: [MescrollMixin],
    data() {
      return {
        // 订单列表数据
        list: getEmptyPaginateObj(),
        // tabs栏数据
        tabs,
        // 当前标签索引
        curTab: 0,
        // 上拉加载配置
        upOption: {
          auto: true,
          page: { size: pageSize },
          noMoreSize: 2,
          empty: {
            tip: '亲，暂无售后单记录'
          }
        },
        canReset: false,
      }
    },

    onShow() {
      this.canReset && this.onRefreshList()
    },

    methods: {

      upCallback(page) {
        const app = this
        app.getRefundList(page.num)
          .then(list => {
            const curlimit = list.data.length
            app.mescroll.endBySize(curlimit, list.count)
          })
          .catch(() => app.mescroll.endErr())
      },

      // [模拟修改] 获取退款/售后单列表
      getRefundList(pageNo = 1) {
        const app = this
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // 1. 获取当前 Tab 状态 (0:全部, 10:待处理)
            const currentStatus = app.getTabValue()
            
            // 2. 筛选数据
            let filtered = mockRefundList
            if (currentStatus == 10) {
                filtered = mockRefundList.filter(item => item.status == 10)
            }

            // 3. 模拟分页
            const total = filtered.length
            const start = (pageNo - 1) * pageSize
            const end = start + pageSize
            const pageData = filtered.slice(start, end)

            // 4. 返回结构
            const res = {
                result: pageData,
                count: total
            }

            app.list.count = res.count
            app.list.data = getMoreListData(res.result, app.list, pageNo)
            resolve(app.list)
          }, 500)
        })
      },

      onChangeTab(index) {
        const app = this
        app.curTab = index
        app.onRefreshList()
      },

      onRefreshList() {
        this.list = getEmptyPaginateObj()
        setTimeout(() => {
          this.mescroll.resetUpScroll()
        }, 120)
      },

      getTabValue() {
        return this.tabs[this.curTab].value
      },

      handleTargetDetail(orderRefundSkuId) {
        this.$navTo('pages/refund/detail', { orderRefundSkuId })
      },

    }
  }
</script>

<style lang="scss" scoped>
  .widget-detail {
    box-sizing: border-box;
    background: #fff;
    margin-bottom: 20rpx;

    .row-block {
      padding: 0 20rpx;
      min-height: 70rpx;
    }

    .detail-goods {
      padding: 20rpx;
      background: #f9f9f9;

      .goods-image {
        margin-right: 20rpx;

        .image {
          display: block;
          width: 200rpx;
          height: 200rpx;
        }
      }

      .goods-right {
        padding: 15rpx 0;
      }

      .goods-name {
        margin-bottom: 10rpx;
      }


      .goods-props {
        margin-top: 14rpx;
        height: 40rpx;
        color: #ababab;
        font-size: 24rpx;
        overflow: hidden;

        .goods-props-item {
          display: inline-block;
          margin-right: 14rpx;
          padding: 4rpx 16rpx;
          border-radius: 12rpx;
          background-color: #F5F5F5;
          width: auto;
        }
      }

    }

    .detail-operate {
      padding-bottom: 20rpx;

      .detail-btn {
        border-radius: 4px;
        border: 1rpx solid #ccc;
        padding: 8rpx 20rpx;
        font-size: 28rpx;
        color: #555;
        margin-left: 10rpx;
      }
    }

    .detail-order {
      padding: 10rpx 20rpx;
      font-size: 26rpx;
      line-height: 50rpx;
      height: 50rpx;

      .item {
        margin-bottom: 10rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
</style>
