<template>
	<view class="container">
		<mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ use: false }" :up="upOption"
			@up="upCallback">

			<u-tabs :list="tabs" :is-scroll="false" :current="curTab" active-color="#FA2209" :duration="0.2"
				@change="onChangeTab" />

			<empty v-if="!list.data.length" :isLoading="isLoading"></empty>

			<view class="coupon-list">
				<view class="coupon-item" v-for="(item, index) in list.data" :key="index">
					<view class="item-wrapper"
						:class="['color-' + (item.status == 10 ? color[index % color.length] : 'gray')]">
						<view class="coupon-type">{{item.strCouponType}}</view>
						<view class="tip dis-flex flex-dir-column flex-x-center">
							<view>
								<text class="f-30">￥</text>
								<text class="money">{{ item.reducePrice }}</text>
							</view>
							<text class="pay-line">满{{ item.minPrice }}元可用</text>
						</view>
						<view class="split-line"></view>
						<view class="content dis-flex flex-dir-column flex-x-between">
							<view class="title">{{ item.name }}</view>
							<view class="bottom dis-flex flex-y-center">
								<view class="time flex-box">
									<block v-if="item.startTime === item.endTime">{{ item.startTime }} 当天有效</block>
									<block v-else>{{ item.startTime }}~{{ item.endTime }}</block>
								</view>
								<view class="receive status">
									<text>{{ item.strStatus }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</mescroll-body>
	</view>
</template>

<script>
	import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
	import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins.js'
	import {
		getEmptyPaginateObj,
		getMoreListData
	} from '@/core/app.js'
	// import * as UserCouponApi from '@/api/user/userCoupon' // [模拟修改] 注释API
	import {
		CouponTypeEnum
	} from '@/common/enum/coupon'
	import uTabs from '@/uview-ui/components/u-tabs/u-tabs.vue';

	const color = ['red', 'blue', 'violet', 'yellow']
	const pageSize = 15
	
	// Tab配置
	const tabs = [{
		name: `未使用`,
		value: '10'
	}, {
		name: `已使用`,
		value: '-20'
	}, {
		name: `已过期`,
		value: '-10'
	}]

	// [模拟修改] 定义模拟数据源
	const mockAllCoupons = [
		// --- 未使用 (status: 10) ---
		{ id: 1, name: '新人注册礼包', strCouponType: '全场券', reducePrice: '10.00', minPrice: '0.00', startTime: '2023-11-01', endTime: '2025-12-31', status: 10, strStatus: '去使用' },
		{ id: 2, name: '满减优惠券', strCouponType: '满减券', reducePrice: '20.00', minPrice: '199.00', startTime: '2023-11-05', endTime: '2025-11-05', status: 10, strStatus: '去使用' },
		{ id: 3, name: '会员专属券', strCouponType: '会员券', reducePrice: '50.00', minPrice: '500.00', startTime: '2023-10-01', endTime: '2025-10-01', status: 10, strStatus: '去使用' },
		{ id: 4, name: '周末狂欢券', strCouponType: '限时券', reducePrice: '5.00', minPrice: '20.00', startTime: '2023-12-01', endTime: '2025-12-30', status: 10, strStatus: '去使用' },
		
		// --- 已使用 (status: -20) ---
		{ id: 5, name: '双11大促红包', strCouponType: '大促券', reducePrice: '100.00', minPrice: '1000.00', startTime: '2023-11-11', endTime: '2023-11-11', status: -20, strStatus: '已使用' },
		{ id: 6, name: '感冒灵专用券', strCouponType: '单品券', reducePrice: '2.00', minPrice: '15.00', startTime: '2023-09-01', endTime: '2023-09-30', status: -20, strStatus: '已使用' },
		
		// --- 已过期 (status: -10) ---
		{ id: 7, name: '限时秒杀券', strCouponType: '秒杀券', reducePrice: '30.00', minPrice: '200.00', startTime: '2022-01-01', endTime: '2022-01-03', status: -10, strStatus: '已过期' },
		{ id: 8, name: '旧版新人券', strCouponType: '全场券', reducePrice: '5.00', minPrice: '0.00', startTime: '2021-05-01', endTime: '2021-06-01', status: -10, strStatus: '已过期' }
	]

	export default {
		components: {
			MescrollBody,
			uTabs
		},
		mixins: [MescrollMixin],
		data() {
			return {
				CouponTypeEnum,
				color,
				tabs,
				curTab: 0,
				list: getEmptyPaginateObj(), // 初始化分页对象
				upOption: {
					auto: true,
					page: {
						size: pageSize
					},
					noMoreSize: 0,
					empty: {
						tip: '亲，暂无相关优惠券'
					}
				},
				isLoading: false
			}
		},

		methods: {

			/**
			 * 上拉加载的回调
			 */
			upCallback(page) {
				const _this = this
				_this.getCouponList(page.num)
					.then(list => {
						// mescroll 成功回调
						// curPageDataLength: 当前页数据的长度
						// totalSize: 数据总长度
						const curlimit = list.data.length // 本次模拟返回的长度
						_this.mescroll.endBySize(curlimit, list.count)
					})
					.catch(() => _this.mescroll.endErr())
			},

			/**
			 * [模拟修改] 获取优惠券列表
			 */
			getCouponList(pageNo = 1) {
				const _this = this
				return new Promise((resolve, reject) => {
					// 模拟网络请求延迟
					setTimeout(() => {
						const currentStatus = _this.getTabValue()
						
						// 1. 根据当前 Tab (status) 筛选数据
						// status 为字符串，需要转换比较
						const filteredList = mockAllCoupons.filter(item => item.status == currentStatus)
						
						// 2. 模拟分页逻辑
						const totalCount = filteredList.length
						const start = (pageNo - 1) * pageSize
						const end = start + pageSize
						const pageList = filteredList.slice(start, end)
						
						// 3. 组装数据结构 (保持和原 API 返回结构一致)
						// 这里的 getMoreListData 负责将新页数据拼接到旧数据上
						_this.list.count = totalCount
						_this.list.data = getMoreListData(pageList, _this.list, pageNo)
						
						resolve(_this.list)
					}, 500)
				})
			},

			// 获取当前 Tab 的 value
			getTabValue() {
				return this.tabs[this.curTab].value
			},

			// 切换标签项
			onChangeTab(index) {
				const _this = this
				_this.curTab = index
				_this.onRefreshList()
			},

			// 刷新列表
			onRefreshList() {
				this.list = getEmptyPaginateObj()
				// 重置 mescroll (回到第一页并触发 upCallback)
				setTimeout(() => {
					this.mescroll.resetUpScroll()
				}, 120)
			},

		}
	}
</script>

<style lang="scss" scoped>
	.coupon-list {
		padding: 20rpx;
	}

	.coupon-item {
		position: relative;
		overflow: hidden;
		margin-bottom: 22rpx;
	}

	.item-wrapper {
		width: 100%;
		display: flex;
		background: #fff;
		border-radius: 8rpx;
		color: #fff;
		height: 180rpx;

		.coupon-type {
			position: absolute;
			top: 0;
			right: 0;
			z-index: 10;
			width: 128rpx;
			padding: 6rpx 0;
			background: #a771ff;
			font-size: 20rpx;
			text-align: center;
			color: #ffffff;
			transform: rotate(45deg);
			transform-origin: 64rpx 64rpx;
		}

		/* 动态颜色类名对应 */
		&.color-blue {
			background: linear-gradient(-125deg, #57bdbf, #2f9de2);
		}

		&.color-red {
			background: linear-gradient(-128deg, #ff6d6d, #ff3636);
		}

		&.color-violet {
			background: linear-gradient(-113deg, #ef86ff, #b66ff5);
			.coupon-type { background: #55b5ff; }
		}

		&.color-yellow {
			background: linear-gradient(-141deg, #f7d059, #fdb054);
		}

		&.color-gray {
			background: linear-gradient(-113deg, #bdbdbd, #a2a1a2);
			.coupon-type { background: #9e9e9e; }
		}

		.content {
			flex: 1;
			padding: 30rpx 20rpx;
			border-radius: 16rpx 0 0 16rpx;

			.title {
				font-size: 32rpx;
			}

			.bottom {
				.time {
					font-size: 24rpx;
				}

				.receive {
					height: 46rpx;
					width: 122rpx;
					line-height: 46rpx;
					text-align: center;
					border: 1rpx solid #fff;
					border-radius: 30rpx;
					color: #fff;
					font-size: 24rpx;

					&.status {
						border: none;
					}
				}
			}
		}

		.tip {
			position: relative;
			flex: 0 0 32%;
			text-align: center;
			border-radius: 0 16rpx 16rpx 0;

			.money {
				font-weight: bold;
				font-size: 52rpx;
			}

			.pay-line {
				font-size: 22rpx;
			}
		}

		.split-line {
			position: relative;
			flex: 0 0 0;
			border-left: 4rpx solid #fff;
			margin: 0 10rpx 0 6rpx;
			background: #fff;

			&:before {
				content: '';
				position: absolute;
				width: 24rpx;
				height: 12rpx;
				background: #f7f7f7;
				left: -14rpx;
				z-index: 1;
				border-radius: 0 0 16rpx 16rpx;
				top: 0;
			}

			&:after {
				content: '';
				position: absolute;
				width: 24rpx;
				height: 12rpx;
				background: #f7f7f7;
				left: -14rpx;
				z-index: 1;
				border-radius: 16rpx 16rpx 0 0;
				bottom: 0;
			}
		}
	}
</style>