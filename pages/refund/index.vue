<template>
  <view class="container">
    <view class="tabs-box">
      <u-tabs
        :list="tabs"
        :is-scroll="true"
        :current="curTab"
        active-color="#2979ff"
        @change="onChangeTab"
      ></u-tabs>
    </view>

    <view class="refund-list">
      <u-card
        v-for="(item, index) in refundList"
        :key="item.id || index"
        :border="false"
        margin="24rpx 24rpx 0"
        border-radius="16"
        :head-style="{ padding: '24rpx 24rpx 0' }"
        :body-style="{ padding: '20rpx 24rpx' }"
        :foot-style="{ padding: '0 24rpx 24rpx' }"
      >
        <template v-slot:head>
          <view class="card-head">
            <text class="order-no">售后单号：{{ item.refundNo || item.orderNo || '--' }}</text>
            <text class="status" :class="{ danger: item.statusValue < 0 }">{{ item.statusName }}</text>
          </view>
        </template>

        <template v-slot:body>
          <view class="goods-row" @click.stop="handleTargetDetail(item.id)">
            <image :src="item.imageUrl" mode="aspectFill" class="thumb"></image>
            <view class="goods-info">
              <view class="goods-name u-line-2">{{ item.goodsName }}</view>
              <view class="goods-spec">{{ item.skuName || '默认规格' }}</view>
              <view class="refund-meta">
                <text>{{ item.refundTypeName }}</text>
                <text class="quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>

          <view class="amount-row">
            <text class="label">退款金额</text>
            <text class="amount">¥{{ item.refundAmount }}</text>
          </view>
          <view class="time-row" v-if="item.createTime">申请时间：{{ item.createTime }}</view>
        </template>

        <template v-slot:foot>
          <view class="operate-row">
            <view class="btn plain" @click.stop="handleTargetDetail(item.id)">查看详情</view>
          </view>
        </template>
      </u-card>

      <u-empty
        v-if="!isLoading && refundList.length === 0"
        mode="order"
        text="暂无退款/售后记录"
        margin-top="120"
      ></u-empty>
      <u-loadmore
        v-if="refundList.length > 0"
        :status="loadStatus"
        margin-top="30"
        margin-bottom="30"
      ></u-loadmore>
    </view>
  </view>
</template>

<script>
import { getRefundList } from '@/api/order/order.js'

const pageSize = 10
const tabs = [
  { name: '全部', value: '' },
  { name: '待处理', value: 10 }
]

function pickFirst(...values) {
  const target = values.find(value => value !== undefined && value !== null && value !== '')
  return target === undefined ? '' : target
}

function getCode(res = {}) {
  return pickFirst(res.code, res.Code)
}

function getResult(res = {}) {
  return pickFirst(res.result, res.Result, res.data, {})
}

function normalizeListPayload(res = {}) {
  const result = getResult(res)
  if (Array.isArray(result)) {
    return { list: result, count: pickFirst(res.count, res.Count, result.length) }
  }

  const list = pickFirst(
    result.list,
    result.List,
    result.rows,
    result.Rows,
    result.data,
    result.Data,
    result.items,
    result.Items,
    []
  )
  return {
    list: Array.isArray(list) ? list : [],
    count: pickFirst(result.count, result.Count, result.total, result.Total, res.count, res.Count, 0)
  }
}

