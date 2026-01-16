<template>
	<view class="container">
		<!-- 页面头部 -->
		<view class="main-header"
		      :style="{ height: platform == 'H5' ? '260rpx' : '280rpx', paddingTop: platform == 'H5' ? '0' : '80rpx' }">
			<!-- 用户信息 -->
			<view class="user-info">
				<view class="user-avatar" @click="handlePersonal()">
					<avatar-image :url="userInfo.urlAvater" :width="100"/>
				</view>
				<view class="user-content">
					<!-- 会员昵称 -->
					<view class="nick-name oneline-hide" @click="handlePersonal()">{{ userInfo.nickName }}</view>
					<!-- 会员等级 -->
					<view v-if="userInfo.grade_id > 0 && userInfo.grade" class="user-grade">
						<view class="user-grade_icon">
							<image class="image"
							       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA0lBMVEUAAAD/tjL/tzH/uDP/uC7/tjH/tzH/tzL/tTH+tTL+tjP/tDD/tTD+tzD/tjL/tjL+tjD/tjT/szb/tzL/tTL+uTH+tjL/tjL/tjL/tTT/tjL/tjL+tjH/uTL/vDD/tjL/tjH/tzL9uS//tTL/nBr/sS7/tjH/ujL/szD/uTv+rzf/tzL+tzH+vDP+uzL+tjP+ry7+tDL9ki/7szf/sEX/tTL/tjL+tjL/tTH/tTT/tzH/tzL/tjP/sTX/uTP/wzX+rTn/vDX9vC8m8ckhAAAAOXRSTlMAlnAMB/vjxKWGMh0S6drMiVxPRkEY9PLy0ru0sKagmo5+dGtgVCMgBP716eXWyMGxqJGRe2o5KSmFNjaYAAABP0lEQVQ4y8XS13KDMBAF0AWDDe4t7r3ETu9lVxJgJ/n/X8rKAzHG5TE+Twz3zki7I/g/KXdghIbGJewrU4yzn08Ebgl6TuZzzuOC6W5es3HX6qsSz3NFShRU0MpucytDmOSpu3yULx3CA9RD1HjVedc0jSjqm6ZzhUjDsFDQhSp/OKj5GQvg0+ZCOixsbtDLAeTTOm/yGi8GyIphIVsgH737FEDV44LJa88IRKK/SetrwT9G/GUIr6vXjoy4GXn7+RboVXnghuSjaoGecwQxL2su3CwAKlO+QFoqxI4FMctHQhQd2OhxTu184jWUlI+rMTBTn1/IQcJHQ6GQdZ7pWiDaNdhTt330efISeiqYwQEzQpTlsURJLhzkEmpCPsERfeIUVyXr6MNuIyp5uziW6xURtt7hhGwzmMNJExfO4Bd9X0ZPqAxdNwAAAABJRU5ErkJggg==">
							</image>
						</view>
						<view class="user-grade_name">
							<text>{{ userInfo.grade.name }}</text>
						</view>
					</view>
					<!-- 会员无等级时显示手机号 -->
					<view v-else class="mobile">{{ userInfo.phone }}</view>
				</view>
			</view>
		</view>

		<!-- 我的钱包 -->
		<view class="my-asset">
		  <!-- 账户余额 -->
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value">{{ userInfo.balance }}</view>
		    <view class="item-name">账户余额</view>
		  </view>
		
		  <!-- 积分 -->
		  <view class="asset-item" @click="onTargetPoints">
		    <view class="item-value">{{ userInfo.points }}</view>
		    <view class="item-name">{{ setting.pointsName }}</view>
		  </view>
		
		  <!-- 优惠券 -->
		  <view class="asset-item" @click="onTargetMyCoupon">
		    <view class="item-value">{{ userInfo.countCoupon }}</view>
		    <view class="item-name">优惠券</view>
		  </view>
		
		  <!-- 我的钱包（带图标） -->
		  <view class="asset-item" @click="onTargetWallet">
		    <view class="item-value icon-value">
		      <text class="iconfont icon-qianbao"></text>
		    </view>
		    <view class="item-name">我的钱包</view>
		  </view>
		</view>

		<!-- 订单操作 -->
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

		<!-- 我的服务 -->
		<view class="my-service">
			<view class="service-title">常用功能</view>
			<view class="service-content clearfix">
				<block v-for="item in service" :key="item.id">
				  <!-- 普通链接项 -->
				  <view 
				    v-if="item.type === 'link'" 
				    class="service-item" 
				    @click="handleService(item)"
				  >
				    <view class="item-icon">
				      <text class="iconfont" :class="`icon-${item.icon}`"></text>
				    </view>
				    <view class="item-name">{{ item.name }}</view>
				  </view>
				
				  <!-- 微信客服：必须用 <button> -->
				  <button 
				    v-else-if="item.type === 'button' && platform === 'mp-weixin'"
				    class="service-item-btn"
				    open-type="contact"
				  >
				    <view class="item-icon">
				      <text class="iconfont" :class="`icon-${item.icon}`"></text>
				    </view>
				    <view class="item-name">{{ item.name }}</view>
				  </button>
				</block>
			</view>
		</view>

		<!-- 店铺推荐（独立区块） -->
		<view class="recommend-section">
		  <Recommend title="店铺推荐" />
		</view>  
	</view>
