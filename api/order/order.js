import request from '@/utils/request/request.js';

// ==========================================
// 1. 订单结算 (预下单)
// ==========================================

/**
 * 获取普通采购订单结算信息
 * @param {Object} params { cartIds, addressId, ... }
 */
export function getOrderSettlement(params) {
  return request({
    url: '/api/Order/GetOrderSettlement',
    method: 'GET',
    params
  });
}

/**
 * 【新增】获取处方订单结算信息
 * 文档: 5.2.1 章节
 * @param {Object} data { cartIds: "id1,id2", dosageDays: 7, dailyPackages: 2, addressId }
 */
export function getPrescriptionSettlement(data) {
  return request({
    url: '/api/user/prescription/order/settlement',
    method: 'POST', // 注意：文档要求是 POST
    data
  });
}

// ==========================================
// 2. 创建订单 (提交)
// ==========================================

/**
 * 创建普通采购订单
 */
export function createOrder(data) {
  return request({
    url: '/api/Order/CreateOrder',
    method: 'POST',
    data
  });
}

/**
 * 【新增】创建处方订单
 * 文档: 5.2.2 章节
 * @param {Object} data { cartIds, addressId, dosageDays, dailyPackages, medicalAdvice, ... }
 */
export function createPrescriptionOrder(data) {
  return request({
    url: '/api/user/prescription/order/create',
    method: 'POST',
    data
  });
}

// ==========================================
// 3. 订单列表
// ==========================================

/**
 * 获取订单列表 (支持混合查询)
 * 文档: 13.3 章节
 * @param {Object} params 
 * @param {number} params.orderType - 0:全部, 1:采购, 2:调剂
 * @param {number} params.orderStatus
 * @param {number} params.page
 */
export function getOrderList(params) {
  // 建议改用新的混合接口，这样能同时看到两种订单
  return request({
    url: '/api/user/order/all', 
    method: 'GET',
    params
  });
}

// ==========================================
// 4. 订单详情
// ==========================================

/**
 * 获取订单详情
 * @param {string} orderId 
 * @param {number} type - 可选，用于区分调用哪个接口，或者后端统一处理
 */
export function getOrderDetail(orderId) {
  // 如果后端普通订单和处方订单详情接口没统一，可能需要判断
  // 处方文档: /api/user/prescription/order/detail/{orderId}
  // 这里暂时保持原样，如果报错，可能需要根据订单类型区分 URL
  return request({
    url: '/api/Order/GetDetail', 
    method: 'GET',
    params: { id: orderId }
  });
}