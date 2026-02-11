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

	// ==========================================================
	// 模拟地区数据
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
	
	// 递归格式化函数
	const formatAreaTree = (data) => {
		if (!data || data.length === 0) return [];
		return data.map(item => {
			const newItem = {
				value: item.id, 
				label: item.name, 
			};
			if (item.children && item.children.length > 0) {
				newItem.children = formatAreaTree(item.children); 
			}
			return newItem;
		});
	}

	// 查找索引
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
		props: {
			// 【修复】Vue 3 中 v-model 默认属性名为 modelValue
			modelValue: {
				type: Array,
				default: () => []
			},
			placeholder: {
				type: String,
				default: '请选择省/市/区'
			}
		},
		data() {
			return {
				isLoading: true,
				show: false,
				defaultValue: [],
				valueText: '',
				options: []
			}
		},
		watch: {
			// 【修复】监听 modelValue
			modelValue: {
				handler(val) {
					if(!val || val.length === 0) {
						this.valueText = '';
						return;
					}
					// 【修复】兼容 label (组件选中的) 和 Label (后端回显的)
					this.valueText = val.map(item => item.label || item.Label).join('/')
					this.setDefaultValue(val)
					this.dispatch('u-form-item', 'on-form-change', val)
				},
				immediate: true // 立即执行以处理回显
			},
		},
		created() {
			this.getTreeData()
		},

		methods: {
			handleSelect() {
				this.show = true
			},

			getTreeData() {
				const _this = this
				_this.isLoading = true
				
				setTimeout(() => {
					const formattedRegions = formatAreaTree(MOCK_AREA_DATA);
					_this.options = formattedRegions;

					// 数据加载完成后，再次尝试设置回显（防止 watch 执行时 options 还没加载）
					if (_this.modelValue && _this.modelValue.length) {
						_this.setDefaultValue(_this.modelValue);
						// 兼容大小写
						_this.valueText = _this.modelValue.map(item => item.label || item.Label).join('/')
					}

					_this.isLoading = false;
				}, 300) 
			},

			onConfirm(value) {
				// value 格式: [{label: 'xx', value: 'xx'}, ...]
				
				// 立即更新显示文本，提升体验
				this.valueText = value.map(item => item.label).join('/')
				
				// 【修复】触发 Vue 3 的 v-model 更新事件
				this.$emit('update:modelValue', value)
				
				// 保留 change 事件
				this.$emit('change', value)
				this.dispatch('u-form-item', 'on-form-change', value)
			},

			setDefaultValue(value) {
				// 【修复】兼容 Value (大写) 和 value (小写)
				const values = value.map(item => item.value || item.Value)
				const options = this.options
				if(options && options.length > 0) {
					this.defaultValue = findOptionsKey(options, values)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
	}

	.loading {
		padding-left: 10rpx;
	}
</style>