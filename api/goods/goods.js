// api/goods/goods.js
import request from '@/utils/request/request.js'

// ... 原有的代码 ...

/**
 * [新增] 1. 获取多维度筛选选项
 * 文档对应：GET /api/Goods/GetFilterOptions
 */
export function getFilterOptions() {
  return request({
    url: '/api/Goods/GetFilterOptions',
    method: 'get'
  })
}

/**
 * [新增] 2. 商品筛选查询 (支持分页 + 多维度筛选)
 * 文档对应：GET /api/Goods/ListByWhere
 * @param {Object} query 参数对象
 * query结构示例:
 * {
 * page: 1,
 * limit: 10,
 * manufacturer: '华润三九,同仁堂', // 可选，逗号分隔
 * packageType: '大包',            // 可选
 * standard: '国标'                // 可选
 * }
 */
export function getGoodsListByWhere(query) {
  return request({
    url: '/api/Goods/ListByWhere',
    method: 'get',
    params: query
  })
}