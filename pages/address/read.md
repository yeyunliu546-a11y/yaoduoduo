1. index.vue (地址列表页)
这是收货地址列表的页面。它的主要作用是展示用户已保存的所有收货地址，并提供列表操作。

功能：

地址列表展示： 循环展示每个地址的收货人姓名 (name)、电话 (phone)、所在地区 (region) 和详细地址 (detail)。

设置默认地址： 用户可以点击单选框将某个地址设置为默认地址 (handleSetDefault)。

编辑地址： 提供了“编辑”按钮 (handleUpdate)，用于跳转到地址修改页面。

删除地址： 提供了“删除”按钮 (handleRemove)，用于移除不再需要的地址。

添加新地址： 底部有“添加新地址”按钮 (handleCreate)，用于跳转到新增地址页面。

数据处理： 通过 userAddressApi.listByWhere() 获取地址列表数据，并根据 isDefault 字段将默认地址排序到最前面 (onReorder)。

2. create.vue (新增地址页)
这是用于创建或添加新的收货地址的页面。

功能：

表单定义： 包含收货人姓名、电话、地区选择（使用 select-region 组件）和详细地址等表单项。

表单验证： 定义了严格的验证规则 (rules)，例如姓名、手机号（使用 isMobile 工具函数验证）和地址详情都是必填项。

表单提交： 提交时，通过 $refs.uForm.validate 进行校验。

API 调用： 校验通过后，调用 AddressApi.addOrUpdate 方法将新的地址数据保存到后端。

3. update.vue (编辑地址页)
这是用于修改现有收货地址信息的页面。

功能：

获取详情： 页面加载时 (onLoad)，通过传递的 addressId 调用 AddressApi.getDetail 获取该地址的全部详细信息 (getDetail)。

数据回显： 将获取到的详细信息 (detail) 填充到表单 (form) 中，包括解析地区信息 (createRegion) 以便在 select-region 组件中正确显示 (createFormData)。

表单结构： 表单结构和验证规则 (rules) 与 create.vue 基本一致。

API 调用： 提交时，调用 AddressApi.edit 方法，传入 addressId 和修改后的表单数据，完成地址更新。