// 位于 uview-ui/libs/mixin/mixin.js

export default { // 【核心修改点：将 module.exports = 改为 export default】
	data() {
		return {}
	},
	onLoad() {
		// getRect挂载到$u上，因为这方法需要使用in(this)，所以无法把它独立成一个单独的文件导出
		this.$u.getRect = this.$uGetRect
	},
	methods: {
		// 查询节点信息
		// 目前此方法在支付宝小程序中无法获取组件跟接点的尺寸，为支付宝的bug(2020-07-21)
		// 解决办法为在组件根部再套一个没有任何作用的view元素
		$uGetRect(selector, all) {
			return new Promise(resolve => {
				uni.createSelectorQuery().
				in(this)[all ? 'selectAll' : 'select'](selector)
					.boundingClientRect(rect => {
						if (all && Array.isArray(rect) && rect.length) {
							resolve(rect)
						}
						if (!all && rect) {
							resolve(rect)
						}
					})
					.exec()
			})
		},
		getParentData(parentName = '') {
			// 避免在created中去定义parent变量
			if(!this.parent) this.parent = false;
			// 这里的本质原理是，通过获取父组件实例(也即u-radio-group的this)
			// 将父组件this中对应的参数，赋值给本组件(u-radio的this)的parentData对象中对应的属性
			// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
			this.parent = this.$u.$parent.call(this, parentName);
			if(this.parent) {
				// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
				Object.keys(this.parentData).map(key => {
					this.parentData[key] = this.parent[key];
				});
			}
		},
		// Vue 2 Emitter Mixin 的核心方法
        dispatch(componentName, eventName, params) {
            let parent = this.$parent;
            // 循环向上查找父组件
            while (parent && (!parent.$options.name || parent.$options.name !== componentName)) {
                parent = parent.$parent;
            }
            if (parent) {
                // 改为调用我们 polyfill 后的 $on 对应的 $emit
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        broadcast(componentName, eventName, params) {
            this.$children.forEach(child => {
                const name = child.$options.name;

                if (name === componentName) {
                    // 改为调用我们 polyfill 后的 $on 对应的 $emit
                    child.$emit.apply(child, [eventName].concat(params));
                } else {
                    // 递归向下寻找
                    // eslint-disable-next-line
                    if (child.$children) {
                        this.broadcast.apply(child, [componentName, eventName, params]);
                    }
                }
            });
        },
		// 阻止事件冒泡
		stopEvent() {}
	}
}
