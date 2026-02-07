// api/goods/favorite.js
import request from '@/utils/request/request'

// 1. 收藏列表
export function getFavoriteList() {
  return request({
    url: '/api/PrescriptionFavorite/Load', 
    method: 'GET'
  })
}

// 2. 添加收藏
export function addFavorite(data) {
  return request({
    url: '/api/PrescriptionFavorite/Add',
    method: 'POST',
    data: {
      name: data.name,
      items: data.goodsList.map(item => ({
        goodsId: item.goodsId,
        goodsSkuId: item.goodsSkuId || item.id, 
        goodsWeight: item.goodsNum 
      }))
    }
  })
}

// 3. 收藏加购 (文档明确指定: /api/user/prescription/favorite/use)
export function addFavoriteToCart(favId) {
  return request({
    url: '/api/user/prescription/favorite/use',
    method: 'POST',
    data: { id: favId }
  })
}

// 4. 删除收藏
export function deleteFavorite(id) {
  return request({
    url: '/api/PrescriptionFavorite/Delete',
    method: 'POST',
    data: { ids: [id] }
  })
}

// 5. 更新收藏
export function updateFavorite(data) {
    return request({
        url: '/api/PrescriptionFavorite/Update',
        method: 'POST',
        data: data
    })
}