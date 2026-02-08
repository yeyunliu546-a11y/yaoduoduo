import request from '@/utils/request/request.js'

// 1. 获取分类列表
// 原名可能叫 ListByWhere，改为 getCategoryList
export function getCategoryList() {
  return request.get('/api/GoodsCate/ListByWhere')
}