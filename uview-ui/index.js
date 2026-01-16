// 1. 修复导入方式，避免只读错误
import * as mixin_module from './libs/mixin/mixin.js'
import * as mpShare_module from './libs/mixin/mpShare.js'

// 2. 修复导入解包
let mixin = mixin_module.default || mixin_module
let mpShare = mpShare_module.default || mpShare_module

import http from './libs/request'

function wranning(str) {
	if (process.env.NODE_ENV === 'development') {
		console.warn(str)
	}
}

// 引入各种工具函数
import queryParams from './libs/function/queryParams.js'
import route from './libs/function/route.js'
import timeFormat from './libs/function/timeFormat.js'
import timeFrom from './libs/function/timeFrom.js'
import colorGradient from './libs/function/colorGradient.js'
import guid from './libs/function/guid.js'
import color from './libs/function/color.js'
import type2icon from './libs/function/type2icon.js'
import randomArray from './libs/function/randomArray.js'
import deepClone from './libs/function/deepClone.js'
import deepMerge from './libs/function/deepMerge.js'
import addUnit from './libs/function/addUnit.js'
import test from './libs/function/test.js'
import random from './libs/function/random.js'
import trim from './libs/function/trim.js'
import toast from './libs/function/toast.js'
import getParent from './libs/function/getParent.js'
import $parent from './libs/function/$parent.js'
import {sys, os} from './libs/function/sys.js'
import debounce from './libs/function/debounce.js'
import throttle from './libs/function/throttle.js'
import config from './libs/config/config.js'
import zIndex from './libs/config/zIndex.js'

// 定义 $u 对象
const $u = {
	queryParams, route, timeFormat, date: timeFormat, timeFrom,
	colorGradient: colorGradient.colorGradient,
	colorToRgba: colorGradient.colorToRgba,
	guid, color, sys, os, type2icon, randomArray, wranning,
	get: http.get, post: http.post, put: http.put, 'delete': http.delete,
	hexToRgb: colorGradient.hexToRgb, rgbToHex: colorGradient.rgbToHex,
	test, random, deepClone, deepMerge, getParent, $parent, addUnit, trim,
	type: ['primary', 'success', 'error', 'warning', 'info'],
	http, toast, config, zIndex, debounce, throttle,
}

// 挂载到 uni 对象
uni.$u = $u

const install = Vue => {
	// 1. 兼容 Vue 3 的全局属性挂载
	// 【关键修复】直接使用上面定义的 $u，而不是 new UView()
	if (Vue.config && Vue.config.globalProperties) {
		Vue.config.globalProperties.$u = $u;
	} else {
		Vue.prototype.$u = $u;
	}

	// 2. 混入 mixin (必须在 $u 挂载之后)
	Vue.mixin(mixin)
	if (mpShare) Vue.mixin(mpShare)

	// 3. Vue 3 兼容补丁：修复 $on/$off/$once 缺失问题
	Vue.mixin({
		beforeCreate() {
			if (typeof this.$on === 'undefined') {
				this._u_events = {};
				
				this.$uOn = function(event, fn) {
					if (!this._u_events[event]) {
						this._u_events[event] = [];
					}
					this._u_events[event].push(fn);
					return this;
				};

				this.$uOff = function(event, fn) {
					if (!arguments.length) {
						this._u_events = {};
						return this;
					}
					const cbs = this._u_events[event];
					if (!cbs) return this;
					if (!fn) {
						this._u_events[event] = null;
						return this;
					}
					let cb;
					let i = cbs.length;
					while (i--) {
						cb = cbs[i];
						if (cb === fn || cb.fn === fn) {
							cbs.splice(i, 1);
							break;
						}
					}
					return this;
				};

				this.$uOnce = function(event, fn) {
					const on = (...args) => {
						this.$uOff(event, on);
						fn.apply(this, args);
					};
					on.fn = fn;
					this.$uOn(event, on);
					return this;
				};

				this.$uEmit = function(event, ...args) {
					const cbs = this._u_events && this._u_events[event];
					if (cbs) {
						cbs.forEach(fn => fn.apply(this, args));
					}
				}

				// 映射方法
				this.$on = this.$uOn
				this.$off = this.$uOff
				this.$once = this.$uOnce
			}
		}
	});

	// 4. 过滤器兼容 (仅在支持的环境下运行)
	if (typeof Vue.filter === 'function') {
		Vue.filter('timeFormat', (timestamp, format) => timeFormat(timestamp, format))
		Vue.filter('date', (timestamp, format) => timeFormat(timestamp, format))
		Vue.filter('timeFrom', (timestamp, format) => timeFrom(timestamp, format))
	}
}

export default {
	install
}