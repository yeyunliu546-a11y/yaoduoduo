import request from '@/utils/request/request.js';

// ==========================================
// 1. 订单列表
// ==========================================
export function getOrderList(params) {
  return request({
    url: '/api/user/order/all', 
    method: 'GET',
    params
  });
}

// ==========================================
// 2. 订单详情 (分流)
// ==========================================

/**
 * [普通采购] 订单详情
 */
export function getOrderDetail(orderId) {
  return request({
    url: '/api/Order/GetDetail', 
    method: 'GET',
    params: { id: orderId }
  });
}

/**
 * [处方调剂] 订单详情
 * 文档 5.2.4: GET /api/user/prescription/order/detail/{orderId}
 * 这是一个 RESTful 风格接口，需要拼接 URL
 */
export function getPrescriptionDetail(orderId) {
  return request({
    url: `/api/user/prescription/order/detail/${orderId}`, 
    method: 'GET'
  });
}

// ==========================================
// 3. 结算与下单
// ==========================================
export function getOrderSettlement(params) {
  return request({ url: '/api/Order/GetOrderSettlement', method: 'GET', params });
}

export function createOrder(data) {
  return request({ url: '/api/Order/CreateOrder', method: 'POST', data });
}

export function getPrescriptionSettlement(data) {
  return request({ url: '/api/user/prescription/order/settlement', method: 'POST', data });
}

export function createPrescriptionOrder(data) {
  return request({ url: '/api/user/prescription/order/create', method: 'POST', data });
}

// 支付
export function payOrder(data) {
    return request({ url: '/api/Order/Pay', method: 'POST', data })
}