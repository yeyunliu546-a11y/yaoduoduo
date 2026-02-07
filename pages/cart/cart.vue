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

    <view v-show="currentTab === 0">
        <view v-if="Object.keys(procurementList).length" class="cart-list">
             <view v-for="(items, brandName) in procurementList" :key="brandName" class="brand-group">
                <view class="brand-header">
                    <view class="brand-left">
                        <label class="radio-label" @click="handleCheckBrand(brandName, items)">
                            <radio class="radio" color="#ff3800" :checked="isBrandChecked(items)" />
                        </label>
                        <view class="brand-title">🏭 {{ brandName }}</view>
                    </view>
                    <view class="delete-brand-btn" @click="handleDeleteBrand(brandName, items)">删除</view>
                </view>
                <view class="brand-products">
                    <view v-for="(item, idx) in items" :key="item.id" class="product-item">
                        <label class="item-radio" @click.stop="handleCheckItem(item.id)">
                            <radio class="radio" color="#ff3800" :checked="inArray(item.id, checkedIds)" />
                        </label>
                        <view class="product-content">
                            <view class="goods-header">
                                <text class="goods-title">{{ item.goodsName }}</text>
                                <view class="delete-text" @click="handleDeleteItem(item)">ⓧ</view>
                            </view>
                            <view class="goods-tags">
                                <text class="tag tag-blue" v-if="item.standard">{{ item.standard }}</text>
                                <text class="tag tag-green" v-if="item.packageType">{{ item.packageType }}</text>
                            </view>
                            <view class="goods-props">
                                <text>规格：{{ item.spec || item.skuName }}</text>
                                <text class="unit-price">￥{{ item.salePrice }}</text>
                            </view>
                            <view class="item-foot">
                                <view></view>
                                <view class="stepper-box">
                                    <button class="step-btn" @click="changeQty(item, -1)">-</button>
                                    <input class="step-input" type="number" :value="item.goodsNum" disabled />
                                    <button class="step-btn" @click="changeQty(item, 1)">+</button>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
             </view>
        </view>
        <view v-else-if="!isLoading" class="empty-cart">
             <u-empty text="购物车空空如也" mode="cart"></u-empty>
             <button class="go-shop" @click="onTargetIndex">去采购</button>
        </view>
    </view>

    <view v-show="currentTab === 1">
        <view class="prescription-config-card" v-if="dispensingList.length > 0">
            <view class="config-title">处方用法配置</view>
            <view class="config-row">
                <view class="config-item">
                    <text class="label">服用天数</text>
                    <view class="stepper-box orange">
                        <button class="step-btn" @click="updateDays(-1)">-</button>
                        <input class="step-input" type="number" v-model="prescriptionDays" />
                        <button class="step-btn" @click="updateDays(1)">+</button>
                    </view>
                    <text class="unit">天</text>
                </view>
                <view class="config-item">
                    <text class="label">每日包数</text>
                    <view class="stepper-box orange">
                        <button class="step-btn" @click="updatePacks(-1)">-</button>
                        <input class="step-input" type="number" v-model="prescriptionPacks" disabled />
                        <button class="step-btn" @click="updatePacks(1)">+</button>
                    </view>
                    <text class="unit">包</text>
                </view>
            </view>
        </view>
        
        <view class="prescription-config-card" v-if="dispensingList.length > 0">
            <view class="config-title">医嘱 (选填)</view>
            <view class="advice-box">
                <textarea class="advice-input" v-model="doctorAdvice" placeholder="请输入医嘱..." maxlength="200"></textarea>
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
                    <view class="stepper-box">
                        <button class="step-btn" @click="changeQty(item, -1)">-</button>
                        <input class="step-input" type="number" :value="item.goodsWeight" disabled />
                        <button class="step-btn" @click="changeQty(item, 1)">+</button>
                    </view>
                    <text class="unit">g</text>
                </view>
                <view class="delete-btn" @click="handleDeleteItem(item)">
                    <u-icon name="close" color="#ccc"></u-icon>
                </view>
            </view>
        </view>
        <view v-else-if="!isLoading" class="empty-cart">
             <u-empty text="暂无处方药品" mode="list"></u-empty>
             <button class="go-shop" @click="onTargetIndex">去开方</button>
        </view>
    </view>

    <view class="footer-wrapper" v-if="(currentTab === 0 && Object.keys(procurementList).length) || (currentTab === 1 && dispensingList.length)">
        <view class="footer-fixed" v-if="currentTab === 0">
            <label class="all-radio" @click="handleCheckAll">
              <radio class="radio" color="#ff3800" :checked="isAllChecked" />
              <text class="select-text">全选</text>
            </label>
            <view class="total-info">
              <text class="label">合计：</text>
              <view class="goods-price"><text class="unit">￥</text>{{ totalPriceProcurement }}</view>
            </view>
            <view class="action-btn" @click="handleOrder">生成需求</view>
        </view>

        <view class="footer-fixed dispensing-footer" v-if="currentTab === 1">
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
                <view class="action-btn orange" @click="handleOrder">立即下单</view>
            </view>
        </view>
    </view>

    <view class="custom-modal-mask" v-if="showFavNameModal" @click.stop="showFavNameModal = false">
        <view class="custom-modal-content" @click.stop>
            <view class="modal-title">收藏方剂</view>
            <view class="modal-input-box">
                <input class="modal-input" type="text" v-model="favName" placeholder="给方剂起个名 (如: 柴胡疏肝散)" />
            </view>
            <view class="modal-footer">
                <view class="modal-btn cancel" @click="showFavNameModal = false">取消</view>
                <view class="modal-btn confirm" @click="confirmFavorite">确定收藏</view>
            </view>
        </view>
    </view>

  </view>
