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
        :key="`${item.type}-${item.id || index}`"
        :border="false"
        margin="24rpx 24rpx 0"
        border-radius="12"
        :head-style="{ padding: '24rpx 24rpx 0' }"
        :body-style="{ padding: '20rpx 24rpx' }"
        :foot-style="{ padding: '0 24rpx 24rpx' }"
      >
        <template v-slot:head>
          <view class="card-head">
            <text class="order-no">{{ item.noLabel }}：{{ item.refundNo || item.orderNo || '--' }}</text>
            <text class="status" :class="{ danger: item.statusValue < 0 }">{{ item.statusName }}</text>
          </view>
        </template>

        <template v-slot:body>
          <view class="goods-row" @click.stop="handleTargetDetail(item)">
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
            <text class="label">{{ item.amountLabel }}</text>
            <text class="amount">¥{{ item.refundAmount }}</text>
          </view>
          <view class="reject-row" v-if="item.showRejectReason">
            拒绝原因：{{ item.sellerMark }}
          </view>
          <view class="time-row" v-if="item.createTime">申请时间：{{ item.createTime }}</view>
        </template>

        <template v-slot:foot>
          <view class="operate-row">
            <view class="btn plain" @click.stop="handleTargetDetail(item)">查看详情</view>
          </view>
        </template>
      </u-card>

      <u-empty
        v-if="!isLoading && refundList.length === 0"
        mode="order"
        :text="emptyText"
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
import { getCancelOrderList, getRefundList } from '@/api/order/order.js'

const pageSize = 10
const tabs = [
  { name: '售后退款', type: 'refund', bigStatus: '' },
  { name: '售后待处理', type: 'refund', bigStatus: 10 },
  { name: '申请取消', type: 'cancel' }
]

function pickFirst(...values) {
  const target = values.find(value => value !== undefined && value !== null && value !== '')
  return target === undefined ? '' : target
}

