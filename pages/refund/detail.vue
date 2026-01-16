<template>
  <view v-if="!isLoading" class="container p-bottom">

    <view class="detail-header dis-flex flex-y-center">
      <view class="header-backdrop">
        </view>
      <view class="header-state">
        <text class="f-32 col-f">{{ detail.strStatus }}</text>
      </view>
    </view>

    <view class="detail-goods b-f m-top20 dis-flex flex-dir-row" @click="onGoodsDetail(detail.goodsId)">
      <view class="left">
        <image class="goods-image" :src="detail.urlSkuThumbnail"></image>
      </view>
      <view class="right dis-flex flex-box flex-dir-column flex-x-around">
        <view class="goods-name">
          <text class="twoline-hide">{{ detail.goodsName }}</text>
        </view>
        <view class="dis-flex col-9 f-24">
          <view class="flex-box">
            <view class="goods-props clearfix">
              <view class="goods-props-item" >
                <text>{{ detail.skuName}}</text>
              </view>
            </view>
          </view>
          <text class="t-r">×{{ detail.quantity }}</text>
        </view>
      </view>
    </view>

    <view class="detail-order b-f row-block">
      <view class="item dis-flex flex-x-end flex-y-center">
        <text class="">商品金额：</text>
        <text class="col-m">￥{{ detail.amountExpectRefund}}</text>
      </view>
    </view>

    <view v-if="detail.status == RefundStatusEnum.Received.value && detail.type == 10"
      class="detail-order b-f row-block dis-flex flex-x-end flex-y-center">
      <text class="">已退款金额：</text>
      <text class="col-m">￥{{ detail.amountRealRefund }}</text>
    </view>

    <view v-if="detail.status >= RefundStatusEnum.WaitAudit.value" class="detail-refund b-f m-top20">
      <view class="detail-refund__row dis-flex">
        <view class="text">
          <text>售后类型：</text>
        </view>
        <view class="flex-box">
          <text>{{ detail.strRefundType }}</text>
        </view>
      </view>
      <view class="detail-refund__row dis-flex">
        <view class="text">
          <text>申请原因：</text>
        </view>
        <view class="flex-box">
          <text>{{ detail.mark}}</text>
        </view>
      </view>
      <view v-if="detail.listRefundProof.length > 0" class="detail-refund__row dis-flex">
        <view class="text">
          <text>申请凭证：</text>
        </view>
        <view class="image-list flex-box">
          <view class="image-preview" v-for="(item, index) in detail.listRefundProof" :key="index">
            <image class="image" mode="aspectFill" :src="item" @click="handlePreviewImages(index)"></image>
          </view>
        </view>
      </view>
    </view>

    <view v-if="detail.status == RefundStatusEnum.UnApprove.value" class="detail-refund b-f m-top20">
      <view class="detail-refund__row dis-flex">
        <view class="text">
          <text class="col-m">拒绝原因：</text>
        </view>
        <view class="flex-box">
          <text>{{ detail.sellerMark }}</text>
        </view>
      </view>
    </view>

    <view v-if="detail.status == RefundStatusEnum.Shipped.value && detail.is_user_send"
      class="detail-address b-f m-top20">
      <view class="detail-address__row address-title">
        <text class="col-m">退货物流信息</text>
      </view>
      <view class="detail-address__row address-details">
        <view class="address-details__row">
          <text>物流公司：{{ detail.express.expressName }}</text>
        </view>
        <view class="address-details__row">
          <text>物流单号：{{ detail.express_no }}</text>
        </view>
        <view class="address-details__row">
          <text>发货时间：{{ detail.send_time }}</text>
        </view>
      </view>
    </view>

    <view v-if="detail.status == RefundStatusEnum.Approve.value" class="detail-address b-f m-top20">
      <view class="detail-address__row address-title">
        <text class="col-m">商家退货地址</text>
      </view>
      <view class="detail-address__row address-details">
        <view class="address-details__row">
          <text>收货人：{{ detail.refundAddress.name }}</text>
        </view>
        <view class="address-details__row">
          <text>联系电话：{{ detail.refundAddress.phone }}</text>
        </view>
        <view class="address-details__row dis-flex">
          <view class="text">
            <text>详细地址：</text>
          </view>
            <text class="detail">{{ detail.refundAddress.fullAddress }}</text>
			<view class="act-copy" @click.stop="handleCopy(detail.refundAddress.name+','+detail.refundAddress.phone+','+detail.refundAddress.fullAddress)">
			  <text>复制</text>
			</view>
        </view>
      </view>
      <view class="detail-address__row address-tips">
        <view class="f-26 col-9">
          <text>· 未与卖家协商一致情况下，请勿寄到付或平邮</text>
        </view>
        <view class="f-26 col-9">
          <text>· 请填写真实有效物流信息</text>
        </view>
      </view>
    </view>

    <form
      v-if="detail.refundType == RefundTypeEnum.Return.value && detail.status == RefundStatusEnum.Approve.value"
      @submit="onSubmit()">
      <view class="detail-express b-f m-top20">
        <view class="form-group dis-flex flex-y-center">
          <view class="field">物流公司：</view>
          <view class="flex-box">
            <picker mode="selector" :range="listExpress" range-key="expressName" :value="expressIndex"
              @change="onChangeExpress">
              <text v-if="expressIndex > -1">{{ listExpress[expressIndex].expressName }}</text>
              <text v-else class="col-80">请选择物流公司</text>
            </picker>
          </view>
        </view>
        <view class="form-group dis-flex flex-y-center">
          <view class="field">物流单号：</view>
          <view class="flex-box">
            <input class="input" v-model="formData.expressNo" placeholder="请填写物流单号"></input>
          </view>
        </view>
      </view>
      <view class="footer">
        <view class="btn-wrapper">
          <button class="btn-item btn-item-main btn-normal" :class="{ disabled }" formType="submit">确认发货</button>
        </view>
      </view>
    </form>

    <view class="vRecord">
		<u-time-line>
				<u-time-line-item nodeTop="2" v-for="(item,index) in detail.listRecord" :key="index">					
					<template v-slot:content>
						<view>
							<view class="uLineDesc">{{item.info}}</view>
							<view class="uLineTime">{{item.createTime}}</view>
						</view>
					</template>
				</u-time-line-item>				
		</u-time-line>
	</view>
  </view>
