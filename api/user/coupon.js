import request from '@/utils/request/request.js';

// ==========================================
// 1. 领券中心 (市场 - 可领取的券)
// ==========================================

/**
 * 获取领券中心列表
 * 文档参考: 2.2 获取可领取优惠券列表
 * @param {Object} params { page, limit }
 */
export function getCouponList(params) {
  return request({
    url: '/api/Coupon/ListByWhere', // 【修正】文档指定接口
    method: 'GET',
    params: {
      ...params,
      // 文档虽然没强制要求传 status，但在领券中心通常只看"可用"的
      // 如果后端接口不需要传 Status=10，可以去掉这个参数
      Status: 10 
    }
  });
}

/**
 * 领取优惠券
 * 文档参考: 2.3 领取优惠券
 * @param {Object} data { couponId: "GUID" }
 */
export function receiveCoupon(data) {
  return request({
    url: '/api/Coupon/ReceiveCoupon',
    method: 'POST',
    data
  });
}

// ==========================================
// 2. 我的优惠券 (用户资产)
// ==========================================

/**
 * 获取我的优惠券列表
 * 文档参考: 2.4 获取我的优惠券列表
 * @param {Object} params 
 * Status: 10(可使用), -10(已过期), -20(已使用), -30(已作废)
 */
export function getMyCouponList(params) {
  return request({
    url: '/api/UserCoupon/ListByWhere', // 【修正】文档指定接口
    method: 'GET',
    params: {
      ...params,
      OnlyMy: true // 【关键】文档要求固定传 true
    }
  });
}

/**
 * 获取优惠券详情 (保留接口)
 */
export function getCouponDetail(id) {
  return request({
    url: '/api/Coupon/Get',
    method: 'GET',
    params: { id }
  });
}

// ==========================================
// 3. 订单结算配套 (预埋)
// ==========================================

/**
 * 【新增】获取订单可用优惠券（自动匹配最佳）
 * 文档参考: 2.1 获取订单可用优惠券
 * @param {Object} data 
 * { 
 * OrderAmount: 100.00, 
 * GoodsItems: [{ GoodsId: "...", GoodsType: 1 }] 
 * }
 */
export function getAvailableCoupons(data) {
  return request({
    url: '/api/UserCoupon/GetAvailableCoupons',
    method: 'POST',
    data
  });
}