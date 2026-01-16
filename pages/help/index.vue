<template>
	<view class="container">
		<mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ use: false }" :up="upOption"
			@up="upCallback">
			<view class="help cont-box b-f" v-for="(item, index) in list.data" :key="index">
				<view class="title">
					<text>{{ item.title }}</text>
				</view>
				<view class="content">
					<text>{{ item.content }}</text>
				</view>
			</view>
		</mescroll-body>
	</view>
</template>

<script>
	import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
	import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
	// import * as HelpApi from '@/api/help' // [模拟修改]
	import {
		getEmptyPaginateObj,
		getMoreListData
	} from '@/core/app'

	const pageSize = 15

    // [模拟修改] 模拟帮助中心数据
    const mockHelpList = [
        { id: 1, title: '如何修改收货地址？', content: '您可以在“个人中心-收货地址”中进行修改或添加新的地址。在订单未发货前，联系客服也可以尝试修改。' },
        { id: 2, title: '退换货规则是怎样的？', content: '商品签收后7天内支持无理由退货（需保持商品完好），质量问题15天内包换。具体请查看售后服务条款。' },
        { id: 3, title: '发货需要多久？', content: '通常情况下，订单会在24小时内发货。大促期间或预售商品发货时间请以页面提示为准。' },
        { id: 4, title: '积分有什么用？', content: '积分可以在下单时抵扣现金，也可以在积分商城兑换优惠券或实物礼品。' },
        { id: 5, title: '如何查看物流信息？', content: '在“我的订单”中找到对应订单，点击“查看物流”即可实时追踪包裹状态。' },
        { id: 6, title: '忘记密码怎么办？', content: '在登录页面点击“忘记密码”，通过手机号验证码即可重置新密码。' },
        { id: 7, title: '支持哪些支付方式？', content: '目前支持微信支付、余额支付等多种方式，具体以结算页面显示为准。' },
    ]

	export default {
		components: {
			MescrollBody
		},
		mixins: [MescrollMixin],
		data() {
			return {
				list: getEmptyPaginateObj(),
				// 上拉加载配置
				upOption: {
					auto: true,
					page: {
						size: pageSize
					},
					noMoreSize: 5, // 数据少于5条时不显示无更多
					empty: {
						tip: '亲，暂无相关数据'
					}
				}
			}
		},

		methods: {

			upCallback(page) {
				const _this = this
				// 设置列表数据
				_this.getHelpList(page.num)
					.then(list => {
						const curlimit = list.data.length
						_this.mescroll.endBySize(curlimit, list.count)
					})
					.catch(() => _this.mescroll.endErr())
			},

			// [模拟修改] 获取帮助列表
			getHelpList(pageNo = 1) {
				const _this = this
				return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 模拟分页
                        const total = mockHelpList.length
                        const start = (pageNo - 1) * pageSize
                        const end = start + pageSize
                        const pageData = mockHelpList.slice(start, end)
                        
                        const res = {
                            result: pageData,
                            count: total
                        }
                        
                        // 合并新数据
                        _this.list.count = res.count
                        _this.list.data = getMoreListData(res.result, _this.list, pageNo)
                        resolve(_this.list)
                    }, 500)
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.help {
		border-bottom: 1rpx solid #f6f6f9;
        padding: 30rpx; /* 增加内边距优化显示 */

		.title {
			font-size: 32rpx;
			color: #333;
			margin-bottom: 15rpx;
            font-weight: bold;
		}

		.content {
			font-size: 28rpx;
			color: #666;
            line-height: 1.6;
            text-align: justify; /* 两端对齐 */
		}
	}
    
    /* 增加容器背景色 */
    .container {
        background-color: #fff;
        min-height: 100vh;
    }
</style>