</template>

<script>
  import {  RefundStatusEnum, RefundTypeEnum } from '@/common/enum/order/refund'
  // import * as RefundApi from '@/api/order/orderRefundSku' // [模拟修改]
  // import * as ExpressApi from '@/api/store/storeExpress'   // [模拟修改]

  export default {
    data() {
      return {
        // 枚举类
        RefundStatusEnum,
        RefundTypeEnum,
        isLoading: true,
        orderRefundSkuId: null,
        detail: {},
        listExpress: [],
        formData: {
          expressId: null,
          expressNo: ''
        },
        expressIndex: -1,
        disabled: false
      }
    },

    onLoad({ orderRefundSkuId }) {
      this.orderRefundSkuId = orderRefundSkuId
      this.getPageData()
    },

    methods: {
      getPageData() {
        const app = this
        app.isLoading = true
        Promise.all([app.getRefundDetail(), app.getlistExpress()])
          .then(result => {
            app.isLoading = false
          })
      },

      // [模拟修改] 获取售后单详情
      getRefundDetail() {
        const app = this
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // 构造模拟详情数据
            // status: 20 (商家已同意/待发货) 可以测试发货表单
            // refundType: 10 (退货退款)
            const mockDetail = {
              status: 20, 
              strStatus: '商家同意退货',
              refundType: 10,
              strRefundType: '退货退款',
              type: 10,
              
              goodsId: 999,
              urlSkuThumbnail: 'https://via.placeholder.com/200x200',
              goodsName: '模拟商品详情：冬季加绒卫衣',
              skuName: '藏青色, L码',
              quantity: 1,
              amountExpectRefund: '128.00',
              amountRealRefund: '0.00',
              mark: '尺码不合适，想要换个大号',
              sellerMark: '',
              listRefundProof: ['https://via.placeholder.com/200x200'], // 凭证图片
              
              // 商家地址
              refundAddress: {
                name: '售后中心-张三',
                phone: '13800138000',
                fullAddress: 'xx省xx市xx区xx工业园A栋'
              },
              
              // 物流信息 (如果是已发货状态会用到)
              is_user_send: false,
              express: { expressName: '' },
              express_no: '',
              send_time: '',

              // 时间轴
              listRecord: [
                { info: '商家同意了您的售后申请，请尽快发货', createTime: '2023-12-12 14:00:00' },
                { info: '您发起了售后申请，原因：尺码不合适', createTime: '2023-12-12 10:00:00' }
              ]
            }
            
            app.detail = mockDetail
            resolve()
          }, 500)
        })
      },

      // [模拟修改] 获取物流公司列表
      getlistExpress() {
        const app = this
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            app.listExpress = [
              { id: 1, expressName: '顺丰速运' },
              { id: 2, expressName: '圆通快递' },
              { id: 3, expressName: '中通快递' },
              { id: 4, expressName: '韵达快递' }
            ]
            resolve()
          }, 300)
        })
      },

      onGoodsDetail(goodsId) {
        // this.$navTo('pages/goods/detail', { goodsId })
        this.$toast('模拟跳转商品详情: ' + goodsId)
      },

      handlePreviewImages(index) {
        const { detail: { listRefundProof } } = this
        // 注意：原代码用的 images，模拟数据改为了 listRefundProof 保持一致
        const imageUrls = listRefundProof || [] 
        uni.previewImage({
          current: imageUrls[index],
          urls: imageUrls
        })
      },

      handleCopy(value) {
        const app = this
        uni.setClipboardData({
          data: value,
          success() {
            app.$toast('复制成功')
          }
        })
      },

      onChangeExpress(e) {
        const expressIndex = e.detail.value
        const { listExpress } = this
        this.expressIndex = expressIndex
        this.formData.expressId = listExpress[expressIndex].id
      },

      // [模拟修改] 表单提交 (发货)
      onSubmit() {
        const app = this
        if (app.disabled === true) return false
  
        // 校验一下
        if(!app.formData.expressId || !app.formData.expressNo) {
            app.$toast('请完善物流信息')
            return
        }

		app.disabled = true
        
        // 模拟请求
        setTimeout(() => {
            app.$toast('发货成功 (模拟)')
            setTimeout(() => {
              app.disabled = false
              uni.navigateBack()
            }, 1500)
        }, 800)
      }

    }
  }
