import request from '@/utils/request/request'

// 1. 获取收藏列表
// GET /api/user/prescription/favorite/list
export function getFavoriteList(params) {
  return request.get('/api/user/prescription/favorite/list', params)
}

// 2. 添加收藏
// POST /api/user/prescription/favorite/add
// data: { name, items: [{ goodsId, goodsSkuId, goodsWeight }] }
export function addFavorite(data) {
  return request.post('/api/user/prescription/favorite/add', data)
}

// 3. 编辑方剂收藏
// POST /api/user/prescription/favorite/update
// data: { favoriteId, name, items: [...] }
export function updateFavorite(data) {
  return request.post('/api/user/prescription/favorite/update', data)
}

// 4. 删除收藏
// DELETE /api/user/prescription/favorite/delete
// data: { favoriteId }
export function deleteFavorite(favoriteId) {
  return request.delete('/api/user/prescription/favorite/delete', { favoriteId })
}

// 5. 使用收藏（一键加购）
// POST /api/user/prescription/favorite/use
// data: { favoriteId }
export function useFavorite(favoriteId) {
  return request.post('/api/user/prescription/favorite/use', { favoriteId })
}

// 6. 获取收藏详情
// GET /api/user/prescription/favorite/detail
export function getFavoriteDetail(favoriteId) {
  return request.get('/api/user/prescription/favorite/detail', { favoriteId })
}