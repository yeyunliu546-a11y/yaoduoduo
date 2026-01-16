<template>
	<view class="container">
		<mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ use: false }" :up="upOption"
			@up="upCallback">
			<view class="log-list">
				<view v-for="(item, index) in list.data" :key="index" class="log-item">
					<view class="item-left flex-box">
						<view class="rec-status">
							<text>{{ item.describe }}</text>
						</view>
						<view class="rec-time">
							<text>{{ item.createTime }}</text>
						</view>
					</view>
					
					<view class="item-right" :class="[item.points > 0 ? 'col-green' : 'col-6']">
						<text>{{ item.points > 0 ? '+' : '' }}{{ item.value }}</text>
					</view>

					<view class="item-right col-6">
						<text>余额: {{ item.balancePoints }}</text>
					</view>
				</view>
			</view>
		</mescroll-body>
	</view>
</template>

<script>
	import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
	import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
	// import * as UserPointsLogApi from '@/api/user/userPointsLog' // [模拟修改] 注释掉后端API
	import {
		getEmptyPaginateObj,
		getMoreListData
	} from '@/core/app'

	// [模拟修改] 定义模拟数据源 (20条数据，用于测试分页)
	const mockLogList = [
		{ id: 1, describe: '每日签到', createTime: '2023-12-11 09:00:00', points: 10, value: 10, balancePoints: 1050 },
		{ id: 2, describe: '购买商品抵扣', createTime: '2023-12-10 14:20:00', points: -50, value: -50, balancePoints: 1040 },
		{ id: 3, describe: '邀请好友奖励', createTime: '2023-12-09 11:30:00', points: 100, value: 100, balancePoints: 1090 },
		{ id: 4, describe: '订单退款返还', createTime: '2023-12-08 16:10:00', points: 20, value: 20, balancePoints: 990 },
		{ id: 5, describe: '每日签到', createTime: '2023-12-07 09:00:00', points: 10, value: 10, balancePoints: 970 },
		{ id: 6, describe: '购买商品抵扣', createTime: '2023-12-06 18:00:00', points: -100, value: -100, balancePoints: 960 },
		{ id: 7, describe: '系统赠送', createTime: '2023-12-05 10:00:00', points: 500, value: 500, balancePoints: 1060 },
		{ id: 8, describe: '每日签到', createTime: '2023-12-04 09:05:00', points: 10, value: 10, balancePoints: 560 },
		{ id: 9, describe: '兑换优惠券', createTime: '2023-12-03 12:00:00', points: -200, value: -200, balancePoints: 550 },
		{ id: 10, describe: '每日签到', createTime: '2023-12-02 08:30:00', points: 10, value: 10, balancePoints: 750 },
		{ id: 11, describe: '完善用户信息', createTime: '2023-12-01 10:00:00', points: 50, value: 50, balancePoints: 740 },
		{ id: 12, describe: '购买商品抵扣', createTime: '2023-11-30 15:00:00', points: -30, value: -30, balancePoints: 690 },
		{ id: 13, describe: '每日签到', createTime: '2023-11-29 09:10:00', points: 10, value: 10, balancePoints: 720 },
		{ id: 14, describe: '好评返积分', createTime: '2023-11-28 17:00:00', points: 20, value: 20, balancePoints: 710 },
		{ id: 15, describe: '每日签到', createTime: '2023-11-27 09:00:00', points: 10, value: 10, balancePoints: 690 },
		{ id: 16, describe: '抽奖消耗', createTime: '2023-11-26 20:00:00', points: -10, value: -10, balancePoints: 680 },
		{ id: 17, describe: '每日签到', createTime: '2023-11-25 09:00:00', points: 10, value: 10, balancePoints: 690 },
		{ id: 18, describe: '新人注册奖励', createTime: '2023-11-24 10:00:00', points: 680, value: 680, balancePoints: 680 },
	]

	export default {
		components: {
			MescrollBody
		},
		mixins: [MescrollMixin],
		data() {
			return {
				// 列表数据
				list: getEmptyPaginateObj(),
				// 上拉加载配置
				upOption: {
					// 首次自动执行
					auto: true,
					// 每页数据的数量; 默认15 (这里为了演示效果，可以设小一点，或者保持默认)
					page: {
						size: 10 
					},
					// 数量要大于4条才显示无更多数据
					noMoreSize: 5,
					empty: {
						tip: '暂无积分明细'
					}
				},
			}
		},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad(options) {},

		methods: {

			/**
			 * 上拉加载的回调 (页面初始化时也会执行一次)
			 * 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10
			 * @param {Object} page
			 */
			upCallback(page) {
				const _this = this
				// 设置列表数据
				_this.loadList(page.num)
					.then(list => {
						const curlimit = list.data.length
						_this.mescroll.endBySize(curlimit, list.count)
					})
					.catch(() => _this.mescroll.endErr())
			},

			// [模拟修改] 获取积分明细列表 (纯前端模拟)
			loadList(pageNo = 1) {
				const _this = this
				return new Promise((resolve, reject) => {
					// 模拟网络延迟 500ms
					setTimeout(() => {
						// 1. 模拟分页逻辑：从 mockLogList 数组中切片取出当前页的数据
						const pageSize = _this.upOption.page.size
						const totalCount = mockLogList.length
						
						const start = (pageNo - 1) * pageSize
						const end = start + pageSize
						const pageData = mockLogList.slice(start, end)
						
						// 2. 模拟后端返回的数据结构
						// 后端通常返回 { result: [], count: 100 }
						const res = {
							result: pageData,
							count: totalCount
						}

						// 3. 使用核心工具合并数据 (第一页清空，后续追加)
						const newList = res.result
						_this.list.count = res.count
						_this.list.data = getMoreListData(newList, _this.list, pageNo)
						
						resolve(_this.list)
					}, 500)
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	page,
	.container {
		background: #fff;
	}

	.log-list {
		padding: 0 30rpx;
	}

	.log-item {
		font-size: 28rpx;
		padding: 20rpx 0; /* 修改了padding，让左右对齐更好看 */
		line-height: 1.8;
		border-bottom: 1rpx solid rgb(238, 238, 238);
		display: flex;
		justify-content: space-between; /* 关键：两端对齐 */
		align-items: center;
	}

	.item-left {
		flex: 1; /* 占据剩余空间 */
		display: flex;
		flex-direction: column;
	}
	
	/* 右侧容器，包含变动值和余额 */
	.right-box {
		text-align: right;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.rec-status {
		color: #333;
		font-size: 30rpx;
	}
	
	.rec-time {
		color: rgb(160, 160, 160);
		font-size: 24rpx;
		margin-top: 6rpx;
	}
	
	/* 颜色样式 */
	.col-green {
		color: #07c160;
		font-weight: bold;
		font-size: 32rpx;
	}
	
	.col-6 {
		color: #666;
		font-size: 24rpx; /* 余额字体小一点 */
	}
	
	/* 负数积分样式 */
	.item-right.col-6 {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

</style>