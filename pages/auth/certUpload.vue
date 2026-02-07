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
          @input="onInputChange('clinicName', $event)"
        />
      </view>

      <view class="form-group">
        <text class="label">联系人姓名</text>
        <input 
          v-model="clinicInfo.contactName" 
          placeholder="请输入联系人姓名"
          class="input"
          @input="onInputChange('contactName', $event)"
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
          @input="onInputChange('contactPhone', $event)"
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
		  <view>选择地区</view>
		</picker>
      </view>

      <view class="form-group">
        <text class="label">详细地址</text>
        <input 
          v-model="clinicInfo.detailAddress" 
          placeholder="请输入详细地址"
          class="input"
          @input="onInputChange('detailAddress', $event)"
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
			  v-if="cert.type === 'powerOfAttorney' || cert.type === 'qualityAgreement'" 
			  class="template-link" 
			  @tap="downloadTemplate(cert.type)"
			>
			  模板下载
			</text>
		  </view>
    
		  <view class="cert-image-group">
		    <view class="image-pair">
			  <view class="example-wrapper">
			    <image v-if="cert.exampleImage" :src="cert.exampleImage" class="example-image" mode="aspectFill" @click="previewExample(cert.exampleImage)" />
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
// 定义新的基础域名
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
          label: '法人身份证正面',
          type: 'legalPersonIdFront',
          fileType: 7,
          exampleImage: '/static/images/legal_id_front_example.png',
          desc: '（复印件盖红章）',
          templateDownload: false
        },
        {
          label: '法人身份证反面',
          type: 'legalPersonIdBack',
          fileType: 8,
          exampleImage: '/static/images/legal_id_back_example.png',
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
      certList: {
        businessLicense: '',
        medicalLicense: '',
        powerOfAttorney: '',
        idCardFront: '',
        idCardBack: '',
        legalPersonIdFront: '',
        legalPersonIdBack: '',
        qualityAgreement: ''
      },
      fileInfo: [],
      isInfoValid: false,
      isCertValid: false,
      token: '',
      showPicker: false
    }
  },

  onLoad() {
    // 👇 1. 无条件读取 token（关键！）
    const token = uni.getStorageSync('token') || ''
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/index' })
      }, 1500)
      return
    }
    this.token = token 
  
    // 👇 2. 再读取其他缓存（可选）
    const cachedInfo = uni.getStorageSync('clinicInfo') || {}
    const cachedCert = uni.getStorageSync('certList') || {}
    const cachedFileInfo = uni.getStorageSync('fileInfo') || []
  
    if (Object.keys(cachedInfo).length > 0) {
      this.clinicInfo = cachedInfo
      this.certList = cachedCert
      this.fileInfo = cachedFileInfo
    }
  
    this.checkInfoValid()
    this.checkCertValid()
  },

  methods: {
    onInputChange(field, event) {
      this.clinicInfo[field] = event.detail.value
      this.checkInfoValid()
    },

    checkInfoValid() {
      const { clinicName, contactName, contactPhone, province, city, district, detailAddress } = this.clinicInfo
      const isValid = !!(
        clinicName && contactName && contactPhone &&
        province && city && district && detailAddress &&
        contactPhone.length === 11
      )
      this.isInfoValid = isValid
    },

    checkCertValid() {
      const requiredTypes = this.requiredCerts.map(item => item.type)
      const hasAllRequired = requiredTypes.every(type =>
        this.fileInfo.some(item => item.type === type)
      )
      this.isCertValid = hasAllRequired
    },

    prevPage() {
      this.currentPage = 1
    },

    nextPage() {
      uni.setStorageSync('clinicInfo', this.clinicInfo)
      this.currentPage = 2
    },

    showRegionPicker() {
      this.showPicker = true  //显示选择器
    },

    onRegionChange(e) {
      const [province, city, district] = e.detail.value
      this.clinicInfo.province = province
      this.clinicInfo.city = city
      this.clinicInfo.district = district
      this.checkInfoValid();  //更新验证状态
	  this.showPicker = false   //关闭选择器
    },

    onRegionCancel() {
      this.showPicker = false   //取消时关闭
    },
	
	async previewExample(imageUrl) {
	    if (!imageUrl) return;
	
	    // 判断是否为本地静态资源
	    if (imageUrl.startsWith('/static/')) {
	      try {
	        const info = await new Promise((resolve, reject) => {
	          uni.getImageInfo({
	            src: imageUrl,
	            success: resolve,
	            fail: reject
	          });
	        });
	
	        console.log('getImageInfo 成功', info); // 确认获取到了正确的图片信息
	
	        // 使用获取到的本地路径进行预览
	        uni.previewImage({
	          urls: [info.path], // 确保这里的路径是有效的本地路径
	          current: info.path ,// 当前显示的图片路径
			  success: () => {
			      console.log('previewImage 成功');
			    },
			    fail: (err) => {
			      console.error('previewImage 失败', err);
			    }
	        });
	      } catch (err) {
	        console.error('获取图片信息失败', err);
	        uni.showToast({ title: '图片加载失败', icon: 'none' });
	      }
	    } else {
	      // 如果是网络图或临时文件路径，直接预览
	      uni.previewImage({
	        urls: [imageUrl],
	        current: imageUrl
	      });
	    }
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
			  // 先本地预览（提升体验）
			  this.certList[type] = tempFilePath;

			  uni.showLoading({ title: '上传中...' });

              // 【修改】使用新的域名 BASE_URL
			  uni.uploadFile({
				url: `${BASE_URL}/api/Files/Upload`, 
				filePath: tempFilePath,
				name: 'files', 
				header: {
				  'Authorization': `Bearer ${token}`
				},
				success: (uploadRes) => {
				  uni.hideLoading();
				  console.log('上传响应原始数据:', uploadRes.data);

				  try {
					const data = JSON.parse(uploadRes.data);

					if (data.code === 200 && Array.isArray(data.result) && data.result.length > 0) {
					  const uploadedFile = data.result[0]; // 获取第一个文件对象

					  const fileInfo = this.fileInfo.filter(item => item.type !== type);
					  fileInfo.push({
						type,
						fileType,
						fileTypeName: this.getFileTypeName(fileType),  //展示文件类型名称
						fileUrl: uploadedFile.filePath,   //使用 filePath
						fileId: uploadedFile.id || ''          //使用 id
					  });

					  this.fileInfo = fileInfo;
					  this.certList[type] = uploadedFile.filePath; // 更新为真实 URL

					  // 持久化存储
					  uni.setStorageSync('certList', this.certList);
					  uni.setStorageSync('fileInfo', fileInfo);
					  this.checkCertValid();

					  uni.showToast({ title: '上传成功', icon: 'success' });
					} else {
					  // 业务失败
					  uni.showToast({ 
						title: '上传失败：' + (data.message || '未返回有效文件'), 
						icon: 'none' 
					  });
					  this.certList[type] = ''; // 回滚预览图
					}
				  } catch (err) {
					console.error('JSON 解析失败:', err);
					uni.showToast({ title: '上传失败，服务器返回异常', icon: 'none' });
					this.certList[type] = '';
				  }
				},
				fail: (err) => {
				  uni.hideLoading();
				  console.error('uni.uploadFile 失败:', err);
				  uni.showToast({ title: '上传失败，请检查网络', icon: 'none' });
				  this.certList[type] = ''; // 清除预览
				}
			  });
			},
			fail: (err) => {
			  // 用户取消选择图片
			  if (!err.errMsg.includes('cancel')) {
				uni.showToast({ title: '选择图片失败', icon: 'none' });
			  }
			}
		  });
		},
		fail: () => {
		  // 用户取消 ActionSheet
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
        7: '法人身份证正面',
        8: '法人身份证反面',
      }
      return typeMap[fileType] || ''
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
      const certList = { ...this.certList }
      certList[type] = ''
      const fileInfo = this.fileInfo.filter(item => item.type !== type)
      
      this.certList = certList
      this.fileInfo = fileInfo
      this.checkCertValid()
    },

    // 下载模板文件
    downloadTemplate(type) {
      let apiUrl = ''
      let fileName = ''
      
      if (type === 'powerOfAttorney') {
        // 【修改】使用新的域名 BASE_URL
        apiUrl = `${BASE_URL}/api/Resource/DownloadPurchaseEntrust`
        fileName = '采购委托书模板.pdf'
      } else if (type === 'qualityAgreement') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadDrugQualityAgreement`
        fileName = '药品质量保证协议模板.pdf'
      } else {
		uni.showToast({ title: '不支持的模板类型', icon: 'none' });
		return;
	  }
      
      console.log('[下载] 开始下载模板:', { type, fileName, url: apiUrl });
	  
      uni.showLoading({ title: '下载中...' })
      
	  console.log('下载模板 URL:', apiUrl);
	  uni.downloadFile({
		url: apiUrl,
		filePath: uni.env.USER_DATA_PATH + '/' + fileName, // 可选：指定保存路径（仅部分平台支持）
		success: (res) => {
		  uni.hideLoading();
		  console.log('[下载] downloadFile 成功响应:', res);
		  if (res.statusCode === 200) {
			// 成功下载，尝试直接打开 PDF
			uni.openDocument({
			  filePath: res.tempFilePath || res.filePath,
			  fileType: 'pdf',
			  success: () => {
				uni.showToast({ title: '模板已打开', icon: 'success' });
			  },
			  fail: (err) => {
				console.error('打开文档失败:', err);
				// 如果打不开，尝试保存
				this._saveAndNotify(res.tempFilePath || res.filePath, fileName);
			  }
			});
		  } else {
			uni.showToast({ title: '下载失败：' + res.statusCode, icon: 'none' });
		  }
		},
		fail: (err) => {
		  uni.hideLoading();
		  console.error('downloadFile 失败:', err);
		  uni.showToast({ title: '网络错误，请重试', icon: 'none' });
		}
	  });
    },
	
    viewTemplate(type) {
      this.downloadTemplate(type);
    },
    
    _saveAndNotify(tempFilePath, fileName) {
      uni.saveFile({
        tempFilePath,
        success: (saveRes) => {
          uni.showToast({
            title: `已保存到本地：${fileName}`,
            icon: 'success',
            duration: 3000
          });
          console.log('文件已保存:', saveRes.savedFilePath);
        },
        fail: (err) => {
          console.error('保存失败:', err);
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          });
        }
      });
    },

    async submitCert() {
	  console.log('=== 点击提交时的 token ===');
	  console.log('storage token:', uni.getStorageSync('token'));
      
      const isValid = await this.checkLoginStatus();
      if (!isValid) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/login/index' });
        }, 1500);
        return;
      }
    
      const { clinicInfo, fileInfo } = this;
      const token = uni.getStorageSync('token');
    
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
    
      // 【修改】使用新的域名 BASE_URL
      uni.request({
        url: `${BASE_URL}/api/Clinic/SubmitCertificate`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: submitData,
        success: (res) => {
          uni.hideLoading();
          console.log('[提交] 响应:', res.data);
    
          if (res.data?.code === 200) {
            uni.setStorageSync('auditStatus', 'pending');
            // 如果后端返回了新的 ID
            if(res.data.result && res.data.result.clinicId) {
                uni.setStorageSync('clinicId', res.data.result.clinicId);
            }
            uni.showToast({ title: '提交成功，等待审核' });
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/auth/certStatus' });
            }, 1500);
          } else {
            const msg = res.data?.message || '提交失败';
            uni.showToast({ title: msg, icon: 'none' });
			console.error('【提交失败详情】', res.data);
    
            if (res.data?.code === 401 || msg.includes('token') || msg.includes('认证')) {
              uni.removeStorageSync('token');
              setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 2000);
            }
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('[提交] 网络失败:', err);
          uni.showToast({ title: '网络错误，请重试', icon: 'none' });
        }
      });
    },

	checkLoginStatus() {
	  return new Promise((resolve) => {
	    const token = uni.getStorageSync('token');
	    if (!token) {
	      resolve(false);
	      return;
	    }
	
        // 【修改】使用新的域名 BASE_URL
	    uni.request({
	      url: `${BASE_URL}/api/Clinic/CheckStatus`,
	      method: 'GET',
	      header: {
	        'Authorization': `Bearer ${token}`
	      },
	      success: (res) => {
	        if (res.statusCode === 200 && res.data?.code === 200) {
	          resolve(true);
	        } else {
	          resolve(false);
	        }
	      },
	      fail: () => {
	        resolve(false);
	      }
	    });
	  });
	}
  },
}
</script>

<style>
/* 样式保持不变 */
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