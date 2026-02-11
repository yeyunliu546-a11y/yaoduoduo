<template>
  <view class="container">
    <view class="form-card">
      <u-form :model="form" ref="uForm" label-width="160rpx">
        <u-form-item label="收货人" prop="Name">
          <u-input v-model="form.Name" placeholder="请填写收货人姓名" />
        </u-form-item>
        <u-form-item label="手机号码" prop="Phone">
          <u-input v-model="form.Phone" type="number" maxlength="11" placeholder="请填写收货人手机号" />
        </u-form-item>
        <u-form-item label="所在地区" prop="ListRegion">
          <select-region v-model="form.ListRegion" />
        </u-form-item>
        <u-form-item label="详细地址" prop="Detail">
          <u-input v-model="form.Detail" type="textarea" height="100" auto-height placeholder="街道、楼牌号等" />
        </u-form-item>
        
        <u-form-item label="设为默认" :border-bottom="false">
          <u-switch v-model="form.IsDefault" active-color="#ff3b30" size="40"></u-switch>
        </u-form-item>
      </u-form>
    </view>
    
    <view class="footer-btn">
      <u-button 
        type="error" 
        shape="circle" 
        :custom-style="{height: '88rpx', fontSize: '32rpx'}"
        @click="handleSubmit" 
        :loading="loading"
      >保存地址</u-button>
      
      <view class="del-btn" v-if="isEdit" @click="handleDelete">删除收货地址</view>
    </view>
  </view>
</template>

<script>
  import { getDetail, addOrUpdate, setDefault, deleteAddress } from '@/api/user/userAddress.js';

  export default {
    data() {
      return {
        isEdit: false,
        addressId: '',
        loading: false,
        form: {
          Id: '',
          Name: '',
          Phone: '',
          Detail: '',
          ListRegion: [], // 结构: [{Value: id, Label: name}, ...]
          IsDefault: false
        },
        rules: {
          Name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
          Phone: [
            { required: true, message: '请填写手机号', trigger: 'blur' },
            { validator: (rule, value, callback) => this.$u.test.mobile(value), message: '手机号格式不正确', trigger: 'blur' }
          ],
          ListRegion: [{ required: true, type: 'array', message: '请选择地区', trigger: 'change' }],
          Detail: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
        }
      }
    },
    onLoad(options) {
      if (options.id) {
        this.isEdit = true;
        this.addressId = options.id;
        this.loadDetail();
      } else {
        uni.setNavigationBarTitle({ title: '新增收货地址' });
      }
    },
    onReady() {
      this.$refs.uForm.setRules(this.rules);
    },
    methods: {
      // 1. 获取详情并回显（核心修复）
      loadDetail() {
        uni.showLoading({ title: '加载中' });
        getDetail(this.addressId).then(res => {
          uni.hideLoading();
          
          // 调试日志：确认数据结构
          console.log('地址详情返回:', res);

          // 兼容 code/Code
          if (res.code === 200 || res.Code === 200) {
            // 【关键修复】正确读取 result 字段（全小写）
            const data = res.result || res.Result || {};
            
            // 构造省市区数组 (select-region 组件需要)
            // 注意：API 返回的 ID 为空字符串时，尝试用 Name 作为 Value 兜底，防止组件报错
            const regionList = [];
            if (data.province || data.Province) {
                regionList.push({ 
                    Value: data.provinceId || data.ProvinceId || data.province, 
                    Label: data.province || data.Province 
                });
                regionList.push({ 
                    Value: data.cityId || data.CityId || data.city, 
                    Label: data.city || data.City 
                });
                regionList.push({ 
                    Value: data.regionId || data.RegionId || data.region, 
                    Label: data.region || data.Region 
                });
            }

            // 【关键修复】将后端小写字段映射到表单大写字段
            this.form = {
              Id: data.id || data.Id,
              Name: data.name || data.Name,
              Phone: data.phone || data.Phone,
              Detail: data.detail || data.Detail,
              IsDefault: !!(data.isDefault || data.IsDefault),
              ListRegion: regionList
            };
          } else {
            this.$u.toast(res.message || res.Message || '获取详情失败');
          }
        }).catch(err => {
          uni.hideLoading();
          console.error(err);
        });
      },

      // 2. 提交保存
      handleSubmit() {
        this.$refs.uForm.validate(valid => {
          if (valid) {
            this.loading = true;
            
            // 构造提交参数（确保符合 addOrUpdate 接口要求的 PascalCase）
            // 如果后端接口 AddOrUpdate 也接受小写，这里不用动；如果必须大写，this.form 已经是大写了
            addOrUpdate(this.form).then(async res => {
              this.loading = false;
              if (res.code === 200 || res.Code === 200) {
                
                // 如果勾选了默认，且本来不是默认，手动调一次 setDefault
                if (this.form.IsDefault) {
                    // 获取 ID：编辑时用 addressId，新增时尝试从 result 获取
                    const targetData = res.result || res.Result || {};
                    const id = this.isEdit ? this.addressId : (targetData.id || targetData.Id);
                    
                    if(id) await setDefault(id);
                }

                this.$u.toast('保存成功');
                setTimeout(() => uni.navigateBack(), 800);
              } else {
                this.$u.toast(res.message || res.Message || '保存失败');
              }
            }).catch(() => this.loading = false);
          }
        });
      },

      // 3. 删除
      handleDelete() {
        uni.showModal({
          title: '提示',
          content: '确定要删除该地址吗？',
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '删除中' });
              deleteAddress([this.addressId]).then(res => {
                uni.hideLoading();
                if (res.code === 200 || res.Code === 200) {
                  this.$u.toast('删除成功');
                  setTimeout(() => uni.navigateBack(), 800);
                } else {
                  this.$u.toast(res.message || res.Message || '删除失败');
                }
              });
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
.container { background-color: #f5f5f5; min-height: 100vh; padding-top: 20rpx; }
.form-card {
  background: #fff; margin: 20rpx; padding: 0 30rpx; border-radius: 16rpx;
}
.footer-btn {
  margin-top: 60rpx; padding: 0 40rpx;
  .del-btn {
    text-align: center; color: #666; font-size: 28rpx; margin-top: 30rpx; padding: 20rpx;
    &:active { opacity: 0.7; }
  }
}
</style>