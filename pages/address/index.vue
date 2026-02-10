<template>
	<view class="container">
		<view class="address-list" v-if="addressList.length > 0">
			<u-swipe-action 
				v-for="(item, index) in addressList" 
				:key="item.Id" 
				:options="swipeOptions" 
				@click="handleSwipeClick($event, item.Id)"
			>
				<view class="address-item">
					<view class="content" @click="handleEdit(item.Id)">
						<view class="user-info">
							<text class="name">{{ item.Name }}</text>
							<text class="phone">{{ item.Phone }}</text>
							<u-tag v-if="item.IsDefault" text="默认" type="error" size="mini" mode="dark" class="tag" />
						</view>
						<view class="address-text">
							{{ item.FullAddress || '地址信息缺失' }}
						</view>
					</view>
					<view class="action-bar">
						<view class="default-toggle" @click.stop="handleSetDefault(item)">
							<u-icon 
								:name="item.IsDefault ? 'checkmark-circle-fill' : 'checkmark-circle'" 
								:color="item.IsDefault ? '#f9211c' : '#ccc'" 
								size="38" 
							/>
							<text :class="{ 'active': item.IsDefault }">默认地址</text>
						</view>
						<view class="edit-btn" @click.stop="handleEdit(item.Id)">
							<u-icon name="edit-pen" size="30" color="#999" />
							<text>编辑</text>
						</view>
					</view>
				</view>
			</u-swipe-action>
		</view>

		<u-empty v-else mode="address" margin-top="200" text="暂无收货地址" />

		<view class="footer">
			<view class="btn-wrap">
				<u-button type="error" shape="circle" @click="handleCreate">
					<u-icon name="plus" color="#fff" size="30" />
					<text>新增收货地址</text>
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 收货地址列表页面
	 * 对接文档：收货地址管理API对接文档.md
	 */
	import * as AddressApi from '@/api/user/userAddress.js'

	export default {
		data() {
			return {
				addressList: [],
				swipeOptions: [
					{
						text: '删除',
						style: { backgroundColor: '#dd524d' }
					}
				],
				query: {
					Page: 1,
					Limit: 50,
					OnlyMy: true
				}
			}
		},
		onShow() {
			// 每次页面显示都刷新列表（包含从新增页返回时）
			this.getList();
		},
		methods: {
			/**
			 * 获取地址列表
			 */
			async getList() {
				uni.showLoading({ title: '加载中...', mask: true });
				try {
					const res = await AddressApi.loadList(this.query);
					
					// 1. 调试日志：核对字段名和类型
					console.log('地址列表原始数据:', res, 'Code类型:', typeof (res.Code || res.code));

					// 2. 兼容性判断：弱等于 200，并兼容大小写 Code
					const responseCode = res.Code !== undefined ? res.Code : res.code;
					
					if (responseCode == 200) {
						const rawList = res.Result || res.result || [];
						
						// 3. 安全映射：防止字段缺失导致渲染报错
						this.addressList = rawList.map(item => {
							return {
								// 兼容处理 ID 和基本信息，增加空值保护
								Id: item.Id || item.id || '',
								Name: item.Name || item.name || '未命名',
								Phone: item.Phone || item.phone || '',
								IsDefault: !!(item.IsDefault || item.isDefault),
								FullAddress: item.FullAddress || item.fullAddress || 
											 `${item.Province || ''}${item.City || ''}${item.Region || ''}${item.Detail || ''}`
							};
						});
					} else {
						uni.showToast({ title: res.Message || '列表获取失败', icon: 'none' });
					}
				} catch (err) {
					console.error('获取列表异常:', err);
					uni.showToast({ title: '网络请求异常', icon: 'none' });
				} finally {
					// 4. Loading 闭环：确保 hideLoading 总能执行
					uni.hideLoading();
				}
			},

			/**
			 * 设置默认地址
			 */
			async handleSetDefault(item) {
				if (item.IsDefault) return;
				
				uni.showLoading({ title: '设置中...', mask: true });
				try {
					const res = await AddressApi.setDefault(item.Id);
					if (res.Code == 200 || res.code == 200) {
						uni.showToast({ title: '设置成功', icon: 'none' });
						this.getList(); // 重新加载列表同步状态
					}
				} catch (err) {
					uni.showToast({ title: '操作失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			},

			/**
			 * 滑动删除
			 */
			handleSwipeClick(e, id) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该地址吗？',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({ title: '删除中...' });
							try {
								const delRes = await AddressApi.deleteAddress([id]);
								if (delRes.Code == 200 || delRes.code == 200) {
									uni.showToast({ title: '删除成功', icon: 'none' });
									this.getList();
								}
							} finally {
								uni.hideLoading();
							}
						}
					}
				});
			},

			handleCreate() {
				uni.navigateTo({ url: '/pages/address/create' });
			},

			handleEdit(id) {
				uni.navigateTo({ url: `/pages/address/update?id=${id}` });
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #f7f8fa;
	}

	.container {
		padding-bottom: 160rpx;
	}

	.address-item {
		background-color: #fff;
		margin-bottom: 20rpx;
		padding: 30rpx;

		.user-info {
			display: flex;
			align-items: center;
			margin-bottom: 12rpx;

			.name {
				font-size: 32rpx;
				font-weight: bold;
				margin-right: 20rpx;
			}

			.phone {
				font-size: 28rpx;
				color: #666;
			}

			.tag {
				margin-left: 16rpx;
			}
		}

		.address-text {
			font-size: 26rpx;
			color: #333;
			line-height: 1.4;
			padding-bottom: 20rpx;
			border-bottom: 1px solid #f5f5f5;
		}

		.action-bar {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 20rpx;

			.default-toggle, .edit-btn {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				color: #999;

				text {
					margin-left: 10rpx;
					&.active {
						color: #f9211c;
					}
				}
			}
		}
	}

	.footer {
		position: fixed;
		bottom: 30rpx;
		left: 0;
		right: 0;
		padding: 0 40rpx;
		z-index: 100;
	}
</style>