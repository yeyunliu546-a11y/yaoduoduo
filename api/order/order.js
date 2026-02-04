import request from '@/utils/request/request.js';

/**
 * 获取订单结算信息 (预下单)
 * @param {Object} params
 * @param {string} params.cartIds - 购物车ID集合 (购物车模式)
 * @param {number} params.goodsSkuId - SKU ID (立即购买模式)
 * @param {number} params.goodsNum - 购买数量 (立即购买模式)
 * @param {number} params.addressId - 收货地址ID
 * @param {number} params.days - [调剂] 服用天数
 * @param {number} params.packs - [调剂] 每日包数
 */
export function getOrderSettlement(params) {
  return request({
    url: '/api/Order/GetOrderSettlement',
    method: 'GET',
    params
  });
}

/**
 * 创建订单 (提交下单)
 * @param {Object} data
 * @param {number} data.addressId - 收货地址ID
 * @param {number} data.payType - 支付方式 (10:余额, 20:微信)
 * @param {string} data.buyerRemark - 买家备注/医嘱
 * @param {string} data.cartIds - 购物车ID集合
 * @param {number} data.orderType - 订单类型 (1:采购, 2:调剂)
 * @param {number} data.couponId - 优惠券ID
 */
export function createOrder(data) {
  return request({
    url: '/api/Order/CreateOrder',
    method: 'POST',
    data
  });
}

/**
 * 获取订单列表 (分页)
 * @param {Object} params 
 * @param {number} params.page 
 * @param {number} params.limit 
 * @param {number} params.orderStatus - 状态筛选
 * @param {number} params.orderType - 类型筛选 (0:全部, 1:采购, 2:调剂)
 */
export function getOrderList(params) {
  return request({
    url: '/api/Order/Load',
    method: 'GET',
    params
  });
}

/**
 * 获取订单详情
 * @param {string} orderId 
 */
export function getOrderDetail(orderId) {
  return request({
    url: '/api/Order/GetDetail',
    method: 'GET',
    params: { id: orderId }
  });
}