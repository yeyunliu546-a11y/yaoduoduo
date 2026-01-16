import request from '@/utils/request/request.js'

// api地址
const api = {
  load: 'Goods/Load',    // ✅ 对应文档：商品列表展示API
  detail: 'Goods/Get',   // ✅ 对应文档：商品详情展示API
}

// 商品列表(分页)
// 对应文档参数: page, limit, key, sortType, manufacturer...
export const load = param => {
  return request.get(api.load, param)
}

// 商品详情
// 对应文档参数: id
export const detail = id => {
  return request.get(api.detail, { id })
}
