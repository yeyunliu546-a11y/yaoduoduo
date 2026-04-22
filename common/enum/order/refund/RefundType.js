import Enum from '../../enum'

/**
 * 售后类型
 * 10 = 退货退款
 * 20 = 仅退款
 */
export default new Enum([
  { key: 'Return', name: '退货退款', value: 10 },
  { key: 'RefundOnly', name: '仅退款', value: 20 }
])
