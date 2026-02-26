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
// 3. 结算与下单 (优惠券核心对接点)
// ==========================================

/**
 * 获取订单结算信息 (普通采购)
 * 支持传入 couponId 进行重算
 * @param {Object} params { StrCartIds: "...", addressId: "...", couponId: "..." }
 */
export function getOrderSettlement(params) {
  return request({ 
    url: '/api/Order/GetOrderSettlement', 
    method: 'GET', 
    params 
  });
}

/**
 * 获取订单结算信息 (处方调剂)
 * 支持传入 couponId 进行重算
 * @param {Object} data { cartIds: [], addressId: "...", couponId: "..." }
 */
export function getPrescriptionSettlement(data) {
  return request({ 
    url: '/api/user/prescription/order/settlement', 
    method: 'POST', 
    data 
  });
}

export function createOrder(data) {
  return request({ url: '/api/Order/CreateOrder', method: 'POST', data });
}

export function createPrescriptionOrder(data) {
  return request({ url: '/api/user/prescription/order/create', method: 'POST', data });
}

// ==========================================
// 4. 订单操作与支付 (含之前的支付修复)
// ==========================================

// 待付款订单获取微信支付参数 (普通采购 - 兼容老接口)
export function payOrder(data) {
    return request({ url: '/api/Order/GetPayParams', method: 'POST', data });
}

// 待付款订单获取微信支付参数 (处方调剂 - 新接口)
export function payPrescriptionOrder(data) {
    return request({ url: '/api/user/prescription/order/getPayParams', method: 'POST', data });
}

export function confirmReceive(data) {
    return request({ url: '/api/Order/Receipt', method: 'POST', data });
}

export function confirmPrescriptionReceive(data) {
    return request({ url: '/api/user/prescription/order/receive', method: 'POST', data });
}

export function cancelOrder(data) {
    return request({ url: '/api/Order/CancelOrder', method: 'POST', data });
}

export function cancelPrescriptionOrder(data) {
    return request({ url: '/api/user/prescription/order/cancel', method: 'POST', data });
}

export function applyCancelOrder(data) {
    return request({ url: '/api/Order/ApplyCancelOrder', method: 'POST', data });
}

export function deleteOrder(data) {
    return request({
        url: '/api/Order/Delete',
        method: 'POST',
        data
    });
}