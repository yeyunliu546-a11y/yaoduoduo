# 新手指引页使用说明

### 说明
1、 本插件是参考 ` https://www.cnblogs.com/shenjp/p/14873233.html ` ，根据该作者 `sjpqy` 的分享进行了整理和优化，感谢作者提供示例。
2、 本人暂时只在微信小程序端和H5 使用Chrome浏览器测试。更改了一些内容，有可能会有一些错误或说明与实际不一致，介意者慎用，组件中都有代码备注，可以根据自己的需求自行调整。本人会适当的抽出业余时间，把它完善，再次感谢原作者。

~~3、目前有两个不太完善的地方，不过大家可以根据自己的需求对组件进行修改。~~
~~如果需要引导的dom在底部，步骤提示条`[tips]`没有做顶部定位，只能展示在选择的dom下方，可能无法展示（主要是css基础差）。
由于屏幕尺寸不一可能导致提示条`[tips]`定位可能存在偏差，导致提示条`[tips]`无法展示~~

> v-1.6.5 修复上述bug，增加了下一步按钮文字自定义，增加是否重复展示新手引导，兼容旧版本

> 感谢 @`10163688**qq.com` 对该插件进行bug修复和完善。

### 优点
`高颜值` `简单易用` `占用精简小`

### 演示视频

[点我播放](https://lcoce.oss-cn-beijing.aliyuncs.com/video/guidestep.mp4 "点我播放")

或者复制视频链接到浏览器
```
https://lcoce.oss-cn-beijing.aliyuncs.com/video/guidestep.mp4
```


### 安装插件
 将下载的组件直接放入根目录的组件文件夹【components】中。

### 使用插件
1. 在需要用到的页面组件中引入组件

```
import guideStep from "@/components/guideStep.vue";
```

2. 注册组件

```
components:{
	guideStep
},
```
3. 使用guideStep组件，可放到view里面最外层

```
<guideStep :step="step"></guideStep>
```
4. 配置data里面的参数step。

```
step:{
	name:'workbenchKey',
	guideList: [
		{
			el: '.content1', 
			tips: '点击这里，步骤一', 
			style: "border-radius: 8rpx;margin: 0",
			next:"下一步"
		},{
			el: '.content2', 
			tips: '点击这里，步骤二', 
			style: "border-radius: 8rpx;margin: 0",
		},{
			el: '.content3', 
			tips: '点击这里，步骤三！', 
			style: "border-radius: 8rpx;margin: 0",
			next:"下一页"
		},{
			el: '.main-body .content4',
			tips: '点击这里，步骤四',
			style: "border-radius: 8rpx;margin: 0",
			next:"我知道啦"
		}]
	},
```

### 参数说明

| 属性  |  类型 |  必填 |  说明 |
| ------------ | ------------ | ------------ | ------------ |
| name  |  String |  是 | 引导提示的名称，如果已经展示过引导将会自动跳过，全局名称必须唯一，否则其他页面的引导提示无法展示 |
| repeat  |  boolean |  否 | 默认为false，是否重复展示新手引导，如果设置为true的话。每次进入都会展示这个新手引导 |
|  guideList | Array  |  是 | 引导流程，参数见下表 |

guideList参数说明

| 属性  |  类型 |  必填 |  说明 |
| ------------ | ------------ | ------------ | ------------ |
| el  |  String |  是 |  需要高亮的元素，这里最好唯一，dom选择器，跟JQ差不多。|
|  tips | String  |  是 | 引导步骤的提示文字 |
|  next | String  |  是 | 下一步展示文字 |
|  style | String  |  否 | 引导步骤的样式，可自行添加一些。只能写css |

### 完成示例
```javascrpt
<template>
	<view class="main-body">
		<view class="content1" style="height:200rpx"></view>
		<view class="content2" style="height:200rpx"></view>
		<view class="content3" style="height:200rpx"></view>
		<view class="content4" style="height:200rpx"></view>
		<guideStep :step="step"></guideStep>
	</view>
</template>
<script>
	import guideStep from "@/components/guideStep.vue";
	export default {
		components:{
			guideStep
		},
		data() {
			return {
				step:{
					name:'workbenchKey',
					repeat:false,
					guideList: [
						{
							el: '.content1', 
							tips: '点击这里，步骤一', 
							style: "border-radius: 8rpx;margin: 0",
							next:"下一步"
						},{
							el: '.content2', 
							tips: '点击这里，步骤二', 
							style: "border-radius: 8rpx;margin: 0",
							next:"下一步"
						},{
							el: '.content3', 
							tips: '点击这里，步骤三！', 
							style: "border-radius: 8rpx;margin: 0",
							next:"我知道啦"
						},{
							el: '.main-body .content4',
							tips: '点击这里，步骤四',
							style: "border-radius: 8rpx;margin: 0",
							next:"完成"
						}]
					},
				}
			}
		}
</script>



```



