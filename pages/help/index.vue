<template>
	<view class="container">
		<view class="header-bg">
			<view class="header-content">
				<text class="title">常见问题解答</text>
				<text class="subtitle">Hi~ 请问有什么可以帮您？</text>
			</view>
		</view>

		<view class="main-content">
			<mescroll-body ref="mescrollRef" :sticky="false" @init="mescrollInit" :down="downOption" :up="upOption"
				@down="downCallback" @up="upCallback">
				
				<view class="faq-card" v-if="list.length > 0">
					<view class="card-header">
						<u-icon name="question-circle-fill" color="#2979ff" size="38"></u-icon>
						<text class="header-title">热门问题</text>
					</view>
					
					<u-collapse accordion :item-style="collapseItemStyle">
						<u-collapse-item 
							:title="item.question || item.Question" 
							v-for="(item, index) in list" 
							:key="item.id || item.Id || index"
						>
							<view class="answer-box">
								<text class="answer-text">{{ item.answer || item.Answer }}</text>
							</view>
						</u-collapse-item>
					</u-collapse>
				</view>
				
			</mescroll-body>
		</view>

		<view class="contact-footer" v-if="list.length > 0">
			<text class="tips">没有找到想要的答案？</text>
			<button class="contact-btn" open-type="contact">
				<u-icon name="server-fill" color="#fff" size="32" margin-right="8"></u-icon>
				咨询在线客服
			</button>
		</view>
	</view>
</template>

<script>
	import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
	import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
	import request from '@/utils/request/request.js'

	export default {
		components: {
			MescrollBody
		},
		mixins: [MescrollMixin],
		data() {
			return {
				list: [], 
				collapseItemStyle: {
					padding: '10rpx 0',
					fontSize: '30rpx',
					fontWeight: 'bold',
					color: '#333'
				},
				downOption: {
					use: true,
					auto: false
				},
				upOption: {
					auto: true,
					noMoreSize: 1, 
					empty: {
						tip: '暂无常见问题',
						icon: '/static/empty.png'
					},
					textNoMore: '没有更多问题了'
				}
			}
		},

		methods: {
			upCallback(page) {
				if (page.num > 1) {
					this.mescroll.endSuccess(0, false);
					return;
				}
				
				request({
					url: '/api/Faq/GetList',
					method: 'GET'
				}).then(res => {
					const code = res.Code !== undefined ? res.Code : res.code;
					if (code === 200) {
						let result = res.Result || res.result || [];
						if (page.num === 1) this.list = [];
						
						this.list = result;
						this.mescroll.endSuccess(result.length, false);
					} else {
						this.mescroll.endErr();
					}
				}).catch(() => {
					this.mescroll.endErr();
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 140rpx; /* 给底部客服悬浮栏留出空间 */
	}

	/* 顶部沉浸式渐变 */
	.header-bg {
		background: linear-gradient(135deg, #2979ff 0%, #518cff 100%);
		height: 320rpx;
		padding: 60rpx 40rpx 0;
		box-sizing: border-box;
		border-bottom-left-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
	}

	.header-content {
		display: flex;
		flex-direction: column;
		color: #fff;
		
		.title {
			font-size: 44rpx;
			font-weight: 800;
			letter-spacing: 2rpx;
			margin-bottom: 16rpx;
		}
		
		.subtitle {
			font-size: 26rpx;
			opacity: 0.9;
		}
	}

	/* 悬浮卡片主体 */
	.main-content {
		position: relative;
		z-index: 2;
		margin-top: -100rpx; /* 向上偏移形成悬浮效果 */
		padding: 0 24rpx;
	}

	.faq-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 10rpx 30rpx 30rpx;
		box-shadow: 0 6rpx 20rpx rgba(41, 121, 255, 0.05);
		
		.card-header {
			display: flex;
			align-items: center;
			padding: 30rpx 0 20rpx;
			border-bottom: 1px solid #f5f5f5;
			margin-bottom: 10rpx;
			
			.header-title {
				font-size: 34rpx;
				font-weight: 800;
				color: #333;
				margin-left: 14rpx;
			}
		}
	}

	/* 答案区域气泡样式 */
	.answer-box {
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		border-left: 6rpx solid #2979ff; /* 左侧加入品牌色点缀 */
	}

	.answer-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
		white-space: pre-wrap; 
		text-align: justify;
	}

	/* 底部悬浮客服工具栏 */
	.contact-footer {
		position: fixed;
		bottom: 0;
		bottom: env(safe-area-inset-bottom); /* 兼容苹果底部小黑条 */
		left: 0;
		right: 0;
		height: 110rpx;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40rpx;
		box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.04);
		z-index: 99;
		
		.tips {
			font-size: 26rpx;
			color: #999;
		}
		
		.contact-btn {
			margin: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 72rpx;
			padding: 0 36rpx;
			background: linear-gradient(135deg, #ff9900, #ff6034); /* 温暖的橙色系，引导点击 */
			color: #fff;
			font-size: 28rpx;
			font-weight: bold;
			border-radius: 36rpx;
			box-shadow: 0 4rpx 12rpx rgba(255, 96, 52, 0.3);
			border: none;
			
			&::after {
				border: none;
			}
			
			&:active {
				transform: scale(0.96);
			}
		}
	}
</style>