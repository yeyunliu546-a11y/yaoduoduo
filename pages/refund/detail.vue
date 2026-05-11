<template>
  <view v-if="!isLoading" class="container">
    <view class="detail-header">
      <view class="status-name">{{ detail.strStatus || getStatusName(detail.status) }}</view>
      <view class="status-desc">{{ detail.refundNo || detail.orderNo || '' }}</view>
    </view>

    <view class="goods-card" @click="onGoodsDetail(detail.goodsId)">
      <image class="goods-image" :src="detail.urlSkuThumbnail" mode="aspectFill"></image>
      <view class="goods-info">
        <view class="goods-name u-line-2">{{ detail.goodsName }}</view>
        <view class="goods-spec">{{ detail.skuName || '默认规格' }}</view>
        <view class="goods-meta">
          <text>{{ detail.strRefundType || getRefundTypeName(detail.refundType) }}</text>
          <text>x{{ detail.quantity }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="cell">
        <text class="label">预计退款金额</text>
        <text class="amount">¥{{ formatPrice(detail.amountExpectRefund) }}</text>
      </view>
      <view class="cell" v-if="detail.amountRealRefund">
        <text class="label">实际退款金额</text>
        <text class="amount">¥{{ formatPrice(detail.amountRealRefund) }}</text>
      </view>
      <view class="cell">
        <text class="label">售后类型</text>
        <text class="value">{{ detail.strRefundType || getRefundTypeName(detail.refundType) }}</text>
      </view>
      <view class="cell" v-if="detail.mark">
        <text class="label">申请原因</text>
        <text class="value">{{ detail.mark }}</text>
      </view>
      <view class="cell" v-if="detail.createTime">
        <text class="label">申请时间</text>
        <text class="value">{{ detail.createTime }}</text>
      </view>
    </view>

    <view v-if="detail.listRefundProof.length > 0" class="section">
      <view class="section-title">申请凭证</view>
      <view class="image-list">
        <image
          v-for="(item, index) in detail.listRefundProof"
          :key="index"
          class="proof-image"
          mode="aspectFill"
          :src="item"
          @click="handlePreviewImages(index)"
        ></image>
      </view>
    </view>

    <view v-if="showRejectReason" class="section reject-section">
      <view class="section-title danger">拒绝原因</view>
      <view class="reject-text">{{ rejectReason }}</view>
    </view>

    <view v-if="showReturnAddress" class="section">
      <view class="section-title">商家退货地址</view>
      <view class="address-line">收货人：{{ detail.refundAddress.name || '--' }}</view>
      <view class="address-line">联系电话：{{ detail.refundAddress.phone || '--' }}</view>
      <view class="address-line address-detail">
        <text>详细地址：{{ detail.refundAddress.fullAddress || '--' }}</text>
        <view class="copy-btn" @click.stop="handleCopy(returnAddressText)">复制</view>
      </view>
      <view class="address-tip">请填写真实有效的退货物流信息，避免影响退款处理。</view>
    </view>

    <view v-if="showDeliveryInfo" class="section">
      <view class="section-title">退货物流信息</view>
      <view class="cell">
        <text class="label">物流公司</text>
        <text class="value">{{ detail.express.expressName || '--' }}</text>
      </view>
      <view class="cell">
        <text class="label">物流单号</text>
        <text class="value">{{ detail.expressNo || '--' }}</text>
      </view>
      <view class="cell" v-if="detail.sendTime">
        <text class="label">发货时间</text>
        <text class="value">{{ detail.sendTime }}</text>
      </view>
    </view>

    <view v-if="showDeliveryForm" class="section form-section">
      <view class="section-title">填写退货物流</view>
      <view class="form-group">
        <text class="field">物流公司</text>
        <picker mode="selector" :range="listExpress" range-key="expressName" :value="expressIndex" @change="onChangeExpress">
          <view class="picker-value">
            {{ expressIndex > -1 ? listExpress[expressIndex].expressName : '请选择物流公司' }}
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="field">物流单号</text>
        <input class="input" v-model="formData.expressNo" placeholder="请填写物流单号" />
      </view>
      <view class="submit-btn" :class="{ disabled }" @click="onSubmit">
        {{ disabled ? '提交中...' : '确认发货' }}
      </view>
    </view>

    <view v-if="detail.listRecord.length > 0" class="section">
      <view class="section-title">售后进度</view>
      <view class="record-item" v-for="(item, index) in detail.listRecord" :key="index">
        <view class="record-dot"></view>
        <view class="record-content">
          <view class="record-info">{{ item.info }}</view>
          <view class="record-time">{{ item.createTime }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { RefundStatusEnum, RefundTypeEnum } from '@/common/enum/order/refund'
import { getRefundOrderDetail, getStoreExpressList, refundDelivery } from '@/api/order/order.js'

function pickFirst(...values) {
  const target = values.find(value => value !== undefined && value !== null && value !== '')
  return target === undefined ? '' : target
}

function isRejectStatus(value) {
  if (value === undefined || value === null || value === '') return false
  if (Number(value) === RefundStatusEnum.UnApprove.value) return true
  const text = String(value)
  return text.indexOf('\u62d2\u7edd') > -1 || text.indexOf('\u9a73\u56de') > -1
}

export default {
  data() {
    return {
      RefundStatusEnum,
      RefundTypeEnum,
      isLoading: true,
      orderRefundSkuId: '',
      detail: {
        listRefundProof: [],
        refundAddress: {},
        express: {},
        listRecord: []
      },
      listExpress: [],
      formData: {
        expressId: '',
        expressNo: ''
      },
      expressIndex: -1,
      disabled: false
    }
  },

  computed: {
    rejectReason() {
      return pickFirst(this.detail.sellerMark, this.detail.SellerMark, '')
    },

    showRejectReason() {
      return !!this.rejectReason && (isRejectStatus(this.detail.status) || isRejectStatus(this.detail.strStatus))
    },

    isReturnRefund() {
      return Number(this.detail.refundType) === RefundTypeEnum.Return.value
    },

    showReturnAddress() {
      return this.isReturnRefund && Number(this.detail.status) === RefundStatusEnum.Approve.value
    },

    showDeliveryForm() {
      return this.showReturnAddress && !this.detail.expressNo
    },

    showDeliveryInfo() {
      return this.isReturnRefund && (!!this.detail.expressNo || Number(this.detail.status) === RefundStatusEnum.Shipped.value)
    },

    returnAddressText() {
      const addr = this.detail.refundAddress || {}
      return [addr.name, addr.phone, addr.fullAddress].filter(Boolean).join('，')
    }
  },

  onLoad({ orderRefundSkuId } = {}) {
    this.orderRefundSkuId = orderRefundSkuId || ''
    this.getPageData()
  },

  methods: {
    getPageData() {
      if (!this.orderRefundSkuId) {
        this.isLoading = false
        uni.showToast({ title: '缺少售后单参数', icon: 'none' })
        return
      }

      this.isLoading = true
      Promise.all([this.getRefundDetail(), this.loadStoreExpressList()]).finally(() => {
        this.isLoading = false
      })
    },

    getRefundDetail() {
      return getRefundOrderDetail({ orderRefundSkuId: this.orderRefundSkuId }).then(res => {
        console.log('====== 售后详情原始数据 ====== ', res)
        const code = pickFirst(res.code, res.Code)
        if (String(code) === '200') {
          const data = pickFirst(res.result, res.Result, res.data, {}) || {}
          this.detail = this.normalizeRefundDetail(data)
        } else {
          uni.showToast({ title: res.message || res.Message || '获取售后详情失败', icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '获取售后详情失败', icon: 'none' })
      })
    },

    loadStoreExpressList() {
      return getStoreExpressList().then(res => {
        const code = pickFirst(res.code, res.Code)
        if (String(code) !== '200') return
        const result = pickFirst(res.result, res.Result, res.data, []) || []
        this.listExpress = Array.isArray(result) ? result.map(item => ({
          ...item,
          id: pickFirst(item.id, item.Id, item.expressId, item.ExpressId),
          expressName: pickFirst(item.expressName, item.ExpressName, item.name, item.Name, item.companyName, item.CompanyName, '未知物流')
        })).filter(item => item.id) : []
      }).catch(() => {
        this.listExpress = []
      })
    },

    normalizeRefundDetail(data = {}) {
      const refundAddress = pickFirst(data.refundAddress, data.RefundAddress, {}) || {}
      const express = pickFirst(data.express, data.Express, {}) || {}
      const listRefundProof = pickFirst(data.listRefundProof, data.ListRefundProof, [])
      const listRecord = pickFirst(data.listRecord, data.ListRecord, [])
      const status = Number(pickFirst(data.status, data.Status, 0))
      const refundType = Number(pickFirst(data.refundType, data.RefundType, data.type, data.Type, 0))

      return {
        ...data,
        id: pickFirst(data.id, data.Id, data.orderRefundSkuId, data.OrderRefundSkuId, ''),
        refundNo: pickFirst(data.refundNo, data.RefundNo, ''),
        orderNo: pickFirst(data.orderNo, data.OrderNo, ''),
        status,
        strStatus: pickFirst(data.strStatus, data.StrStatus, this.getStatusName(status)),
        refundType,
        strRefundType: pickFirst(data.strRefundType, data.StrRefundType, this.getRefundTypeName(refundType)),
        goodsId: pickFirst(data.goodsId, data.GoodsId, ''),
        urlSkuThumbnail: pickFirst(data.urlSkuThumbnail, data.UrlSkuThumbnail, data.skuImageUrl, data.SkuImageUrl, '/static/empty.png'),
        goodsName: pickFirst(data.goodsName, data.GoodsName, '售后商品'),
        skuName: pickFirst(data.skuName, data.SkuName, ''),
        quantity: pickFirst(data.refundQuantity, data.RefundQuantity, data.quantity, data.Quantity, 1),
        amountExpectRefund: pickFirst(data.amountExpectRefund, data.AmountExpectRefund, data.refundAmount, data.RefundAmount, '0.00'),
        amountRealRefund: pickFirst(data.amountRealRefund, data.AmountRealRefund, ''),
        mark: pickFirst(data.mark, data.Mark, data.refundDescription, data.RefundDescription, ''),
        sellerMark: pickFirst(data.sellerMark, data.SellerMark, ''),
        listRefundProof: Array.isArray(listRefundProof) ? listRefundProof : [],
        refundAddress: {
          name: pickFirst(refundAddress.name, refundAddress.Name, ''),
          phone: pickFirst(refundAddress.phone, refundAddress.Phone, ''),
          fullAddress: pickFirst(refundAddress.fullAddress, refundAddress.FullAddress, '')
        },
        express: {
          ...express,
          expressName: pickFirst(express.expressName, express.ExpressName, data.expressName, data.ExpressName, '')
        },
        expressNo: pickFirst(data.expressNo, data.ExpressNo, data.express_no, ''),
        sendTime: pickFirst(data.sendTime, data.SendTime, data.send_time, ''),
        listRecord: Array.isArray(listRecord) ? listRecord : []
      }
    },

    getStatusName(status) {
      const map = {
        '-10': '审核拒绝',
        '10': '待审核',
        '20': '审核通过',
        '30': '用户已发货',
        '80': '已退款'
      }
      return map[String(status)] || '售后处理中'
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

    onGoodsDetail(goodsId) {
      if (!goodsId) return
      uni.navigateTo({ url: `/pages/good/detail?id=${encodeURIComponent(goodsId)}` })
    },

    handlePreviewImages(index) {
      const imageUrls = this.detail.listRefundProof || []
      uni.previewImage({
        current: imageUrls[index],
        urls: imageUrls
      })
    },

    handleCopy(value) {
      if (!value) return
      uni.setClipboardData({
        data: value,
        success() {
          uni.showToast({ title: '复制成功', icon: 'success' })
        }
      })
    },

    onChangeExpress(e) {
      const expressIndex = Number(e.detail.value)
      this.expressIndex = expressIndex
      this.formData.expressId = this.listExpress[expressIndex].id
    },

    onSubmit() {
      if (this.disabled) return
      if (!this.formData.expressId || !this.formData.expressNo) {
        uni.showToast({ title: '请完善物流信息', icon: 'none' })
        return
      }

      this.disabled = true
      refundDelivery({
        orderRefundSkuId: this.orderRefundSkuId,
        expressId: this.formData.expressId,
        expressNo: this.formData.expressNo
      }).then(res => {
        const code = res.code !== undefined ? res.code : res.Code
        if (String(code) === '200') {
          uni.showToast({ title: '发货成功', icon: 'success' })
          setTimeout(() => {
            this.disabled = false
            this.getPageData()
          }, 800)
        } else {
          this.disabled = false
          uni.showToast({ title: res.message || res.Message || '发货失败', icon: 'none' })
        }
      }).catch(() => {
        this.disabled = false
        uni.showToast({ title: '发货失败', icon: 'none' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #f5f7fa;
}

.detail-header {
  padding: 36rpx 30rpx;
  background: #2979ff;
  color: #fff;
}

.status-name {
  font-size: 36rpx;
  font-weight: 600;
}

.status-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.86;
}

.goods-card,
.section {
  margin: 20rpx 24rpx 0;
  padding: 24rpx;
  background: #fff;
  border-radius: 8rpx;
}

.goods-card {
  display: flex;
}

.goods-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
  margin-right: 22rpx;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  color: #333;
  font-size: 28rpx;
  line-height: 1.4;
}

.goods-spec,
.goods-meta {
  margin-top: 14rpx;
  color: #999;
  font-size: 24rpx;
}

.goods-meta {
  display: flex;
  justify-content: space-between;
}

.section-title {
  margin-bottom: 20rpx;
  color: #333;
  font-size: 28rpx;
  font-weight: 600;

  &.danger {
    color: #fa3534;
  }
}

.cell {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14rpx 0;
  font-size: 26rpx;
}

.label {
  width: 180rpx;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
  text-align: right;
  line-height: 1.5;
}

.amount {
  color: #fa3534;
  font-weight: 600;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.proof-image {
  width: 180rpx;
  height: 180rpx;
  margin-right: 18rpx;
  margin-bottom: 18rpx;
  border-radius: 8rpx;
}

.reject-section {
  background: #fff5f5;
}

.reject-text {
  color: #fa3534;
  font-size: 26rpx;
  line-height: 1.6;
}

.address-line {
  margin-top: 14rpx;
  color: #333;
  font-size: 26rpx;
  line-height: 1.5;
}

.address-detail {
  display: flex;
  align-items: flex-start;
}

.copy-btn {
  flex: none;
  margin-left: 16rpx;
  padding: 4rpx 18rpx;
  border: 1rpx solid #2979ff;
  border-radius: 22rpx;
  color: #2979ff;
  font-size: 22rpx;
}

.address-tip {
  margin-top: 18rpx;
  color: #999;
  font-size: 24rpx;
}

.form-section {
  padding-bottom: 30rpx;
}

.form-group {
  display: flex;
  align-items: center;
  min-height: 76rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.field {
  width: 180rpx;
  color: #666;
  font-size: 26rpx;
}

.picker-value,
.input {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  color: #333;
  font-size: 26rpx;
}

.submit-btn {
  margin-top: 28rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  border-radius: 38rpx;
  color: #fff;
  background: #2979ff;
  font-size: 28rpx;

  &.disabled {
    opacity: 0.65;
  }
}

.record-item {
  position: relative;
  display: flex;
  padding-bottom: 28rpx;
}

.record-dot {
  width: 18rpx;
  height: 18rpx;
  margin-top: 8rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #2979ff;
}

.record-content {
  flex: 1;
}

.record-info {
  color: #333;
  font-size: 26rpx;
  line-height: 1.5;
}

.record-time {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
