1. 模块导入（Dependencies Import）
import store from '@/store'  ->  引入状态管理  ->  引入Vuex store实例,用于访问或修改全局状态，例如用户的登录信息 (userId)。
import * as util from '@/utils/util'  ->  引入通用工具  ->  引入另一个工具文件 (util.js) 中的所有导出内容,并将其命名为util,用于 URL 编码、对象克隆等操作。
import { paginate } from '@/common/constant'  ->  引入分页常量  ->  引入一个定义了分页默认结构或设置的常量对象 paginate。

2. UI 提示模块（Alert/Toast）
这部分封装了 uni-app 中用于给用户反馈的 API (uni.showToast, uni.showModal)，使其使用起来更方便、样式更统一。
             函数名                                                        作用
showSuccess显示操作成功的提示框。  使用 icon: 'success'，持续 1500ms，带有遮罩（mask: true），并且在提示框消失后（success 回调）执行可选的 callback 函数。
showError显示错误或失败的提示框。  使用 uni.showModal 弹出模态框，标题固定为“友情提示”，没有取消按钮（showCancel: false），确保用户只能点击确定。
showToast显示纯文字提示。         使用 icon: 'none'，常用于显示简单的信息或警告，可自定义持续时间 (duration) 和是否显示透明蒙层 (mask)。

3. 导航与链接模块（Navigation & URL）
这部分用于处理应用内的页面跳转和外部链接的生成。

4. 购物车模块（Cart Management）
这部分主要围绕购物车数量进行本地管理和 UI 更新。

5. 用户与支付模块（Auth & Payment）

6. 分页与列表模块（Pagination & List）
这部分用于处理“上拉加载更多”功能中数据的初始化和合并。





这段代码在整个开发过程中扮演着核心工具库 (Utility Library) 的角色，它的作用是标准化、简化和集中化项目中常用的、重复性的功能。
简单来说，它就像一个开发工具箱，让开发者不用在每个页面重复编写相同的代码，从而极大地提升了开发效率、代码质量和项目可维护性。

🛠️ 核心作用：提高效率与代码质量
1. 遵循 DRY 原则（Don't Repeat Yourself）
这是工具文件的最主要目的。如果没有这个文件，开发者在每一个页面需要弹窗、跳转、或者检查登录状态时，就必须重复编写或复制粘贴相同的代码逻辑。

效果：通过将这些逻辑封装成函数（如 navTo, showSuccess），开发者在任何地方只需要一行代码调用即可，避免了代码冗余。

2. 统一的用户体验 (UX Consistency)
它确保了用户界面的反馈和操作在整个应用中保持一致。

UI 规范化：showSuccess 和 showError 确保了无论是哪个页面触发成功或失败提示，它们的样式、持续时间和用户交互方式（例如 showError 使用的固定标题 "友情提示" 和无取消按钮的模态框）都完全相同，提升了品牌和用户体验的专业性。

导航统一：navTo 函数强制所有页面跳转都遵循相同的规则。它会自动判断目标路径是Tab Bar 页面（使用 switchTab）还是普通页面（使用 MapsTo 或 redirectTo），并自动处理 URL 参数编码，有效防止了跳转错误和参数丢失。

📦 简化复杂业务逻辑
3. 封装平台和原生 API 交互
它将复杂或异步的原生 API 调用包装成更容易使用的函数。

支付简化：wxPayment 函数将微信支付（uni.requestPayment）这个复杂的异步流程封装成 Promise，让调用方可以用现代 JavaScript 的 async/await 或 .then/.catch 语法来处理支付结果，使业务代码更清晰。

购物车/角标：setCartTabBadge 封装了操作 Tab Bar 角标的逻辑。开发者无需关心购物车总数是从哪里来的、角标的位置是第几位、是显示还是移除，只需要调用这个函数即可，将复杂的 UI 操作简化为一个单一的 API。

4. 集中状态管理与业务检查
它为常用的状态检查提供了统一入口。

登录状态检查：checkLogin 集中了判断用户是否登录的逻辑（通过访问 store.getters.userId）。所有需要登录才能进行的操作，都只需调用 if (checkLogin())，确保了验证逻辑的一致性和准确性。

5. 易于维护和升级
如果 uni-app 的底层 API 发生变化，或者需要将功能从本地缓存（uni.getStorageSync）切换到后端 API，只需修改这个工具文件中的对应函数，无需更改项目中的每一个调用它的页面。

模块	                            核心作用	                                             开发价值
navTo	                统一处理页面跳转逻辑，区分 Tab Bar 和普通页面。 	防止导航错误，参数自动编码，简化页面跳转代码。
showSuccess/showError	封装 UI 提示框和模态框的样式和行为。	            统一用户体验，保证应用内所有提示的风格一致。
wxPayment	            将微信支付 API 封装为 Promise。	                简化异步支付流程，使代码更易读、更稳定。
setCartTabBadge	        自动设置或移除购物车 Tab Bar 角标。	            隔离原生 API 细节，使购物车功能开发更简单。
getMoreListData	        统一处理分页列表数据（第一页清空，后续合并）。	    标准化加载更多功能，避免重复的列表数据处理逻辑。 