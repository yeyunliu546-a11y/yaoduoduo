<template>
  <view class="container">
    <view class="custom-nav">
      <text class="title">资质认证</text>
    </view>

    <view class="steps">
      <view class="step-item" :class="{ active: currentPage === 1 }">
        <text class="step-text">1. 填写信息</text>
      </view>
      <view class="step-line"></view>
      <view class="step-item" :class="{ active: currentPage === 2 }">
        <text class="step-text">2. 上传资质</text>
      </view>
    </view>

    <view v-if="currentPage === 1" class="step-content">
      <view class="form-group">
        <text class="label">机构名称</text>
        <input v-model="clinicInfo.clinicName" placeholder="请输入机构名称" class="input" @input="onInputChange" />
      </view>

      <view class="form-group">
        <text class="label">联系人姓名</text>
        <input v-model="clinicInfo.contactName" placeholder="请输入联系人姓名" class="input" @input="onInputChange" />
      </view>

      <view class="form-group">
        <text class="label">联系人电话</text>
        <input v-model="clinicInfo.contactPhone" type="number" maxlength="11" placeholder="请输入联系人电话" class="input" @input="onInputChange" />
      </view>

      <view class="form-group">
        <text class="label">所在地区</text>
        <picker mode="region" :value="[clinicInfo.province || '', clinicInfo.city || '', clinicInfo.district || '']" @change="onRegionChange">
          <view class="picker-wrapper">
            <text v-if="clinicInfo.province" class="picker-text">{{ clinicInfo.province }} {{ clinicInfo.city }} {{ clinicInfo.district }}</text>
            <text v-else class="picker-placeholder">请选择所在地区</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">详细地址</text>
        <input v-model="clinicInfo.detailAddress" placeholder="请输入详细地址" class="input" @input="onInputChange" />
      </view>

      <button :disabled="!isInfoValid" @click="nextPage" class="next-btn">下一步</button>
      <button @click="handleBackLogin" class="back-login-btn">返回登录</button>
    </view>

    <view v-if="currentPage === 2" class="step-content">
      <view class="cert-list">
        <view v-for="cert in requiredCerts" :key="cert.type" class="cert-item">
          <view class="cert-title-group">
            <view class="cert-title-left">
              <text class="cert-label">{{ cert.label }}</text>
              <text v-if="cert.desc" class="cert-desc">{{ cert.desc }}</text>
            </view>
            <text v-if="cert.templateDownload" class="template-link" @tap="downloadTemplate(cert.type)">模板下载</text>
          </view>

          <view class="cert-image-group">
            <view class="image-pair">
              <view class="example-wrapper" @click="previewExample(cert.exampleImage)">
                <image v-if="cert.exampleImage" :src="cert.exampleImage" class="example-image" mode="aspectFill" @error="handleExampleImageError(cert.type)" />
                <view v-else class="placeholder-text">无示例</view>
              </view>

              <view v-if="!hasUploaded(cert.type)" class="upload-btn-wrapper">
                <button @click="chooseImage(cert.type, cert.fileType)" class="upload-btn">+
上传</button>
              </view>

              <view v-else class="uploaded-file">
                <image :src="getUploadedUrl(cert.type)" class="preview-image" @click="previewImage(getUploadedUrl(cert.type))" />
              </view>
            </view>

            <view v-if="hasUploaded(cert.type)" class="delete-btn-wrapper">
              <button @click="deleteImage(cert.type)" class="delete-btn">删除</button>
            </view>
          </view>
        </view>
      </view>

      <button :disabled="!isCertValid" @click="submitCert" class="submit-btn">提交审核</button>
      <button @click="prevPage" class="prev-btn">返回修改信息</button>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request/request.js'
import { getClinicExampleImages } from '@/api/user/user.js'
import { SUBSCRIBE_TMPL, requestSubscribe } from '@/utils/subscribe.js'

const BASE_URL = 'https://www.yaoduoduo.top'
const EXAMPLE_IMAGE_TYPE_MAP = {
  business_license: 'businessLicense',
  medical_license: 'medicalLicense',
  legal_id_front: 'legalPersonIdFront',
  legal_id_back: 'legalPersonIdBack',
  id_card_front: 'idCardFront',
  id_card_back: 'idCardBack',
  power_of_attorney: 'powerOfAttorney',
  quality_agreement: 'qualityAgreement'
}

function pushUnique(list, value) {
  if (value && list.indexOf(value) === -1) {
    list.push(value)
  }
}

