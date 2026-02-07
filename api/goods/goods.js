import request from '@/utils/request/request.js'

// 1. 获取筛选选项 (厂家、包装等)
// 文档: /api/Goods/GetFilterOptions
export function getFilterOptions(params) {
  return request({
    url: '/api/Goods/GetFilterOptions',
    method: 'get',
    params
  })
}

// 2. 获取商品列表 (分页/搜索)
// 【修改】URL 从 /api/Goods/ListByWhere 改为 /api/Goods/Load
export function getGoodsListByWhere(params) {
  return request({
    url: '/api/Goods/Load',
    method: 'get',
    params
  })
}

// 3. 获取商品详情
// 【修改】URL 从 /api/Goods/Detail 改为 /api/Goods/Get
export function getGoodsDetail(id) {
  return request({
    url: '/api/Goods/Get',
    method: 'get',
    params: { id }
  })
}