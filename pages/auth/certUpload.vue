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
        <text class="label">诊所名称</text>
        <input 
          v-model="clinicInfo.clinicName" 
          placeholder="请输入诊所名称"
          class="input"
          @input="onInputChange"
        />
      </view>

      <view class="form-group">
        <text class="label">联系人姓名</text>
        <input 
          v-model="clinicInfo.contactName" 
          placeholder="请输入联系人姓名"
          class="input"
          @input="onInputChange"
        />
      </view>

      <view class="form-group">
        <text class="label">联系人电话</text>
        <input 
          v-model="clinicInfo.contactPhone" 
          type="number"
          maxlength="11"
          placeholder="请输入联系人电话"
          class="input"
          @input="onInputChange"
        />
      </view>

      <view class="form-group">
        <text class="label">所在地区</text>
        <view class="picker-wrapper" @click="showRegionPicker">
          <text v-if="clinicInfo.province" class="picker-text">
            {{ clinicInfo.province }} {{ clinicInfo.city }} {{ clinicInfo.district }}
          </text>
          <text v-else class="picker-placeholder">请选择所在地区</text>
        </view>
        <picker 
		  v-if="showPicker" 
		  mode="region" 
		  :value="[clinicInfo.province, clinicInfo.city, clinicInfo.district]" 
		  @change="onRegionChange"
		  @cancel="onRegionCancel"
		>
		  <view style="display:none">hidden trigger</view>
		</picker>
      </view>

      <view class="form-group">
        <text class="label">详细地址</text>
        <input 
          v-model="clinicInfo.detailAddress" 
          placeholder="请输入详细地址"
          class="input"
          @input="onInputChange"
        />
      </view>

      <button 
        :disabled="!isInfoValid" 
        @click="nextPage" 
        class="next-btn"
      >
        下一步
      </button>
    </view>

    <view v-if="currentPage === 2" class="step-content">
      <view class="cert-list">
        <view 
          v-for="cert in requiredCerts" 
          :key="cert.type" 
          class="cert-item"
        >
          <view class="cert-title-group">
			<view class="cert-title-left">
			  <text class="cert-label">{{ cert.label }}</text>
			  <text v-if="cert.desc" class="cert-desc">{{ cert.desc }}</text>
			</view>

			<text 
			  v-if="cert.templateDownload" 
			  class="template-link" 
			  @tap="downloadTemplate(cert.type)"
			>
			  模板下载
			</text>
		  </view>
    
		  <view class="cert-image-group">
		    <view class="image-pair">
			  <view class="example-wrapper">
			    <image 
                  v-if="cert.exampleImage" 
                  :src="cert.exampleImage" 
                  class="example-image" 
                  mode="aspectFill" 
                  @click="previewExample(cert.exampleImage)" 
                />
			    <view v-else class="placeholder-text">无示例</view>
			  </view>

			  <view v-if="!hasUploaded(cert.type)" class="upload-btn-wrapper">
			    <button 
				  @click="chooseImage(cert.type, cert.fileType)" 
				  class="upload-btn"
			    >
				  +\n上传
			    </button>
			  </view>

			  <view v-else class="uploaded-file">
			    <image 
				  :src="getUploadedUrl(cert.type)" 
				  class="preview-image" 
				  @click="previewImage(getUploadedUrl(cert.type))"
			    />
			  </view>
		    </view>

		    <view v-if="hasUploaded(cert.type)" class="delete-btn-wrapper">
			  <button @click="deleteImage(cert.type)" class="delete-btn">删除</button>
		    </view>
		  </view>
        </view>
      </view>
    
      <button 
        :disabled="!isCertValid" 
        @click="submitCert" 
        class="submit-btn"
      >
        提交审核
      </button>
    
      <button @click="prevPage" class="prev-btn">
        返回修改信息
      </button>
    </view>
  </view>
</template>

<script>
// 使用新的基础域名
const BASE_URL = 'https://www.yaoduoduo.top';

