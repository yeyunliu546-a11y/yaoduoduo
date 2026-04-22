import Enum from '../../enum'

/**
 * 售后单状态
 */
export default new Enum([
  { key: 'UnApprove', name: '审核拒绝', value: -10 },
  { key: 'WaitAudit', name: '待审核', value: 10 },
  { key: 'Approve', name: '审核通过', value: 20 },
  { key: 'Shipped', name: '用户已发货', value: 30 },
  { key: 'Refunded', name: '已退款', value: 80 }
])
