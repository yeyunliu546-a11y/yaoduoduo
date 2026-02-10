<template>
  <view class="container">
    <view class="tab-header">
      <view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
        药品采购 <view class="tab-line" v-if="currentTab === 0"></view>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
        处方调剂 <view class="tab-line" v-if="currentTab === 1"></view>
      </view>
    </view>

    <view class="cart-container">
      
      <view v-show="currentTab === 0">
        <block v-if="Object.keys(procurementList).length">
          <view v-for="(items, brandName) in procurementList" :key="brandName" class="brand-group">
            
            <view class="brand-header">
              <view class="brand-left" @click="handleCheckBrand(brandName, items)">
                <view class="checkbox-icon" :class="{ checked: isBrandChecked(items) }">
                  <u-icon name="checkbox-mark" color="#fff" size="24" v-if="isBrandChecked(items)"></u-icon>
                </view>
                <text class="brand-title">🏭 {{ brandName }}</text>
                <u-icon name="arrow-right" size="24" color="#999"></u-icon>
              </view>
              <text class="clear-btn" @click="handleDeleteBrand(brandName, items)">清空厂家</text>
            </view>

            <view class="goods-list">
              <view v-for="(item, idx) in items" :key="item.id" class="swipe-wrapper">
                <u-swipe-action 
                  :options="swipeOptions" 
                  @click="handleSwipeClick($event, item)"
                  :key="item.id"
                >
                  <view class="goods-item">
                    <view class="checkbox-area" @click.stop="handleCheckItem(item.id)">
                      <view class="checkbox-icon" :class="{ checked: inArray(item.id, checkedIds) }">
                        <u-icon name="checkbox-mark" color="#fff" size="24" v-if="inArray(item.id, checkedIds)"></u-icon>
                      </view>
                    </view>

                    <view class="goods-image" @click="goGoodsDetail(item.goodsId)">
                      <u-image 
                        width="180rpx" 
                        height="180rpx" 
                        border-radius="12" 
                        :src="item.urlImg || item.goodsCover || '/static/default-goods.png'" 
                        mode="aspectFill"
                      ></u-image>
                    </view>

                    <view class="goods-content">
                      <view class="goods-title u-line-2" @click="goGoodsDetail(item.goodsId)">
                        {{ item.goodsName }}
                      </view>

                      <view class="goods-specs">
                        <view class="spec-tag" v-if="item.standard || item.spec || item.skuName">
                          {{ item.spec || item.skuName || item.standard }}
                        </view>
                        <view class="spec-tag" v-if="item.packageType">
                          {{ item.packageType }}
                        </view>
                      </view>

                      <view class="goods-bottom">
                        <view class="price-box">
                          <text class="symbol">¥</text>
                          <text class="number">{{ item.salePrice }}</text>
                        </view>
                        
                        <view class="stepper-box">
                          <u-number-box 
                            v-model="item.goodsNum" 
                            :min="1" 
                            :max="9999" 
                            :index="idx"
                            @change="val => handleNumChange(val, item)"
                          ></u-number-box>
                        </view>
                      </view>
                    </view>
                  </view>
                </u-swipe-action>
              </view>
            </view>
          </view>
        </block>

        <view v-else-if="!isLoading" class="empty-cart">
           <u-empty text="购物车空空如也" mode="cart" icon-size="160"></u-empty>
           <u-button 
             type="primary" 
             size="medium" 
             shape="circle" 
             :custom-style="{marginTop: '40rpx', padding: '0 60rpx', background: 'linear-gradient(to right, #ff6034, #ee0a24)'}"
             @click="onTargetIndex"
           >去采购</u-button>
        </view>
      </view>

      <view v-show="currentTab === 1">
          <view class="prescription-config-card" v-if="dispensingList.length > 0">
              <view class="config-title">处方用法配置</view>
              <view class="config-row">
                  <view class="config-item">
                      <text class="label">服用天数</text>
                      <u-number-box v-model="prescriptionDays" :min="1" :max="99" @change="updateDays"></u-number-box>
                      <text class="unit">天</text>
                  </view>
                  <view class="config-item">
                      <text class="label">每日包数</text>
                      <u-number-box v-model="prescriptionPacks" :min="1" :max="5" @change="updatePacks"></u-number-box>
                      <text class="unit">包</text>
                  </view>
              </view>
          </view>
          
          <view class="prescription-config-card" v-if="dispensingList.length > 0">
              <view class="config-title">医嘱 (选填)</view>
              <view class="advice-box">
                  <textarea class="advice-input" v-model="doctorAdvice" placeholder="请输入医嘱 (如: 饭后温服，忌辛辣)..." maxlength="200"></textarea>
                  <text class="word-count">{{ doctorAdvice.length }}/200</text>
              </view>
          </view>

          <view class="dispensing-list" v-if="dispensingList.length > 0">
              <view class="list-title">
                  <text>药品清单 ({{ dispensingList.length }}味)</text>
                  <text class="clear-btn" @click="clearDispensingCart">清空处方</text>
              </view>
              <view v-for="(item, index) in dispensingList" :key="item.id" class="herb-item">
                  <view class="herb-info">
                      <view class="name-row">
                          <text class="name">{{ item.goodsName }}</text>
                          <text class="factory">{{ item.manufacturer }}</text>
                      </view>
                      <view class="price-row">
                          <text>单价: ￥{{ item.salePrice }}/g</text>
                      </view>
                  </view>
                  <view class="weight-control">
                      <text class="label">单剂</text>
                      <u-number-box v-model="item.goodsWeight" :min="1" :max="999" @change="val => handleWeightChange(val, item)"></u-number-box>
                      <text class="unit">g</text>
                  </view>
                  <view class="delete-btn" @click="handleDeleteItem(item)">
                      <u-icon name="trash" color="#fa3534" size="36"></u-icon>
                  </view>
              </view>
          </view>
          <view v-else-if="!isLoading" class="empty-cart">
               <u-empty text="暂无处方药品" mode="list"></u-empty>
               <u-button 
                 type="warning" 
                 size="medium" 
                 shape="circle" 
                 :custom-style="{marginTop: '40rpx'}"
                 @click="onTargetIndex"
               >去开方</u-button>
          </view>
      </view>
    </view>

    <view class="footer-wrapper" v-if="(currentTab === 0 && Object.keys(procurementList).length) || (currentTab === 1 && dispensingList.length)">
        
        <view class="footer-bar" v-if="currentTab === 0">
            <view class="footer-left" @click="handleCheckAll">
              <view class="checkbox-icon" :class="{ checked: isAllChecked }">
                <u-icon name="checkbox-mark" color="#fff" size="24" v-if="isAllChecked"></u-icon>
              </view>
              <text class="select-text">全选</text>
            </view>
            <view class="footer-right">
              <view class="total-info">
                <text class="label">合计：</text>
                <view class="price-box">
                  <text class="unit">￥</text>
                  <text class="num">{{ totalPriceProcurement }}</text>
                </view>
              </view>
              <view class="checkout-btn" @click="handleOrder">
                去结算({{ checkedCount }})
              </view>
            </view>
        </view>

        <view class="footer-bar dispensing-footer" v-if="currentTab === 1">
            <view class="summary-info">
                <view class="main-total">
                    <text>总价：</text>
                    <text class="price-symbol">￥</text>
                    <text class="price-val">{{ finalPriceDispensing }}</text>
                </view>
                <view class="sub-total">
                    <text>药费￥{{ drugCostDispensing }} </text>
                    <text v-if="shippingFee > 0" class="fee-tag"> + 运费￥{{ shippingFee }}</text>
                    <text v-else class="fee-tag free"> (免运费)</text>
                </view>
            </view>
            
            <view class="btn-group">
                <view class="action-btn outline" @click.stop="openFavModal">收藏方剂</view>
                <view class="action-btn fill" @click="handleOrder">立即下单</view>
            </view>
        </view>
    </view>

    <u-modal v-model="showFavNameModal" title="收藏方剂" show-cancel-button @confirm="confirmFavorite">
      <view class="slot-content" style="padding: 30rpx;">
        <u-input v-model="favName" type="text" border placeholder="给方剂起个名 (如: 柴胡疏肝散)" />
      </view>
    </u-modal>

  </view>
