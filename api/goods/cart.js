import request from '@/utils/request/request.js'

// 1. 查询购物车列表
export function getCartList(params) {
  return request({
    url: '/api/Cart/Load',
    method: 'get',
    params
  })
}

// 2. 添加商品到购物车
export function addCart(data) {
  return request({
    url: '/api/Cart/AddCart',
    method: 'post',
    data
  })
}

// 3. 修改购物车商品数量
export function updateCartNum(data) {
  return request({
    url: '/api/Cart/UpdateCartNum',
    method: 'post',
    data
  })
}

// 4. 批量删除购物车商品
export function deleteCart(data) {
  return request({
    url: '/api/Cart/Delete',
    method: 'post',
    data
  })
}