</script>

<style lang="scss" scoped>
  // 顶部状态栏
  .detail-header {
    position: relative;
    width: 100%;
    height: 120rpx;
	
	background-color: rgba(250,45,33, .8);

    .header-backdrop {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      .image {
        display: block;
        width: 100%;
        height: 140rpx;
      }
    }
  }

  .header-state {
    z-index: 1;
    padding: 0 50rpx;
  }

  /* 商品详情 */
  .detail-goods {
    padding: 24rpx 20rpx;

    .left {
      .goods-image {
        display: block;
        width: 150rpx;
        height: 150rpx;
      }
    }

    .right {
      padding-left: 20rpx;
    }

    .goods-props {
      margin-top: 14rpx;
      height: 40rpx;
      color: #ababab;
      font-size: 24rpx;
      overflow: hidden;

      .goods-props-item {
        display: inline-block;
        margin-right: 14rpx;
        padding: 4rpx 16rpx;
        border-radius: 12rpx;
        background-color: #F5F5F5;
        width: auto;
      }
    }
  }

  .detail-order {
    padding: 15rpx 20rpx;
    font-size: 26rpx;

    .item {
      margin-bottom: 10rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  

  /* 售后详情 */
  .detail-refund {
    padding: 15rpx 20rpx;
  }

  .detail-refund__row {
    margin: 20rpx 0;
  }

  /* 申请凭证 */
  .image-list {
    margin-bottom: -15rpx;

    .image-preview {
      margin: 0 15rpx 15rpx 0;
      float: left;

      .image {
        display: block;
        width: 180rpx;
        height: 180rpx;
      }

      &:nth-child(3n+0) {
        margin-right: 0;
      }
    }
  }

  /* 商家收货地址 */
  .detail-address {
    padding: 20rpx 34rpx;
  }

  // 复制
.act-copy {
          margin-left: 20rpx;
          padding: 2rpx 20rpx;
          font-size: 22rpx;
          color: #666;
          border: 1rpx solid #c1c1c1;
          border-radius: 16rpx;
}
  .address-details {
    padding: 8rpx 0;
    border-bottom: 1px solid #eee;

    .address-details__row {
      margin: 14rpx 0;
    }
  }

  .address-tips {
    margin-top: 16rpx;
    line-height: 46rpx;
  }

  .detail-address__row {
    // margin: 18rpx 0;
  }

  /* 填写物流信息 */
  .detail-express {
    padding: 10rpx 30rpx;
  }

  .form-group {
    height: 60rpx;
    margin: 14rpx 0;

    .input {
      height: 100%;
      font-size: 28rpx;
    }
  }
  
  // 售后记录
  .vRecord{
	  padding: 30rpx;
  }
.u-node {
		width: 44rpx;
		height: 44rpx;
		border-radius: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #d0d0d0;
	}
	
	.uLineTitle {
		color: #333333;
		font-weight: bold;
		font-size: 32rpx;
	}
	
	.uLineDesc {
		color: rgb(150, 150, 150);
		font-size: 28rpx;
		margin-bottom: 6rpx;
	}
	
	.uLineTime {
		color: rgb(200, 200, 200);
		font-size: 26rpx;
	}

  /* 底部操作栏 */

  .footer {
    margin-top: 60rpx;

    .btn-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 20rpx;
    }

    .btn-item {
      flex: 1;
      font-size: 28rpx;
      height: 80rpx;
      color: #fff;
      border-radius: 50rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .btn-item-main {
      background: linear-gradient(to right, #f9211c, #ff6335);

      // 禁用按钮
      &.disabled {
        background: #ff9779;
      }
    }

  }
</style>