</template>

<script>
import { 
    getCartList, updateCartNum, deleteCart, 
    getPrescriptionCartList, updatePrescriptionCart, removePrescriptionCart 
} from '@/api/goods/cart.js';
import { addFavorite } from '@/api/goods/favorite.js';

function inArray(val, arr) { return Array.isArray(arr) && arr.includes(val); }

export default {
  data() {
    return {
      inArray,
      currentTab: 0, 
      isLoading: true,
      procurementList: {}, // 采购车数据 (Tab 0)
      dispensingList: [],  // 处方车数据 (Tab 1)
      checkedIds: [],
      prescriptionDays: 3, 
      prescriptionPacks: 2,
      doctorAdvice: '', 
      debounceTimers: {},
      
      // 收藏相关
      showFavNameModal: false,
      favName: '',
      
      // 左滑删除配置
      swipeOptions: [
        {
          text: '删除',
          style: {
            backgroundColor: '#fa3534'
          }
        }
      ]
    }
  },
  computed: {
    allProcurementIds() { return Object.values(this.procurementList).flat().map(item => item.id); },
    isAllChecked() { return this.allProcurementIds.length > 0 && this.checkedIds.length === this.allProcurementIds.length; },
    checkedCount() { return this.checkedIds.length; },
    totalPriceProcurement() {
        let total = 0;
        Object.values(this.procurementList).flat().forEach(item => {
            if (this.inArray(item.id, this.checkedIds)) total += Number(item.salePrice) * Number(item.goodsNum);
        });
        return total.toFixed(2);
    },
    // 处方车单剂价格计算
    singleDosePrice() {
        let total = 0;
        this.dispensingList.forEach(item => {
            const price = Number(item.pricePerGram || item.salePrice || 0);
            total += price * Number(item.goodsWeight || 0); 
        });
        return total;
    },
    drugCostDispensing() { return (this.singleDosePrice * this.prescriptionDays).toFixed(2); },
    shippingFee() { return parseFloat(this.drugCostDispensing) >= 200 ? 0 : 10; },
    finalPriceDispensing() { return (parseFloat(this.drugCostDispensing) + this.shippingFee).toFixed(2); }
  },
  onShow() {
    this.loadData();
  },
  methods: {
    switchTab(index) { 
        this.currentTab = index; 
        this.loadData(); 
    },
    
    goGoodsDetail(goodsId) {
      uni.navigateTo({ url: `/pages/good/detail?id=${goodsId}` });
    },

    loadData() {
        this.isLoading = true;
        if (this.currentTab === 0) {
            getCartList({ limit: 100 }).then(res => {
                this.isLoading = false;
                if(res.code === 200) {
                    const list = res.data?.list || res.result || [];
                    this.procurementList = this.groupCartByBrand(list);
                }
            }).catch(() => { this.isLoading = false; });
        } else {
            // Tab 1: 加载处方车
            getPrescriptionCartList().then(res => {
                this.isLoading = false;
                if(res.code === 200) {
                    if (res.result && Array.isArray(res.result.list)) {
                        this.dispensingList = res.result.list;
                    } else if (Array.isArray(res.result)) {
                        this.dispensingList = res.result;
                    } else {
                        this.dispensingList = [];
                    }
                }
            }).catch(() => { this.isLoading = false; });
        }
    },
    
    groupCartByBrand(list) {
        const groups = {};
        list.forEach(item => {
            const brand = item.manufacturer || '其他';
            if (!groups[brand]) groups[brand] = [];
            groups[brand].push(item);
        });
        return groups;
    },

    // 处理 SwipeAction 点击
    handleSwipeClick(index, item) {
      if (index === 0) { // 索引0是删除按钮
        this.handleDeleteItem(item);
      }
    },

    // 【核心修复】采购车数量变更 (u-number-box)
    handleNumChange(val, item) {
      // 1. 处理 u-number-box 可能返回对象或字符串的问题
      // uView/vk-uview 在不同版本中，event 可能是 {value: 3} 也可能是直接的 3
      let rawVal = val;
      if (typeof val === 'object' && val !== null && val.hasOwnProperty('value')) {
          rawVal = val.value;
      }
      
      // 2. 强制类型转换为 Number 整数，防止 String 传给后端导致 400
      const newNum = parseInt(rawVal);
      
      // 校验：如果是 NaN 或小于1，则不处理
      if (isNaN(newNum) || newNum < 1) return;
      
      // 3. 乐观更新：先更新本地数据，防止 UI 抖动
      // 注意：v-model 已经双向绑定了 item.goodsNum，但为了保险起见，再次赋值正确类型
      item.goodsNum = newNum;

      // 4. 防抖处理 API 请求
      if (this.debounceTimers[item.id]) clearTimeout(this.debounceTimers[item.id]);
        
      this.debounceTimers[item.id] = setTimeout(() => {
          // 5. 构造 API 参数：严格确保 goodsNum 是 Number 类型
          const params = {
              goodsSkuId: item.goodsSkuId, // 保持原有的 goodsSkuId
              goodsNum: Number(newNum)     // ✅ 关键修复：强制 Number 类型
          };

          updateCartNum(params).then(res => {
             if (res.code !== 200) {
                 // 如果失败，提示并可选择重新加载数据
                 uni.showToast({ title: res.message || '更新失败', icon: 'none' });
                 // this.loadData(); // 可选：失败后回滚数据
             }
          }).catch(() => { 
             uni.showToast({ title: '网络请求异常', icon: 'none' });
          }); 
      }, 500);
    },

    // 处方车克重变更
    handleWeightChange(val, item) {
      // 这里的 val 也需要处理类型
      let rawVal = val;
      if (typeof val === 'object' && val !== null && val.hasOwnProperty('value')) {
          rawVal = val.value;
      }
      const newWeight = parseInt(rawVal);
      if (isNaN(newWeight) || newWeight < 1) return;

      item.goodsWeight = newWeight;

      if (this.debounceTimers[item.id]) clearTimeout(this.debounceTimers[item.id]);
      
      this.debounceTimers[item.id] = setTimeout(() => {
          updatePrescriptionCart({ 
              id: item.id, 
              goodsWeight: Number(newWeight) // 同样确保类型安全
          }).catch(() => { this.loadData(); });
      }, 500);
    },
    
    // 处方配置变更
    updateDays(val) { 
        let v = val;
        if(typeof val === 'object') v = val.value;
        this.prescriptionDays = Number(v); 
    },
    updatePacks(val) { 
        let v = val;
        if(typeof val === 'object') v = val.value;
        this.prescriptionPacks = Number(v); 
    },

    // 删除商品
    handleDeleteItem(item) { 
        this.execDelete([item.id], '确定移除该商品吗？'); 
    },
    handleDeleteBrand(brandName, items) { 
        this.execDelete(items.map(i => i.id), `确定删除 ${brandName} 吗？`); 
    },
    
    execDelete(ids, content) {
        uni.showModal({
            title: '提示', content,
            success: ({ confirm }) => {
                if (confirm) {
                    let promise;
                    if (this.currentTab === 0) {
                        promise = deleteCart(ids);
                    } else {
                        promise = removePrescriptionCart({ ids });
                    }
                    promise.then(res => {
                        if (res.code === 200) {
                            if (this.currentTab === 0) {
                                this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
                            }
                            this.loadData();
                            uni.showToast({ title: '删除成功', icon: 'success' });
                        }
                    });
                }
            }
        });
    },

    clearDispensingCart() {
        const ids = this.dispensingList.map(item => item.id);
        this.execDelete(ids, '确定清空当前处方吗？');
    },
    
    // 选中逻辑
    handleCheckItem(id) {
        const idx = this.checkedIds.indexOf(id);
        if (idx === -1) this.checkedIds.push(id); else this.checkedIds.splice(idx, 1);
    },
    isBrandChecked(items) {
        if (!items || items.length === 0) return false;
        return items.every(i => this.checkedIds.includes(i.id));
    },
    handleCheckBrand(brandName, items) {
        const ids = items.map(i => i.id);
        const allChecked = this.isBrandChecked(items);
        if (allChecked) this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
        else this.checkedIds.push(...ids.filter(id => !this.checkedIds.includes(id)));
    },
    handleCheckAll() {
        if (this.isAllChecked) this.checkedIds = []; else this.checkedIds = [...this.allProcurementIds];
    },

    // 下单逻辑
    handleOrder() {
        if (this.currentTab === 0) {
            if (this.checkedIds.length === 0) return uni.showToast({ title: '请选择商品', icon: 'none' });
            uni.navigateTo({ url: `/pages/order/create?type=procurement&cartIds=${this.checkedIds.join(',')}` });
        } else {
            if (this.dispensingList.length === 0) return uni.showToast({ title: '处方为空', icon: 'none' });
            const allIds = this.dispensingList.map(item => item.id).join(',');
            const adviceEncoded = encodeURIComponent(this.doctorAdvice);
            uni.navigateTo({
                url: `/pages/order/create?type=dispensing&cartIds=${allIds}&days=${this.prescriptionDays}&packs=${this.prescriptionPacks}&advice=${adviceEncoded}`
            });
        }
    },
    onTargetIndex() { uni.switchTab({ url: '/pages/category/category' }); },

    // 收藏弹窗
    openFavModal() {
        if (this.dispensingList.length === 0) return uni.showToast({ title: '处方为空', icon: 'none' });
        this.favName = '';
        this.showFavNameModal = true;
    },
    confirmFavorite() {
        if (!this.favName.trim()) return uni.showToast({ title: '请输入名称', icon: 'none' });
        
        uni.showLoading({ title: '收藏中...' });
        const items = this.dispensingList.map(item => ({
            goodsId: item.goodsId, 
            goodsSkuId: item.goodsSkuId,
            goodsWeight: item.goodsWeight 
        }));

        addFavorite({ name: this.favName, items: items }).then(res => {
            uni.hideLoading();
            if(res.code === 200) {
                uni.showToast({ title: '收藏成功', icon: 'success' });
                this.showFavNameModal = false;
            } else {
                uni.showToast({ title: res.message || '收藏失败', icon: 'none' });
            }
        }).catch(() => uni.hideLoading());
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 220rpx;
  background-color: #f5f5f5;
}

/* Tab Header */
.tab-header {
  display: flex;
  background: #fff;
  height: 88rpx;
  line-height: 88rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    color: #666;
    position: relative;
    font-weight: 500;
    transition: all 0.3s;

    &.active {
      color: #ee0a24;
      font-weight: bold;
      font-size: 32rpx;
    }

    .tab-line {
      position: absolute;
      bottom: 8rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background: linear-gradient(90deg, #ff6034, #ee0a24);
      border-radius: 3rpx;
    }
  }
}

.cart-container {
  padding: 24rpx;
}

/* Brand Group */
.brand-group {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.brand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .brand-left {
    display: flex;
    align-items: center;
    
    .brand-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin: 0 10rpx 0 16rpx;
    }
  }

  .clear-btn {
    font-size: 24rpx;
    color: #999;
  }
}

/* Checkbox Style */
.checkbox-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #c8c9cc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #fff;

  &.checked {
    background: #ee0a24;
    border-color: #ee0a24;
  }
}

