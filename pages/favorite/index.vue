<template>
  <view class="container">
    <view class="fav-list" v-if="list.length > 0">
      <view class="fav-card" v-for="(item, index) in list" :key="item.id">
        <view class="card-header">
          <view class="header-left">
            <view class="icon-box">方</view>
            <text class="title">{{ item.name }}</text>
          </view>
          <text class="date">{{ item.createTime || '--' }}</text>
        </view>

        <view class="goods-content" @click="toggleExpand(index)">
          <view class="summary-text" v-if="!item.expanded">
            <text class="label">共 {{ item.items ? item.items.length : 0 }} 味药：</text>
            <text class="value">{{ getSummary(item.items) }}</text>
          </view>
          
          <view class="tags-wrapper" v-else>
            <view class="herb-tag" v-for="(goods, gIdx) in item.items" :key="gIdx">
              <text class="name">{{ goods.goodsName }}</text>
              <text class="weight">{{ goods.goodsWeight }}g</text>
            </view>
          </view>
          
          <view class="arrow-box">
            <u-icon :name="item.expanded ? 'arrow-up' : 'arrow-down'" size="24" color="#ccc"></u-icon>
          </view>
        </view>

        <view class="card-footer">
          <view class="action-btn delete" @click="handleDelete(item)">
            <u-icon name="trash" size="28" color="#999"></u-icon> 删除
          </view>
          <view class="right-actions">
            <view class="action-btn edit" @click="handleEdit(item)">
              <u-icon name="edit-pen" size="28" color="#333"></u-icon> 编辑
            </view>
            <view class="action-btn cart" @click="handleAddToCart(item)">
              <u-icon name="shopping-cart" color="#fff" size="28"></u-icon> 加购
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <u-empty v-else text="暂无收藏方剂" mode="list" margin-top="120"></u-empty>

    <view class="custom-modal-mask" v-if="showEdit" @click.stop="showEdit = false">
      <view class="custom-modal-content" @click.stop>
        
        <view class="modal-header">
          <text class="close-btn" @click="showEdit = false">取消</text>
          <text class="modal-title">编辑方剂</text>
          <text class="save-btn" @click="saveEdit">保存</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <view class="form-section">
            <view class="section-title">方剂名称</view>
            <view class="input-wrapper">
              <input type="text" v-model="editForm.name" class="custom-input" placeholder="请输入方剂名称" />
            </view>
          </view>

          <view class="form-section">
            <view class="section-title-row">
              <text class="section-title">药品明细 ({{ editForm.items.length }}味)</text>
              <text class="tip">可修改克数或删除</text>
            </view>
            
            <view class="edit-list">
              <view class="edit-item" v-for="(goods, idx) in editForm.items" :key="idx">
                <view class="item-left">
                  <view class="goods-name">{{ goods.goodsName }}</view>
                  <view class="goods-spec" v-if="goods.skuName">{{ goods.skuName }}</view>
                </view>
                
                <view class="item-right">
                  <view class="stepper">
                    <view class="step-btn minus" @click="updateQty(idx, -1)">-</view>
                    <input class="step-val" type="number" v-model="goods.goodsWeight" disabled />
                    <view class="step-btn plus" @click="updateQty(idx, 1)">+</view>
                  </view>
                  <view class="del-btn" @click="removeHerb(idx)">
                    <u-icon name="trash" size="36" color="#ff4d4f"></u-icon>
                  </view>
                </view>
              </view>
            </view>
            
            <view class="empty-tip" v-if="editForm.items.length === 0">
              <text>当前方剂内没有药品，请保存后将被删除</text>
            </view>
          </view>
        </scroll-view>

      </view>
    </view>

  </view>
</template>

<script>
// 【修改】引入新的 API
import { getFavoriteList, deleteFavorite, useFavorite, updateFavorite } from '@/api/goods/favorite.js';

