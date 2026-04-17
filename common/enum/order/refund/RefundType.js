import Enum from '../../enum'

/**
 * 枚举类：售后类型
 * RefundTypeEnum
 */
export default new Enum([
  { key: 'RefundOnly', name: '仅退款', value: 10 },
  { key: 'Return', name: '退货退款', value: 20 }
])
