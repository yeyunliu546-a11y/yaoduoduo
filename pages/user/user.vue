<template>
	<view class="container">
		<view class="main-header"
		      :style="{ height: platform == 'H5' ? '260rpx' : '280rpx', paddingTop: platform == 'H5' ? '0' : '80rpx' }">
			<view class="user-info">
				<view class="user-avatar" @click="handlePersonal()">
					<avatar-image :url="userInfo.urlAvater" :width="100"/>
				</view>
				<view class="user-content">
					<view class="nick-name oneline-hide" @click="handlePersonal()">{{ userInfo.nickName || '点击登录' }}</view>
					<view v-if="userInfo.grade_id > 0 && userInfo.grade" class="user-grade">
						<view class="user-grade_icon">
							<image class="image" src="https://via.placeholder.com/32"></image>
						</view>
						<view class="user-grade_name">
							<text>{{ userInfo.grade.name }}</text>
						</view>
					</view>
					<view v-else class="mobile">{{ userInfo.phone || '登录后享受更多权益' }}</view>
				</view>
			</view>
		</view>

		<view class="my-asset">
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value">{{ assets.balance || '0.00' }}</view>
		    <view class="item-name">账户余额</view>
		  </view>
		  <view class="asset-item" @click="onTargetPoints">
		    <view class="item-value">{{ assets.points || 0 }}</view>
		    <view class="item-name">{{ setting.pointsName || '积分' }}</view>
		  </view>
		  <view class="asset-item" @click="onTargetMyCoupon">
		    <view class="item-value">{{ assets.coupon || 0 }}</view>
		    <view class="item-name">优惠券</view>
		  </view>
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value icon-value">
		      <u-icon name="rmb-circle" size="40" color="#333"></u-icon>
		    </view>
		    <view class="item-name">我的钱包</view>
		  </view>
		</view>

		<view class="order-navbar">
			<view class="order-navbar-item" v-for="(item, index) in orderNavbar" :key="index"
			      @click="onTargetOrder(item)">
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
			<view class="service-content clearfix">
				<block v-for="item in service" :key="item.id">
				  <view v-if="item.type === 'link'" class="service-item" @click="handleService(item)">
				    <view class="item-icon">
				      <text class="iconfont" :class="`icon-${item.icon}`"></text>
				    </view>
				    <view class="item-name">{{ item.name }}</view>
				  </view>
				  <button v-else-if="item.type === 'button' && platform === 'mp-weixin'"
				    class="service-item-btn" open-type="contact">
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
// 1. 引入必要文件
import AvatarImage from '@/components/avatar-image/avatar-image.vue'
import Recommend from '@/pages/good/components/Recommend'
import request from '@/utils/request/request.js' // [新增] 用于请求订单数量

// 2. 静态配置数据 (保留你原本的配置)
const orderNavbar = [{
	id: 'all',
	name: '全部订单',
	bigOrderStatus: 0,
	icon: 'quanbudingdan'
}, {
	id: 'countNotPaid',
	name: '待支付',
	bigOrderStatus: 1, // 这里注意：原本可能是 10，这里为了匹配 Tab 索引改为 1
	icon: 'daizhifu',
	count: 0 // 初始为 0
}, {
	id: 'countWaitDeliver',
	name: '待发货',
	bigOrderStatus: 2,
	icon: 'daifahuo',
	count: 0
}, {
	id: 'countWaitReceiving',
	name: '待收货',
	bigOrderStatus: 3,
	icon: 'daishouhuo',
	count: 0
}, {
	id: 'countWaitComment',
	name: '待评价',
	bigOrderStatus: 4,
	icon: 'daipingjia',
	count: 0
}]