function buildExampleImageCandidates(url) {
  const normalizedUrl = String(url || '').trim().replace(/\\/g, '/')
  const candidates = []

  if (!normalizedUrl) {
    return candidates
  }

  pushUnique(candidates, normalizedUrl)

  return candidates
}

function pickFirst() {
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i]
    if (value !== undefined && value !== null) {
      return value
    }
  }
  return undefined
}

function getCode(payload = {}) {
  return pickFirst(payload.Code, payload.code)
}

function getResult(payload = {}) {
  return pickFirst(payload.Result, payload.result)
}

function getMessage(payload = {}) {
  return pickFirst(payload.Message, payload.message, '请求失败')
}

function syncAuditCache(payload = {}) {
  const status = Number(pickFirst(payload.ClinicAuditStatus, payload.clinicAuditStatus, 0))
  const clinicName = pickFirst(payload.ClinicName, payload.clinicName, '')

  uni.setStorageSync('clinicAuditStatus', Number.isNaN(status) ? 0 : status)
  uni.setStorageSync('clinicAuditRemark', pickFirst(payload.AuditRemark, payload.auditRemark, ''))
  uni.setStorageSync('hasClinicProfile', !!pickFirst(payload.HasClinicProfile, payload.hasClinicProfile, true))
  uni.setStorageSync('clinicName', clinicName)

  const userInfo = uni.getStorageSync('user_info') || {}
  uni.setStorageSync('user_info', {
    ...userInfo,
    ...payload,
    HasClinicProfile: true,
    ClinicAuditStatus: Number.isNaN(status) ? 0 : status,
    ClinicName: clinicName
  })
}