/* Goods List Item */
.swipe-wrapper {
  margin-bottom: 2rpx; // 分割线效果
}

.goods-item {
  display: flex;
  padding: 24rpx;
  background: #fff;

  .checkbox-area {
    display: flex;
    align-items: center;
    padding-right: 20rpx;
  }

  .goods-image {
    flex-shrink: 0;
    margin-right: 20rpx;
    border-radius: 12rpx;
    overflow: hidden;
    border: 1rpx solid #f0f0f0;
  }

  .goods-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .goods-title {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      line-height: 40rpx;
      margin-bottom: 10rpx;
    }

    .goods-specs {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      margin-bottom: 16rpx;

      .spec-tag {
        font-size: 22rpx;
        color: #909399;
        background: #f4f4f5;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
      }
    }

    .goods-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .price-box {
        color: #ee0a24;
        font-weight: bold;
        line-height: 1;
        
        .symbol { font-size: 24rpx; }
        .number { font-size: 36rpx; }
      }
    }
  }
}

/* Empty State */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
}

/* Footer Bar */
.footer-wrapper {
  position: fixed;
  bottom: 0; /* 如果有 tabbar，可能需要 adjust bottom: var(--window-bottom); */
  bottom: var(--window-bottom);
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 24rpx;

  .footer-left {
    display: flex;
    align-items: center;
    height: 100%;
    
    .select-text {
      margin-left: 12rpx;
      font-size: 28rpx;
      color: #666;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;

    .total-info {
      display: flex;
      align-items: baseline;
      margin-right: 24rpx;
      
      .label {
        font-size: 26rpx;
        color: #333;
      }
      .price-box {
        color: #ee0a24;
        font-weight: bold;
        .unit { font-size: 24rpx; }
        .num { font-size: 36rpx; }
      }
    }

    .checkout-btn {
      width: 200rpx;
      height: 76rpx;
      line-height: 76rpx;
      text-align: center;
      background: linear-gradient(90deg, #ff6034, #ee0a24);
      color: #fff;
      font-size: 30rpx;
      font-weight: bold;
      border-radius: 38rpx;
      box-shadow: 0 4rpx 12rpx rgba(238, 10, 36, 0.3);
      
      &:active { opacity: 0.9; }
    }
  }
}

/* Prescription Footer Specifics */
.dispensing-footer {
  .summary-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .main-total {
      font-size: 28rpx;
      color: #333;
      .price-symbol { color: #ee0a24; font-size: 24rpx; }
      .price-val { color: #ee0a24; font-size: 40rpx; font-weight: bold; }
    }
    
    .sub-total {
      font-size: 22rpx;
      color: #999;
      margin-top: 4rpx;
      .fee-tag { 
        margin-left: 6rpx;
        &.free { color: #19be6b; }
      }
    }
  }
  
  .btn-group {
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      height: 72rpx;
      line-height: 72rpx;
      padding: 0 30rpx;
      border-radius: 36rpx;
      font-size: 28rpx;
      font-weight: 500;
      
      &.outline {
        border: 2rpx solid #ff9900;
        color: #ff9900;
        background: #fff;
      }
      &.fill {
        background: linear-gradient(90deg, #ff9900, #ff6034);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(255, 96, 52, 0.3);
      }
    }
  }
}

/* Prescription Styles (Simple Refinement) */
.prescription-config-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .config-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    border-left: 8rpx solid #ff9900;
    padding-left: 16rpx;
    line-height: 1;
  }
  
  .config-row {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    
    .config-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f9f9f9;
      padding: 16rpx;
      border-radius: 12rpx;
      
      .label { font-size: 26rpx; color: #666; }
      .unit { font-size: 24rpx; color: #999; margin-left: 10rpx; }
    }
  }
  
  .advice-box {
    position: relative;
    .advice-input {
      width: 100%;
      height: 140rpx;
      background: #f9f9f9;
      border-radius: 12rpx;
      padding: 16rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }
    .word-count {
      position: absolute;
      bottom: 16rpx;
      right: 16rpx;
      font-size: 22rpx;
      color: #ccc;
    }
  }
}

.dispensing-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;

  .list-title {
    display: flex;
    justify-content: space-between;
    padding: 24rpx;
    background: #fff7eb;
    color: #d48806;
    font-size: 28rpx;
    font-weight: 500;
  }

  .herb-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    .herb-info {
      flex: 1;
      .name-row {
        margin-bottom: 8rpx;
        .name { font-size: 30rpx; font-weight: bold; margin-right: 12rpx; }
        .factory { font-size: 20rpx; color: #909399; background: #f4f4f5; padding: 2rpx 8rpx; border-radius: 4rpx; }
      }
      .price-row {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .weight-control {
      display: flex;
      align-items: center;
      margin-right: 20rpx;
      .label { font-size: 24rpx; color: #666; margin-right: 10rpx; }
      .unit { font-size: 24rpx; color: #333; margin-left: 10rpx; }
    }
    
    .delete-btn {
      padding: 10rpx;
    }
  }
}
</style>