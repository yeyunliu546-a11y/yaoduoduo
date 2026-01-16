<template>
  <view class="container">
    <mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ use: false }" :up="upOption"
      @up="upCallback">
      <view class="log-list">
        <view v-for="(item, index) in list.data" :key="index" class="log-item">
          <view class="item-left flex-box">
            <view class="rec-status">
              <text>{{ '充值成功' }}</text>
            </view>
            <view class="rec-time">
              <text>{{ item.payTime }}</text>
            </view>
          </view>
          <view class="item-right">
            <text>+{{ item.actualMoney }}元</text>
          </view>
        </view>
      </view>
    </mescroll-body>
  </view>
</template>

<script>
  import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
  import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
  // import * as RechargeOrderApi from '@/api/recharge/rechargeOrder' // [模拟修改]
  import { getEmptyPaginateObj, getMoreListData } from '@/core/app'

  // [模拟修改] 模拟充值记录数据
  const mockRechargeOrders = [
    { id: 1, actualMoney: '100.00', payTime: '2023-12-12 10:00:00' },
    { id: 2, actualMoney: '50.00', payTime: '2023-12-10 14:30:00' },
    { id: 3, actualMoney: '200.00', payTime: '2023-11-20 09:15:00' },
    { id: 4, actualMoney: '30.00', payTime: '2023-11-11 11:11:11' },
    { id: 5, actualMoney: '500.00', payTime: '2023-10-01 08:00:00' },
    { id: 6, actualMoney: '100.00', payTime: '2023-09-15 18:20:00' },
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
       	// 上拉加载配置
       	upOption: {
       	  auto: true,
       	  page: { size: 10 }, // 默认每页10条
       	  noMoreSize: 5, // 数据少于5条时不显示无更多
          empty: {
            tip: '暂无充值记录'
          }
       	},
       }
    },

    methods: {
      upCallback(page) {
        const app = this
        app.loadList(page.num).then(list => {
			 const curlimit = list.data.length
			 app.mescroll.endBySize(curlimit, list.count)
          }).catch(() => app.mescroll.endErr())
      },
      
      // [模拟修改] 分页列表
      loadList(pageNo = 1) {
       const app = this
       return new Promise((resolve, reject) => {
           setTimeout(() => {
               // 模拟分页
               const total = mockRechargeOrders.length
               const pageSize = app.upOption.page.size
               const start = (pageNo - 1) * pageSize
               const end = start + pageSize
               const pageData = mockRechargeOrders.slice(start, end)
               
               const res = {
                   result: pageData,
                   count: total
               }
               
               app.list.count = res.count
               app.list.data = getMoreListData(res.result, app.list, pageNo)
               resolve(app.list)
           }, 500)
       	  })
      }

    }
  }
</script>

<style lang="scss" scoped>
  page,
  .container {
    background: #fff;
  }

  .log-list {
    padding: 0 30rpx;
  }

  .log-item {
    font-size: 28rpx;
    padding: 20rpx 20rpx;
    line-height: 1.8;
    border-bottom: 1rpx solid rgb(238, 238, 238);
    display: flex;
    justify-content: space-between; /* 优化布局：两端对齐 */
    align-items: center;
  }
  
  .item-left {
      flex: 1;
  }
  
  .item-right {
      font-weight: bold;
      color: #333;
  }

  .rec-status {
    color: #333;
    font-size: 30rpx;
  }

  .rec-time {
    color: rgb(160, 160, 160);
    font-size: 24rpx;
    margin-top: 6rpx;
  }
</style>