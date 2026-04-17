<template>
  <view class="container">
    <u-card
      title="物流信息"
      :border="false"
      margin="24rpx"
      border-radius="20"
      :head-style="{ color: '#333', fontWeight: 'bold' }"
      :body-style="{ paddingTop: '0rpx' }"
    >
      <template v-slot:body>
        <view class="express-head">
          <view class="company-row">
            <view class="company-icon">
              <u-icon name="car" color="#fff" size="34"></u-icon>
            </view>
            <view class="company-info">
              <view class="company-name">{{ expressInfo.expressName || '快递公司待更新' }}</view>
              <view class="express-no-row">
                <text class="express-no">单号：{{ expressInfo.expressNo || '暂无单号' }}</text>
                <text v-if="expressInfo.expressNo" class="copy-btn" @click="copyExpressNo">复制</text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </u-card>

    <u-card
      title="物流轨迹"
      :border="false"
      margin="0 24rpx 24rpx"
      border-radius="20"
      :head-style="{ color: '#333', fontWeight: 'bold' }"
    >
      <template v-slot:body>
        <view v-if="trackList.length > 0" class="track-list">
          <u-time-line>
            <u-time-line-item v-for="(item, index) in trackList" :key="index" nodeTop="2">
              <template v-slot:node>
                <view class="timeline-node" :class="{ active: index === 0 }"></view>
              </template>
              <template v-slot:content>
                <view class="track-item" :class="{ active: index === 0 }">
                  <view class="track-desc">{{ item.acceptStation || '暂无轨迹信息' }}</view>
                  <view class="track-time" v-if="item.acceptTime">{{ item.acceptTime }}</view>
                </view>
              </template>
            </u-time-line-item>
          </u-time-line>
        </view>
        <view v-else class="empty-track">
          <u-empty mode="list" text="暂无轨迹信息" margin-top="30"></u-empty>
        </view>
      </template>
    </u-card>

    <u-loading-page :loading="loading"></u-loading-page>
  </view>
</template>

<script>
import { ListTrack } from '@/api/order/express.js'

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

function getMessage(res = {}) {
  return pickFirst(res.message, res.Message, '获取物流信息失败')
}

export default {
  data() {
    return {
      orderSkuId: '',
      loading: false,
      expressInfo: {
        expressName: '',
        expressNo: ''
      },
      trackList: []
    }
  },

  onLoad(options) {
    this.orderSkuId = decodeURIComponent(options.orderSkuId || '')
    if (!this.orderSkuId) {
      uni.showToast({ title: '缺少物流参数', icon: 'none' })
      return
    }
    this.loadTrack()
  },

  onPullDownRefresh() {
    this.loadTrack(true)
  },

  methods: {
    normalizeTrackItem(item = {}) {
      return {
        acceptTime: pickFirst(item.acceptTime, item.AcceptTime, ''),
        acceptStation: pickFirst(item.acceptStation, item.AcceptStation, '暂无轨迹信息'),
        location: pickFirst(item.location, item.Location, '')
      }
    },

    loadTrack(isRefresh = false) {
      if (!this.orderSkuId) {
        uni.stopPullDownRefresh()
        return
      }

      if (!isRefresh) this.loading = true

      ListTrack({ orderSkuId: this.orderSkuId }).then(res => {
        const code = getCode(res)
        const result = getResult(res) || {}

        if (code === 200) {
          const rawList = pickFirst(result.listInfo, result.ListInfo, [])
          const list = Array.isArray(rawList) ? rawList : []
          this.expressInfo = {
            expressName: pickFirst(result.expressName, result.ExpressName, ''),
            expressNo: pickFirst(result.expressNo, result.ExpressNo, '')
          }
          this.trackList = list.map(item => this.normalizeTrackItem(item))
        } else {
          this.trackList = []
          uni.showToast({ title: getMessage(res), icon: 'none' })
        }
      }).catch(() => {
        this.trackList = []
      }).finally(() => {
        this.loading = false
        uni.stopPullDownRefresh()
      })
    },

    copyExpressNo() {
      if (!this.expressInfo.expressNo) return
      uni.setClipboardData({
        data: String(this.expressInfo.expressNo),
        success: () => {
          uni.showToast({ title: '复制成功', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 24rpx;
}

.express-head {
  padding-top: 4rpx;
}

.company-row {
  display: flex;
  align-items: center;
}

.company-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2979ff 0%, #5a96ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 22rpx;
  box-shadow: 0 8rpx 18rpx rgba(41, 121, 255, 0.24);
  flex-shrink: 0;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.express-no-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.express-no {
  font-size: 25rpx;
  color: #666;
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.copy-btn {
  margin-left: 16rpx;
  font-size: 22rpx;
  color: #2979ff;
  background: #e9f2ff;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
}

.track-list {
  padding: 8rpx 0 2rpx;
}

.timeline-node {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #dcdfe6;
  border: 4rpx solid #fff;
  box-shadow: 0 0 0 2rpx #dcdfe6;

  &.active {
    width: 22rpx;
    height: 22rpx;
    background: #2979ff;
    box-shadow: 0 0 0 4rpx rgba(41, 121, 255, 0.18);
  }
}

.track-item {
  padding: 0 0 28rpx;
  color: #666;

  &.active {
    .track-desc {
      color: #2979ff;
      font-weight: 600;
    }
  }
}

.track-desc {
  font-size: 27rpx;
  line-height: 1.5;
  color: #333;
}

.track-time {
  font-size: 23rpx;
  color: #999;
  margin-top: 10rpx;
}

.empty-track {
  padding: 24rpx 0 40rpx;
}
</style>
