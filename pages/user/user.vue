<template>
	<view class="container">
		<view class="main-header" :style="{ height: platform == 'H5' ? '260rpx' : '280rpx', paddingTop: platform == 'H5' ? '0' : '80rpx' }">
			<view class="user-info">
				<view class="user-avatar" @click="handlePersonal()">
					<avatar-image :url="userInfo.urlAvater" :width="100"/>
				</view>
				<view class="user-content">
					<view class="nick-name oneline-hide" @click="handlePersonal()">{{ userInfo.nickName }}</view>
					<view v-if="userInfo.grade_id > 0 && userInfo.grade" class="user-grade">
						<view class="user-grade_icon">
							<image class="image" src="https://via.placeholder.com/32"></image>
						</view>
						<view class="user-grade_name"><text>{{ userInfo.grade.name }}</text></view>
					</view>
					<view v-else class="mobile">{{ userInfo.phone }}</view>
				</view>
			</view>
		</view>

		<view class="my-asset">
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value">{{ userInfo.balance }}</view>
		    <view class="item-name">账户余额</view>
		  </view>
		  <view class="asset-item" @click="onTargetPoints">
		    <view class="item-value">{{ userInfo.points }}</view>
		    <view class="item-name">{{ setting.pointsName }}</view>
		  </view>
		  <view class="asset-item" @click="onTargetMyCoupon">
		    <view class="item-value">{{ userInfo.countCoupon }}</view>
		    <view class="item-name">优惠券</view>
		  </view>
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value icon-value">
		      <text class="iconfont icon-qianbao"></text>
		    </view>
		    <view class="item-name">我的钱包</view>
		  </view>
		</view>

		<view class="order-navbar">
			<view class="order-navbar-item" v-for="(item, index) in orderNavbar" :key="index" @click="onTargetOrder(item)">
				<view class="item-icon">
					<text class="iconfont" :class="[`icon-${item.icon}`]"></text>
				</view>
				<view class="item-name">{{ item.name }}</view>
				<view class="item-badge" v-if="item.count && item.count > 0">
					<text v-if="item.count <= 99" class="text">{{ item.count }}</text>
					<text v-else class="text">99+</text>
				</view>
			</view>
		</view>

		<view class="my-service">
			<view class="service-title">常用功能</view>
			<view class="service-content">
				<block v-for="(item, index) in service" :key="index">
				  
				  <view v-if="item.type === 'link'" class="service-item" @click="handleService(item)">
				    <view class="item-icon">
				      <image 
                        v-if="item.id === 'fav'" 
                        src="/static/menu/fav.png" 
                        mode="aspectFit" 
                        style="width: 50rpx; height: 50rpx; margin-bottom: 2rpx;"
                      ></image>
				      
				      <text v-else class="iconfont" :class="`icon-${item.icon}`"></text>
				    </view>
				    <view class="item-name">{{ item.name }}</view>
				  </view>
				  
				  <button v-else-if="item.type === 'button'" class="service-item-btn" open-type="contact">
				    <view class="item-icon">
				      <text class="iconfont" :class="`icon-${item.icon}`"></text>
				    </view>
				    <view class="item-name">{{ item.name }}</view>
				  </button>
				</block>
			</view>
		</view>

		<view class="recommend-section">
		  <Recommend title="店铺推荐" />
		</view>  
	</view>
</template>

<script>
import AvatarImage from '@/components/avatar-image/avatar-image.vue'
import Recommend from '@/pages/good/components/Recommend'
import request from '@/utils/request/request.js'

const orderNavbar = [{
	id: 'all', name: '全部订单', bigOrderStatus: 0, icon: 'quanbudingdan'
}, {
	id: 'countNotPaid', name: '待支付', bigOrderStatus: 1, icon: 'daizhifu', count: 0
}, {
	id: 'countWaitDeliver', name: '待发货', bigOrderStatus: 2, icon: 'daifahuo', count: 0
}, {
	id: 'countWaitReceiving', name: '待收货', bigOrderStatus: 3, icon: 'daishouhuo', count: 0
}, {
	id: 'countWaitComment', name: '待评价', bigOrderStatus: 4, icon: 'daipingjia', count: 0
}]

// 服务列表
const service = [
    { id: 'address', name: '收货地址', icon: 'dizhi', type: 'link', url: '/pages/address/index' },
    // 这里的 icon 属性不再重要，因为 id='fav' 会触发上面的图片渲染
    { id: 'fav', name: '调剂收藏夹', icon: 'star', type: 'link', url: '/pages/favorite/index' },
    { id: 'coupon', name: '领券中心', icon: 'lingquanzhongxin', type: 'link', url: '/pages/coupon/index' },
    { id: 'myCoupon', name: '优惠券', icon: 'youhuiquan', type: 'link', url: '/pages/my-coupon/index' },
    { id: 'points', name: '我的积分', icon: 'jifen', type: 'link', url: '/pages/points/log' },
    { id: 'Refund', name: '退换/售后', icon: 'shouhou', type: 'link', url: '/pages/refund/index' },
    { id: 'orderCenter', name: '订单中心', icon: 'dingdanzhongxin', type: 'link', url: '/pages/order/center' },
    { id: 'help', name: '我的帮助', icon: 'bangzhu', type: 'link', url: '/pages/help/index' },
    { id: 'contact', name: '在线客服', icon: 'kefu1', type: 'button', openType: 'contact' }
]