const service = [{
	id: 'address', name: '收货地址', icon: 'dizhi', type: 'link', url: '/pages/address/index'
}, {
	id: 'coupon', name: '领券中心', icon: 'lingquanzhongxin', type: 'link', url: '/pages/coupon/index'
}, {
	id: 'myCoupon', name: '优惠券', icon: 'youhuiquan', type: 'link', url: '/pages/my-coupon/index'
}, {
	id: 'points', name: '我的积分', icon: 'jifen', type: 'link', url: '/pages/points/log'
}, {
	id: 'Refund', name: '退换/售后', icon: 'shouhou', type: 'link', url: '/pages/refund/index'
}, {
	id: 'orderCenter', name: '订单中心', icon: 'dingdanzhongxin', type: 'link', url: '/pages/order/center'
}, {
	id: 'help', name: '我的帮助', icon: 'bangzhu', type: 'link', url: '/pages/help/index'
}, {
	id: 'contact', name: '在线客服', icon: 'kefu1', type: 'button', openType: 'contact'
}]

export default {
	components: { Recommend, AvatarImage },
	data() {
		return {
			platform: 'H5', // 这里的平台判断逻辑可保留你原有的
			service,
			orderNavbar, // 核心：绑定上面的数组
			userInfo: {
				nickName: '测试用户',
				urlAvater: '/static/default-avatar.png',
				phone: '138****8888',
				grade: { name: '普通会员' },
                grade_id: 1
			},
			assets: {
				balance: '1000.00',
				points: 200,
				coupon: 5
			},
			setting: { pointsName: '积分' }
		}
	},
	// [核心] 每次显示页面时，刷新订单数量
	onShow() {
		this.loadOrderCounts();
	},
	methods: {
		// [核心逻辑] 加载订单数量并映射到图标上
		loadOrderCounts() {
			request({
				url: '/api/Order/GetOrderCount',
				method: 'GET'
			}).then(res => {
				if (res.code === 200) {
					const counts = res.result;
					// 遍历 orderNavbar，根据 ID 匹配 API 返回的数量
					this.orderNavbar.forEach(item => {
						if (item.id === 'countNotPaid') item.count = counts.payment;
						if (item.id === 'countWaitDeliver') item.count = counts.delivery;
						if (item.id === 'countWaitReceiving') item.count = counts.received;
                        // Mock 暂无待评价数据，默认为0
					});
				}
			});
		},

		// 跳转订单列表
		onTargetOrder(item) {
			// bigOrderStatus 对应 order.vue 里的 currentStatus 索引
            // 0:全部, 1:待付款, 2:待发货...
			uni.navigateTo({
				url: `/pages/order/order?status=${item.bigOrderStatus}`
			});
		},

		// 跳转其他服务
		handleService(item) {
			if (item.url) {
				uni.navigateTo({ url: item.url });
			} else {
                uni.showToast({ title: '功能开发中', icon: 'none' });
            }
		},

        // 个人信息
        handlePersonal() {
            // uni.navigateTo({ url: '/pages/user/personal' });
        },
        
        // 钱包跳转
        onTargetWallet() {
            uni.navigateTo({ url: '/pages/wallet/recharge/index' });
        },
        onTargetPoints() {
            uni.navigateTo({ url: '/pages/points/log' });
        },
        onTargetMyCoupon() {
            uni.navigateTo({ url: '/pages/my-coupon/index' });
        }
	}
}
</script>

<style lang="scss" scoped>
// 页面头部
.main-header {
	background-color: #fff;
	position: relative;
	width: 100%;
	height: 280rpx;
	background-size: 100% 100%;
	overflow: hidden;
	display: flex;
	align-items: center;
	padding-left: 30rpx;

	.user-info {
		display: flex;
		height: 100rpx;
		z-index: 1;

		.user-content {
			display: flex;
			flex-direction: column;
			justify-content: center;
			margin-left: 30rpx;
			color: #c59a46;

			.nick-name {
				font-size: 34rpx;
				font-weight: bold;
				max-width: 270rpx;
			}

			.mobile {
				margin-top: 15rpx;
				font-size: 28rpx;
			}

			.user-grade {
				align-self: baseline;
				display: flex;
				align-items: center;
				background: #3c3c3c;
				margin-top: 12rpx;
				border-radius: 10rpx;
				padding: 4rpx 12rpx;

				.user-grade_icon .image {
					display: block;
					width: 32rpx;
					height: 32rpx;
				}

				.user-grade_name {
					margin-left: 5rpx;
					font-size: 26rpx;
					color: #EEE0C3;
				}

			}

			.login-tips {
				margin-top: 12rpx;
				font-size: 30rpx;
			}

		}
	}
}

