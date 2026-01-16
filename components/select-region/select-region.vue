<template>
	<view class="container">
		<view v-if="isLoading" class="loading">
			<u-loading mode="circle"></u-loading>
		</view>
		<view v-else class="field-body" @click="handleSelect()">
			<view class="field-value oneline-hide">{{ valueText ? valueText: placeholder }}</view>
		</view>
		<u-select v-model="show" mode="mutil-column-auto" :list="options" :default-value="defaultValue"
			@confirm="onConfirm"></u-select>
	</view>
</template>

<script>
	import Emitter from '@/uview-ui/libs/util/emitter'
	import {
		isEmpty
	} from '@/utils/util'
	// import SysArea from '@/common/model/SysArea' // 【已注释/删除】不再需要外部 API

	// ==========================================================
	// 【新增】模拟地区数据和辅助函数 - 放在 export default 外部
	// ==========================================================
	const MOCK_AREA_DATA = [
		{
			id: 110000,
			name: '北京市',
			children: [
				{
					id: 110100,
					name: '市辖区',
					children: [
						{ id: 110101, name: '东城区' },
						{ id: 110102, name: '西城区' },
					]
				}
			]
		},
		{
			id: 440000,
			name: '广东省',
			children: [
				{
					id: 440100,
					name: '广州市',
					children: [
						{ id: 440105, name: '海珠区' },
						{ id: 440106, name: '天河区' }
					]
				},
				{
					id: 440300,
					name: '深圳市',
					children: [
						{ id: 440303, name: '罗湖区' },
						{ id: 440304, name: '福田区' },
						{ id: 440305, name: '南山区' } 
					]
				}
			]
		},
		{
			id: 420000,
			name: '湖北省',
			children: [
				{
					id: 420100,
					name: '武汉市',
					children: [
						{ id: 420106, name: '武昌区' },
						{ id: 420111, name: '洪山区' } 
					]
				}
			]
		}
	];
	
	/**
	 * 【新增】递归格式化函数：将 id/name/children 转换为 value/label/children
	 * @param {Array} data 原始地区数据数组
	 */
	const formatAreaTree = (data) => {
		if (!data || data.length === 0) return [];
		return data.map(item => {
			const newItem = {
				value: item.id, // ID 作为 value
				label: item.name, // 名称 作为 label
			};
			
			// 只有当有子节点时才添加 children 字段
			if (item.children && item.children.length > 0) {
				newItem.children = formatAreaTree(item.children); // 递归处理子级
			}
			
			return newItem;
		});
	}

	// 根据选中的value集获取索引集keys (保持不变)
	// 用于设置默认选中
	const findOptionsKey = (data, searchValue, deep = 1, keys = []) => {
		const index = data.findIndex(item => item.value === searchValue[deep - 1])
		if (index > -1) {
			keys.push(index)
			if (data[index].children) {
				findOptionsKey(data[index].children, searchValue, ++deep, keys)
			}
		}
		return keys
	}
	// ==========================================================


	export default {
		name: 'SelectRegion',
		mixins: [Emitter],
		model: {
			prop: 'value',
			event: 'change'
		},
		props: {
			// v-model 指定选中项
			value: {
				type: Array,
				default: () => {
					return []
				}
			},
			// 未选中时的提示文字
			placeholder: {
				type: String,
				default: '请选择省/市/区'
			}
		},
		data() {
			return {
				// 正在加载
				isLoading: true,
				// 是否显示
				show: false,
				// 默认选中的值
				defaultValue: [],
				// 选中项内容(文本展示)
				valueText: '',
				// 级联选择器数据
				options: []
			}
		},
		watch: {
			// 监听v-model (在 options 数据加载完成后，后续的 value 变化会触发这里)
			value(val) {
				// 设置默认选中的值
				this.valueText = val.map(item => item.label).join('/')
				this.setDefaultValue(val)
				// 将当前的值发送到 u-form-item 进行校验
				this.dispatch('u-form-item', 'on-form-change', val)
			},
		},
		created() {
			// 获取地区数据
			this.getTreeData()
		},

		methods: {

			// 打开选择器
			handleSelect() {
				this.show = true
			},

			/**
			 * 【修改点】获取地区数据，替换为模拟本地数据加载
			 */
			getTreeData() {
				const _this = this
				_this.isLoading = true
				
				// 模拟异步加载
				setTimeout(() => {
					
					// 1. 格式化整个 MOCK_AREA_DATA 树（将 id/name 转换为 value/label）
					const formattedRegions = formatAreaTree(MOCK_AREA_DATA);
					
					// 2. 赋值给 options，供 u-select 使用
					_this.options = formattedRegions;

					// 3. 处理默认选中值 (解决加载完成后 value 还没有触发 watch 的时序问题)
					if (_this.value && _this.value.length) {
						_this.setDefaultValue(_this.value);
						_this.valueText = _this.value.map(item => item.label).join('/')
					}

					_this.isLoading = false;
					
				}, 300) // 模拟 300ms 加载延迟
			},

			// 确认选择后的回调
			onConfirm(value) {
				// 绑定到v-model执行的值
				this.$emit('input', value)
				this.$emit('change', value)
			},

			/**
			 * 设置默认选中的值
			 * 该操作是为了每次打开选择器时聚焦到上次选择
			 * @param {Object} value
			 */
			setDefaultValue(value) {
				const values = value.map(item => item.value)
				const options = this.options
				// 只有 options 加载完毕后才能设置 defaultValue
				if(options && options.length > 0) {
					this.defaultValue = findOptionsKey(options, values)
				}
			},
			
			// 【已删除/注释】原有的 getOptions 和 getChildren 方法不再需要
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
	}

	.loading {
		padding-left: 10rpx;
		// text-align: center;
	}
</style>