</template>

<script>
import store from '@/store'
import AvatarImage from '@/components/avatar-image/avatar-image.vue'
// import { setCartTabBadge } from '@/core/app'
import SettingKeyEnum from '@/common/enum/setting/Key'
// import SettingModel from '@/common/model/Setting'
import Recommend from '@/pages/good/components/Recommend'

// 订单操作
const orderNavbar = [{
	id: 'all',
	name: '全部订单',
	bigOrderStatus: 0,
	icon: 'quanbudingdan'
}, {
	id: 'countNotPaid',
	name: '待支付',
	bigOrderStatus: 10,
	icon: 'daizhifu',
	count: 1
}, {
	id: 'countWaitDeliver',
	name: '待发货',
	bigOrderStatus: 20,
	icon: 'daifahuo',
	count: 0
}, {
	id: 'countWaitReceiving',
	name: '待收货',
	bigOrderStatus: 30,
	icon: 'daishouhuo',
	count: 0
}, {
	id: 'countWaitComment',
	name: '待评价',
	bigOrderStatus: 40,
	icon: 'daipingjia',
	count: 0
}]

/**
 * 我的服务
 * id: 标识; name: 标题名称; icon: 图标; type 类型(link和button); url: 跳转的链接
 */
const service = [{
	id: 'address',
	name: '收货地址',
	icon: 'dizhi',
	type: 'link',
	url: 'pages/address/index'
}, {
	id: 'coupon',
	name: '领券中心',
	icon: 'lingquanzhongxin',
	type: 'link',
	url: 'pages/coupon/index'
}, {
	id: 'myCoupon',
	name: '优惠券',
	icon: 'youhuiquan',
	type: 'link',
	url: 'pages/my-coupon/index'
}, {
	id: 'points',
	name: '我的积分',
	icon: 'jifen',
	type: 'link',
	url: 'pages/points/log'
}, {
	id: 'Refund',
	name: '退换/售后',
	icon: 'shouhou',
	type: 'link',
	url: 'pages/refund/index',
	count: 2
}, {
	id: 'orderCenter',
	name: '订单中心',
	icon: 'dingdanzhongxin',
	type: 'link',
	url: 'pages/order/center'
}, {
	id: 'help',
	name: '我的帮助',
	icon: 'bangzhu',
	type: 'link',
	url: 'pages/help/index',
},{
	id: 'contact',
	name: '在线客服',
	icon: 'kefu1',
	type: 'button',
	openType: 'contact'
}]

export default {
	components: {
		Recommend,
		AvatarImage
	},
	data() {
		return {
			platform: '',
			//常用功能
			service: JSON.parse(JSON.stringify(service)), // 防止外部修改影响
			// 枚举类
			SettingKeyEnum,
			// 正在加载
			isLoading: false,
			// 首次加载
			isFirstload: true,
			// 是否已登录
			isLogin: true,
			// 系统设置
			setting: {
				pointsName: '积分',
			},
			// 当前用户信息
			userInfo: {
				urlAvater: 'https://via.placeholder.com/100', // 使用占位符图片URL作为头像
				nickName: '张三',
				grade_id: 1,
				grade: {
					name: '黄金会员'
				},
				phone: '12345678901',
				balance: '100.00',
				points: 500,
				countCoupon: 3,
			},
			// 账户资产
			assets: {
				balance: '100.00',
				points: 500,
				coupon: '--'
			},
			// 订单操作
			orderNavbar,
			// 当前用户待处理的订单数量
			orderGroupCount: {
				countNotPaid: 1,
				countWaitDeliver: 0,
				countWaitReceiving: 0,
				Refund: 2,
			},
			listRecommend: [], // 推荐商品
		}
	},

	onShow(options) {
		// 如果需要，可以根据实际情况保留或调整这里的逻辑
	},
	
	onLoad() {
	  const info = uni.getSystemInfoSync();
	  this.platform = info.uniPlatform; // 'mp-weixin', 'h5', 'app-plus'...
	  console.log('当前平台:', this.platform);
	},

	methods: {
		handlePersonal() {
			this.$navTo('pages/user/personal/index')
		},

		onTargetWallet() {
			this.$navTo('pages/wallet/index')
		},

		onTargetOrder(item) {
			this.$navTo('pages/order/order', {
				bigOrderStatus: item.bigOrderStatus
			})
		},

		onTargetPoints() {
			this.$navTo('pages/points/log')
		},

		onTargetMyCoupon() {
			this.$navTo('pages/my-coupon/index')
		},

		handleService(item) {
		  if (item.id === 'contact') {
		    // 非微信平台：跳转到客服页面或拨打电话
		    if (this.platform !== 'MP-WEIXIN') {
		      uni.navigateTo({ url: '/pages/customer-service/index' });
		      return;
		    }
		  }
		  this.$navTo(item.url);
		},

		/**
		 * 下拉刷新
		 */
		onPullDownRefresh() {
			// 结束下拉刷新
			uni.stopPullDownRefresh();
			// 可选：模拟更新某些数据
			this.userInfo.points += Math.floor(Math.random() * 10);
		},
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