export default {
  data() {
    return {
      list: [],
      showEdit: false,
      editForm: {
        id: '', // 即 favoriteId
        name: '',
        items: [] // 即 goodsList
      }
    };
  },
  onShow() {
    this.loadList();
  },
  methods: {
    // 加载列表
    loadList() {
      getFavoriteList().then(res => {
        if (res.code === 200) {
          // 给每个item加上展开状态标记
          // 确保 items 存在，防止报错
          this.list = (res.result || []).map(item => ({ 
              ...item, 
              expanded: false,
              items: item.items || [] 
          }));
        }
      });
    },
    // 展开/收起
    toggleExpand(index) {
      this.list[index].expanded = !this.list[index].expanded;
    },
    // 生成摘要文字
    getSummary(items) {
      if(!items || items.length == 0) return '无药品';
      const names = items.slice(0, 3).map(g => g.goodsName);
      return names.join('、') + (items.length > 3 ? ' 等' : '');
    },
    
    // --- 删除整个收藏 ---
    handleDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定删除方剂“${item.name}”吗？`,
        success: ({ confirm }) => {
          if (confirm) {
            // 【修改】调用新API，传 item.id (作为 favoriteId)
            deleteFavorite(item.id).then(res => {
              if(res.code === 200) {
                  this.loadList();
                  uni.showToast({ title: '已删除', icon: 'none' });
              }
            });
          }
        }
      });
    },

    // --- 加购 (使用收藏) ---
    handleAddToCart(item) {
      uni.showLoading({ title: '正在合并...' });
      // 【修改】调用 useFavorite
      useFavorite(item.id).then(res => {
        uni.hideLoading();
        if (res.code === 200) {
          const result = res.result || {};
          const msg = `已添加${result.addedCount || 0}味药`;
          
          uni.showToast({ title: msg, icon: 'success' });
          // 延迟跳转
          setTimeout(() => {
             uni.switchTab({ url: '/pages/cart/cart' });
          }, 800);
        } else {
            uni.showToast({ title: res.message || '添加失败', icon: 'none' });
        }
      }).catch(() => uni.hideLoading());
    },

    // --- 编辑功能 ---
    handleEdit(item) {
      // 深拷贝
      this.editForm = JSON.parse(JSON.stringify(item));
      // 确保 items 存在
      if (!this.editForm.items) this.editForm.items = [];
      this.showEdit = true;
    },
    
    // 修改克数
    updateQty(index, delta) {
      const item = this.editForm.items[index];
      let val = parseInt(item.goodsWeight) || 0;
      val += delta;
      if (val < 1) {
          val = 1;
          uni.showToast({ title: '不能少于1g', icon: 'none' });
      }
      // 强制更新视图
      this.$set(this.editForm.items[index], 'goodsWeight', val);
    },

    // 移除单味药
    removeHerb(index) {
      this.editForm.items.splice(index, 1);
    },

    // 保存编辑
    saveEdit() {
      if (!this.editForm.name) return uni.showToast({ title: '请填写名称', icon: 'none' });
      
      // 如果药被删光了，询问是否直接删除该收藏
      if (this.editForm.items.length === 0) {
          uni.showModal({
              title: '提示', content: '方剂内无药品，是否直接删除该收藏？',
              success: ({confirm}) => {
                  if(confirm) {
                      deleteFavorite(this.editForm.id).then(() => {
                          this.showEdit = false;
                          this.loadList();
                      });
                  }
              }
          });
          return;
      }
      
      // 【修改】构造符合文档的参数
      // 文档要求: { favoriteId, name, items: [...] }
      const postData = {
          favoriteId: this.editForm.id,
          name: this.editForm.name,
          items: this.editForm.items.map(i => ({
              goodsId: i.goodsId,
              goodsSkuId: i.goodsSkuId,
              goodsWeight: i.goodsWeight
          }))
      };
      
      updateFavorite(postData).then(res => {
        if (res.code === 200) {
          this.showEdit = false;
          this.loadList();
          uni.showToast({ title: '保存成功', icon: 'success' });
        } else {
            uni.showToast({ title: res.message || '保存失败', icon: 'none' });
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 保持原有样式不变 */
.container { min-height: 100vh; background-color: #f5f5f5; padding: 24rpx; }

.fav-card { 
  background: #fff; border-radius: 20rpx; padding: 0 30rpx; margin-bottom: 24rpx; 
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  
  .card-header { 
    display: flex; justify-content: space-between; align-items: center; padding: 30rpx 0; border-bottom: 1px solid #f9f9f9;
    .header-left { 
      display: flex; align-items: center;
      .icon-box { width: 44rpx; height: 44rpx; background: #e6f7ff; color: #1890ff; font-size: 24rpx; text-align: center; line-height: 44rpx; border-radius: 8rpx; margin-right: 16rpx; font-weight: bold;}
      .title { font-size: 32rpx; font-weight: bold; color: #333; }
    }
    .date { color: #ccc; font-size: 24rpx; }
  }
  
  .goods-content { 
    padding: 24rpx 0;
    .summary-text { 
      font-size: 28rpx; line-height: 1.5; 
      .label { color: #666; }
      .value { color: #333; font-weight: 500; }
    }
    .tags-wrapper { 
      display: flex; flex-wrap: wrap; margin-right: -12rpx;
      .herb-tag { 
        background: #f5f7fa; padding: 8rpx 16rpx; border-radius: 8rpx; margin-right: 16rpx; margin-bottom: 16rpx; 
        display: flex; align-items: center;
        .name { color: #333; font-size: 26rpx; margin-right: 8rpx; }
        .weight { color: #1890ff; font-weight: bold; font-size: 26rpx; }
      }
    }
    .arrow-box { text-align: center; height: 30rpx; display: flex; align-items: center; justify-content: center; margin-top: 10rpx;}
  }

  .card-footer { 
    display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0 30rpx; border-top: 1px dashed #f0f0f0;
    .action-btn { 
      display: flex; align-items: center; font-size: 26rpx; padding: 12rpx 24rpx; border-radius: 34rpx;
      &.delete { color: #999; background: #f5f5f5; }
      &.edit { color: #333; background: #fff; border: 1px solid #ddd; margin-right: 20rpx; }
      &.cart { color: #fff; background: linear-gradient(90deg, #1890ff, #0052d9); box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3); }
    }
    .right-actions { display: flex; }
  }
}

.custom-modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99999; 
  display: flex; flex-direction: column; justify-content: flex-end; 
}

.custom-modal-content {
  background: #fff;
  border-top-left-radius: 30rpx; border-top-right-radius: 30rpx;
  height: 75vh; 
  display: flex; flex-direction: column;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 30rpx; border-bottom: 1px solid #eee;
  .modal-title { font-size: 32rpx; font-weight: bold; color: #333; }
  .close-btn { font-size: 28rpx; color: #999; padding: 10rpx; }
  .save-btn { font-size: 28rpx; color: #1890ff; font-weight: bold; padding: 10rpx; }
}

.modal-body {
  flex: 1; padding: 30rpx; overflow-y: scroll;
  
  .form-section {
    margin-bottom: 50rpx;
    .section-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; display: block; }
    .section-title-row { display: flex; justify-content: space-between; margin-bottom: 20rpx; .tip{color:#ccc; font-size:24rpx; font-weight:normal;} }
    
    .input-wrapper {
      background: #f5f5f5; border-radius: 12rpx; padding: 20rpx;
      .custom-input { font-size: 30rpx; width: 100%; color: #333; }
    }
  }

  .edit-list {
    .edit-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 24rpx 0; border-bottom: 1px solid #f9f9f9;
      
      .item-left {
        flex: 1; margin-right: 20rpx;
        .goods-name { font-size: 30rpx; color: #333; font-weight: 500; margin-bottom: 6rpx; }
        .goods-spec { font-size: 24rpx; color: #999; }
      }
      
      .item-right {
        display: flex; align-items: center;
        .stepper {
          display: flex; align-items: center; background: #f5f5f5; border-radius: 8rpx; margin-right: 30rpx;
          .step-btn { 
            width: 60rpx; height: 56rpx; line-height: 56rpx; text-align: center; font-size: 36rpx; color: #666;
            &.minus { color: #999; }
            &.plus { color: #1890ff; }
          }
          .step-val { width: 80rpx; text-align: center; font-size: 28rpx; font-weight: bold; color: #333; }
        }
        .del-btn { padding: 10rpx; }
      }
    }
  }
  
  .empty-tip { text-align: center; color: #ccc; margin-top: 50rpx; font-size: 26rpx; }
}
</style>