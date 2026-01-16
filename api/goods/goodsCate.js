import request from '@/utils/request/request.js'

// api地址
const api = {
  ListByWhere: 'GoodsCate/ListByWhere' // 保持不变，符合新文档的命名风格
}

// 页面数据
export function ListByWhere() {
  return request.get(api.ListByWhere)
}