export default {
  data() {
    return {
      currentPage: 1,
      clinicInfo: {
        clinicName: '',
        contactName: '',
        contactPhone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: ''
      },
      requiredCerts: [
        { label: '营业执照', type: 'businessLicense', fileType: 1, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖公章）', templateDownload: false },
        { label: '医疗机构执业许可证', type: 'medicalLicense', fileType: 2, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖公章）', templateDownload: false },
        { label: '法人身份证正面', type: 'legalPersonIdFront', fileType: 7, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖红章）', templateDownload: false },
        { label: '法人身份证反面', type: 'legalPersonIdBack', fileType: 8, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖红章）', templateDownload: false },
        { label: '委托人身份证正面', type: 'idCardFront', fileType: 3, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖红章）', templateDownload: false },
        { label: '委托人身份证反面', type: 'idCardBack', fileType: 4, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖红章）', templateDownload: false },
        { label: '采购委托书', type: 'powerOfAttorney', fileType: 5, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（白纸黑字、签字、盖章）', templateDownload: true },
        { label: '药品质量保证协议照片', type: 'qualityAgreement', fileType: 6, exampleImage: '', exampleImageCandidates: [], exampleImageCandidateIndex: -1, desc: '（复印件盖公章）', templateDownload: true }
      ],
      certList: {
        businessLicense: '',
        medicalLicense: '',
        legalPersonIdFront: '',
        legalPersonIdBack: '',
        idCardFront: '',
        idCardBack: '',
        powerOfAttorney: '',
        qualityAgreement: ''
      },
      fileInfo: [],
      isInfoValid: false,
      isCertValid: false,
      token: ''
    }
  },
  onLoad(options) {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 1200)
      return
    }
    this.token = token

    if (options.status === '-1') {
      const userInfo = uni.getStorageSync('user_info') || {}
      const remark = userInfo.AuditRemark || userInfo.auditRemark || uni.getStorageSync('clinicAuditRemark') || ''
      if (remark) {
        uni.showModal({ title: '审核拒绝原因', content: remark, showCancel: false })
      }
    }

    const cachedInfo = uni.getStorageSync('clinicInfo') || {}
    const cachedCert = uni.getStorageSync('certList') || {}
    const cachedFileInfo = uni.getStorageSync('fileInfo') || []

    if (Object.keys(cachedInfo).length > 0) {
      this.clinicInfo = { ...this.clinicInfo, ...cachedInfo }
      this.certList = { ...this.certList, ...cachedCert }
      this.fileInfo = cachedFileInfo
    }

    this.checkInfoValid()
    this.checkCertValid()
    this.loadExampleImages()
  },
  methods: {
    onInputChange() {
      this.$nextTick(() => {
        this.checkInfoValid()
      })
    },

    handleBackLogin() {
      uni.showModal({
        title: '返回登录',
        content: '将退出当前账号并清空未提交的资质资料，确定返回登录吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) {
            return
          }

          uni.removeStorageSync('clinicInfo')
          uni.removeStorageSync('certList')
          uni.removeStorageSync('fileInfo')

          this.$store.dispatch('Logout').finally(() => {
            uni.reLaunch({ url: '/pages/login/index' })
          })
        }
      })
    },

    checkInfoValid() {
      const { clinicName, contactName, contactPhone, province, city, district, detailAddress } = this.clinicInfo
      this.isInfoValid = !!(
        clinicName && contactName && contactPhone && province && city && district && detailAddress && contactPhone.length === 11
      )
    },

    checkCertValid() {
      const requiredTypes = this.requiredCerts.map(item => item.type)
      this.isCertValid = requiredTypes.every(type => this.fileInfo.some(item => item.type === type))
    },

    prevPage() {
      this.currentPage = 1
    },

    nextPage() {
      uni.setStorageSync('clinicInfo', this.clinicInfo)
      this.currentPage = 2
    },

    onRegionChange(e) {
      const [province, city, district] = e.detail.value || []
      this.clinicInfo.province = province || ''
      this.clinicInfo.city = city || ''
      this.clinicInfo.district = district || ''
      this.checkInfoValid()
    },

    previewExample(imageUrl) {
      this.openImagePreview(imageUrl)
    },

    openImagePreview(imageUrl) {
      if (!imageUrl) {
        return
      }

      uni.getImageInfo({
        src: imageUrl,
        success: (res) => {
          const previewUrl = pickFirst(res.path, res.tempFilePath, imageUrl)
          uni.previewImage({
            urls: [previewUrl],
            current: previewUrl,
            fail: () => {
              uni.showToast({ title: '图片预览失败', icon: 'none' })
            }
          })
        },
        fail: () => {
          uni.previewImage({
            urls: [imageUrl],
            current: imageUrl,
            fail: () => {
              uni.showToast({ title: '图片预览失败', icon: 'none' })
            }
          })
        }
      })
    },

    loadExampleImages() {
      getClinicExampleImages({}, { load: false }).then(res => {
        const code = getCode(res)
        const result = getResult(res) || []

        if (code !== 200 || !Array.isArray(result) || result.length === 0) {
          return
        }

        const exampleMap = result.reduce((map, item) => {
          const rawType = pickFirst(item.fileType, item.FileType, '')
          const exampleType = String(rawType || '').trim()
          if (!exampleType) {
            return map
          }

          const targetType = EXAMPLE_IMAGE_TYPE_MAP[exampleType]
          if (!targetType) {
            return map
          }

          map[targetType] = {
            exampleImageCandidates: buildExampleImageCandidates(
              pickFirst(item.exampleUrl, item.ExampleUrl, '')
            )
          }
          return map
        }, {})

        if (Object.keys(exampleMap).length === 0) {
          return
        }

        this.requiredCerts = this.requiredCerts.map(cert => {
          const exampleConfig = exampleMap[cert.type]
          if (!exampleConfig) {
            return cert
          }

          return {
            ...cert,
            exampleImage: exampleConfig.exampleImageCandidates[0] || '',
            exampleImageCandidates: exampleConfig.exampleImageCandidates,
            exampleImageCandidateIndex: exampleConfig.exampleImageCandidates.length > 0 ? 0 : -1
          }
        })
      }).catch(err => {
        console.error('获取资质示例图失败', err)
      })
    },

    handleExampleImageError(type) {
      this.requiredCerts = this.requiredCerts.map(cert => {
        if (cert.type !== type) {
          return cert
        }

        const candidates = Array.isArray(cert.exampleImageCandidates) ? cert.exampleImageCandidates : []
        const nextIndex = Number(cert.exampleImageCandidateIndex) + 1

        if (nextIndex >= 0 && nextIndex < candidates.length) {
          return {
            ...cert,
            exampleImage: candidates[nextIndex],
            exampleImageCandidateIndex: nextIndex
          }
        }

        return {
          ...cert,
          exampleImage: '',
          exampleImageCandidateIndex: candidates.length
        }
      })
    },

    chooseImage(type, fileType) {
      const token = this.token
      const storeId = uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945'

      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (actionRes) => {
          const sourceType = actionRes.tapIndex === 0 ? ['camera'] : ['album']

          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType,
            success: (res) => {
              const tempFilePath = res.tempFilePaths[0]
              uni.showLoading({ title: '上传中...' })

              uni.uploadFile({
                url: `${BASE_URL}/api/Files/Upload`,
                filePath: tempFilePath,
                name: 'files',
                header: {
                  'X-Token': token || '',
                  'Authorization': token ? `Bearer ${token}` : '',
                  'platform': 'MP-WEIXIN',
                  'storeId': storeId
                },
                success: (uploadRes) => {
                  uni.hideLoading()
                  try {
                    const data = JSON.parse(uploadRes.data || '{}')
                    const code = getCode(data)
                    const result = getResult(data) || []

                    if (code === 200 && Array.isArray(result) && result.length > 0) {
                      const uploadedFile = result[0]
                      const fileUrl = pickFirst(uploadedFile.filePath, uploadedFile.FilePath, '')
                      const fileId = pickFirst(uploadedFile.id, uploadedFile.Id, '')

                      const fileInfo = this.fileInfo.filter(item => item.type !== type)
                      fileInfo.push({
                        type,
                        fileType,
                        fileTypeName: this.getFileTypeName(fileType),
                        fileUrl,
                        fileId
                      })

                      this.fileInfo = fileInfo
                      this.certList[type] = fileUrl
                      uni.setStorageSync('certList', this.certList)
                      uni.setStorageSync('fileInfo', fileInfo)
                      this.checkCertValid()

                      uni.showToast({ title: '上传成功', icon: 'success' })
                    } else {
                      uni.showToast({ title: getMessage(data), icon: 'none' })
                    }
                  } catch (err) {
                    uni.showToast({ title: '服务端返回异常', icon: 'none' })
                  }
                },
                fail: () => {
                  uni.hideLoading()
                  uni.showToast({ title: '网络错误', icon: 'none' })
                }
              })
            }
          })
        }
      })
    },

    getFileTypeName(fileType) {
      const typeMap = {
        1: '营业执照',
        2: '医疗机构执业许可证',
        3: '委托人身份证正面',
        4: '委托人身份证反面',
        5: '采购委托书',
        6: '药品质量保证协议照片',
        7: '法人身份证正面',
        8: '法人身份证反面'
      }
      return typeMap[fileType] || '未知类型'
    },

    hasUploaded(type) {
      return this.fileInfo.some(item => item.type === type)
    },

    getUploadedUrl(type) {
      const file = this.fileInfo.find(item => item.type === type)
      return file ? file.fileUrl : ''
    },

    previewImage(url) {
      this.openImagePreview(url)
    },

    deleteImage(type) {
      this.certList[type] = ''
      this.fileInfo = this.fileInfo.filter(item => item.type !== type)
      uni.setStorageSync('certList', this.certList)
      uni.setStorageSync('fileInfo', this.fileInfo)
      this.checkCertValid()
    },

    downloadTemplate(type) {
      let apiUrl = ''
      if (type === 'powerOfAttorney') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadPurchaseEntrust`
      } else if (type === 'qualityAgreement') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadDrugQualityAgreement`
      } else {
        return
      }

      uni.showLoading({ title: '下载中...' })
      uni.downloadFile({
        url: apiUrl,
        success: (res) => {
          uni.hideLoading()
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              fileType: 'pdf',
              fail: () => {
                uni.showToast({ title: '打开失败，请重试', icon: 'none' })
              }
            })
          } else {
            uni.showToast({ title: '下载失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      })
    },

    async submitCert() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '登录状态已失效，请重新登录', icon: 'none' })
        setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 1200)
        return
      }

      const submitData = {
        clinicName: this.clinicInfo.clinicName,
        contactName: this.clinicInfo.contactName,
        contactPhone: this.clinicInfo.contactPhone,
        province: this.clinicInfo.province,
        city: this.clinicInfo.city,
        district: this.clinicInfo.district,
        detailAddress: this.clinicInfo.detailAddress,
        files: this.fileInfo.map(item => ({
          fileType: item.fileType,
          fileTypeName: item.fileTypeName,
          fileUrl: item.fileUrl,
          fileId: item.fileId
        }))
      }

      await requestSubscribe([SUBSCRIBE_TMPL.tmpl_cert], 'cert-submit')

      uni.showLoading({ title: '提交中...' })
      request.post('/api/Clinic/SubmitCertificate', submitData, {
        'Authorization': `Bearer ${token}`,
        'AppKey': 'MP-WEIXIN'
      }).then(res => {
        uni.hideLoading()
        const code = getCode(res)
        if (code === 200) {
          syncAuditCache({
            HasClinicProfile: true,
            ClinicAuditStatus: 0,
            AuditRemark: '',
            ClinicName: this.clinicInfo.clinicName
          })

          uni.removeStorageSync('clinicInfo')
          uni.removeStorageSync('certList')
          uni.removeStorageSync('fileInfo')

          uni.showToast({ title: '提交成功', icon: 'success' })
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/auth/certStatus' })
          }, 1200)
        } else {
          uni.showToast({ title: getMessage(res), icon: 'none' })
        }
      }).catch(err => {
        uni.hideLoading()
        uni.showToast({ title: getMessage(err), icon: 'none' })
      })
    }
  }
}
</script>

