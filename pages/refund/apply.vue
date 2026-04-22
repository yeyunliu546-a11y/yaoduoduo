<template>
  <view v-if="!isLoading" class="container">
    <view class="goods-card">
      <image class="goods-image" :src="sku.skuImageUrl" mode="aspectFill"></image>
      <view class="goods-info">
        <view class="goods-name u-line-2">{{ sku.goodsName }}</view>
        <view class="goods-spec">{{ sku.skuName || '默认规格' }}</view>
        <view class="goods-meta">
          <text>数量 x{{ sku.quantity }}</text>
          <text class="price">¥{{ formatPrice(sku.payPrice) }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">服务类型</view>
      <view class="service-switch">
        <view
          v-for="item in RefundTypeEnum.data"
          :key="item.value"
          class="switch-item"
          :class="{ active: formData.refundType === item.value }"
          @click="onSwitchService(item.value)"
        >
          {{ item.name }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">申请原因</view>
      <textarea
        class="textarea"
        v-model="formData.refundDescription"
        maxlength="2000"
        placeholder="请详细填写退款/售后原因，便于商家审核"
        placeholder-style="color:#bbb"
      ></textarea>
    </view>

    <view class="section amount-row">
      <text class="section-title no-margin">预计退款金额</text>
      <text class="amount">¥{{ formatPrice(sku.payPrice) }}</text>
    </view>

    <view class="section">
      <view class="section-title">上传凭证 <text class="sub-title">最多 {{ maxImageLength }} 张</text></view>
      <view class="image-list">
        <view class="image-preview" v-for="(image, imageIndex) in listImage" :key="imageIndex">
          <image class="image" mode="aspectFill" :src="image.path || image.tempFilePath"></image>
          <view class="image-delete" @click="deleteImage(imageIndex)">×</view>
        </view>
        <view v-if="listImage.length < maxImageLength" class="image-picker" @click="chooseImage">
          <text class="choose-icon">+</text>
          <text class="choose-text">上传图片</text>
        </view>
      </view>
    </view>

    <view class="footer-fixed">
      <view class="submit-btn" :class="{ disabled }" @click="handleSubmit">
        {{ disabled ? '提交中...' : '确认提交' }}
      </view>
    </view>
  </view>
</template>

<script>
import { RefundTypeEnum } from '@/common/enum/order/refund'
import { applyOrderRefundSku } from '@/api/order/order.js'

const maxImageLength = 6
const BASE_URL = 'https://www.yaoduoduo.top'

function pickFirst(...values) {
  const target = values.find(value => value !== undefined && value !== null && value !== '')
  return target === undefined ? '' : target
}

function getCode(payload = {}) {
  return pickFirst(payload.code, payload.Code)
}

function getResult(payload = {}) {
  return pickFirst(payload.result, payload.Result)
}

export default {
  data() {
    return {
      RefundTypeEnum,
      isLoading: true,
      orderSkuId: '',
      sku: {},
      formData: {
        listImageId: [],
        refundType: RefundTypeEnum.RefundOnly.value,
        refundDescription: ''
      },
      listImage: [],
      maxImageLength,
      disabled: false
    }
  },

  onLoad(options = {}) {
    this.orderSkuId = options.orderSkuId || ''
    this.initSkuFromOptions(options)
  },

  methods: {
    initSkuFromOptions(options = {}) {
      this.sku = {
        goodsName: options.goodsName ? decodeURIComponent(options.goodsName) : '售后商品',
        skuName: options.skuName ? decodeURIComponent(options.skuName) : '',
        quantity: options.quantity || 1,
        skuImageUrl: options.skuImageUrl ? decodeURIComponent(options.skuImageUrl) : '/static/empty.png',
        payPrice: options.payPrice || '0.00'
      }
      this.isLoading = false
    },

    formatPrice(value) {
      const number = Number(value || 0)
      return Number.isNaN(number) ? '0.00' : number.toFixed(2)
    },

    onSwitchService(value) {
      this.formData.refundType = value
    },

    chooseImage() {
      uni.chooseImage({
        count: this.maxImageLength - this.listImage.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: ({ tempFiles, tempFilePaths }) => {
          const files = Array.isArray(tempFiles) && tempFiles.length > 0
            ? tempFiles
            : (tempFilePaths || []).map(path => ({ path, tempFilePath: path }))
          this.listImage = this.listImage.concat(files)
        }
      })
    },

    deleteImage(imageIndex) {
      this.listImage.splice(imageIndex, 1)
    },

    handleSubmit() {
      if (this.disabled) return
      if (!this.orderSkuId) {
        uni.showToast({ title: '缺少订单商品ID', icon: 'none' })
        return
      }

      this.disabled = true
      const submitTask = this.listImage.length > 0 ? this.uploadFile() : Promise.resolve([])
      submitTask
        .then(() => this.onSubmit())
        .catch(err => {
          this.disabled = false
          uni.showToast({ title: err.message || '凭证上传失败', icon: 'none' })
        })
    },

    onSubmit() {
      const payload = {
        orderSkuId: this.orderSkuId,
        refundType: this.formData.refundType,
        refundDescription: this.formData.refundDescription || '',
        listImageId: this.formData.listImageId || []
      }

      applyOrderRefundSku(payload).then(res => {
        const code = res.code !== undefined ? res.code : res.Code
        if (String(code) === '200') {
          uni.showToast({ title: '申请提交成功', icon: 'success' })
          setTimeout(() => {
            this.disabled = false
            uni.navigateBack()
          }, 1200)
        } else {
          this.disabled = false
          uni.showToast({ title: res.message || res.Message || '申请失败', icon: 'none' })
        }
      }).catch(() => {
        this.disabled = false
        uni.showToast({ title: '申请失败', icon: 'none' })
      })
    },

    uploadFile() {
      const token = uni.getStorageSync('token')
      const storeId = uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945'
      uni.showLoading({ title: '上传凭证中...', mask: true })

      const tasks = this.listImage.map(file => {
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            url: `${BASE_URL}/api/Files/Upload`,
            filePath: file.path || file.tempFilePath,
            name: 'files',
            header: {
              'X-Token': token || '',
              'Authorization': token ? `Bearer ${token}` : '',
              'platform': 'MP-WEIXIN',
              'storeId': storeId
            },
            success(uploadRes) {
              try {
                const data = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data || '{}') : uploadRes.data
                const result = getResult(data) || []
                if (String(getCode(data)) === '200' && Array.isArray(result) && result.length > 0) {
                  const uploadedFile = result[0]
                  const fileId = pickFirst(uploadedFile.id, uploadedFile.Id)
                  if (fileId) {
                    resolve(fileId)
                    return
                  }
                }
                reject(new Error(data.message || data.Message || '凭证上传失败'))
              } catch (err) {
                reject(err)
              }
            },
            fail(err) {
              reject(err)
            }
          })
        })
      })

      return Promise.all(tasks).then(fileIds => {
        this.formData.listImageId = fileIds
        return fileIds
      }).finally(() => {
        uni.hideLoading()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: calc(env(safe-area-inset-bottom) + 150rpx);
  background: #f5f7fa;
}

.goods-card,
.section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 24rpx;
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

.price,
.amount {
  color: #fa3534;
  font-weight: 600;
}

.section-title {
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;

  &.no-margin {
    margin-bottom: 0;
  }
}

.sub-title {
  color: #999;
  font-size: 24rpx;
  font-weight: 400;
}

.service-switch {
  display: flex;
}

.switch-item {
  min-width: 160rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  margin-right: 24rpx;
  border-radius: 8rpx;
  border: 1rpx solid #dcdfe6;
  color: #606266;
  font-size: 26rpx;

  &.active {
    color: #2979ff;
    border-color: #2979ff;
    background: #ecf5ff;
  }
}

.textarea {
  width: 100%;
  height: 220rpx;
  padding: 18rpx;
  box-sizing: border-box;
  border: 1rpx solid #ebeef5;
  border-radius: 8rpx;
  font-size: 26rpx;
  line-height: 1.5;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-preview,
.image-picker {
  width: 184rpx;
  height: 184rpx;
  margin-right: 26rpx;
  margin-bottom: 26rpx;
  border-radius: 8rpx;
}

.image-preview {
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.image-delete {
  position: absolute;
  top: -14rpx;
  right: -14rpx;
  width: 42rpx;
  height: 42rpx;
  line-height: 38rpx;
  text-align: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  font-size: 36rpx;
}

.image-picker {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1rpx dashed #c0c4cc;
  color: #909399;
}

.choose-icon {
  font-size: 52rpx;
  line-height: 1;
}

.choose-text {
  margin-top: 12rpx;
  font-size: 24rpx;
}

.footer-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom);
  padding: 20rpx 24rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: #fff;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  color: #fff;
  background: #2979ff;
  font-size: 28rpx;

  &.disabled {
    opacity: 0.65;
  }
}
</style>
