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
             <view class="delete-brand-btn" @click="handleDeleteBrand(brandName)">
               <text class="iconfont icon-shanchu"></text> 删除厂家
             </view>
          </view>
        </view>

        <view class="brand-promo" v-if="brandName === '劲牌持正堂'">
          <text>/满3000元，可赠送1500元药品 /满2000元，可赠送600元药品</text>
        </view>

        <view class="brand-products">
          <view v-for="(item, idx) in items" :key="item.id" class="product-item">
            <label class="item-radio" @click.stop="handleCheckItem(item.id)">
              <radio class="radio" color="#ff3800" :checked="inArray(item.id, checkedIds)" />
            </label>
            
            <view class="product-content">
              <view class="goods-header">
                <text class="goods-title">{{ item.goodsName }}</text>
                <view class="delete-text" @click="handleDeleteItem(item.id)">
                   <text class="del-icon">ⓧ</text> 删除商品
                </view>
              </view>

              <view class="goods-tags">
                <text class="tag tag-blue">国标</text>
                <text class="tag tag-green">小包装</text>
                <text v-if="idx % 2 !== 0" class="tag tag-red">近效期</text>
              </view>

              <view class="goods-props">
                <text>规格：{{ item.skuName }}</text>
                <text class="unit-price">￥{{ item.salePrice }}</text>
              </view>
              
              <view class="goods-sub-info">
                <text>相当于每g饮片￥0.09元</text>
              </view>
               <view class="goods-sub-info">
                <text>有效期：2026-10-18</text>
              </view>

              <view class="item-foot">
                <view class="price-placeholder"></view> 
                <view class="stepper-box">
                  <button class="step-btn" @click="decreaseQuantity(item)">-</button>
                  <input class="step-input" type="number" :value="item.goodsNum" @input="e => updateQuantity(item, e.target.value)" />
                  <button class="step-btn" @click="increaseQuantity(item)">+</button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!Object.keys(cartList).length && !isLoading" class="empty-cart">
      <text>暂无需求商品，快去添加吧！</text>
      <button class="go-shop" @click="onTargetIndex">去添加</button>
    </view>

    <view v-if="Object.keys(cartList).length" class="footer-wrapper">
      <view class="footer-tips">
        <text>库存紧张，请尽快生成需求</text>
      </view>
      
      <view class="footer-fixed">
        <label class="all-radio" @click="handleCheckAll">
          <radio class="radio" color="#ff3800"
            :checked="checkedIds.length > 0 && checkedIds.length === getAllCheckedCount()" />
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
// 工具函数
function inArray(val, arr) {
  return Array.isArray(arr) && arr.includes(val);
}

