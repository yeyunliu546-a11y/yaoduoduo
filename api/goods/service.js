import request from '@/utils/request/request.js'

// api地址
const api = {
  list: 'Goods/GetServiceList' // 修改：goods -> Goods，保持命名风格统一
}

// 商品评价列表
export function list(goodsId) {
  return request.get(api.list, { goodsId })
}