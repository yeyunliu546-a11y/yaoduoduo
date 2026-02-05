<template>
  <view class="container">
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="(item, index) in addressList" :key="item.id" @click="selectAddress(item)">
        <view class="info">
          <view class="user-row">
            <text class="name">{{ item.name }}</text>
            <text class="mobile">{{ item.mobile }}</text>
            <text class="tag" v-if="item.isDefault">默认</text>
          </view>
          <view class="address-text">{{ item.province }}{{ item.city }}{{ item.district }} {{ item.detail }}</view>
        </view>
        <view class="edit-btn" @click.stop="editAddress(item.id)">
          <u-icon name="edit-pen" size="40" color="#999"></u-icon>
        </view>
      </view>
    </view>
    <u-empty v-else text="暂无收货地址" mode="address" margin-top="100"></u-empty>

    <view class="footer-btn">
      <u-button type="primary" shape="circle" @click="addAddress">+ 新建收货地址</u-button>
    </view>
  </view>
</template>

<script>
import { getAddressList } from '@/api/user/userAddress.js'; 

export default {
  data() {
    return {
      source: '', // 来源：'order' 代表从订单页来
      addressList: []
    }
  },
  onLoad(option) {
    this.source = option.source || '';
  },
  onShow() {
    this.loadData();
  },
  methods: {
    loadData() {
        // 这里模拟数据，实际请换成你的 API 调用
        // getAddressList().then(...)
        this.addressList = [
            { id: 101, name: '张三', mobile: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城', isDefault: true },
            { id: 102, name: '李四', mobile: '13900139000', province: '上海市', city: '上海市', district: '浦东新区', detail: '陆家嘴环路1000号', isDefault: false }
        ];
    },
    // [核心] 选择地址
    selectAddress(item) {
        if (this.source === 'order') {
            // 存入缓存，供订单页读取
            uni.setStorageSync('selectedAddress', item);
            uni.navigateBack();
        }
    },
    addAddress() {
      uni.navigateTo({ url: '/pages/address/create' });
    },
    editAddress(id) {
      uni.navigateTo({ url: `/pages/address/update?id=${id}` });
    }
  }
}
</script>

<style lang="scss" scoped>
.container { padding: 20rpx; padding-bottom: 120rpx; }
.address-item { background: #fff; padding: 30rpx; border-radius: 12rpx; margin-bottom: 20rpx; display: flex; align-items: center; justify-content: space-between;
  .info { flex: 1; margin-right: 20rpx; }
  .user-row { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; display: flex; align-items: center;
    .mobile { margin-left: 20rpx; font-weight: normal; color: #666; font-size: 26rpx; }
    .tag { font-size: 20rpx; background: #ff3b30; color: #fff; padding: 2rpx 8rpx; border-radius: 4rpx; margin-left: 16rpx; font-weight: normal; }
  }
  .address-text { font-size: 26rpx; color: #333; line-height: 1.4; }
  .edit-btn { padding: 10rpx; }
}
.footer-btn { position: fixed; bottom: 40rpx; left: 40rpx; right: 40rpx; }
</style>