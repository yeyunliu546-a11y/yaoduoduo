import request from '@/utils/request/request.js';

// ==========================================
// 1. 订单列表
// ==========================================

/**
 * 获取订单列表 (聚合查询)
 */
export function getOrderList(params) {
  return request({
    url: '/api/user/order/all',
    method: 'GET',
    params: {
      ...params,
      // 【关键】必须传 OnlyMy，否则采购订单可能查不到
      OnlyMy: true 
    }
  });
}

// ==========================================
// 2. 订单详情 (接口分流)
// ==========================================

/**
 * [采购订单] 详情
 */
export function getOrderDetail(orderId) {
  return request({
    url: '/api/Order/GetDetail',
    method: 'GET',
    params: { id: orderId }
  });
}

/**
 * [处方订单] 详情
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

// ==========================================
// 4. 订单操作 (支付/收货/取消)
// ==========================================

// 支付 (通用)
export function payOrder(data) {
    return request({ url: '/api/Order/Pay', method: 'POST', data });
}

// --- 采购订单操作 ---

export function confirmReceive(data) {
    return request({ url: '/api/Order/Receipt', method: 'POST', data });
}

export function cancelOrder(data) {
    return request({ url: '/api/Order/CancelOrder', method: 'POST', data });
}

export function applyCancelOrder(data) {
    return request({ url: '/api/Order/ApplyCancelOrder', method: 'POST', data });
}

// --- 处方订单操作 (新增) ---

/**
 * [处方] 取消订单 (文档 5.2.5)
 */
export function cancelPrescriptionOrder(data) {
    return request({ url: '/api/user/prescription/order/cancel', method: 'POST', data });
}

/**
 * [处方] 确认收货 (文档 5.2.6)
 */
export function confirmPrescriptionReceive(data) {
    return request({ url: '/api/user/prescription/order/receive', method: 'POST', data });
}