export default {
	components: { Recommend, AvatarImage },
	data() {
		return {
			platform: 'H5',
			service,
			setting: { pointsName: '积分' },
			userInfo: {
				urlAvater: '/static/default-avatar.png',
				nickName: '微信用户',
				grade_id: 1,
				grade: { name: '黄金会员' },
				phone: '138****8888',
				balance: '100.00',
				points: 500,
				countCoupon: 3,
			},
			orderNavbar
		}
	},
    onLoad() {
        const info = uni.getSystemInfoSync();
        this.platform = info.uniPlatform;
    },
	onShow() {
        this.loadOrderCounts();
	},
	methods: {
		handlePersonal() { this.$navTo('pages/user/personal/index') },
		onTargetWallet() { this.$navTo('pages/wallet/recharge/index') },
		onTargetOrder(item) { uni.navigateTo({ url: `/pages/order/order?status=${item.bigOrderStatus}` }) },
		onTargetPoints() { this.$navTo('pages/points/log') },
		onTargetMyCoupon() { this.$navTo('pages/my-coupon/index') },
		handleService(item) {
		  if (item.id === 'contact' && this.platform !== 'mp-weixin') {
		      uni.showToast({title: '请在微信小程序中使用', icon: 'none'});
		      return;
		  }
		  if(item.url) uni.navigateTo({ url: item.url });
		},
        loadOrderCounts() {
            request({
                url: '/api/Order/GetOrderGroupCount',
                method: 'GET'
            }).then(res => {
                if (res.code === 200) {
                    const counts = res.result;
                    this.orderNavbar.forEach(item => {
                        if (item.id === 'countNotPaid') item.count = counts.payment;
                        if (item.id === 'countWaitDeliver') item.count = counts.delivery;
                        if (item.id === 'countWaitReceiving') item.count = counts.received;
                    });
                }
            });
        },
        $navTo(url) { uni.navigateTo({ url }); }
	}
}
</script>

<style lang="scss" scoped>
/* 保持所有样式不变，只修改了 Template 里的图片路径逻辑 */
.main-header { background-color: #fff; position: relative; width: 100%; height: 280rpx; display: flex; align-items: center; padding-left: 30rpx;
	.user-info { display: flex; height: 100rpx; z-index: 1;
		.user-content { display: flex; flex-direction: column; justify-content: center; margin-left: 30rpx; color: #c59a46;
			.nick-name { font-size: 34rpx; font-weight: bold; }
			.mobile { margin-top: 15rpx; font-size: 28rpx; }
			.user-grade { align-self: baseline; display: flex; align-items: center; background: #3c3c3c; margin-top: 12rpx; border-radius: 10rpx; padding: 4rpx 12rpx;
				.user-grade_icon .image { display: block; width: 32rpx; height: 32rpx; }
				.user-grade_name { margin-left: 5rpx; font-size: 26rpx; color: #EEE0C3; }
			}
		}
	}
}
.item-badge { position: absolute; top: 0; right: 55rpx; background: #fa2209; color: #fff; border-radius: 100%; min-width: 38rpx; height: 38rpx; display: flex; justify-content: center; align-items: center; padding: 1rpx; font-size: 24rpx; }
.my-asset { display: flex; justify-content: space-around; align-items: center; background: #fff; padding: 40rpx 20rpx;
  .asset-item { text-align: center; color: #666; flex-shrink: 0;
    .item-value { font-size: 34rpx; color: red; margin-bottom: 8rpx; display: flex; align-items: center; justify-content: center; height: 50rpx; }
    .icon-value { color: #545454 !important; font-size: 44rpx !important; }
    .item-name { font-size: 26rpx; color: #545454; }
  }
}
.order-navbar { display: flex; margin: 20rpx auto; padding: 20rpx 0; width: 94%; box-shadow: 0 1rpx 5rpx rgba(0,0,0,0.05); border-radius: 5rpx; background: #fff;
	&-item { position: relative; width: 25%;
		.item-icon { text-align: center; padding: 10rpx 0; color: #545454; font-size: 44rpx; }
		.item-name { font-size: 28rpx; color: #545454; text-align: center; }
	}
}
.my-service { 
    margin: 22rpx auto; 
    padding: 22rpx 0; 
    width: 94%; 
    box-shadow: 0 1rpx 5rpx rgba(0,0,0,0.05); 
    border-radius: 5rpx; 
    background: #fff;
	
    .service-title { padding-left: 24rpx; margin-bottom: 20rpx; font-size: 30rpx; }
	
    .service-content {
        display: flex; flex-wrap: wrap; width: 100%;
		.service-item, .service-item-btn {
			width: 25%; text-align: center; margin-bottom: 30rpx;
            display: flex; flex-direction: column; align-items: center; justify-content: center;

			.item-icon { 
                height: 60rpx; 
                display: flex; align-items: center; justify-content: center; margin-bottom: 10rpx;
                color: #ff3800; font-size: 44rpx; 
            }
			.item-name { font-size: 26rpx; color: #545454; }
		}
        .service-item-btn { background: transparent; border: none; padding: 0; line-height: 1.35; outline: none; &::after { border: none; } }
	}
}
.recommend-section { margin-top: 20rpx; width: 94%; margin: 20rpx auto; }
</style>