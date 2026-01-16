<template>
	<view class="container">
		<view class="addres-list">
			<view class="address-item" v-for="(item, index) in list" :key="index">
				<view class="contacts">
					<text class="name">{{ item.name }}</text>
					<text class="phone">{{ item.phone }}</text>
				</view>
				<view class="address">
					<text class="region">{{ item.province }} {{ item.city }} {{ item.region }}</text>
					<text class="detail">{{ item.detail }}</text>
				</view>
				<view class="line"></view>
				<view class="item-option">
					<view class="_left">
						<label class="item-radio" @click.stop="handleSetDefault(item.addressId)">
							<radio class="radio" color="#fa2209" :checked="item.isDefault == 1"></radio>
							<text class="text">{{ item.isDefault == 1 ? '默认' : '选择' }}</text>
						</label>
					</view>
					<view class="_right">
						<view class="events">
							<view class="event-item" @click.stop="handleUpdate(item.addressId)">
								<text class="iconfont icon-edit"></text>
								<text class="title">编辑</text>
							</view>
							<view class="event-item" @click.stop="handleRemove(item.addressId)">
								<text class="iconfont icon-delete"></text>
								<text class="title">删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="!list.length && !isLoading" class="empty-tips">亲，暂无收货地址</view>
		<view class="footer-fixed">
			<view class="btn-wrapper">
				<view class="btn-item btn-item-main" @click="handleCreate()">添加新地址</view>
			</view>
		</view>
	</view>
</template>

<script>
	// import * as userAddressApi from '@/api/user/userAddress' // [模拟修改] 注释掉后端API

	export default {
		data() {
			return {
				options: {},
				isLoading: true,
				list: []
			}
		},

		onLoad(options) {
			this.options = options
			// [模拟修改] 初始化一些假数据，防止进去一片空白
			this.initMockData();
		},

		onShow() {
			this.getPageData()
		},

		methods: {
			// [模拟修改] 初始化模拟数据
			initMockData() {
				const existData = uni.getStorageSync('mock_address_list');
				if (!existData || existData.length === 0) {
					const mockData = [{
							addressId: 1001,
							name: '张三',
							phone: '13800138000',
							province: '湖北省',
							city: '武汉市',
							region: '洪山区',
							detail: '光谷软件园F4栋',
							isDefault: 1 // 1代表默认
						},
						{
							addressId: 1002,
							name: '李四',
							phone: '13900139000',
							province: '广东省',
							city: '深圳市',
							region: '南山区',
							detail: '科技园南区',
							isDefault: 0
						}
					];
					uni.setStorageSync('mock_address_list', mockData);
				}
			},

			// 获取页面数据
			getPageData() {
				this.isLoading = true
				// [模拟修改] 模拟网络请求延迟
				setTimeout(() => {
					// 1. 从本地缓存读取数据
					let localList = uni.getStorageSync('mock_address_list') || [];
					this.list = localList;
					// 2. 排序
					this.onReorder();
					this.isLoading = false;
				}, 300);
			},

			// 列表排序把默认收货地址放到最前
			onReorder() {
				// isDefault 大的排前面 (1 > 0)
				this.list.sort((a, b) => b.isDefault - a.isDefault)
			},

			/**
			 * 添加新地址
			 */
			handleCreate() {
				this.$navTo('pages/address/create')
			},

			/**
			 * 编辑地址
			 */
			handleUpdate(addressId) {
				this.$navTo('pages/address/update', {
					addressId
				})
			},

			/**
			 * 删除收货地址
			 */
			handleRemove(addressId) {
				const _this = this
				uni.showModal({
					title: "提示",
					content: "您确定要删除当前收货地址吗?",
					success({
						confirm
					}) {
						confirm && _this.onRemove(addressId)
					}
				});
			},

			/**
			 * 确认删除收货地址
			 */
			onRemove(addressId) {
				// [模拟修改] 模拟删除逻辑
				uni.showLoading({
					title: '删除中'
				});
				setTimeout(() => {
					// 1. 读数据
					let localList = uni.getStorageSync('mock_address_list') || [];
					// 2. 过滤掉要删除的ID
					localList = localList.filter(item => item.addressId != addressId);
					// 3. 存回去
					uni.setStorageSync('mock_address_list', localList);

					uni.hideLoading();
					uni.showToast({
						title: '删除成功',
						icon: 'none'
					});
					// 4. 刷新页面
					this.getPageData();
				}, 500);
			},

			/**
			 * 设置为默认地址
			 */
			handleSetDefault(addressId) {
				// [模拟修改] 模拟设置默认
				uni.showLoading({
					title: '设置中'
				});
				setTimeout(() => {
					let localList = uni.getStorageSync('mock_address_list') || [];
					// 遍历，选中的设为1，其他的设为0
					localList.forEach(item => {
						if (item.addressId == addressId) {
							item.isDefault = 1;
						} else {
							item.isDefault = 0;
						}
					});
					// 存回去
					uni.setStorageSync('mock_address_list', localList);

					uni.hideLoading();
					this.getPageData();

					// 如果是从下单页过来的，选完直接返回
					if (this.options.from === 'checkout') {
						uni.navigateBack();
					}
				}, 300);
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 样式保持不变 */
	.addres-list {
		padding-top: 20rpx;
		padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
		padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
	}

	.address-item {
		margin: 20rpx auto 20rpx auto;
		padding: 30rpx 40rpx;
		width: 94%;
		box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
		border-radius: 16rpx;
		background: #fff;
	}

	.contacts {
		font-size: 30rpx;
		margin-bottom: 16rpx;

		.name {
			margin-right: 16rpx;
		}
	}

	.address {
		font-size: 28rpx;

		.region {
			margin-right: 10rpx;
		}
	}

	.line {
		margin: 20rpx 0;
		border-bottom: 1rpx solid #f3f3f3;
	}

	.item-option {
		display: flex;
		justify-content: space-between;
		height: 48rpx;

		.item-radio {
			font-size: 28rpx;

			.radio {
				vertical-align: middle;
				transform: scale(0.76)
			}

			.text {
				vertical-align: middle;
			}
		}

		.events {
			display: flex;
			align-items: center;
			line-height: 48rpx;

			.event-item {
				font-size: 28rpx;
				margin-right: 26rpx;
				color: #4c4c4c;

				&:last-child {
					margin-right: 0;
				}

				.title {
					margin-left: 8rpx;
				}
			}
		}

	}

	.empty-tips {
		text-align: center;
		color: #999;
		margin-top: 100rpx;
		font-size: 28rpx;
	}

	.footer-fixed {
		position: fixed;
		bottom: var(--window-bottom);
		left: 0;
		right: 0;
		min-height: 120rpx;
		z-index: 11;
		box-shadow: 0 -4rpx 40rpx 0 rgba(151, 151, 151, 0.24);
		background: #fff;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.btn-wrapper {
			height: 120rpx;
			display: flex;
			align-items: center;
			padding: 0 40rpx;
		}

		.btn-item {
			flex: 1;
			font-size: 28rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			color: #fff;
			border-radius: 50rpx;
		}

		.btn-item-main {
			background: linear-gradient(to right, #f9211c, #ff6335);
		}
	}
</style>