// 角标组件
.item-badge {
	position: absolute;
	top: 0;
	right: 55rpx;
	background: #fa2209;
	color: #fff;
	border-radius: 100%;
	min-width: 38rpx;
	height: 38rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1rpx;
	font-size: 24rpx;
}

.my-asset {
  display: flex;
  flex-direction: row;
  justify-content: space-around; /* 或 space-between */
  align-items: center;
  background: #fff;
  padding: 40rpx 20rpx;

  .asset-item {
    text-align: center;
    color: #666;
    width: 150rpx; /* 可根据屏幕调整 */
    flex-shrink: 0; /* 防止压缩 */

    .item-value {
	  font-size: 34rpx;
	  color: red;
	  margin-bottom: 8rpx;
	  line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50rpx;
    }

    /* 钱包图标特殊样式 */
    .icon-value {
      color: #545454 !important;
      font-size: 44rpx !important;
    }

    .item-name {
      font-size: 26rpx;
      color: #545454;
      white-space: nowrap;
    }
  }
}

// 订单操作
.order-navbar {
	display: flex;
	margin: 20rpx auto 20rpx auto;
	padding: 20rpx 0;
	width: 94%;
	box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
	font-size: 30rpx;
	border-radius: 5rpx;
	background: #fff;

	&-item {
		position: relative;
		width: 25%;

		.item-icon {
			text-align: center;
			margin: 0 auto;
			padding: 10rpx 0;
			color: #545454;
			font-size: 44rpx;
		}

		.item-name {
			font-size: 28rpx;
			color: #545454;
			text-align: center;
			margin-right: 10rpx;
		}

	}
}

// 我的服务
.my-service {
	margin: 22rpx auto 22rpx auto;
	padding: 22rpx 0;
	width: 94%;
	box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
	border-radius: 5rpx;
	background: #fff;

	.service-title {
		padding-left: 24rpx;
		margin-bottom: 20rpx;
		font-size: 30rpx;
	}

	.service-content {
		margin-bottom: -20rpx;

		// 普通项（link 类型）
		.service-item {
			position: relative;
			width: 25%;
			float: left;
			margin-bottom: 30rpx;

			.item-icon {
				text-align: center;
				margin: 0 auto;
				padding: 14rpx 0;
				color: #ff3800;
				font-size: 44rpx;
			}

			.item-name {
				font-size: 28rpx;
				color: #545454;
				text-align: center;
				margin-right: 10rpx;
			}
		}

		// 客服按钮（button 类型）—— 新增！
		.service-item-btn {
			position: relative;
			width: 25%;
			float: left;
			margin-bottom: 30rpx;
			background: transparent;     // 去掉默认背景
			border: none;               // 去掉边框
			padding: 0;                 // 重置内边距
			font-size: 28rpx;
			color: #545454;
			line-height: 1.35;
			outline: none;
			-webkit-tap-highlight-color: transparent; // 去掉点击高亮

			// 关键：让内部元素布局和 .service-item 一致
			.item-icon {
				text-align: center;
				margin: 0 auto;
				padding: 14rpx 0;
				color: #ff3800;
				font-size: 44rpx;
			}

			.item-name {
				font-size: 28rpx;
				color: #545454;
				text-align: center;
				margin-right: 10rpx;
			}

			// 去掉 button 默认的::after边框（微信特有）
			&::after {
				border: none;
			}
		}
	}
}

.recommend-section {
  margin-top: 20rpx auto; /* 自动上下边距 */
  width: 94%; /* 或者根据设计需求调整宽度 */
  text-align: center; /* 内容居中 */
  padding: 22rpx 0;
  background-color: #fff; /* 根据实际设计选择背景颜色 */
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.05); /* 可选，增加阴影效果 */
  border-radius: 5rpx; /* 可选，圆角效果 */

  .recommend-title {
    font-size: 30rpx;
    color: #333;
  }
}
</style>