import Config from '@/core/config'
import storage from '@/utils/storage'
import * as SettingApi from '@/api/sys/setting'

const OTHER = '_other'
/******
设置Storage缓存
cacheKey:key
data:缓存数据
expireTime:分钟,默认30分钟
 *******/
const setStorage = (cacheKey, data, expireMinute) => {
	if (expireMinute == null) {
		expireMinute = 30
	}
	storage.set(cacheKey, data, expireMinute * 60)
}

// 获取缓存中的数据
const getStorage = (cacheKey) => {
	return storage.get(cacheKey)
}

// 获取后端接口商城设置 (最新)
const getApiData = (cacheKey) => {
	return new Promise((resolve, reject) => {
		SettingApi.GetDetail({
				key: cacheKey
			})
			.then(res => {
				resolve(res.result)
			})
	})
}

/**
 * 获取商城设置
 * 有缓存的情况下返回缓存, 没有缓存从后端api获取
 * @param {string} cacheKey 缓存Key
 * @param {bool} isCache 是否从缓存中获取,默认不缓存 [优点不用每次请求后端api 缺点后台更新设置后需等待时效性]
 */
const GetDetail = (cacheKey, isCache) => {
	if (isCache == undefined) {
		isCache = false
	}
	return new Promise((resolve, reject) => {
		const cacheData = getStorage(cacheKey)
		if (isCache && cacheData) {
			resolve(cacheData)
		} else {
			getApiData(cacheKey)
				.then(data => {
					console.log("111", data)
					setStorage(cacheKey, data)
					resolve(data)
				})
		}
	})
}


// 获取H5端访问地址
const h5Url = (isCache = false) => {
	return new Promise((resolve, reject) => {
		GetDetail(isCache)
			.then(setting => {
				const h5Url = setting[OTHER]['h5Url']
				resolve(h5Url)
			})
	})
}

export default {
	GetDetail,
	// item,
	h5Url
}