<style>
.container { padding: 20rpx; background-color: #f5f5f5; min-height: 100vh; }
.custom-nav { text-align: center; padding: 20rpx 0; background-color: white; margin-bottom: 20rpx; }
.title { font-size: 36rpx; font-weight: bold; }
.steps { display: flex; align-items: center; justify-content: center; margin-bottom: 40rpx; }
.step-item { display: flex; flex-direction: column; align-items: center; padding: 0 30rpx; }
.step-text { font-size: 28rpx; color: #ccc; }
.step-item.active .step-text { color: #007aff; }
.step-line { width: 100rpx; height: 2rpx; background-color: #ccc; }
.step-content { background-color: white; border-radius: 10rpx; padding: 30rpx; }
.form-group { margin-bottom: 30rpx; }
.label { display: block; margin-bottom: 10rpx; font-size: 28rpx; color: #333; }
.input { width: 100%; height: 80rpx; border: 1rpx solid #ddd; border-radius: 8rpx; padding: 0 20rpx; box-sizing: border-box; }
.picker-wrapper { height: 80rpx; border: 1rpx solid #ddd; border-radius: 8rpx; display: flex; align-items: center; padding: 0 20rpx; background-color: #fafafa; }
.picker-text { color: #333; font-size: 28rpx; }
.picker-placeholder { color: #999; font-size: 28rpx; }
.next-btn, .submit-btn { width: 100%; height: 80rpx; background-color: #007aff; color: white; border-radius: 8rpx; margin-top: 40rpx; }
.next-btn[disabled], .submit-btn[disabled] { background-color: #ccc; }
.back-login-btn { width: 100%; height: 80rpx; background-color: #f0f0f0; color: #666; border-radius: 8rpx; margin-top: 20rpx; }
.prev-btn { width: 100%; height: 80rpx; background-color: #f0f0f0; color: #666; border-radius: 8rpx; margin-top: 20rpx; }
.cert-list { margin-bottom: 40rpx; }
.cert-item { padding: 30rpx 0; border-bottom: 1rpx solid #eee; position: relative; }
.cert-title-group { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20rpx; }
.cert-label { font-size: 28rpx; color: #333; display: block; }
.cert-desc { font-size: 22rpx; color: #ff6b6b; display: block; margin-top: 5rpx; }
.cert-image-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.image-pair { display: flex; align-items: center; gap: 80rpx; }
.example-wrapper { width: 120rpx; height: 120rpx; border-radius: 8rpx; overflow: hidden; background-color: #f9f9f9; }
.example-image { width: 100%; height: 100%; border-radius: 8rpx; }
.placeholder-text { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 24rpx; }
.upload-btn-wrapper { width: 120rpx; height: 120rpx; display: flex; align-items: center; justify-content: center; border: 2rpx dashed #ccc; border-radius: 8rpx; background-color: #f9f9f9; }
.upload-btn { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: none; border: none; padding: 0; color: #999; font-size: 24rpx; line-height: 1.5; white-space: pre-wrap; }
.uploaded-file { width: 120rpx; height: 120rpx; border-radius: 8rpx; overflow: hidden; }
.preview-image { width: 100%; height: 100%; border-radius: 8rpx; }
.delete-btn-wrapper { margin-left: 20rpx; }
.delete-btn { width: 80rpx; height: 40rpx; background-color: #ff6b6b; color: white; font-size: 24rpx; padding: 0 10rpx; border-radius: 4rpx; line-height: 40rpx; }
.template-link { font-size: 24rpx; color: #007aff; text-decoration: underline; white-space: nowrap; margin-left: 20rpx; }
</style>