export default {
  data() {
    return {
      currentPage: 1,
      clinicInfo: {
        clinicName: '',
        contactName: '',
        contactPhone: '',
        province: '北京市',
        city: '北京市',
        district: '东城区',
        detailAddress: ''
      },
      // 定义所需资质列表
      requiredCerts: [
        {
          label: '营业执照',
          type: 'businessLicense',
          fileType: 1,
          exampleImage: '/static/images/business_license_example.jpg',
          desc: '（复印件盖公章）',
          templateDownload: false
        },
        {
          label: '医疗机构执业许可证',
          type: 'medicalLicense',
          fileType: 2,
          exampleImage: '/static/images/medical_license_example.png',
          desc: '（复印件盖公章）',
          templateDownload: false
        },
        // 新增：法人身份证正面
        {
          label: '法人身份证正面',
          type: 'legalPersonIdFront',
          fileType: 7,
          exampleImage: '/static/images/legal_id_front_example.png',
          desc: '（复印件盖红章）',
          templateDownload: false
        },
        // 新增：法人身份证反面
        {
          label: '法人身份证反面',
          type: 'legalPersonIdBack',
          fileType: 8,
          exampleImage: '/static/images/legal_id_back_example.png',
          desc: '（复印件盖红章）',
          templateDownload: false
        },
        {
          label: '委托人身份证正面',
          type: 'idCardFront',
          fileType: 3,
          exampleImage: '/static/images/id_card_front_example.png',
          desc: '（复印件盖红章）',
          templateDownload: false
        },
        {
          label: '委托人身份证反面',
          type: 'idCardBack',
          fileType: 4,
          exampleImage: '/static/images/id_card_back_example.png',
          desc: '（复印件盖红章）',
          templateDownload: false
        },
        {
          label: '采购委托书',
          type: 'powerOfAttorney',
          fileType: 5,
          exampleImage: '/static/images/power_of_attorney_example.png',
          desc: '（白纸黑字、签字、盖章）',
          templateDownload: true
        },
        {
          label: '药品质量保证协议照片',
          type: 'qualityAgreement',
          fileType: 6,
          exampleImage: '/static/images/quality_agreement_example.png',
          desc: '（复印件盖公章）',
          templateDownload: true
        }
      ],
      // 用于本地预览的 Map
      certList: {
        businessLicense: '',
        medicalLicense: '',
        legalPersonIdFront: '', // 新增
        legalPersonIdBack: '',  // 新增
        idCardFront: '',
        idCardBack: '',
        powerOfAttorney: '',
        qualityAgreement: ''
      },
      // 存储上传成功后的文件信息 { type, fileType, fileUrl, fileId }
      fileInfo: [],
      isInfoValid: false,
      isCertValid: false,
      token: '',
      showPicker: false
    }
  },

  onLoad(options) {
    // 1. 获取Token
    const token = uni.getStorageSync('token');
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 1500);
      return;
    }
    this.token = token;
  
    // 2. 如果是从登录页跳转过来，并且状态是-1(拒绝)，提示用户
    if (options.status === '-1') {
        const userInfo = uni.getStorageSync('user_info') || {};
        if (userInfo.AuditRemark || userInfo.auditRemark) {
            uni.showModal({
                title: '审核拒绝原因',
                content: userInfo.AuditRemark || userInfo.auditRemark,
                showCancel: false
            });
        }
    }

    // 3. 读取本地缓存草稿
    const cachedInfo = uni.getStorageSync('clinicInfo') || {};
    const cachedCert = uni.getStorageSync('certList') || {};
    const cachedFileInfo = uni.getStorageSync('fileInfo') || [];
  
    if (Object.keys(cachedInfo).length > 0) {
      this.clinicInfo = cachedInfo;
      // 简单的合并策略，保留已有的图片
      this.certList = { ...this.certList, ...cachedCert };
      this.fileInfo = cachedFileInfo;
    }
  
    this.checkInfoValid();
    this.checkCertValid();
  },

  methods: {
    // 监听输入
    onInputChange() {
      // 延迟校验
      this.$nextTick(() => {
          this.checkInfoValid();
      });
    },

    checkInfoValid() {
      const { clinicName, contactName, contactPhone, province, city, district, detailAddress } = this.clinicInfo;
      // 简单非空校验 + 手机号长度
      const isValid = !!(
        clinicName && contactName && contactPhone &&
        province && city && district && detailAddress &&
        contactPhone.length === 11
      );
      this.isInfoValid = isValid;
    },

    checkCertValid() {
      const requiredTypes = this.requiredCerts.map(item => item.type);
      // 检查 fileInfo 中是否包含了所有 requiredCerts 的 type
      const hasAllRequired = requiredTypes.every(type =>
        this.fileInfo.some(item => item.type === type)
      );
      this.isCertValid = hasAllRequired;
    },

    prevPage() {
      this.currentPage = 1;
    },

    nextPage() {
      // 缓存第一步数据
      uni.setStorageSync('clinicInfo', this.clinicInfo);
      this.currentPage = 2;
    },

    showRegionPicker() {
      this.showPicker = true;
    },

    onRegionChange(e) {
      const [province, city, district] = e.detail.value;
      this.clinicInfo.province = province;
      this.clinicInfo.city = city;
      this.clinicInfo.district = district;
      this.checkInfoValid();
      this.showPicker = false;
    },

    onRegionCancel() {
      this.showPicker = false;
    },
	
	// 预览示例图或本地图
	previewExample(imageUrl) {
        if (!imageUrl) return;
        uni.previewImage({
            urls: [imageUrl],
            current: imageUrl
        });
	},
	
	chooseImage(type, fileType) {
	  const { token } = this;
	  uni.showActionSheet({
		itemList: ['拍照', '从相册选择'],
		success: (actionRes) => {
		  const sourceType = actionRes.tapIndex === 0 ? ['camera'] : ['album'];

		  uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: sourceType,
			success: (res) => {
			  const tempFilePath = res.tempFilePaths[0];
			  
			  uni.showLoading({ title: '上传中...' });

			  uni.uploadFile({
				url: `${BASE_URL}/api/Files/Upload`, 
				filePath: tempFilePath,
				name: 'files', 
				header: {
				  'Authorization': `Bearer ${token}`
				},
				success: (uploadRes) => {
				  uni.hideLoading();
				  try {
					const data = JSON.parse(uploadRes.data);

					if (data.code === 200 && Array.isArray(data.result) && data.result.length > 0) {
					  const uploadedFile = data.result[0];

                      // 更新 fileInfo 数组
					  const fileInfo = this.fileInfo.filter(item => item.type !== type);
					  fileInfo.push({
						type,
						fileType,
						fileTypeName: this.getFileTypeName(fileType),
						fileUrl: uploadedFile.filePath, // 服务端返回的URL
						fileId: uploadedFile.id
					  });

					  this.fileInfo = fileInfo;
					  this.certList[type] = uploadedFile.filePath; // 更新预览图

					  // 持久化
					  uni.setStorageSync('certList', this.certList);
					  uni.setStorageSync('fileInfo', fileInfo);
					  this.checkCertValid();

					  uni.showToast({ title: '上传成功', icon: 'success' });
					} else {
					  uni.showToast({ title: '上传失败：' + (data.message || '未知错误'), icon: 'none' });
					}
				  } catch (err) {
					console.error('JSON 解析失败:', err);
					uni.showToast({ title: '服务器返回异常', icon: 'none' });
				  }
				},
				fail: (err) => {
				  uni.hideLoading();
				  uni.showToast({ title: '网络错误', icon: 'none' });
				}
			  });
			}
		  });
		}
	  });
	},

    getFileTypeName(fileType) {
      const typeMap = {
        1: '营业执照',
        2: '医疗机构执业许可证',
        3: '委托人身份证正面',
        4: '委托人身份证反面',
		5: '采购委托书',
		6: '药品质量保证协议照片',
        7: '法人身份证正面', // 新增
        8: '法人身份证反面', // 新增
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
      uni.previewImage({
        urls: [url]
      })
    },

    deleteImage(type) {
      // 只是清空当前页面的引用和fileInfo，不调用服务端删除（视业务需求而定）
      this.certList[type] = '';
      this.fileInfo = this.fileInfo.filter(item => item.type !== type);
      
      uni.setStorageSync('certList', this.certList);
      uni.setStorageSync('fileInfo', this.fileInfo);
      
      this.checkCertValid();
    },

    // 下载模板
    downloadTemplate(type) {
      let apiUrl = ''
      let fileName = ''
      
      if (type === 'powerOfAttorney') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadPurchaseEntrust`
        fileName = '采购委托书模板.pdf'
      } else if (type === 'qualityAgreement') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadDrugQualityAgreement`
        fileName = '药品质量保证协议模板.pdf'
      } else {
		return;
	  }
      
      uni.showLoading({ title: '下载中...' });
	  
	  uni.downloadFile({
		url: apiUrl,
		success: (res) => {
		  uni.hideLoading();
		  if (res.statusCode === 200) {
			uni.openDocument({
			  filePath: res.tempFilePath,
			  fileType: 'pdf',
			  success: () => {
				uni.showToast({ title: '已打开', icon: 'success' });
			  },
			  fail: () => {
                uni.showToast({ title: '打开失败，请重试', icon: 'none' });
			  }
			});
		  } else {
			uni.showToast({ title: '下载失败', icon: 'none' });
		  }
		},
		fail: () => {
		  uni.hideLoading();
		  uni.showToast({ title: '网络错误', icon: 'none' });
		}
	  });
    },

    // 提交所有资质
    submitCert() {
      const { clinicInfo, fileInfo } = this;
      
      const token = uni.getStorageSync('token');
      // 获取 storeId (参考 request.js 的逻辑)
      const storeId = uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945';
      
      console.log('Debug Token:', token); 

      if (!token) {
          uni.showToast({ title: '登录状态已失效，请重新登录', icon: 'none' });
          setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 1500);
          return;
      }
    
      const submitData = {
        clinicName: clinicInfo.clinicName,
        contactName: clinicInfo.contactName,
        contactPhone: clinicInfo.contactPhone,
        province: clinicInfo.province,
        city: clinicInfo.city,
        district: clinicInfo.district,
        detailAddress: clinicInfo.detailAddress,
        files: fileInfo.map(item => ({
          fileType: item.fileType,
          fileTypeName: item.fileTypeName,
          fileUrl: item.fileUrl,
          fileId: item.fileId
        }))
      };
    
      uni.showLoading({ title: '提交中...' });
    
      uni.request({
        url: `${BASE_URL}/api/Clinic/SubmitCertificate`,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`, // 文档要求的鉴权
          'AppKey': 'MP-WEIXIN',            // 后端强制要求
          'platform': 'MP-WEIXIN',          // 补全：request.js 中有的
          'storeId': storeId,               // 补全：request.js 中有的
          // 为了保险，加上 request.js 里的 X-Token，防止后端中间件混用
          'X-Token': token 
        },
        data: submitData,
        success: (res) => {
          uni.hideLoading();
          const code = res.data.code !== undefined ? res.data.code : res.data.Code;
          
          if (code === 200) {
            let userInfo = uni.getStorageSync('user_info') || {};
            userInfo.ClinicAuditStatus = 0; 
            userInfo.HasClinicProfile = true;
            uni.setStorageSync('user_info', userInfo);
            
            uni.showToast({ title: '提交成功' });
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/auth/certStatus' });
            }, 1500);
          } else {
            console.error('提交失败:', res.data);
            uni.showToast({ title: res.data.message || '提交失败', icon: 'none' });
            
            if (code === 50014) {
                setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 1500);
            }
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('请求失败:', err);
          uni.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    }
  }
}
</script>

<style>
/* 保持原有样式 */
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
.prev-btn { width: 100%; height: 80rpx; background-color: #f0f0f0; color: #666; border-radius: 8rpx; margin-top: 20rpx; }
.cert-list { margin-bottom: 40rpx; }
.cert-item { padding: 30rpx 0; border-bottom: 1rpx solid #eee; position: relative; }
.cert-title-group { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20rpx; }
.cert-label { font-size: 28rpx; color: #333; display: block; }
.cert-desc { font-size: 22rpx; color: #ff6b6b; display: block; margin-top: 5rpx; }
.cert-image-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.image-pair { display: flex; align-items: center; gap: 320rpx; }
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