</template>

<script>
// 【核心修复】引入两套接口
import { 
    getCartList, updateCartNum, deleteCart, 
    // 引入处方车接口
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
      favName: ''
    }
  },
  computed: {
    allProcurementIds() { return Object.values(this.procurementList).flat().map(item => item.id); },
    isAllChecked() { return this.allProcurementIds.length > 0 && this.checkedIds.length === this.allProcurementIds.length; },
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
            total += price * Number(item.goodsWeight || 0); // 注意：处方车用 goodsWeight
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
        this.loadData(); // 切换Tab时刷新数据
    },
    
    // 【核心修复】分Tab加载数据
    loadData() {
        this.isLoading = true;
        if (this.currentTab === 0) {
            // Tab 0: 加载普通采购车
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
                    // 确保返回的是数组
                    this.dispensingList = res.result || [];
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

    // 【核心修复】修改数量 - 分流处理
    changeQty(item, delta) {
        // Tab 0 用 goodsNum, Tab 1 用 goodsWeight
        const currentNum = this.currentTab === 0 ? item.goodsNum : item.goodsWeight;
        const newNum = currentNum + delta;
        
        if (newNum < 1) return uni.showToast({ title: '不能再少了', icon: 'none' });
        
        // 乐观更新视图
        if (this.currentTab === 0) item.goodsNum = newNum;
        else item.goodsWeight = newNum;

        if (this.debounceTimers[item.id]) clearTimeout(this.debounceTimers[item.id]);
        
        this.debounceTimers[item.id] = setTimeout(() => {
            if (this.currentTab === 0) {
                // 普通车：UpdateCartNum (goodsSkuId, goodsNum)
                updateCartNum({ 
                    goodsSkuId: item.goodsSkuId, 
                    goodsNum: newNum 
                }).catch(() => { item.goodsNum = currentNum; }); // 失败回滚
            } else {
                // 处方车：updatePrescriptionCart (id, goodsWeight)
                updatePrescriptionCart({ 
                    id: item.id, // 处方车通常直接用记录ID
                    goodsWeight: newNum 
                }).catch(() => { item.goodsWeight = currentNum; });
            }
        }, 500);
    },

    // 【核心修复】删除商品 - 分流处理
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
                        // 普通车：deleteCart (string[])
                        promise = deleteCart(ids);
                    } else {
                        // 处方车：removePrescriptionCart ({ ids: [] })
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

    // 处方配置逻辑 (保持不变)
    updateDays(delta) {
        let newVal = this.prescriptionDays + delta;
        if (newVal < 1) newVal = 1; if (newVal > 99) newVal = 99;
        this.prescriptionDays = newVal;
    },
    updatePacks(delta) {
        let newVal = this.prescriptionPacks + delta;
        if (newVal < 1) newVal = 1; if (newVal > 5) newVal = 5;
        this.prescriptionPacks = newVal;
    },
    clearDispensingCart() {
        const ids = this.dispensingList.map(item => item.id);
        this.execDelete(ids, '确定清空当前处方吗？');
    },
    
    // 选中逻辑 (仅Tab 0)
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

    // 收藏弹窗逻辑
    openFavModal() {
        if (this.dispensingList.length === 0) {
            return uni.showToast({ title: '处方为空', icon: 'none' });
        }
        this.favName = '';
        this.showFavNameModal = true;
    },
    
    confirmFavorite() {
        if (!this.favName.trim()) {
            return uni.showToast({ title: '请输入名称', icon: 'none' });
        }
        
        uni.showLoading({ title: '收藏中...' });
        
        // 构造符合文档的参数
        const items = this.dispensingList.map(item => ({
            goodsId: item.goodsId, 
            goodsSkuId: item.goodsSkuId,
            goodsWeight: item.goodsWeight // 处方车使用 goodsWeight
        }));

        addFavorite({ 
            name: this.favName, 
            items: items 
        }).then(res => {
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
/* 保持原有样式不变 */
.container { min-height: 100vh; padding-bottom: 220rpx; background: #f5f5f5; }
.tab-header { display: flex; background: #fff; height: 88rpx; line-height: 88rpx; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid #f0f0f0; .tab-item { flex: 1; text-align: center; font-size: 30rpx; color: #666; position: relative; &.active { color: #2979ff; font-weight: bold; } .tab-line { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40rpx; height: 6rpx; background: #2979ff; border-radius: 3rpx; } } }

.cart-list { padding: 20rpx; }
.brand-group { background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; padding-bottom: 10rpx; overflow: hidden;}
.brand-header { display: flex; justify-content: space-between; padding: 20rpx; border-bottom: 1px solid #f5f5f5; background: #fff; .brand-left { display: flex; align-items: center; font-weight: bold; font-size: 28rpx; } .delete-brand-btn { font-size: 24rpx; color: #999; } }
.product-item { display: flex; padding: 20rpx; border-bottom: 1px solid #f9f9f9; .product-content { flex: 1; margin-left: 10rpx; display: flex; flex-direction: column; } .goods-header { display: flex; justify-content: space-between; .goods-title { font-size: 30rpx; font-weight: 500; } .delete-text { color: #ccc; } } .goods-tags { display: flex; margin: 8rpx 0; gap: 8rpx; .tag { font-size: 20rpx; padding: 2rpx 6rpx; border: 1px solid #ddd; border-radius: 4rpx; } } .goods-props { display: flex; justify-content: space-between; font-size: 24rpx; color: #999; margin-bottom: 10rpx; .unit-price { color: #ff4400; font-size: 28rpx; } } .item-foot { display: flex; justify-content: space-between; align-items: center; } }
.stepper-box { display: flex; border: 1px solid #ddd; border-radius: 8rpx; background: #fff; .step-btn { width: 50rpx; height: 44rpx; line-height: 44rpx; background: #f9f9f9; padding: 0; margin: 0; font-size: 28rpx; display: flex; align-items: center; justify-content: center; &::after{border:none} } .step-input { width: 70rpx; height: 44rpx; text-align: center; font-size: 26rpx; border-left: 1px solid #eee; border-right: 1px solid #eee; } &.orange { border-color: #ffaa00; .step-btn { color: #ffaa00; background: #fffbf0; } .step-input { color: #ffaa00; } } }
.prescription-config-card { margin: 20rpx; padding: 24rpx; background: #fff; border-radius: 16rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); .config-title { font-weight: bold; font-size: 30rpx; margin-bottom: 20rpx; border-left: 6rpx solid #ffaa00; padding-left: 16rpx; line-height: 1; } .config-row { display: flex; justify-content: space-between; } .config-item { display: flex; align-items: center; background: #fdfdfd; padding: 16rpx; border-radius: 12rpx; border: 1px solid #f0f0f0; .label { margin-right: 16rpx; font-size: 28rpx; color: #555; } .unit { margin-left: 10rpx; font-size: 24rpx; color: #999; } } .advice-box { position: relative; .advice-input { width: 100%; height: 160rpx; background: #f9f9f9; border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; color: #333; box-sizing: border-box;} .word-count { position: absolute; bottom: 16rpx; right: 16rpx; font-size: 22rpx; color: #ccc; } } }
.dispensing-list { margin: 20rpx; background: #fff; border-radius: 16rpx; overflow: hidden; .list-title { display: flex; justify-content: space-between; padding: 24rpx; background: #fffbf0; color: #d48806; font-size: 28rpx; .clear-btn { color: #999; font-size: 24rpx; text-decoration: underline; } } .herb-item { display: flex; align-items: center; padding: 24rpx; border-bottom: 1px solid #f5f5f5; .herb-info { flex: 1; .name-row { margin-bottom: 6rpx; .name { font-size: 30rpx; font-weight: bold; margin-right: 10rpx; } .factory { font-size: 22rpx; color: #999; background: #f5f5f5; padding: 2rpx 6rpx; border-radius: 4rpx;} } .price-row { font-size: 24rpx; color: #999; } } .weight-control { display: flex; align-items: center; .label { font-size: 24rpx; color: #666; margin-right: 8rpx; } .unit { font-size: 24rpx; color: #333; margin-left: 8rpx; width: 20rpx;} } .delete-btn { width: 60rpx; text-align: right; color: #ccc; } } }
.footer-wrapper { position: fixed; bottom: 0; left: 0; right: 0; bottom: var(--window-bottom); z-index: 99; background: #fff; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.footer-fixed { display: flex; align-items: center; height: 100rpx; padding: 0 30rpx; .all-radio { display: flex; align-items: center; margin-right: 20rpx; .select-text { margin-left: 10rpx; font-size: 26rpx;} } .total-info { flex: 1; display: flex; align-items: baseline; justify-content: flex-end; padding-right: 20rpx; .label { font-size: 26rpx; } .goods-price { color: #ff4400; font-size: 36rpx; font-weight: bold; .unit{font-size: 24rpx;} } } 
    .action-btn { width: 220rpx; height: 76rpx; line-height: 76rpx; text-align: center; background: #2979ff; color: #fff; border-radius: 38rpx; font-size: 28rpx; font-weight: bold; 
        &.outline { background: #fff; border: 1px solid #2979ff; color: #2979ff; margin-right: 20rpx; }
        &.orange { background: linear-gradient(90deg, #ffaa00, #ff4400); } 
    } 
}
.dispensing-footer { justify-content: space-between; .summary-info { display: flex; flex-direction: column; justify-content: center; .main-total { font-size: 28rpx; color: #333; .price-symbol { color: #ff4400; font-size: 24rpx; } .price-val { color: #ff4400; font-size: 40rpx; font-weight: bold; } } .sub-total { font-size: 22rpx; color: #666; margin-top: 4rpx; .fee-tag { color: #ff4400; &.free { color: #52c41a; } } } } .btn-group { display: flex; align-items: center; } }
.empty-cart { text-align: center; padding-top: 100rpx; .go-shop { margin-top: 40rpx; width: 200rpx; font-size: 28rpx; background: #fff; border: 1px solid #ccc; color: #666;} }

.custom-modal-mask {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    display: flex; justify-content: center; align-items: center;
}
.custom-modal-content {
    width: 600rpx; background: #fff; border-radius: 20rpx; padding: 40rpx;
    animation: modal-pop 0.2s ease-out;
}
@keyframes modal-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-title { text-align: center; font-size: 34rpx; font-weight: bold; margin-bottom: 40rpx; color: #333; }
.modal-input-box { margin-bottom: 40rpx; }
.modal-input { height: 80rpx; background: #f5f5f5; padding: 0 20rpx; border-radius: 10rpx; font-size: 28rpx; }
.modal-footer { display: flex; justify-content: space-between; gap: 30rpx; }
.modal-btn { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; border-radius: 40rpx; font-size: 30rpx; }
.modal-btn.cancel { background: #f5f5f5; color: #666; }
.modal-btn.confirm { background: #2979ff; color: #fff; }
</style>