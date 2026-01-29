import request from '@/utils/request/request.js'

// 1. 获取筛选选项 (厂家、包装等)
export function getFilterOptions(params) {
  return request({
    url: '/api/Goods/GetFilterOptions',
    method: 'get',
    params
  })
}

// 2. 获取商品列表
export function getGoodsListByWhere(params) {
  return request({
    url: '/api/Goods/ListByWhere',
    method: 'get',
    params
  })
}

// 3. 获取商品详情
export function getGoodsDetail(id) {
  return request({
    url: '/api/Goods/Detail',
    method: 'get',
    params: { id }
  })
}