<template>
	<view class="container">
		<view class="header-bg" :style="{ paddingTop: platform == 'H5' ? '40rpx' : '100rpx' }">
			<view class="user-info">
				<view class="user-avatar" @click="handlePersonal()">
					<avatar-image :url="userInfo.urlAvater" :width="110"/>
				</view>
				<view class="user-content">
					<view class="nick-name" @click="handlePersonal()">{{ userInfo.nickName }}</view>
					<view class="user-sub">
						<view v-if="userInfo.grade_id > 0 && userInfo.grade" class="user-grade">
							<u-icon name="vip-fill" color="#ffd700" size="24" margin-right="6"></u-icon>
							<text>{{ userInfo.grade.name }}</text>
						</view>
						<view v-else class="mobile">{{ userInfo.phone || '绑定手机号，获取更多服务' }}</view>
					</view>
				</view>
			</view>
		</view>

		<view class="main-content">
			
			<view class="card asset-card">
						  <view class="asset-item" @click="onTargetPoints">
						    <view class="item-value">{{ userInfo.points }}</view>
						    <view class="item-name">{{ setting.pointsName }}</view>
						  </view>
						  <view class="asset-item" @click="onTargetMyCoupon">
						    <view class="item-value">{{ userInfo.countCoupon }}</view>
						    <view class="item-name">优惠券</view>
						  </view>
						</view>

			<view class="card order-card">
				<view class="card-header" @click="onTargetOrder({bigOrderStatus: 0})">
					<text class="card-title">我的订单</text>
					<view class="card-more">
						<text>全部</text>
						<u-icon name="arrow-right" color="#999" size="24"></u-icon>
					</view>
				</view>
				<view class="order-navbar">
					<view class="order-item" v-for="(item, index) in orderNavbar" :key="index" @click="onTargetOrder(item)">
						<view class="item-icon-box">
							<text class="iconfont" :class="[`icon-${item.icon}`]"></text>
							<view class="item-badge" v-if="item.count && item.count > 0">
								{{ item.count > 99 ? '99+' : item.count }}
							</view>
						</view>
						<view class="item-name">{{ item.name }}</view>
					</view>
				</view>
			</view>

			<view class="card service-card">
							<view class="card-header">
								<text class="card-title">常用功能</text>
							</view>
							<view class="service-grid">
								<block v-for="(item, index) in service" :key="index">
								  <view v-if="item.type === 'link'" class="service-item" @click="handleService(item)">
								  					    <view class="item-icon">
								  					      <u-icon v-if="item.isUview" :name="item.icon" color="#2979ff" size="56"></u-icon>
								  					      <text v-else class="iconfont" :class="`icon-${item.icon}`"></text>
								  					    </view>
								  					    <view class="item-name">{{ item.name }}</view>
								  					  </view>
								  
								  <button v-else-if="item.type === 'button'" class="service-item reset-btn" open-type="contact">
								    <view class="item-icon">
								      <text class="iconfont" :class="`icon-${item.icon}`"></text>
								    </view>
								    <view class="item-name">{{ item.name }}</view>
								  </button>
								</block>
							</view>
						</view>
			<view class="action-section" v-if="hasLogin">
							<view class="setting-row card" @click="handlePersonal()">
								<text class="setting-title">个人设置</text>
								<u-icon name="arrow-right" color="#999" size="28"></u-icon>
							</view>
							
							<button class="logout-btn card" hover-class="logout-hover" @click="handleLogout">退出当前账号</button>
						</view>
			
			<view class="bottom-spacer"></view>
		</view>
	</view>
</template>

<script>
import AvatarImage from '@/components/avatar-image/avatar-image.vue'
import request from '@/utils/request/request.js'
import { getDetail } from '@/api/user/user.js'

// 🌟 优化：去掉了 redundant 的“全部订单”，放到卡片头部了
const orderNavbar = [{
	id: 'countNotPaid', name: '待付款', bigOrderStatus: 1, icon: 'daizhifu', count: 0
}, {
	id: 'countWaitDeliver', name: '待发货', bigOrderStatus: 2, icon: 'daifahuo', count: 0
}, {
	id: 'countWaitReceiving', name: '待收货', bigOrderStatus: 3, icon: 'daishouhuo', count: 0
}, {
	id: 'countWaitComment', name: '待评价', bigOrderStatus: 4, icon: 'daipingjia', count: 0
}]

