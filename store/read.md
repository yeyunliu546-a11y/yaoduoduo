状态存储在 app 模块中（由某个 mutation 设置）
getters.js 提供 platform 访问入口
组件通过 this.$store.getters.platform 读取
mutation 类型 Platform 在 mutation-types.js 中定义，确保设置时类型一致

|文件				|作用							|类比												
|mutation-types.js	|定义 mutation 的“操作名”常量	    |就像 API 接口的 endpoint 名称	
|index.js			|创建并组装整个 Vuex Store		|就像“中央控制器”				
|getters.js			|提供安全、统一的状态读取方式	    |就像数据库的“视图（View）”	


假设用户在小程序中完成微信登录：
this.$store.dispatch('loginWx', wxCode)

user.js 的 action 执行
调用微信登录 API → 获取 token 和 userId
调用 loginSuccess(commit, userInfo)
通过 storage.set() 存入缓存（30天过期）
通过 commit('SetToken') 更新 Vuex 状态
其他组件读取状态
通过 getters 获取 token：this.$store.getters.token
通过 getters 获取平台：this.$store.getters.platform（来自 app.js）

完整 Vuex 结构关系图
store/
├── index.js          ← 根 Store（引入 modules + getters）
├── getters.js        ← 全局计算属性（token/platform 等）
├── mutation-types.js ← 常量定义
└── modules/
    ├── index.js      ← 导出 app/user 模块（你刚问的这个）
    ├── app.js        ← 应用配置（platform）
    └── user.js       ← 用户状态（token/userId + 登录逻辑）
	
总结
|文件	                             |职责						                 |是否涉及后端	
|user.js	        用户认证核心，存储 token/userId，封装登录/登出逻辑		     是（actions 中调用 API）			
|app.js				应用环境配置，存储 platform 等全局变量			             否（通常由 App.vue 初始化）
|modules/index.js		  模块聚合出口，统一导出子模块					         否（纯结构文件）

关键结论：
只有 user.js 的 actions 会真正调用后端接口（如登录 API）
app.js 一般由前端初始化（例如在 App.vue 中检测平台并 commit）
modules/index.js 只是代码组织工具，无业务逻辑