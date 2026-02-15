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
// 4. 订单操作与支付
// ==========================================

// 【修改】待付款订单获取微信支付参数 (普通采购)
export function payOrder(data) {
    return request({ url: '/api/Order/GetPayParams', method: 'POST', data });
}

// 【新增】待付款订单获取微信支付参数 (处方调剂)
export function payPrescriptionOrder(data) {
    return request({ url: '/api/user/prescription/order/getPayParams', method: 'POST', data });
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

export function deleteOrder(data) {
    return request({
        url: '/api/Order/Delete',
        method: 'POST',
        data
    });
}