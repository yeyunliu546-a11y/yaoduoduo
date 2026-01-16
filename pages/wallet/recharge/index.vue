<template>
	<view class="container" v-if="userInfo">

		<view class="account-panel dis-flex flex-y-center">
			<view class="panel-lable">
				<text>账户余额</text>
			</view>
			<view class="panel-balance flex-box">
				<text>￥{{ userInfo.balance }}</text>
			</view>
		</view>

		<view class="recharge-panel">
			<view class="recharge-label">
				<text>充值金额</text>
			</view>
			<view class="recharge-plan clearfix">
				<block v-for="(item, index) in planList" :key="index">
					<view class="recharge-plan_item" :class="{ active: selectedPlanId == item.id }"
						@click="onSelectPlan(item.id)">
						<view class="plan_money">
							<text>{{ item.money }}元</text>
						</view>
						<view class="plan_gift" v-if="item.giftMoney > 0">
							<text>送{{ item.giftMoney }}元</text>
						</view>
					</view>
				</block>
			</view>
			<view class="recharge-input" v-if="setting.isCustom == true">
				<input type="digit" placeholder="请输入充值金额" v-model="inputMoney" @input="onChangeMoney" />
			</view>

			<view class="plan_gift" v-if="customGiftMoney > 0" style="margin-top: 10rpx; color: #ff5000;">
				<text>送{{ customGiftMoney }}元</text>
			</view>
			<view class="recharge-submit btn-submit">
				<button class="button" :disabled="disabled" @click="onSubmit">立即充值</button>
			</view>
		</view>
		
		<view class="recharge-describe">
			<view class="recharge-label">
				<text>充值说明</text>
			</view>
			<view class="content">
				<text space="ensp">{{ setting.describe }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	// [模拟修改] 注释掉所有后端API
	// import * as UserApi from '@/api/user/user'
	// import * as RechargeApi from '@/api/recharge/rechargeOrder'
	// import * as PlanApi from '@/api/recharge/rechargePlan'
	// import SettingModel from '@/common/model/Setting'
	// import SettingKeyEnum from '@/common/enum/setting/Key'
	// import { wxPayment } from '@/core/app'

	export default {
		data() {
			return {
				isLoading: true,
				userInfo: null,
				setting: {},
				planList: [],
				disabled: false,
				selectedPlanId: '',
				inputMoney: '',
				customGiftMoney: 0.00,
			}
		},

		onLoad(options) {
			this.getPageData()
		},

		methods: {

			onSelectPlan(planId) {
				this.selectedPlanId = planId
				this.inputMoney = ''
				this.customGiftMoney = 0
			},

			// 监听输入框，动态计算赠送金额
			onChangeMoney(e) {
				const _this = this
				var inputMoney = parseFloat(e.detail.value || 0);
				_this.inputMoney = e.detail.value;
				_this.selectedPlanId = '' // 清空选中的套餐
				
				if (_this.setting.isCustom) {
					// 简单的逻辑：找到比输入金额小的最大套餐，按那个比例赠送（模拟逻辑）
					// 这里简单模拟：如果输入金额 >= 套餐金额，就送对应的赠送金额
					// 实际业务可能更复杂，这里仅作演示
					var listPlan = _this.planList.filter(p => inputMoney >= parseFloat(p.money)).sort((a, b) => parseFloat(b.money) - parseFloat(a.money));
					
					if (listPlan.length > 0) {
						var plan = listPlan[0];
						_this.customGiftMoney = plan.giftMoney;
					} else {
						_this.customGiftMoney = 0;
					}
				}
			},

			getPageData() {
				const _this = this
				_this.isLoading = true
				Promise.all([_this.getUserInfo(), _this.getSettingRecharge(), _this.getPlanList()])
					.then(() => _this.isLoading = false)
			},

			// [模拟修改] 获取充值方案列表
			getPlanList() {
				const _this = this
				return new Promise((resolve) => {
					setTimeout(() => {
						_this.planList = [
							{ id: 101, money: '10.00', giftMoney: '0.00' },
							{ id: 102, money: '50.00', giftMoney: '2.00' },
							{ id: 103, money: '100.00', giftMoney: '5.00' },
							{ id: 104, money: '200.00', giftMoney: '15.00' },
							{ id: 105, money: '500.00', giftMoney: '50.00' },
							{ id: 106, money: '1000.00', giftMoney: '120.00' }
						];
						resolve(_this.planList)
					}, 300)
				})
			},

			// [模拟修改] 获取会员信息
			getUserInfo() {
				const _this = this
				return new Promise((resolve) => {
					setTimeout(() => {
						// 模拟用户当前余额 888.88
						_this.userInfo = {
							balance: '888.88'
						}
						resolve(_this.userInfo)
					}, 200)
				})
			},

			// [模拟修改] 获取充值设置
			getSettingRecharge() {
				const _this = this
				return new Promise((resolve) => {
					setTimeout(() => {
						_this.setting = {
							isCustom: true, // 允许自定义金额
							lowestMoney: 1, // 最低充值 1 元
							describe: "1. 充值金额实时到账；\n2. 充值余额仅限本机使用，不可提现；\n3. 如遇问题请联系客服。"
						}
						resolve(_this.setting)
					}, 200)
				})
			},

			// [模拟修改] 立即充值提交
			onSubmit() {
				const _this = this
				var minMoney = parseFloat(_this.setting.lowestMoney);
				var currentMoney = 0;

				// 判断是选了套餐还是输了金额
				if (_this.selectedPlanId) {
					const plan = _this.planList.find(item => item.id == _this.selectedPlanId)
					currentMoney = parseFloat(plan.money)
				} else {
					currentMoney = parseFloat(_this.inputMoney || 0)
				}

				if (currentMoney < minMoney) {
					_this.$toast('最低充值:' + minMoney + '元')
					return false;
				}

				_this.disabled = true
				uni.showLoading({ title: '正在支付...' })

				// 模拟支付过程
				setTimeout(() => {
					uni.hideLoading()
					_this.$toast('充值成功 (模拟)')
					
					// 模拟余额增加
					let addMoney = currentMoney
					if(_this.selectedPlanId) {
						const plan = _this.planList.find(item => item.id == _this.selectedPlanId)
						addMoney += parseFloat(plan.giftMoney)
					} else {
						addMoney += parseFloat(_this.customGiftMoney)
					}
					
					let newBalance = (parseFloat(_this.userInfo.balance) + addMoney).toFixed(2)
					_this.userInfo.balance = newBalance
					
					// 清空输入
					_this.inputMoney = ''
					_this.selectedPlanId = ''
					_this.customGiftMoney = 0
					_this.disabled = false
					
				}, 1000)
			}

		}
	}
</script>

<style lang="scss" scoped>
	page,
	.container {
		background: #fff;
	}

	.container {
		padding-bottom: 70rpx;
	}

	/* 账户面板 */
	.account-panel {
		width: 650rpx;
		height: 180rpx;
		margin: 50rpx auto;
		padding: 0 60rpx;
		box-sizing: border-box;
		border-radius: 12rpx;
		color: #fff;
		background: linear-gradient(-125deg, #a46bff, #786cff);
		box-shadow: 0 5px 22px 0 rgba(0, 0, 0, 0.26);
	}

	.panel-lable {
		font-size: 32rpx;
	}

	.recharge-label {
		color: rgb(51, 51, 51);
		font-size: 28rpx;
		margin-bottom: 25rpx;
	}

	.panel-balance {
		text-align: right;
		font-size: 46rpx;
	}

	.recharge-panel {
		margin-top: 60rpx;
		padding: 0 60rpx;
	}

	/* 充值套餐 */
	.recharge-plan {
		.recharge-plan_item {
			width: 192rpx;
			padding: 15rpx 0;
			float: left;
			text-align: center;
			color: #888;
			border: 1rpx solid rgb(228, 228, 228);
			border-radius: 10rpx;
			margin: 0 20rpx 20rpx 0;

			&:nth-child(3n + 0) {
				margin-right: 0;
			}

			&.active {
				color: #786cff;
				border: 1rpx solid #786cff;
				background-color: #f5f3ff; /* 增加选中背景色 */

				.plan_money {
					color: #786cff;
				}
			}
		}

	}

	.plan_money {
		font-size: 32rpx;
		color: rgb(82, 82, 82);
	}

	.plan_gift {
		font-size: 24rpx;
		color: #ff5000; /* 赠送金额标红 */
	}

	.recharge-input {
		margin-top: 25rpx;

		input {
			border: 1rpx solid rgb(228, 228, 228);
			border-radius: 10rpx;
			padding: 20rpx 16rpx; /* 增加高度 */
			font-size: 28rpx;
		}
	}

	/* 立即充值 */
	.recharge-submit {
		margin-top: 70rpx;
	}

	.btn-submit {
		.button {
			font-size: 32rpx;
			background: #786cff;
			border: none;
			color: white;
			border-radius: 50rpx;
			padding: 0 120rpx;
			line-height: 2.8;
		}

		.button[disabled] {
			background: #a098ff;
			opacity: 0.7;
		}
	}

	/* 充值说明 */
	.recharge-describe {
		margin-top: 50rpx;
		padding: 0 60rpx;

		.content {
			font-size: 26rpx;
			line-height: 1.6;
			color: #888;
		}
	}
</style>
