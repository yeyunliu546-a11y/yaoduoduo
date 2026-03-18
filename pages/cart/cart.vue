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
                <text class="brand-title"> {{ brandName }}</text>
                <u-icon name="arrow-right" size="24" color="#999"></u-icon>
              </view>
              <text class="clear-btn" @click="handleDeleteBrand(brandName, items)">清空厂家</text>
            </view>

            <view class="goods-list">
              <view v-for="(item, idx) in items" :key="item.id" class="goods-item">
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
                  <view class="title-row">
                    <view class="goods-title u-line-2" @click="goGoodsDetail(item.goodsId)">
                      {{ item.goodsName }}
                    </view>
                    <view class="delete-icon" @click.stop="handleDeleteItem(item)">
                      <u-icon name="trash" color="#c0c4cc" size="36"></u-icon>
                    </view>
                  </view>

                  <view class="goods-specs">
                    <view class="spec-tag" v-if="item.standard || item.spec || item.skuName">
                      {{ item.spec || item.skuName || item.standard }}
                    </view>
                    <view class="spec-tag" v-if="item.packageType">
                      {{ item.packageType }}
                    </view>
                    <view class="spec-tag" style="color: #ff6034; background: #fff0eb;" v-if="getMinQty(item) > 1">
                      {{ getMinQty(item) }}件起批
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
                        :min="getMinQty(item)" 
                        :max="9999" 
                        :index="idx"
                        @change="val => handleNumChange(val, item)"
                      ></u-number-box>
                    </view>
                  </view>
                </view>
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
          
          <view class="dispensing-list" v-if="dispensingList.length > 0">
              <view class="list-title">
                  <view class="title-left" @click="isListExpanded = !isListExpanded">
                      <text>药品清单 ({{ dispensingList.length }}味)</text>
                      <u-icon :name="isListExpanded ? 'arrow-up' : 'arrow-down'" color="#d48806" size="28" style="margin-left: 10rpx;"></u-icon>
                  </view>
                  <text class="clear-btn" @click="clearDispensingCart">清空处方</text>
              </view>
              
              <view v-show="isListExpanded" class="herb-list-wrapper">
                  <view v-for="(item, index) in dispensingList" :key="item.id" class="herb-item">
                      <view class="herb-info">
                          <view class="name-row">
                              <text class="name">{{ item.goodsName }}</text>
                              <text class="factory">{{ item.manufacturer }}</text>
                          </view>
                          <view class="price-row">
                              <text>单价: ￥{{ item.salePrice }}/g</text>
                          </view>
                          <view v-if="getMinQty(item) > 1" style="font-size: 20rpx; color: #ff6034; margin-top: 4rpx;">
                              {{ getMinQty(item) }}g起售
                          </view>
                      </view>
                      <view class="weight-control">
                          <text class="label">单剂</text>
                          <u-number-box v-model="item.goodsWeight" :min="getMinQty(item)" :max="999" @change="val => handleWeightChange(val, item)"></u-number-box>
                          <text class="unit">g</text>
                      </view>
                      <view class="delete-btn" @click="handleDeleteItem(item)">
                          <u-icon name="trash" color="#fa3534" size="36"></u-icon>
                      </view>
                  </view>
              </view>
          </view>

          <view class="prescription-config-card" v-if="dispensingList.length > 0">
              <view class="config-title">处方用法配置</view>
              <view class="config-row">
                  <view class="config-item">
                      <text class="label-top">服用天数 (天)</text>
                      <u-number-box v-model="prescriptionDays" :min="1" :max="99" @change="updateDays"></u-number-box>
                  </view>
                  <view class="config-item">
                      <text class="label-top">每日包数 (包)</text>
                      <u-number-box v-model="prescriptionPacks" :min="1" :max="5" @change="updatePacks"></u-number-box>
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
      procurementList: {}, 
      dispensingList: [],  
      checkedIds: [],
      prescriptionDays: 3, 
      prescriptionPacks: 2,
      doctorAdvice: '', 
      debounceTimers: {},
      isListExpanded: true, // 🌟 新增：控制药品清单展开折叠
	  
      showFavNameModal: false,
      favName: ''
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
    getMinQty(item) {
        if (!item) return 1;
        let qty = item.minOrderQuantity || item.MinOrderQuantity 
                  || (item.sku && (item.sku.minOrderQuantity || item.sku.MinOrderQuantity))
                  || (item.goods && (item.goods.minOrderQuantity || item.goods.MinOrderQuantity)) 
                  || 1;
        return Number(qty) > 0 ? Number(qty) : 1;
    },

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
    
    // 🌟 优化：全方位暴力提取“厂家名称”，防止因为嵌套找不到
    groupCartByBrand(list) {
        const groups = {};
        list.forEach(item => {
            let brand = item.manufacturer || item.Manufacturer || 
                       (item.goods && (item.goods.manufacturer || item.goods.Manufacturer)) || 
                       (item.sku && (item.sku.manufacturer || item.sku.Manufacturer)) || 
                       item.brandName || item.BrandName || 
                       '平台自营 / 其他厂家';
            
            if (!groups[brand]) groups[brand] = [];
            groups[brand].push(item);
        });
        return groups;
    },

    handleNumChange(val, item) {
      let rawVal = typeof val === 'object' && val !== null ? val.value : val;
      let newNum = parseInt(rawVal);
      const minQty = this.getMinQty(item);

      if (isNaN(newNum) || newNum < minQty) {
          uni.showToast({ title: `该商品最低${minQty}件起批`, icon: 'none' });
          this.$nextTick(() => { item.goodsNum = minQty; });
          newNum = minQty;
      } else {
          item.goodsNum = newNum;
      }

      if (this.debounceTimers[item.id]) clearTimeout(this.debounceTimers[item.id]);
        
      this.debounceTimers[item.id] = setTimeout(() => {
          updateCartNum({ goodsSkuId: item.goodsSkuId, goodsNum: Number(newNum) }).then(res => {
             if (res.code !== 200) uni.showToast({ title: res.message || '更新失败', icon: 'none' });
          }).catch(() => { uni.showToast({ title: '网络请求异常', icon: 'none' }); }); 
      }, 500);
    },

    handleWeightChange(val, item) {
      let rawVal = typeof val === 'object' && val !== null ? val.value : val;
      let newWeight = parseInt(rawVal);
      const minQty = this.getMinQty(item);

      if (isNaN(newWeight) || newWeight < minQty) {
          uni.showToast({ title: `该药材最低${minQty}g起售`, icon: 'none' });
          this.$nextTick(() => { item.goodsWeight = minQty; });
          newWeight = minQty;
      } else {
          item.goodsWeight = newWeight;
      }

      if (this.debounceTimers[item.id]) clearTimeout(this.debounceTimers[item.id]);
      
      this.debounceTimers[item.id] = setTimeout(() => {
          updatePrescriptionCart({ id: item.id, goodsWeight: Number(newWeight) }).catch(() => { this.loadData(); });
      }, 500);
    },
    
    updateDays(val) { this.prescriptionDays = Number(typeof val === 'object' ? val.value : val); },
    updatePacks(val) { this.prescriptionPacks = Number(typeof val === 'object' ? val.value : val); },

    handleDeleteItem(item) { this.execDelete([item.id], '确定移除该商品吗？'); },
    handleDeleteBrand(brandName, items) { this.execDelete(items.map(i => i.id), `确定删除 ${brandName} 吗？`); },
    
    execDelete(ids, content) {
        uni.showModal({
            title: '提示', content,
            success: ({ confirm }) => {
                if (confirm) {
                    let promise = this.currentTab === 0 ? deleteCart(ids) : removePrescriptionCart({ ids });
                    promise.then(res => {
                        if (res.code === 200) {
                            if (this.currentTab === 0) this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
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
        if (this.isBrandChecked(items)) this.checkedIds = this.checkedIds.filter(id => !ids.includes(id));
        else this.checkedIds.push(...ids.filter(id => !this.checkedIds.includes(id)));
    },
    handleCheckAll() {
        if (this.isAllChecked) this.checkedIds = []; else this.checkedIds = [...this.allProcurementIds];
    },

    handleOrder() {
           if (this.currentTab === 0) {
               if (!this.checkedIds || this.checkedIds.length === 0) {
                   return uni.showToast({ title: '请先勾选要结算的商品', icon: 'none' });
               }
               let errorMsg = '';
               for (let brand in this.procurementList) {
                   const items = this.procurementList[brand];
                   for (let i = 0; i < items.length; i++) {
                       const item = items[i];
                       if (this.inArray(item.id, this.checkedIds)) {
                           const minQty = this.getMinQty(item);
                           if (item.goodsNum < minQty) {
                               errorMsg = `商品【${item.goodsName}】最低需${minQty}件起批，当前仅${item.goodsNum}件，请修改数量`;
                               break; 
                           }
                       }
                   }
                   if (errorMsg) break;
               }
               if (errorMsg) return uni.showToast({ title: errorMsg, icon: 'none', duration: 3000 });
               uni.navigateTo({ 
                   url: `/pages/order/create?type=procurement&cartIds=${encodeURIComponent(JSON.stringify(this.checkedIds))}` 
               });
           } 
           else {
               if (!this.dispensingList || this.dispensingList.length === 0) {
                   return uni.showToast({ title: '处方清单不能为空', icon: 'none' });
               }
               let errorMsg = '';
               for (let i = 0; i < this.dispensingList.length; i++) {
                   const item = this.dispensingList[i];
                   const minQty = this.getMinQty(item);
                   if (item.goodsWeight < minQty) {
                       errorMsg = `药材【${item.goodsName}】最低需${minQty}g起售，当前仅${item.goodsWeight}g，请修改克重`;
                       break;
                   }
               }
               if (errorMsg) return uni.showToast({ title: errorMsg, icon: 'none', duration: 3000 });
   
               const allIds = this.dispensingList.map(item => item.id);
               uni.navigateTo({
                   url: `/pages/order/create?type=dispensing&cartIds=${encodeURIComponent(JSON.stringify(allIds))}&days=${this.prescriptionDays}&packs=${this.prescriptionPacks}&advice=${encodeURIComponent(this.doctorAdvice || '')}`
               });
           }
       },
    onTargetIndex() { uni.switchTab({ url: '/pages/category/category' }); },

    openFavModal() {
        if (this.dispensingList.length === 0) return uni.showToast({ title: '处方为空', icon: 'none' });
        this.favName = ''; this.showFavNameModal = true;
    },
    confirmFavorite() {
        if (!this.favName.trim()) return uni.showToast({ title: '请输入名称', icon: 'none' });
        uni.showLoading({ title: '收藏中...' });
        const items = this.dispensingList.map(item => ({ goodsId: item.goodsId, goodsSkuId: item.goodsSkuId, goodsWeight: item.goodsWeight }));
        addFavorite({ name: this.favName, items: items }).then(res => {
            uni.hideLoading();
            if(res.code === 200) { uni.showToast({ title: '收藏成功', icon: 'success' }); this.showFavNameModal = false; } 
            else uni.showToast({ title: res.message || '收藏失败', icon: 'none' });
        }).catch(() => uni.hideLoading());
    }
  }
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; padding-bottom: 220rpx; background-color: #f5f5f5; }
.tab-header { display: flex; background: #fff; height: 88rpx; line-height: 88rpx; position: sticky; top: 0; z-index: 99; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); .tab-item { flex: 1; text-align: center; font-size: 30rpx; color: #666; position: relative; font-weight: 500; transition: all 0.3s; &.active { color: #ee0a24; font-weight: bold; font-size: 32rpx; } .tab-line { position: absolute; bottom: 8rpx; left: 50%; transform: translateX(-50%); width: 40rpx; height: 6rpx; background: linear-gradient(90deg, #ff6034, #ee0a24); border-radius: 3rpx; } } }
.cart-container { padding: 24rpx; }
.brand-group { background: #fff; border-radius: 20rpx; margin-bottom: 24rpx; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04); }
.brand-header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; .brand-left { display: flex; align-items: center; .brand-title { font-size: 30rpx; font-weight: bold; color: #333; margin: 0 10rpx 0 16rpx; } } .clear-btn { font-size: 24rpx; color: #999; } }
.checkbox-icon { width: 40rpx; height: 40rpx; border-radius: 50%; border: 2rpx solid #c8c9cc; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: #fff; &.checked { background: #ee0a24; border-color: #ee0a24; } }

/* 🌟 新增：标题与删除按钮并排样式 */
.title-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
    .goods-title { 
        flex: 1; 
        font-size: 28rpx; 
        color: #333; 
        font-weight: bold; 
        line-height: 40rpx; 
        margin-bottom: 10rpx; 
        margin-right: 16rpx; 
    } 
    .delete-icon { 
        padding: 4rpx; 
    } 
}

.goods-item { display: flex; padding: 24rpx; background: #fff; border-bottom: 1px solid #f9f9f9; .checkbox-area { display: flex; align-items: center; padding-right: 20rpx; } .goods-image { flex-shrink: 0; margin-right: 20rpx; border-radius: 12rpx; overflow: hidden; border: 1rpx solid #f0f0f0; } .goods-content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; .goods-specs { display: flex; flex-wrap: wrap; gap: 10rpx; margin-bottom: 16rpx; .spec-tag { font-size: 22rpx; color: #909399; background: #f4f4f5; padding: 4rpx 12rpx; border-radius: 6rpx; } } .goods-bottom { display: flex; justify-content: space-between; align-items: flex-end; .price-box { color: #ee0a24; font-weight: bold; line-height: 1; .symbol { font-size: 24rpx; } .number { font-size: 36rpx; } } } } }
.empty-cart { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 120rpx; }
.footer-wrapper { position: fixed; bottom: 0; bottom: var(--window-bottom); left: 0; right: 0; z-index: 999; background: #fff; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.footer-bar { display: flex; justify-content: space-between; align-items: center; height: 100rpx; padding: 0 24rpx; .footer-left { display: flex; align-items: center; height: 100%; .select-text { margin-left: 12rpx; font-size: 28rpx; color: #666; } } .footer-right { display: flex; align-items: center; .total-info { display: flex; align-items: baseline; margin-right: 24rpx; .label { font-size: 26rpx; color: #333; } .price-box { color: #ee0a24; font-weight: bold; .unit { font-size: 24rpx; } .num { font-size: 36rpx; } } } .checkout-btn { width: 200rpx; height: 76rpx; line-height: 76rpx; text-align: center; background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; font-size: 30rpx; font-weight: bold; border-radius: 38rpx; box-shadow: 0 4rpx 12rpx rgba(238, 10, 36, 0.3); &:active { opacity: 0.9; } } } }
.dispensing-footer { .summary-info { display: flex; flex-direction: column; justify-content: center; .main-total { font-size: 28rpx; color: #333; .price-symbol { color: #ee0a24; font-size: 24rpx; } .price-val { color: #ee0a24; font-size: 40rpx; font-weight: bold; } } .sub-total { font-size: 22rpx; color: #999; margin-top: 4rpx; .fee-tag { margin-left: 6rpx; &.free { color: #19be6b; } } } } .btn-group { display: flex; gap: 20rpx; .action-btn { height: 72rpx; line-height: 72rpx; padding: 0 30rpx; border-radius: 36rpx; font-size: 28rpx; font-weight: 500; &.outline { border: 2rpx solid #ff9900; color: #ff9900; background: #fff; } &.fill { background: linear-gradient(90deg, #ff9900, #ff6034); color: #fff; box-shadow: 0 4rpx 12rpx rgba(255, 96, 52, 0.3); } } } }
/* 🌟 更新后的处方用法配置与医嘱卡片样式 */
.prescription-config-card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 24rpx; .config-title { font-size: 30rpx; font-weight: bold; margin-bottom: 20rpx; border-left: 8rpx solid #ff9900; padding-left: 16rpx; line-height: 1; } .config-row { display: flex; justify-content: space-between; gap: 20rpx; .config-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f9f9f9; padding: 30rpx 16rpx; border-radius: 12rpx; .label-top { font-size: 28rpx; color: #666; margin-bottom: 24rpx; font-weight: 500; } } } .advice-box { position: relative; .advice-input { width: 100%; height: 140rpx; background: #f9f9f9; border-radius: 12rpx; padding: 16rpx; font-size: 28rpx; color: #333; box-sizing: border-box; } .word-count { position: absolute; bottom: 16rpx; right: 16rpx; font-size: 22rpx; color: #ccc; } } }

/* 🌟 更新后的药品清单卡片样式 */
.dispensing-list { background: #fff; border-radius: 20rpx; overflow: hidden; margin-bottom: 24rpx; .list-title { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; background: #fff7eb; color: #d48806; font-size: 28rpx; font-weight: 500; .title-left { display: flex; align-items: center; } } .herb-item { display: flex; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; .herb-info { flex: 1; .name-row { margin-bottom: 8rpx; .name { font-size: 30rpx; font-weight: bold; margin-right: 12rpx; } .factory { font-size: 20rpx; color: #909399; background: #f4f4f5; padding: 2rpx 8rpx; border-radius: 4rpx; } } .price-row { font-size: 24rpx; color: #999; } } .weight-control { display: flex; align-items: center; margin-right: 20rpx; .label { font-size: 24rpx; color: #666; margin-right: 10rpx; } .unit { font-size: 24rpx; color: #333; margin-left: 10rpx; } } .delete-btn { padding: 10rpx; } } }
</style>