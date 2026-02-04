<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			// ------------------------------------------------------
			// 【核心权限控制】
			// 启动时检查本地是否有 Token，如果没有，强制跳转到登录页
			// ------------------------------------------------------
			try {
				const token = uni.getStorageSync('token'); // 假设登录成功后你存的 key 叫 'token'
				if (!token) {
					// 延迟一点点执行，避免应用还没初始化完毕
					setTimeout(() => {
						// 使用 reLaunch 关闭所有页面，打开登录页
						uni.reLaunch({
							url: '/pages/login/index'
						});
					}, 50);
				}
			} catch (e) {
				console.error('权限检查失败', e);
			}
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
	
	/* 每个页面公共css */
	page {
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
	}
    
    /* 解决图片在部分机型可能有默认边距的问题 */
    image {
        display: block;
    }
</style>