import request from '@/utils/request/request.js'

// ==========================================
// 普通购物车接口 (GoodsType = 1)
// ==========================================

// 1. 查询购物车列表
export function getCartList(params) {
  return request({
    url: '/api/Cart/Load',
    method: 'get',
    params
  })
}

// 2. 添加商品到购物车 (普通)
export function addCart(data) {
  return request({
    url: '/api/Cart/AddCart',
    method: 'post',
    data
  })
}

// 3. 修改购物车商品数量 (普通)
export function updateCartNum(data) {
  return request({
    url: '/api/Cart/UpdateCartNum',
    method: 'post',
    data
  })
}

// 4. 批量删除购物车商品 (普通)
export function deleteCart(data) {
  return request({
    url: '/api/Cart/Delete',
    method: 'post',
    data
  })
}

// ==========================================
// 【新增】处方购物车接口 (GoodsType = 2)
// 对应文档 5.1 章节
// ==========================================

// 1. 添加药品到处方购物车
// data: { goodsSkuId: string, goodsWeight: int }
export function addPrescriptionCart(data) {
  return request({
    url: '/api/user/prescription/cart/add',
    method: 'post',
    data
  })
}

// 2. 获取处方购物车列表
export function getPrescriptionCartList() {
  return request({
    url: '/api/user/prescription/cart/list',
    method: 'get'
  })
}

// 3. 更新药品克重
// data: { id: string, goodsWeight: int }
export function updatePrescriptionCart(data) {
  return request({
    url: '/api/user/prescription/cart/update',
    method: 'put',
    data
  })
}

// 4. 删除购物车药品
// data: { ids: [] }
export function removePrescriptionCart(data) {
  return request({
    url: '/api/user/prescription/cart/remove',
    method: 'delete',
    data
  })
}

// 5. 获取处方购物车数量
export function getPrescriptionCartCount() {
  return request({
    url: '/api/user/prescription/cart/count',
    method: 'get'
  })
}