// 🌟 优化：去掉了 redundant 的“订单中心”
const service = [
    { id: 'address', name: '收货地址', icon: 'dizhi', type: 'link', url: '/pages/address/index' },
    { id: 'fav', name: '调剂收藏夹', icon: 'star', type: 'link', isUview: true, url: '/pages/favorite/index' },
    { id: 'coupon', name: '领券中心', icon: 'lingquanzhongxin', type: 'link', url: '/pages/coupon/index' },
    { id: 'myCoupon', name: '我的卡券', icon: 'youhuiquan', type: 'link', url: '/pages/my-coupon/index' },
    { id: 'points', name: '我的积分', icon: 'jifen', type: 'link', url: '/pages/points/log' },
    { id: 'Refund', name: '退换/售后', icon: 'shouhou', type: 'link', url: '/pages/refund/index' },
    { id: 'help', name: '我的帮助', icon: 'bangzhu', type: 'link', url: '/pages/help/index' },
    { id: 'contact', name: '在线客服', icon: 'kefu1', type: 'button', openType: 'contact' }
]

export default {
	components: { AvatarImage },
	data() {
		return {
			platform: 'H5',
			service,
			setting: { pointsName: '积分' },
			hasLogin: false, 
			userInfo: {
				urlAvater: '/static/default-avatar.png',
				nickName: '点击登录/注册',
				grade_id: 0,
				grade: null,
				phone: '',
				balance: '0.00',
				points: 0,
				countCoupon: 0,
			},
			orderNavbar
		}
	},
    onLoad() {
        const info = uni.getSystemInfoSync();
        this.platform = info.uniPlatform;
    },
	onShow() {
        this.initData();
	},
	methods: {
        initData() {
            const token = uni.getStorageSync('token');
            if (!token) {
                this.hasLogin = false; 
                this.resetUserInfo();
                return;
            }
            
            this.hasLogin = true; 

            getDetail().then(res => {
                if(res.code === 200 && res.result) {
                    const info = res.result;
                    this.userInfo.nickName = info.nickName || info.nickname || '微信用户';
                    this.userInfo.urlAvater = info.avatar || info.urlAvater || info.avatarUrl || '/static/default-avatar.png';
                    this.userInfo.grade_id = info.grade_id || 0;
                    this.userInfo.grade = info.grade || null;
                    this.userInfo.phone = info.mobile || info.phone || '';
					
					this.userInfo.balance = info.balance || info.Balance || '0.00';
					this.userInfo.points = info.points || info.Points || 0;
					this.userInfo.countCoupon = info.coupon || info.countCoupon || info.CouponCount || info.coupon_num || 0;
                }
            });

            this.loadOrderCounts();
        },

        resetUserInfo() {
             this.userInfo = {
                urlAvater: '/static/default-avatar.png',
                nickName: '点击登录/注册',
                grade_id: 0,
                grade: null,
                phone: '',
                balance: '0.00',
                points: 0,
                countCoupon: 0,
            };
            this.orderNavbar.forEach(item => item.count = 0);
        },

        handleLogout() {
            uni.showModal({
                title: '系统提示',
                content: '确定要退出当前登录账号吗？',
                confirmColor: '#2979ff',
                success: (res) => {
                    if (res.confirm) {
                        this.$store.dispatch('Logout').then(() => {
                            uni.showToast({ title: '已安全退出', icon: 'success' });
                            this.hasLogin = false;
                            this.resetUserInfo();
                        });
                    }
                }
            });
        },

		handlePersonal() { 
            if(!uni.getStorageSync('token')) {
                uni.navigateTo({ url: '/pages/login/index' });
                return;
            }
            this.$navTo('/pages/user/personal/index') 
        },
		onTargetWallet() { 
            if(!this.checkLogin()) return;
            this.$navTo('pages/wallet/recharge/index') 
        },
		onTargetOrder(item) { 
            if(!this.checkLogin()) return;
            uni.navigateTo({ url: `/pages/order/order?status=${item.bigOrderStatus}` }) 
        },
		onTargetPoints() { 
            if(!this.checkLogin()) return;
            this.$navTo('pages/points/log') 
        },
		onTargetMyCoupon() { 
            if(!this.checkLogin()) return;
            this.$navTo('pages/my-coupon/index') 
        },
		handleService(item) {
		  if (item.id === 'contact' && this.platform !== 'mp-weixin') {
		      uni.showToast({title: '请在微信小程序中使用', icon: 'none'});
		      return;
		  }
		  if(item.url) {
              if(!this.checkLogin()) return;
              uni.navigateTo({ url: item.url });
          }
		},
        
        checkLogin() {
             if(!uni.getStorageSync('token')) {
                uni.navigateTo({ url: '/pages/login/index' });
                return false;
            }
            return true;
        },

        loadOrderCounts() {
            if(!uni.getStorageSync('token')) return;
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
.container { background-color: #f5f7fa; min-height: 100vh; }

/* 沉浸式渐变头部 */
.header-bg { 
	background: linear-gradient(135deg, #2979ff 0%, #518cff 100%); 
	height: 380rpx; 
	padding: 0 40rpx;
	box-sizing: border-box;
	border-bottom-left-radius: 40rpx;
	border-bottom-right-radius: 40rpx;
}

.user-info { 
	display: flex; 
	align-items: center; 
	margin-top: 20rpx;
	
	.user-avatar {
		border: 4rpx solid rgba(255,255,255,0.4);
		border-radius: 50%;
		overflow: hidden;
		width: 118rpx;
		height: 118rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
	}
	
	.user-content { 
		flex: 1; 
		display: flex; 
		flex-direction: column; 
		margin-left: 30rpx; 
		color: #fff;
		
		.nick-name { 
			font-size: 38rpx; 
			font-weight: 800; 
			letter-spacing: 1rpx;
			margin-bottom: 12rpx;
		}
		
		.user-sub {
			display: flex;
			align-items: center;
			
			.mobile { 
				font-size: 24rpx; 
				opacity: 0.9;
			}
			
			.user-grade { 
				display: inline-flex; 
				align-items: center; 
				background: rgba(0, 0, 0, 0.2); 
				border-radius: 20rpx; 
				padding: 4rpx 16rpx;
				font-size: 22rpx;
				backdrop-filter: blur(4px);
			}
		}
	}
	
	
}

/* 核心内容区悬浮 */
.main-content {
	position: relative;
	z-index: 2;
	margin-top: -100rpx; 
	padding: 0 24rpx;
}

/* 通用卡片样式 */
.card {
	background: #fff;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
	overflow: hidden;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 30rpx 20rpx;
	border-bottom: 1px solid transparent; /* 预留边框位置 */
	
	.card-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}
	
	.card-more {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #999;
	}
}

/* 资产卡片 */
.asset-card {
	display: flex;
	justify-content: space-around;
	padding: 40rpx 20rpx;
	
	.asset-item { 
		flex: 1; 
		text-align: center; 
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.item-value { 
			font-size: 36rpx; 
			color: #333; 
			font-weight: bold; 
			margin-bottom: 12rpx; 
			font-family: Arial, Helvetica, sans-serif;
		}
		
		.item-name { 
			font-size: 24rpx; 
			color: #666; 
		}
		
		.icon-value {
			color: #2979ff !important;
			font-size: 44rpx !important;
		}
	}
	
	.wallet-btn {
		border-left: 1px solid #f0f0f0;
	}
}

/* 订单卡片 */
.order-navbar { 
	display: flex; 
	padding: 10rpx 0 30rpx; 
	
	.order-item { 
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.item-icon-box { 
			position: relative;
			padding: 10rpx;
			margin-bottom: 8rpx;
			
			.iconfont {
				font-size: 52rpx; 
				color: #333;
			}
			
			.item-badge { 
				position: absolute; 
				top: 0rpx; 
				right: -10rpx; 
				background: #fa3534; 
				color: #fff; 
				border-radius: 20rpx; 
				padding: 2rpx 10rpx; 
				font-size: 20rpx;
				font-weight: bold;
				line-height: 1.2;
				border: 2rpx solid #fff;
			}
		}
		.item-name { font-size: 24rpx; color: #666; }
	}
}

/* 服务网格卡片 */
.service-grid { 
	display: flex; 
	flex-wrap: wrap; 
	padding: 10rpx 0 20rpx;
	
	.service-item {
		width: 25%; 
		display: flex; 
		flex-direction: column; 
		align-items: center; 
		margin-bottom: 30rpx;
		
		.item-icon { 
			width: 60rpx;
			height: 60rpx;
			display: flex; 
			align-items: center; 
			justify-content: center; 
			margin-bottom: 12rpx;
			
			.iconfont {
				font-size: 56rpx;
				color: #2979ff;
			}
			.custom-icon {
				width: 50rpx; 
				height: 50rpx;
			}
		}
		.item-name { font-size: 24rpx; color: #666; }
	}
	
	/* 消除原生 button 样式 */
	.reset-btn { 
		background: transparent; 
		border: none; 
		padding: 0; 
		margin: 0; 
		line-height: 1.5; 
		outline: none; 
		&::after { border: none; } 
	}
}

/* 底部操作区 (设置 + 退出) */
.action-section {
    margin: 40rpx 0;
    
    /* 设置行样式 */
    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx 30rpx;
        margin-bottom: 24rpx; /* 与退出按钮保持间距 */
        
        .setting-title {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
        }
        
        &:active {
            background-color: #f9f9f9;
        }
    }
    
    .logout-btn {
        background-color: #fff;
        color: #333;
        font-size: 30rpx;
        height: 96rpx;
        line-height: 96rpx;
        border-radius: 24rpx;
        border: none;
        
        &::after { border: none; }
    }
    
    .logout-hover {
        background-color: #f5f5f5;
    }
}

.bottom-spacer {
	height: 40rpx;
}
</style>