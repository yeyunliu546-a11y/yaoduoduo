/**
 * 收货地址管理 API 对接
 * 对应后端数据库表: tb_UserAddress
 */
import request from '@/utils/request/request.js'

/**
 * 获取地址列表（分页）
 * @param {Object} data 
 * @param {number} data.Page - 页码
 * @param {number} data.Limit - 每页数量
 * @param {string} data.Key - 搜索关键字
 * @param {number} data.IsDefault - 是否默认 (10 / -10)
 * @param {boolean} data.OnlyMy - 必须传 true，只查询当前用户的地址
 */
export function loadList(data) {
	return request({
		url: '/api/UserAddress/Load',
		method: 'GET',
		data
	})
}

/**
 * 获取地址列表（全部，不分页）
 * @param {Object} data
 * @param {string} data.Key - 搜索关键字
 * @param {boolean} data.OnlyMy - 必须传 true
 */
export function listByWhere(data) {
	return request({
		url: '/api/UserAddress/ListByWhere',
		method: 'GET',
		data
	})
}

/**
 * 根据 ID 获取地址详情
 * @param {string} id - 地址 ID
 */
export function getDetail(id) {
	return request({
		url: '/api/UserAddress/GetDetail',
		method: 'GET',
		data: { id }
	})
}

/**
 * 新增或修改地址
 * @param {Object} data
 * @param {string} [data.Id] - 地址 ID（修改时必传，新增不传）
 * @param {string} data.Name - 收货人姓名
 * @param {string} data.Phone - 联系电话
 * @param {string} data.Detail - 详细地址
 * @param {Array} data.ListRegion - 省市区数组 [{Value, Label}]，必须为3级
 */
export function addOrUpdate(data) {
	return request({
		url: '/api/UserAddress/AddOrUpdate',
		method: 'POST',
		data
	})
}

/**
 * 设为默认地址
 * @param {string} id - 地址 ID
 */
export function setDefault(id) {
	return request({
		url: '/api/UserAddress/SetDefault',
		method: 'POST',
		data: { Id: id }
	})
}

/**
 * 批量/单个删除地址
 * @param {Array} ids - 地址 ID 数组，例如 ["addr001", "addr002"]
 */
export function deleteAddress(ids) {
	return request({
		url: '/api/UserAddress/Delete',
		method: 'POST',
		data: ids
	})
}

export default {
	loadList,
	listByWhere,
	getDetail,
	addOrUpdate,
	setDefault,
	deleteAddress
}