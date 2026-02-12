import request from '@/utils/request/request.js';

// ==========================================
// 1. 订单列表
// ==========================================
export function getOrderList(params) {
  return request({
    url: '/api/user/order/all',
    method: 'GET',
    params: {
      ...params,
      OnlyMy: true 
    }
  });
}

// ==========================================
// 2. 订单详情
// ==========================================
export function getOrderDetail(orderId) {
  return request({
    url: '/api/Order/GetDetail',
    method: 'GET',
    params: { id: orderId }
  });
}

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

// ==========================================
// 4. 订单操作
// ==========================================

export function payOrder(data) {
    return request({ url: '/api/Order/Pay', method: 'POST', data });
}

export function confirmReceive(data) {
    return request({ url: '/api/Order/Receipt', method: 'POST', data });
}

export function cancelOrder(data) {
    return request({ url: '/api/Order/CancelOrder', method: 'POST', data });
}

export function applyCancelOrder(data) {
    return request({ url: '/api/Order/ApplyCancelOrder', method: 'POST', data });
}

export function cancelPrescriptionOrder(data) {
    return request({ url: '/api/user/prescription/order/cancel', method: 'POST', data });
}

export function confirmPrescriptionReceive(data) {
    return request({ url: '/api/user/prescription/order/receive', method: 'POST', data });
}

/**
 * 【新增】删除订单
 * 文档参考: 后台管理端文档 2.3 批量删除
 * 参数: ["id1", "id2"]
 */
export function deleteOrder(data) {
    return request({
        url: '/api/Order/Delete',
        method: 'POST',
        data
    });
}