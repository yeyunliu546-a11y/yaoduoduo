<template>
	<!--店铺推荐-->
	<block v-if="listRecommend.length > 0">
		<view class="vdivider">
			<u-divider :fontSize="30" :bold="true" width="50%" height="80" color="#333">
				<text class="divTitle">{{ title }}</text>
			</u-divider>
		</view>

		<!-- 商品列表 -->
		<view class="goods-list clearfix" :class="'column-2'">
			<view class="goods-item" v-for="(item, index) in listRecommend" :key="index"
				@click="onTargetDetail(item.id)">
				<view class="">
					<!-- 商品图片 -->
					<view class="goods-image">
						<image class="image" mode="aspectFill" :src="item.urlImageMain"></image>
					</view>
					<view class="detail">
						<!-- 商品标题 -->
						<view class="goods-name">
							<text class="twoline-hide">{{ item.goodsName }}</text>
						</view>
						<!-- 商品价格 -->
						<view class="detail-price oneline-hide">
							<text class="goods-price f-30 col-m">￥{{ item.salePrice }}</text>
							<text v-if="item.linePrice > 0" class="line-price col-9 f-24">￥{{ item.linePrice }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</block>
</template>

<script>
// ❌ 不再需要导入 GoodsApi（因为用 mock）
// import * as GoodsApi from '@/api/goods/goods'

export default {
	components: {},
	props: {
		title: {
			type: String,
			default: "店铺推荐"
		}
	},
	data() {
		return {
			listRecommend: [],
			total: 0
		}
	},

	created() {
		this.listGoodsRecommend()
	},

	methods: {
		// 使用模拟数据代替 API 调用
		listGoodsRecommend() {
			// 模拟延迟（可选，更真实）
			setTimeout(() => {
				this.listRecommend = [
					{
						id: 101,
						goodsName: "【热销】云南高山有机普洱茶 200g",
						salePrice: 88.00,
						linePrice: 128.00,
						urlImageMain: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=普洱茶"
					},
					{
						id: 102,
						goodsName: "便携式保温杯 500ml 不锈钢",
						salePrice: 59.90,
						linePrice: 89.00,
						urlImageMain: "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=保温杯"
					},
					{
						id: 103,
						goodsName: "天然乳胶枕 护颈助眠",
						salePrice: 199.00,
						linePrice: 299.00,
						urlImageMain: "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=乳胶枕"
					},
					{
						id: 104,
						goodsName: "无线蓝牙耳机 高音质降噪",
						salePrice: 129.00,
						linePrice: 199.00,
						urlImageMain: "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=蓝牙耳机"
					}
				]
			}, 300) // 模拟网络延迟 300ms
		},

		onTargetDetail(goodsId) {
			this.$navTo(`pages/goods/detail`, {
				goodsId
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.vdivider {
	padding-top: 15rpx;
}

.divTitle {
	font-weight: 600;
}

// 平铺显示
.goods-list.column-2 {
	.goods-item {
		width: 50%;
	}
}

.goods-item {
	float: left;
	box-sizing: border-box;
	padding: 6rpx;

	.goods-image {
		position: relative;
		width: 100%;
		height: 0;
		padding-bottom: 100%;
		overflow: hidden;
		background: #fff;

		&:after {
			content: '';
			display: block;
			margin-top: 100%;
		}

		.image {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			object-fit: cover;
		}
	}

	.detail {
		padding: 8rpx;
		background: #fff;

		.goods-name {
			min-height: 68rpx;
			line-height: 32rpx;
			white-space: normal;
			color: #484848;
			font-size: 26rpx;
		}

		.detail-price {
			.goods-price {
				margin-right: 8rpx;
			}

			.line-price {
				text-decoration: line-through;
			}
		}
	}
}
</style>