function isRejectStatus(value) {
  if (value === undefined || value === null || value === '') return false
  if (Number(value) === -10) return true
  const text = String(value)
  return text.indexOf('\u62d2\u7edd') > -1 || text.indexOf('\u9a73\u56de') > -1
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

  computed: {
    currentTab() {
      return this.tabs[this.curTab] || this.tabs[0]
    },

    emptyText() {
      return this.currentTab.type === 'cancel' ? '暂无申请取消订单' : '暂无退款/售后记录'
    }
  },

  onLoad(options = {}) {
    if (options.type === 'cancel') {
      this.curTab = this.tabs.findIndex(item => item.type === 'cancel')
    } else {
      const bigStatus = pickFirst(options.bigStatus, options.status, options.refundStatus)
      if (bigStatus !== '') {
        const index = this.tabs.findIndex(item => item.type === 'refund' && String(item.bigStatus) === String(bigStatus))
        this.curTab = index > -1 ? index : 0
      }
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

      const requestTask = this.currentTab.type === 'cancel' ? this.loadCancelOrders() : this.loadRefundOrders()
      requestTask.finally(() => {
        this.isLoading = false
        uni.stopPullDownRefresh()
      })
    },

    loadRefundOrders() {
      const params = {
        page: this.page,
        limit: pageSize,
        onlyMy: true
      }
      if (this.currentTab.bigStatus !== '') {
        params.bigStatus = this.currentTab.bigStatus
      }

      return getRefundList(params).then(res => {
        if (String(getCode(res)) === '200') {
          const payload = normalizeListPayload(res)
          const list = payload.list.map(item => this.normalizeRefundItem(item))
          this.applyListResult(list, payload.count)
        } else {
          this.handleLoadError(res.message || res.Message || '获取售后列表失败')
        }
      }).catch(() => {
        this.handleLoadError('获取售后列表失败')
      })
    },

    loadCancelOrders() {
      return getCancelOrderList({
        page: this.page,
        limit: pageSize
      }).then(res => {
        if (String(getCode(res)) === '200') {
          const payload = normalizeListPayload(res)
          const list = payload.list.map(item => this.normalizeCancelItem(item))
          this.applyListResult(list, payload.count)
        } else {
          this.handleLoadError(res.message || res.Message || '获取申请取消订单失败')
        }
      }).catch(() => {
        this.handleLoadError('获取申请取消订单失败')
      })
    },

    applyListResult(list, count) {
      this.refundList = this.page === 1 ? list : [...this.refundList, ...list]
      this.loadStatus = list.length < pageSize || this.refundList.length >= Number(count || 0) ? 'nomore' : 'loadmore'
    },

    handleLoadError(message) {
      this.loadStatus = this.page === 1 ? 'loadmore' : 'nomore'
      uni.showToast({ title: message, icon: 'none' })
    },

    normalizeRefundItem(item = {}) {
      const sku = item.sku || item.goods || item.orderSku || item.OrderSku || {}
      const statusValue = Number(pickFirst(item.status, item.Status, item.refundStatus, item.RefundStatus, 0))
      const refundType = Number(pickFirst(item.refundType, item.RefundType, 0))
      const statusName = pickFirst(item.strStatus, item.StrStatus, item.statusName, item.StatusName, this.getRefundStatusName(statusValue))
      const sellerMark = pickFirst(item.sellerMark, item.SellerMark, '')
      return {
        type: 'refund',
        noLabel: '售后单号',
        amountLabel: '退款金额',
        id: pickFirst(item.id, item.Id, item.orderRefundSkuId, item.OrderRefundSkuId, item.refundId, item.RefundId),
        refundNo: pickFirst(item.refundNo, item.RefundNo, item.orderRefundNo, item.OrderRefundNo),
        orderNo: pickFirst(item.orderNo, item.OrderNo, item.subOrderNo, item.SubOrderNo),
        statusValue,
        statusName,
        refundType,
        refundTypeName: pickFirst(item.strRefundType, item.StrRefundType, this.getRefundTypeName(refundType)),
        sellerMark,
        showRejectReason: !!sellerMark && (isRejectStatus(statusValue) || isRejectStatus(statusName)),
        imageUrl: pickFirst(item.urlSkuThumbnail, item.UrlSkuThumbnail, item.skuImageUrl, item.SkuImageUrl, item.imageUrl, item.ImageUrl, sku.skuImageUrl, sku.imageUrl, '/static/empty.png'),
        goodsName: pickFirst(item.goodsName, item.GoodsName, sku.goodsName, sku.GoodsName, '未知商品'),
        skuName: pickFirst(item.skuName, item.SkuName, item.spec, item.Spec, sku.skuName, sku.SkuName, ''),
        quantity: pickFirst(item.refundQuantity, item.RefundQuantity, item.quantity, item.Quantity, item.goodsNum, item.GoodsNum, sku.quantity, sku.Quantity, 1),
        refundAmount: this.formatPrice(pickFirst(item.amountExpectRefund, item.AmountExpectRefund, item.refundAmount, item.RefundAmount, item.payPrice, item.PayPrice, 0)),
        createTime: pickFirst(item.createTime, item.CreateTime, item.applyTime, item.ApplyTime, '')
      }
    },

    normalizeCancelItem(item = {}) {
      const rawGoods = item.listSku || item.ListSku || item.goodsList || item.GoodsList || item.orderGoodsList || item.items || []
      const firstGoods = Array.isArray(rawGoods) ? (rawGoods[0] || {}) : {}
      const sku = firstGoods.sku || firstGoods.goods || firstGoods
      const statusValue = Number(pickFirst(item.orderStatus, item.OrderStatus, -20))
      return {
        type: 'cancel',
        noLabel: '订单编号',
        amountLabel: '订单金额',
        id: pickFirst(item.id, item.Id, item.orderId, item.OrderId),
        orderNo: pickFirst(item.orderNo, item.OrderNo, '--'),
        orderType: pickFirst(item.orderType, item.OrderType, 1),
        statusValue,
        statusName: pickFirst(item.strOrderStatus, item.StrOrderStatus, item.orderStatusName, item.OrderStatusName, this.getOrderStatusName(statusValue)),
        refundTypeName: '申请取消订单',
        sellerMark: pickFirst(item.cancelRemark, item.CancelRemark, ''),
        imageUrl: pickFirst(firstGoods.skuImageUrl, firstGoods.SkuImageUrl, firstGoods.imageUrl, firstGoods.ImageUrl, sku.skuImageUrl, sku.imageUrl, '/static/empty.png'),
        goodsName: pickFirst(firstGoods.goodsName, firstGoods.GoodsName, sku.goodsName, sku.GoodsName, '整单取消申请'),
        skuName: pickFirst(firstGoods.skuName, firstGoods.SkuName, firstGoods.spec, firstGoods.Spec, sku.skuName, sku.SkuName, ''),
        quantity: pickFirst(firstGoods.quantity, firstGoods.Quantity, firstGoods.goodsNum, firstGoods.GoodsNum, item.goodsTotalNum, item.GoodsTotalNum, 1),
        refundAmount: this.formatPrice(pickFirst(item.payPrice, item.PayPrice, item.orderPrice, item.OrderPrice, 0)),
        createTime: pickFirst(item.updateTime, item.UpdateTime, item.createTime, item.CreateTime, '')
      }
    },

    getRefundStatusName(status) {
      const map = {
        '-10': '审核拒绝',
        '10': '待审核',
        '20': '审核通过',
        '30': '用户已发货',
        '80': '已退款'
      }
      return map[String(status)] || '退款/售后'
    },

    getOrderStatusName(status) {
      const map = {
        '-30': '已取消',
        '-20': '申请取消中',
        '10': '待付款',
        '20': '待发货',
        '30': '待收货',
        '40': '已完成',
        '80': '已完成'
      }
      return map[String(status)] || '订单处理中'
    },

    getRefundTypeName(type) {
      const map = {
        '10': '退货退款',
        '20': '仅退款'
      }
      return map[String(type)] || '退款/售后'
    },

    formatPrice(value) {
      const number = Number(value || 0)
      return Number.isNaN(number) ? '0.00' : number.toFixed(2)
    },

    handleTargetDetail(item) {
      if (!item || !item.id) {
        uni.showToast({ title: '缺少详情参数', icon: 'none' })
        return
      }

      if (item.type === 'cancel') {
        uni.navigateTo({ url: `/pages/order/detail?id=${encodeURIComponent(item.id)}&type=${encodeURIComponent(item.orderType || 1)}` })
        return
      }

      uni.navigateTo({ url: `/pages/refund/detail?orderRefundSkuId=${encodeURIComponent(item.id)}` })
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
}

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

.goods-row {
  display: flex;
  padding: 20rpx;
  background-color: #f8f9fb;
  border-radius: 8rpx;
}

.thumb {
  width: 150rpx;
  height: 150rpx;
  border-radius: 8rpx;
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
}

.label {
  color: #666;
  margin-right: 12rpx;
}

.amount {
  color: #fa3534;
  font-size: 32rpx;
  font-weight: 600;
}

.reject-row {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 8rpx;
  background: #fff5f5;
  color: #fa3534;
  font-size: 24rpx;
  line-height: 1.5;
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