export default {
  data() {
    return {
      tabs,
      curTab: 0,
      refundList: [],
      page: 1,
      isLoading: false,
      loadStatus: 'loadmore'
    }
  },

  onLoad(options = {}) {
    const bigStatus = pickFirst(options.bigStatus, options.status, options.refundStatus)
    if (bigStatus !== '') {
      const index = this.tabs.findIndex(item => String(item.value) === String(bigStatus))
      this.curTab = index > -1 ? index : 0
    }
    this.refreshList()
  },

  onPullDownRefresh() {
    this.refreshList()
  },

  onReachBottom() {
    if (this.loadStatus !== 'loadmore') return
    this.page += 1
    this.loadData()
  },

  methods: {
    onChangeTab(index) {
      this.curTab = index
      this.refreshList()
    },

    refreshList() {
      this.page = 1
      this.refundList = []
      this.loadStatus = 'loading'
      this.loadData()
    },

    loadData() {
      if (this.isLoading) return
      this.isLoading = true
      this.loadStatus = 'loading'

      const bigStatus = this.tabs[this.curTab].value
      const params = {
        page: this.page,
        limit: pageSize,
        onlyMy: true
      }
      if (bigStatus !== '') {
        params.bigStatus = bigStatus
      }

      getRefundList(params).then(res => {
        if (String(getCode(res)) === '200') {
          const payload = normalizeListPayload(res)
          const list = payload.list.map(item => this.normalizeRefundItem(item))
          this.refundList = this.page === 1 ? list : [...this.refundList, ...list]
          this.loadStatus = list.length < pageSize || this.refundList.length >= Number(payload.count || 0) ? 'nomore' : 'loadmore'
        } else {
          this.loadStatus = this.page === 1 ? 'loadmore' : 'nomore'
          uni.showToast({ title: res.message || res.Message || '获取售后列表失败', icon: 'none' })
        }
      }).catch(() => {
        this.loadStatus = this.page === 1 ? 'loadmore' : 'nomore'
        uni.showToast({ title: '获取售后列表失败', icon: 'none' })
      }).finally(() => {
        this.isLoading = false
        uni.stopPullDownRefresh()
      })
    },

    normalizeRefundItem(item = {}) {
      const sku = item.sku || item.goods || item.orderSku || item.OrderSku || {}
      const statusValue = Number(pickFirst(item.status, item.Status, item.refundStatus, item.RefundStatus, item.auditStatus, item.AuditStatus, 0))
      return {
        id: pickFirst(item.id, item.Id, item.orderRefundSkuId, item.OrderRefundSkuId, item.order_refund_id, item.refundId, item.RefundId),
        refundNo: pickFirst(item.refundNo, item.RefundNo, item.orderRefundNo, item.OrderRefundNo),
        orderNo: pickFirst(item.orderNo, item.OrderNo, item.subOrderNo, item.SubOrderNo),
        statusValue,
        statusName: pickFirst(item.strStatus, item.StrStatus, item.statusName, item.StatusName, item.strRefundStatus, item.StrRefundStatus, this.getStatusName(statusValue)),
        refundTypeName: pickFirst(item.strRefundType, item.StrRefundType, item.refundTypeName, item.RefundTypeName, '退款/售后'),
        sellerMark: pickFirst(item.sellerMark, item.SellerMark, ''),
        imageUrl: pickFirst(item.urlSkuThumbnail, item.UrlSkuThumbnail, item.skuImageUrl, item.SkuImageUrl, item.imageUrl, item.ImageUrl, sku.skuImageUrl, sku.imageUrl, '/static/empty.png'),
        goodsName: pickFirst(item.goodsName, item.GoodsName, sku.goodsName, sku.GoodsName, '未知商品'),
        skuName: pickFirst(item.skuName, item.SkuName, item.spec, item.Spec, sku.skuName, sku.SkuName, ''),
        quantity: pickFirst(item.quantity, item.Quantity, item.goodsNum, item.GoodsNum, sku.quantity, sku.Quantity, 1),
        refundAmount: this.formatPrice(pickFirst(item.amountExpectRefund, item.AmountExpectRefund, item.refundAmount, item.RefundAmount, item.payPrice, item.PayPrice, 0)),
        createTime: pickFirst(item.createTime, item.CreateTime, item.applyTime, item.ApplyTime, '')
      }
    },

    getStatusName(status) {
      const map = {
        '-10': '已拒绝',
        '10': '待审核',
        '20': '审核通过',
        '30': '用户已发货',
        '40': '已收货',
        '80': '已退款'
      }
      return map[String(status)] || '退款/售后'
    },

    formatPrice(value) {
      const number = Number(value || 0)
      return Number.isNaN(number) ? '0.00' : number.toFixed(2)
    },

    handleTargetDetail(orderRefundSkuId) {
      if (!orderRefundSkuId) {
        uni.showToast({ title: '缺少售后单参数', icon: 'none' })
        return
      }
      uni.navigateTo({ url: `/pages/refund/detail?orderRefundSkuId=${encodeURIComponent(orderRefundSkuId)}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.tabs-box {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
}

.refund-list {
  padding-bottom: 30rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .order-no {
    flex: 1;
    min-width: 0;
    color: #333;
    font-size: 26rpx;
  }

  .status {
    margin-left: 20rpx;
    color: #2979ff;
    font-size: 26rpx;

    &.danger {
      color: #fa3534;
    }
  }
}

.goods-row {
  display: flex;
  padding: 20rpx;
  background-color: #f8f9fb;
  border-radius: 12rpx;
}

.thumb {
  width: 150rpx;
  height: 150rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  background-color: #f0f0f0;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.goods-spec {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.refund-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18rpx;
  color: #666;
  font-size: 24rpx;

  .quantity {
    color: #999;
  }
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 18rpx;
  font-size: 26rpx;

  .label {
    color: #666;
    margin-right: 12rpx;
  }

  .amount {
    color: #fa3534;
    font-size: 32rpx;
    font-weight: 600;
  }
}

.time-row {
  margin-top: 12rpx;
  color: #999;
  font-size: 24rpx;
  text-align: right;
}

.operate-row {
  display: flex;
  justify-content: flex-end;
}

.btn {
  min-width: 148rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  border-radius: 28rpx;
  font-size: 26rpx;

  &.plain {
    color: #2979ff;
    border: 1rpx solid #2979ff;
    background-color: #fff;
  }
}
</style>
