<template>
  <view class="container">
    <!-- 页面头部（自定义导航栏） -->
    <view class="custom-nav">
      <text class="title">资质认证</text>
    </view>

    <!-- 步骤指示器 -->
    <view class="steps">
      <view class="step-item" :class="{ active: currentPage === 1 }">
        <text class="step-text">1. 填写信息</text>
      </view>
      <view class="step-line"></view>
      <view class="step-item" :class="{ active: currentPage === 2 }">
        <text class="step-text">2. 上传资质</text>
      </view>
    </view>

    <!-- 步骤1：填写诊所信息 -->
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
		<!-- 地区选择器 -->
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

    <!-- 步骤2：上传资质文件 -->
    <view v-if="currentPage === 2" class="step-content">
      <view class="cert-list">
        <view 
          v-for="cert in requiredCerts" 
          :key="cert.type" 
          class="cert-item"
        >
          <!-- 第一行：标题 + 模板下载（同行） -->
		  <view class="cert-title-group">
			<!-- 左侧：标题 + 描述 -->
			<view class="cert-title-left">
			  <text class="cert-label">{{ cert.label }}</text>
			  <text v-if="cert.desc" class="cert-desc">{{ cert.desc }}</text>
			</view>

			<!-- 右侧：模板下载（仅特定类型显示） -->
			<text 
			  v-if="cert.type === 'powerOfAttorney' || cert.type === 'qualityAgreement'" 
			  class="template-link" 
			  @tap="downloadTemplate(cert.type)"
			>
			  模板下载
			</text>
		  </view>
    
		  <!-- 第二行：示例图 + 上传区 + 删除按钮 -->
		  <view class="cert-image-group">
		    <!-- 左侧：示例图 和 上传/预览 图片 并排 -->
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

		    <!-- 右侧：删除按钮（仅当已上传时显示） -->
		    <view v-if="hasUploaded(cert.type)" class="delete-btn-wrapper">
			  <button @click="deleteImage(cert.type)" class="delete-btn">删除</button>
		    </view>
		  </view>
    
          <!-- 模板下载链接（可选） -->
          <!-- <text 
            v-if="cert.templateDownload" 
            class="template-link" 
            @click="downloadTemplate(cert.type)"
          >
            模板下载
          </text> -->
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
        uni.redirectTo({ url: '/pages/login/login' })
      }, 1500)
      return
    }
    this.token = token // 立即赋值
  
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
	
	//新增：点击上传时弹出选择方式
    // chooseImage(type, fileType) {
    //   uni.showActionSheet({
    //     itemList: ['拍照', '从相册选择'],
    //     success: (res) => {
    //       const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']

    //       uni.chooseImage({
    //         count: 1,
    //         sizeType: ['compressed'],
    //         sourceType: sourceType,
    //         success: (res) => {
    //           const tempFilePath = res.tempFilePaths[0]

    //           const mockFileInfo = {
    //             type,
    //             fileType,
    //             fileTypeName: this.getFileTypeName(fileType),
    //             fileUrl: tempFilePath,
    //             fileId: 'mock_' + Date.now() + '_' + type
    //           }

    //           const fileInfo = this.fileInfo.filter(item => item.type !== type)
    //           fileInfo.push(mockFileInfo)

    //           this.fileInfo = fileInfo
    //           this.certList[type] = tempFilePath

    //           uni.setStorageSync('certList', this.certList)
    //           uni.setStorageSync('fileInfo', fileInfo)
    //           this.checkCertValid()

    //           uni.showToast({ title: '上传成功', icon: 'success' })
    //         },
    //         fail: (err) => {
    //           console.log('选择图片失败', err)
    //           if (err.errMsg && err.errMsg.includes('cancel')) return
    //           uni.showToast({ title: '选择图片失败', icon: 'none' })
    //         }
    //       })
    //     },
    //     fail: () => {
    //       // 用户取消选择
    //     }
    //   })
    // },
	
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

			  uni.uploadFile({
				url: 'http://112.126.75.108:5000/api/Files/Upload', // ← 确保路径正确
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

					  // ✅ 正确取值：使用 filePath 和 id
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
					  // 业务失败（如格式不支持、鉴权失败等）
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
	  const BASE_URL = 'http://112.126.75.108:5000'
      let apiUrl = ''
      let fileName = ''
      
      if (type === 'powerOfAttorney') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadPurchaseEntrust` // 替换为实际模板URL
        fileName = '采购委托书模板.pdf'
      } else if (type === 'qualityAgreement') {
        apiUrl = `${BASE_URL}/api/Resource/DownloadDrugQualityAgreement` // 替换为实际模板URL
        fileName = '药品质量保证协议模板.pdf'
      } else {
		uni.showToast({ title: '不支持的模板类型', icon: 'none' });
		return;
	  }
      
      console.log('[下载] 开始下载模板:', { type, fileName, url: apiUrl });
	  
      uni.showLoading({ title: '下载中...' })
      
      // // 模拟下载（实际项目中需要替换为真实URL）
      // setTimeout(() => {
      //   uni.hideLoading()
      //   uni.showToast({ title: `已下载${fileName}`, icon: 'success' })
      //   console.log(`模拟下载: ${fileName}`)
      // }, 1000)
      
      // 实际下载代码（需要真实URL）
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
	

    // 查看模板（预览）—— 由于是 PDF，无法像图片一样 previewImage
    // 所以“查看”其实就是“下载并打开”
    viewTemplate(type) {
      // 和 downloadTemplate 功能一致，直接复用
      this.downloadTemplate(type);
    },
    
    // 辅助方法：保存文件并提示用户
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

 //    submitCert() {
 //      const { clinicInfo, fileInfo, token } = this

 //      const submitData = {
 //        clinicName: clinicInfo.clinicName,
 //        contactName: clinicInfo.contactName,
 //        contactPhone: clinicInfo.contactPhone,
 //        province: clinicInfo.province,
 //        city: clinicInfo.city,
 //        district: clinicInfo.district,
 //        detailAddress: clinicInfo.detailAddress,
 //        files: fileInfo.map(item => ({
 //          fileType: item.fileType,
 //          fileTypeName: item.fileTypeName,
 //          fileUrl: item.fileUrl,
 //          fileId: item.fileId
 //        }))
 //      }

 //      // 模拟提交成功
 //      uni.showLoading({ title: '提交中...' })
      
 //      setTimeout(() => {
 //        uni.hideLoading()
        
 //        // 模拟成功响应
 //        uni.setStorageSync('auditStatus', 'pending')
 //        uni.setStorageSync('clinicId', 'mock_clinic_' + Date.now())
 //        uni.showToast({ title: '提交成功，等待审核' })
        
 //        // 跳转到审核状态页
 //        setTimeout(() => {
 //          uni.navigateTo({ url: '/pages/auth/certStatus' })
 //        }, 1500)
 //      }, 1000)
	// }
 //    },


    async submitCert() {
	  console.log('=== 点击提交时的 token ===');
	  console.log('storage token:', uni.getStorageSync('token'));
	  console.log('this.token:', this.token);
	  console.log('【准备发起提交请求】', this.token);
      // 1. 先检查登录状态（关键！）
      const isValid = await this.checkLoginStatus();
      if (!isValid) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/login/index' });
        }, 1500);
        return;
      }
    
      // 2. 构造数据并提交
      const { clinicInfo, fileInfo } = this;
      const token = uni.getStorageSync('token'); // 每次都从 storage 读，避免 this.token 滞后
    
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
        url: 'http://112.126.75.108:5000/api/Clinic/SubmitCertificate',
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
            uni.setStorageSync('clinicId', res.data.result.clinicId);
            uni.showToast({ title: '提交成功，等待审核' });
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/auth/certStatus' });
            }, 1500);
          } else {
            const msg = res.data?.message || '提交失败';
            uni.showToast({ title: msg, icon: 'none' });
			console.error('【提交失败详情】', res.data);
    
            // 如果是 token 问题，清除本地 token 并跳转登录
            if (res.data?.code === 401 || msg.includes('token') || msg.includes('认证')) {
              uni.removeStorageSync('token');
              setTimeout(() => uni.redirectTo({ url: '/pages/login' }), 2000);
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
	// 校验当前 token 是否有效
	checkLoginStatus() {
	  return new Promise((resolve) => {
	    const token = uni.getStorageSync('token');
	    if (!token) {
	      resolve(false);
	      return;
	    }
	
	    uni.request({
	      url: 'http://112.126.75.108:5000/api/Clinic/CheckStatus',
	      method: 'GET',
	      header: {
	        'Authorization': `Bearer ${token}`
	      },
	      success: (res) => {
	        // 只要能成功调用 CheckStatus，说明 token 有效
	        if (res.statusCode === 200 && res.data?.code === 200) {
	          resolve(true);
	        } else {
	          resolve(false);
	        }
	      },
	      fail: () => {
	        resolve(false); // 网络错误也视为未登录
	      }
	    });
	  });
	}
  },
}
</script>

<style>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.custom-nav {
  text-align: center;
  padding: 20rpx 0;
  background-color: white;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30rpx;
}

.step-text {
  font-size: 28rpx;
  color: #ccc;
}

.step-item.active .step-text {
  color: #007aff;
}

.step-line {
  width: 100rpx;
  height: 2rpx;
  background-color: #ccc;
}

.step-content {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
}

.form-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.picker-wrapper {
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  background-color: #fafafa;
}

.picker-text {
  color: #333;
  font-size: 28rpx;
}

.picker-placeholder {
  color: #999;
  font-size: 28rpx;
}

.next-btn, .submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: white;
  border-radius: 8rpx;
  margin-top: 40rpx;
}

.next-btn[disabled], .submit-btn[disabled] {
  background-color: #ccc;
}

.prev-btn {
  width: 100%;
  height: 80rpx;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 8rpx;
  margin-top: 20rpx;
}

/* 资质列表 */
.cert-list {
  margin-bottom: 40rpx;
}

.cert-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
  position: relative;
}

/* 标题组：名称 + 描述 */
.cert-title-group {
  display: flex;
  justify-content: space-between; /*左右分布*/
  align-items: flex-start;       /* 防止描述文字多行时垂直居中错位 */
  margin-bottom: 20rpx;
}

/* 左侧：标题 + 描述（允许换行） */
.cert-title-left {

}

.cert-label {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.cert-desc {
  font-size: 22rpx;
  color: #ff6b6b;
  display: block;
  margin-top: 5rpx;
}

/* 图片组：示例图 + 上传区 + 删除按钮 */
.cert-image-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

/* 左侧：示例图 + 上传/预览 图片 并排 */
.image-pair {
  display: flex;
  align-items: center;
  gap: 320rpx; /* 示例图和上传区之间的间距 */
}

/* 示例图容器 */
.example-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #f9f9f9;
}

.example-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.placeholder-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
}

/* 上传区容器 */
.upload-btn-wrapper {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ccc;
  border-radius: 8rpx;
  background-color: #f9f9f9;
}

.upload-btn {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: #999;
  font-size: 24rpx;
  line-height: 1.5; /* 控制两行之间的距离 */
  white-space: pre-wrap; /* 支持 \n 换行 */
}


/* 已上传图片 */
.uploaded-file {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

/* 删除按钮容器（靠右） */
.delete-btn-wrapper {
  margin-left: 20rpx; /* 跟左侧留出间隙 */
}

.delete-btn {
  width: 80rpx;
  height: 40rpx;
  background-color: #ff6b6b;
  color: white;
  font-size: 24rpx;
  padding: 0 10rpx;
  border-radius: 4rpx;
  line-height: 40rpx;
}

/* 模板下载链接 */
.template-link {
  font-size: 24rpx;
  color: #007aff;
  text-decoration: underline;
  white-space: nowrap; /* 防止“模板下载”被折行 */
  margin-left: 20rpx;  /* 和左侧留点空隙 */
}

</style>

