<template>
  <view class="container">
    <view class="search-header">
      <view class="search-input-box">
        <text class="icon iconfont icon-sousuo search-icon">🔍</text>
        <input class="search-input" type="text" placeholder="请输入需求内商品" placeholder-class="placeholder-style" />
      </view>
      <view class="search-btn">搜索</view>
    </view>

    <view v-if="Object.keys(cartList).length" class="cart-list">
      <view v-for="(items, brandName) in cartList" :key="brandName" class="brand-group">
        
        <view class="brand-header">
          <view class="brand-left">
            <label class="radio-label" @click="handleCheckBrand(brandName, items)">
              <radio class="radio" color="#ff3800" :checked="isBrandChecked(items)" />
            </label>
            <view class="brand-info">
              <view class="brand-title">
                <text class="brand-icon">🏭</text> <text class="brand-name">{{ brandName }}</text>
                <text class="arrow">></text>
              </view>
            </view>
          </view>
          <view class="brand-right">
             <view class="delete-brand-btn" @click="handleDeleteBrand(brandName, items)">
               <text class="iconfont icon-shanchu"></text> 删除厂家
             </view>
          </view>
        </view>

        <view class="brand-products">
          <view v-for="(item, idx) in items" :key="item.id" class="product-item">
            <label class="item-radio" @click.stop="handleCheckItem(item.id)">
              <radio class="radio" color="#ff3800" :checked="inArray(item.id, checkedIds)" />
            </label>
            
            <view class="product-content">
              <view class="goods-header">
                <text class="goods-title">{{ item.goodsName }}</text>
                <view class="delete-text" @click="handleDeleteItem(item)">
                   <text class="del-icon">ⓧ</text> 删除商品
                </view>
              </view>

              <view class="goods-tags">
                <text class="tag tag-blue" v-if="item.standard">{{ item.standard }}</text>
                <text class="tag tag-green" v-if="item.packageType">{{ item.packageType }}</text>
              </view>

              <view class="goods-props">
                <text>规格：{{ item.spec || item.skuName }}</text>
                <text class="unit-price">￥{{ item.salePrice }}</text>
              </view>
              
              <view class="goods-sub-info" v-if="item.manufacturer">
                <text>厂家：{{ item.manufacturer }}</text>
              </view>

              <view class="item-foot">
                <view class="price-placeholder"></view> 
                <view class="stepper-box">
                  <button class="step-btn" @click="decreaseQuantity(item)">-</button>
                  <input class="step-input" type="number" :value="item.goodsNum" @blur="e => updateQuantity(item, e.detail.value)" />
                  <button class="step-btn" @click="increaseQuantity(item)">+</button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!Object.keys(cartList).length && !isLoading" class="empty-cart">
      <u-empty text="购物车空空如也" mode="cart"></u-empty>
      <button class="go-shop" @click="onTargetIndex">去添加</button>
    </view>

    <view v-if="Object.keys(cartList).length" class="footer-wrapper">
      <view class="footer-tips">
        <text>库存紧张，请尽快生成需求</text>
      </view>
      
      <view class="footer-fixed">
        <label class="all-radio" @click="handleCheckAll">
          <radio class="radio" color="#ff3800"
            :checked="allIds.length > 0 && checkedIds.length === allIds.length" />
          <text class="select-text">全选 共{{sumNum}}件</text>
        </label>
        
        <view class="total-info">
          <text class="label">合计：</text>
          <view class="goods-price">
            <text class="unit">￥</text>
            <text class="value">{{ totalPrice }}</text>
          </view>
          <text class="shipping-tip">(不含运费)</text>
        </view>
        
        <view class="action-btn" @click="handleOrder()">
          <text>生成需求</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 引入API
import { getCartList, updateCartNum, deleteCart } from '@/api/goods/cart.js';

// 工具函数：判断元素是否在数组中
function inArray(val, arr) {
  return Array.isArray(arr) && arr.includes(val);
}

