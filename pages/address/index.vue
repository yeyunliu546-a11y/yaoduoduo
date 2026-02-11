<template>
  <view class="container">
    <view class="address-list">
      <block v-if="list.length > 0">
        <u-swipe-action
          v-for="(item, index) in list"
          :key="item.Id"
          :show="item.show"
          :index="index"
          :options="swipeOptions"
          @click="(btnIndex) => handleSwipeClick(btnIndex, item)"
          @open="openSwipe(index)"
        >
          <view class="address-item" @click="onItemClick(item)">
            <view class="left-action" @click.stop="handleSetDefault(item)">
              <view class="radio-box" :class="{ 'checked': item.IsDefault }">
                <u-icon v-if="item.IsDefault" name="checkmark" color="#fff" size="24"></u-icon>
              </view>
            </view>

            <view class="item-content">
              <view class="user-info">
                <text class="name">{{ item.Name }}</text>
                <text class="phone">{{ item.Phone }}</text>
                <text class="tag" v-if="item.IsDefault">默认</text>
              </view>
              <view class="address-text">
                {{ item.Province }} {{ item.City }} {{ item.Region }} {{ item.Detail }}
              </view>
            </view>

            <view class="item-edit" @click.stop="handleEdit(item)">
              <u-icon name="edit-pen" size="40" color="#999"></u-icon>
            </view>
          </view>
        </u-swipe-action>
      </block>
      
      <view v-else class="empty-box">
        <u-empty text="暂无收货地址" mode="address" margin-top="100"></u-empty>
      </view>
    </view>

    <view class="footer-fixed">
      <button class="add-btn" @click="handleAdd">+ 新建收货地址</button>
    </view>
  </view>
</template>

<script>
import { listByWhere, setDefault, deleteAddress } from '@/api/user/userAddress.js';

export default {
  data() {
    return {
      list: [],
      source: '', 
      swipeOptions: [
        {
          text: '删除',
          style: { backgroundColor: '#fa3534' }
        }
      ]
    };
  },
  onLoad(options) {
    this.source = options.source || '';
  },
  onShow() {
    this.loadData();
  },
  methods: {
    loadData() {
      uni.showLoading({ title: '加载中' });
      listByWhere({ OnlyMy: true }).then(res => {
        uni.hideLoading();
        if (res.Code === 200 || res.code === 200) {
          const rawList = res.Result || res.result || res.data || [];
          
          this.list = rawList.map(item => ({
            Id: item.Id || item.id,
            Name: item.Name || item.name,
            Phone: item.Phone || item.phone || item.mobile,
            Province: item.Province || item.province,
            City: item.City || item.city,
            Region: item.Region || item.region || item.district,
            Detail: item.Detail || item.detail,
            IsDefault: !!(item.IsDefault || item.isDefault),
            show: false // 【关键】初始化 show 属性，否则 Vue 3 可能无法追踪变化
          }));
        }
      }).catch(() => uni.hideLoading());
    },

    onItemClick(item) {
      if (this.source === 'order') {
        uni.setStorageSync('selectedAddress', {
            id: item.Id,
            name: item.Name,
            phone: item.Phone,
            mobile: item.Phone, 
            province: item.Province,
            city: item.City,
            district: item.Region,
            detail: item.Detail,
            fullAddress: `${item.Province}${item.City}${item.Region}${item.Detail}`
        });
        uni.navigateBack();
      } else {
        this.handleEdit(item);
      }
    },

    handleSetDefault(item) {
      if (item.IsDefault) return; 
      
      uni.showLoading({ title: '设置中' });
      setDefault(item.Id).then(res => {
        uni.hideLoading();
        if (res.Code === 200 || res.code === 200) {
          uni.showToast({ title: '设置成功', icon: 'success' });
          this.loadData(); 
        } else {
          uni.showToast({ title: res.Message || '设置失败', icon: 'none' });
        }
      });
    },

    handleEdit(item) {
      uni.navigateTo({ url: `/pages/address/update?id=${item.Id}` });
    },
    
    handleAdd() {
      uni.navigateTo({ url: '/pages/address/create' });
    },

    // 互斥打开逻辑：打开一个时关闭其他
    openSwipe(index) {
      this.list.forEach((item, i) => {
        item.show = (i === index);
      });
    },

    // 这里的 item 是我们在 template 里显式传过来的
    handleSwipeClick(btnIndex, item) {
      if (btnIndex === 0) { 
        this.execDelete(item.Id);
      }
    },

    execDelete(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该地址吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中' });
            deleteAddress([id]).then(res => {
              uni.hideLoading();
              if (res.Code === 200 || res.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadData();
              } else {
                uni.showToast({ title: res.Message || '删除失败', icon: 'none' });
              }
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 120rpx; }
.address-list { padding: 20rpx; }

.address-item {
  background: #fff; padding: 30rpx 20rpx;
  display: flex; align-items: center; 
  
  .left-action {
    padding-right: 20rpx;
    display: flex; align-items: center;
    .radio-box {
      width: 40rpx; height: 40rpx; border-radius: 50%; border: 2rpx solid #ccc;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s;
      &.checked {
        background-color: #ff3b30; border-color: #ff3b30;
      }
    }
  }

  .item-content { flex: 1; margin-right: 20rpx; overflow: hidden; }
  
  .user-info {
    margin-bottom: 12rpx; font-weight: bold; font-size: 30rpx; display: flex; align-items: center;
    
    // 修复：使用标准 CSS 替代 mixin
    .name { 
        margin-right: 20rpx; 
        max-width: 160rpx; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap;
        display: block; // 确保截断生效
    }
    .mobile { font-weight: normal; color: #666; font-size: 28rpx; }
    .tag { background: #ffeae9; color: #ff3b30; font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 6rpx; margin-left: 16rpx; font-weight: normal; border: 1px solid #ff3b30;}
  }
  
  .address-text { color: #333; font-size: 26rpx; line-height: 1.4; }
  
  .item-edit { 
    padding: 10rpx; border-left: 1rpx solid #eee; padding-left: 20rpx; 
    height: 60rpx; display: flex; align-items: center;
  }
}

.footer-fixed {
  position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 20rpx 30rpx;
  padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 99;
  .add-btn {
    background: #ff3b30; color: #fff; border-radius: 44rpx; height: 88rpx; line-height: 88rpx; font-size: 32rpx; font-weight: bold;
    &::after { border: none; }
    &:active { opacity: 0.9; }
  }
}
</style>