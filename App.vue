<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意：uView 基础样式必须写在第一行 */
	@import "@/uview-ui/index.scss";
	
	/* 引入你的 iconfont 样式 */
	@import "/static/iconfont/iconfont.scss";
	
	/* 每个页面公共css (可选) */
	page {
		background-color: #f5f5f5;
	}
</style>