export default {
  data() {
    return {
      inArray,
      isLoading: true,
      // 数据结构保持不变
      cartList: {
        '劲牌持正堂': [
          { id: 201, goodsId: 'g3', goodsName: '满199起批，还差51.00元', skuName: '去凑单 >', salePrice: 0, goodsNum: 0, isMsg: true },
          { id: 101, goodsId: 'g1', goodsName: '大蓟', skuName: '2.25g/9g', salePrice: 0.82, goodsNum: 100 }
        ],
        '凌霄花(美洲凌霄)': [
          { id: 102, goodsId: 'g2', goodsName: '凌霄花(美洲凌霄)', skuName: '3.33g/5g', salePrice: 0.66, goodsNum: 100 }
        ]
      },
      checkedIds: [101, 102],
      // [修改] totalPrice 移除了，改为 computed
    }
  },
  computed: {
    // [新增] 实时计算总件数
    sumNum() {
      // 过滤掉非商品行（如果有）
      return Object.values(this.cartList).flat()
        .filter(i => !i.isMsg && this.inArray(i.id, this.checkedIds)) // 只计算选中的
        .reduce((sum, item) => sum + item.goodsNum, 0);
    },
    
    // [核心修改] 实时计算总价 (解决不灵敏问题)
    totalPrice() {
      let total = 0;
      Object.values(this.cartList).forEach(items => {
        items.forEach(item => {
          // 只有当商品被选中时才计算
          if (this.inArray(item.id, this.checkedIds)) {
            // 确保是数字进行计算
            total += Number(item.salePrice) * Number(item.goodsNum);
          }
        });
      });
      return total.toFixed(2);
    }
  },
  // [修改] 移除了 watch，因为 computed 会自动监听变化
  
  onShow() {
    this.isLoading = false;
    // 模拟去除凑单提示行
    if(this.cartList['劲牌持正堂'] && this.cartList['劲牌持正堂'][0].isMsg) {
       this.cartList['劲牌持正堂'].shift();
    }
  },
  methods: {
    getAllItemIds() {
      return Object.values(this.cartList).flat().map(item => item.id);
    },
    getAllCheckedCount() {
      return this.getAllItemIds().length;
    },
    
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
        // 取消全选
        this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
      } else {
        // 全选
        const newIds = ids.filter(id => !this.checkedIds.includes(id));
        this.checkedIds.push(...newIds);
      }
    },

    // [修改] 移除了 onCalcTotalPrice 方法，逻辑已合并到 computed

    //删除厂家
    handleDeleteBrand(brandName) {
      uni.showModal({
        title: '提示',
        content: `确定要删除 ${brandName} 下的所有商品吗？`,
        success: ({ confirm }) => {
          if (confirm) {
            const idsToDelete = this.cartList[brandName].map(i => i.id);
            this.checkedIds = this.checkedIds.filter(id => !idsToDelete.includes(id));
            delete this.cartList[brandName]; 
            this.cartList = { ...this.cartList };
          }
        }
      });
    },
	
	//删除单个商品
    handleDeleteItem(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        success: ({ confirm }) => {
          if (confirm) {
            for (const brand in this.cartList) {
              const index = this.cartList[brand].findIndex(item => item.id === id);
              if (index >= 0) {
                this.cartList[brand].splice(index, 1);
                if (this.cartList[brand].length === 0) {
                  delete this.cartList[brand];
                  this.cartList = { ...this.cartList };
                }
                break;
              }
            }
            this.checkedIds = this.checkedIds.filter(cid => cid !== id);
          }
        }
      });
    },

    handleCheckItem(id) {
      const index = this.checkedIds.indexOf(id);
      if (index === -1) {
        this.checkedIds.push(id);
      } else {
        this.checkedIds.splice(index, 1);
      }
    },

    handleCheckAll() {
      if (this.checkedIds.length === this.getAllCheckedCount()) {
        this.checkedIds = [];
      } else {
        this.checkedIds = [...this.getAllItemIds()];
      }
    },

    increaseQuantity(item) { item.goodsNum++; },
    
    decreaseQuantity(item) { if (item.goodsNum > 1) item.goodsNum--; },
    
    updateQuantity(item, val) { 
        const num = parseInt(val) || 1;
        item.goodsNum = Math.max(1, num);
    },
    
    handleOrder() {
        console.log("生成需求");
    },
    
    onTargetIndex() {
        uni.switchTab({
            url: '/pages/index/index',
            success: () => {
                console.log('成功跳转到主页');
            },
            fail: (res) => {
                console.error('跳转主页失败:', res);
            }
        });
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
    background: #007aff; // 蓝色按钮
    color: #fff;
    font-size: 28rpx;
    border-radius: 10rpx;
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
      color: #fa2209; /* 红色删除 */
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
  bottom: 0; /* 如果有tabbar，这里可能需要改为 var(--window-bottom) */
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
      border-radius: 8rpx; /* 方角微圆 */
    }
  }
}

.empty-cart {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;
  .go-shop {
    margin-top: 30rpx;
    background: #ff9900;
    color: white;
    width: 240rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}
</style>