export default {
  data() {
    return {
      inArray,
      isLoading: true,
      cartList: {}, // 初始为空，依赖Mock加载
      checkedIds: [], // 存储选中的购物车ID
      debounceTimers: {} // 存储防抖定时器
    }
  },
  computed: {
    // 获取所有商品ID（用于全选判断）
    allIds() {
        return Object.values(this.cartList).flat().map(item => item.id);
    },
    // 实时计算选中总件数
    sumNum() {
      let count = 0;
      Object.values(this.cartList).flat().forEach(item => {
          if (this.inArray(item.id, this.checkedIds)) {
              count += Number(item.goodsNum);
          }
      });
      return count;
    },
    // 实时计算总价
    totalPrice() {
      let total = 0;
      Object.values(this.cartList).flat().forEach(item => {
        if (this.inArray(item.id, this.checkedIds)) {
          total += Number(item.salePrice) * Number(item.goodsNum);
        }
      });
      return total.toFixed(2);
    }
  },
  onShow() {
    this.loadData();
  },
  methods: {
    // --- 1. 数据加载与转换 ---
    loadData() {
        // 仅在列表为空时显示加载loading，提升体验
        if(!Object.keys(this.cartList).length) {
             this.isLoading = true;
        }
        
        // 调用查询接口
        getCartList({ limit: 100 }).then(res => {
            this.isLoading = false;
            if(res.code === 200) {
                // 兼容不同后端返回结构 data.list 或 result
                const list = res.data?.list || res.result || [];
                // 关键步骤：将扁平列表转换为按厂家分组的对象
                this.cartList = this.groupCartByBrand(list);
            }
        }).catch(err => {
            this.isLoading = false;
            console.error('加载购物车失败', err);
        });
    },

    // [核心逻辑] 将列表按 Manufacturer 字段分组
    groupCartByBrand(list) {
        const groups = {};
        list.forEach(item => {
            // 如果后端没返回 manufacturer 字段，给个默认值 "其他厂家"
            const brand = item.manufacturer || '其他厂家';
            if (!groups[brand]) {
                groups[brand] = [];
            }
            groups[brand].push(item);
        });
        return groups;
    },

    // --- 2. 勾选逻辑 ---
    // 判断某个厂家是否全选
    isBrandChecked(items) {
      if (!items || items.length === 0) return false;
      const ids = items.map(i => i.id);
      return ids.every(id => this.checkedIds.includes(id));
    },
    // 点击厂家全选
    handleCheckBrand(brandName, items) {
      const isChecked = this.isBrandChecked(items);
      const ids = items.map(i => i.id);
      if (isChecked) {
        // 取消全选：从 checkedIds 中移除该厂家的所有ID
        this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
      } else {
        // 全选：将该厂家的所有ID加入 checkedIds (去重)
        const newIds = ids.filter(id => !this.checkedIds.includes(id));
        this.checkedIds.push(...newIds);
      }
    },
    // 点击单个商品勾选
    handleCheckItem(id) {
      const index = this.checkedIds.indexOf(id);
      if (index === -1) {
        this.checkedIds.push(id);
      } else {
        this.checkedIds.splice(index, 1);
      }
    },
    // 底部全选按钮
    handleCheckAll() {
      if (this.checkedIds.length === this.allIds.length) {
        this.checkedIds = []; // 全部取消
      } else {
        this.checkedIds = [...this.allIds]; // 全部选中
      }
    },

    // --- 3. 数量修改逻辑 (乐观更新+防抖) ---
    increaseQuantity(item) {
        this.updateQuantity(item, item.goodsNum + 1);
    },
    decreaseQuantity(item) { 
        if (item.goodsNum > 1) {
            this.updateQuantity(item, item.goodsNum - 1);
        } else {
            uni.showToast({ title: '至少购买一件', icon: 'none' });
        }
    },
    updateQuantity(item, val) { 
        const targetNum = parseInt(val);
        if(!targetNum || targetNum < 1) return;

        // 1. 乐观更新：立刻修改界面，不等待服务器
        const oldNum = item.goodsNum;
        item.goodsNum = targetNum;

        // 2. 防抖：清除旧定时器
        if (this.debounceTimers[item.id]) {
            clearTimeout(this.debounceTimers[item.id]);
        }

        // 3. 延迟发送请求
        this.debounceTimers[item.id] = setTimeout(() => {
            const params = {
                goodsSkuId: item.goodsSkuId || item.goodsId || item.id, 
                goodsNum: targetNum
            };

            // 4. 静默请求 (不显示Loading)
            updateCartNum(params).then(res => {
                if(res.code !== 200) {
                    // 失败回滚
                    item.goodsNum = oldNum;
                    uni.showToast({ title: res.message || '修改失败', icon: 'none' });
                }
            }).catch(() => {
                // 网络错误回滚
                item.goodsNum = oldNum;
                uni.showToast({ title: '网络请求失败', icon: 'none' });
            });
            delete this.debounceTimers[item.id];
        }, 500); // 500ms 防抖
    },

    // --- 4. 删除逻辑 ---
    // 删除整个厂家
    handleDeleteBrand(brandName, items) {
      const ids = items.map(i => i.id); 
      this.execDelete(ids, `确定要删除 ${brandName} 下的所有商品吗？`);
    },
    // 删除单个商品
    handleDeleteItem(item) {
      this.execDelete([item.id], '确定要删除该商品吗？');
    },
    // 执行删除请求封装
    execDelete(ids, content) {
        uni.showModal({
            title: '提示',
            content: content,
            success: ({ confirm }) => {
                if (confirm) {
                    uni.showLoading({ title: '删除中' });
                    deleteCart(ids).then(res => {
                        uni.hideLoading();
                        if(res.code === 200) {
                            // 本地移除选中状态
                            this.checkedIds = this.checkedIds.filter(cid => !ids.includes(cid));
                            // 重新加载数据
                            this.loadData();
                            uni.showToast({ title: '删除成功', icon: 'success' });
                        } else {
                            uni.showToast({ title: res.message || '删除失败', icon: 'none' });
                        }
                    });
                }
            }
        });
    },
    
    // --- 5. 结算逻辑 ---
    handleOrder() {
        if (this.checkedIds.length === 0) {
            return uni.showToast({ title: '请先选择商品', icon: 'none' });
        }
        // 跳转到确认订单页
        const selectedIdsStr = this.checkedIds.join(',');
        uni.navigateTo({
            url: `/pages/order/create?cartIds=${selectedIdsStr}`
        });
    },
    
    // 跳转到分类页
    onTargetIndex() {
        uni.switchTab({ url: '/pages/category/category' });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 全局背景 */
.container {
  min-height: 100vh;
  padding-bottom: 220rpx; /* 留出底部操作栏高度 */
  background: #f5f5f5;
}

/* 1. 搜索栏样式 */
.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .search-input-box {
    flex: 1;
    height: 72rpx;
    background: #f8f8f8; // 浅灰色背景
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    border: 1px solid #eaeaea;
    
    .search-icon {
      font-size: 28rpx;
      color: #999;
      margin-right: 12rpx;
    }
    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
  
  .search-btn {
    margin-left: 20rpx;
    width: 100rpx;
    height: 72rpx;
    line-height: 72rpx;
    text-align: center;
    background: #2979ff; // uView 主题蓝
    color: #fff;
    font-size: 28rpx;
    border-radius: 36rpx;
  }
}

/* 列表容器 */
.cart-list {
  padding: 20rpx 20rpx;
}

.brand-group {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding-bottom: 10rpx;
}

/* 品牌头部 */
.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;

  .brand-left {
    display: flex;
    align-items: center;
    
    .radio-label {
      transform: scale(0.8);
      margin-right: 10rpx;
    }
    
    .brand-title {
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 30rpx;
      color: #333;
      
      .brand-icon { margin-right: 8rpx; font-size: 28rpx; }
      .arrow { color: #ccc; margin-left: 10rpx; font-size: 24rpx;}
    }
  }

  .delete-brand-btn {
    font-size: 22rpx;
    color: #fa2209;
    background: #fff;
    border: 1px solid #fa2209;
    padding: 6rpx 16rpx;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    .iconfont { margin-right: 4rpx; font-size: 22rpx;}
  }
}

.brand-promo {
  padding: 10rpx 20rpx;
  background: #fff5f5;
  color: #fa2209;
  font-size: 22rpx;
  line-height: 1.4;
}

/* 商品条目 */
.product-item {
  display: flex;
  padding: 24rpx 20rpx;
  border-bottom: 1px solid #f8f8f8;
  
  &:last-child { border-bottom: none; }
  
  .item-radio {
    display: flex;
    align-items: flex-start; /* 对齐顶部 */
    padding-top: 10rpx;
    margin-right: 16rpx;
    transform: scale(0.8);
  }
  
  .product-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .goods-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8rpx;
    
    .goods-title {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
    }
    .delete-text {
      font-size: 24rpx;
      color: #999;
      display: flex;
      align-items: center;
      white-space: nowrap;
      margin-left: 20rpx;
      .del-icon { margin-right: 4rpx; font-size: 24rpx;}
    }
  }

  /* 标签样式 */
  .goods-tags {
    display: flex;
    margin-bottom: 12rpx;
    .tag {
      font-size: 20rpx;
      padding: 2rpx 8rpx;
      border-radius: 4rpx;
      margin-right: 10rpx;
      border: 1px solid;
      
      &.tag-blue { color: #1890ff; border-color: #1890ff; }
      &.tag-green { color: #52c41a; border-color: #52c41a; }
      &.tag-red { color: #fa2209; border-color: #fa2209; background: #fff0f0;}
    }
  }

  .goods-props {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 6rpx;
    .unit-price {
      color: #fa2209;
      font-weight: bold;
      margin-left: 20rpx;
      font-size: 28rpx;
    }
  }
  
  .goods-sub-info {
    font-size: 22rpx;
    color: #4ab7bd; /* 青色文字 */
    margin-bottom: 4rpx;
  }

  /* 底部操作行 */
  .item-foot {
    display: flex;
    justify-content: space-between; /* 两端对齐 */
    align-items: center;
    margin-top: 16rpx;
    
    .stepper-box {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      
      .step-btn {
        width: 56rpx;
        height: 52rpx;
        line-height: 52rpx;
        background: #f8f8f8;
        font-size: 32rpx;
        color: #666;
        padding: 0;
        margin: 0;
        border-radius: 0;
        &::after { border: none; }
      }
      .step-input {
        width: 80rpx;
        height: 52rpx;
        text-align: center;
        font-size: 28rpx;
        color: #333;
        border-left: 1px solid #ddd;
        border-right: 1px solid #ddd;
      }
    }
  }
}

/* 4. 底部栏 */
.footer-wrapper {
  position: fixed;
  bottom: 0; 
  /* #ifdef H5 */
  bottom: var(--window-bottom);
  /* #endif */
  left: 0;
  right: 0;
  z-index: 99;
  background: #fff;
  
  .footer-tips {
    background: #fff5e6;
    color: #ff5500;
    font-size: 24rpx;
    text-align: center;
    padding: 10rpx 0;
  }

  .footer-fixed {
    display: flex;
    align-items: center;
    height: 100rpx;
    padding: 0 30rpx;
    border-top: 1px solid #eee;
    
    .all-radio {
      display: flex;
      align-items: center;
      margin-right: 20rpx;
      .radio { transform: scale(0.8); }
      .select-text { font-size: 26rpx; color: #666; margin-left: 6rpx;}
    }

    .total-info {
      flex: 1;
      display: flex;
      flex-direction: column; /* 垂直排列 */
      align-items: flex-end; /* 靠右 */
      padding-right: 20rpx;
      
      .label { font-size: 26rpx; color: #333; display: inline-block;}
      .goods-price {
        display: inline-block;
        .unit { font-size: 24rpx; color: #fa2209; }
        .value { font-size: 36rpx; font-weight: bold; color: #fa2209; }
      }
      .shipping-tip {
        font-size: 20rpx;
        color: #999;
      }
    }

    .action-btn {
      width: 220rpx;
      height: 76rpx;
      line-height: 76rpx;
      text-align: center;
      background: #ff3800; /* 红色背景 */
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
      border-radius: 38rpx;
    }
  }
}

.empty-cart {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .go-shop {
    margin-top: 40rpx;
    background: #2979ff;
    color: white;
    width: 240rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}
</style>