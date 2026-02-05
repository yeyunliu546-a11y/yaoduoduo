// mock/goods.js

// ==========================================
// 1. 【药品采购】数据池 (GoodsType = 1)
// ==========================================
const dbProcurement = [
    // --- 华润三九 ---
    { id: 101, goodsType: 1, goodsName: '感冒灵颗粒 (热销)', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*9袋', salePrice: 15.50, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 102, goodsType: 1, goodsName: '感冒灵颗粒 (便携)', manufacturer: '华润三九', standard: '省标', packageType: '小包', spec: '5g*12袋', salePrice: 9.90, sales: 1200, imageUrl: '/static/logo.png' },
    { id: 103, goodsType: 1, goodsName: '板蓝根颗粒', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*20袋', salePrice: 12.00, sales: 800, imageUrl: '/static/logo.png' },
    { id: 114, goodsType: 1, goodsName: '三九胃泰颗粒', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '20g*6袋', salePrice: 28.00, sales: 2100, imageUrl: '/static/logo.png' },
    { id: 115, goodsType: 1, goodsName: '正天丸', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '6g*10袋', salePrice: 19.50, sales: 600, imageUrl: '/static/logo.png' },

    // --- 北京同仁堂 ---
    { id: 104, goodsType: 1, goodsName: '六味地黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '120丸/瓶', salePrice: 48.00, sales: 3000, imageUrl: '/static/logo.png' },
    { id: 105, goodsType: 1, goodsName: '安宫牛黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '3g*1丸', salePrice: 580.00, sales: 100, imageUrl: '/static/logo.png' },
    { id: 106, goodsType: 1, goodsName: '大活络丹', manufacturer: '北京同仁堂', standard: '国标', packageType: '大包', spec: '3.5g*10丸', salePrice: 35.00, sales: 600, imageUrl: '/static/logo.png' },
    { id: 116, goodsType: 1, goodsName: '乌鸡白凤丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '9g*10丸', salePrice: 45.00, sales: 1500, imageUrl: '/static/logo.png' },
    { id: 117, goodsType: 1, goodsName: '感冒清热颗粒', manufacturer: '北京同仁堂', standard: '省标', packageType: '大包', spec: '12g*10袋', salePrice: 18.00, sales: 900, imageUrl: '/static/logo.png' },

    // --- 云南白药 ---
    { id: 107, goodsType: 1, goodsName: '云南白药气雾剂', manufacturer: '云南白药', standard: '国标', packageType: '瓶装', spec: '85g+30g', salePrice: 28.50, sales: 4500, imageUrl: '/static/logo.png' },
    { id: 108, goodsType: 1, goodsName: '三七粉', manufacturer: '云南白药', standard: '省标', packageType: '瓶装', spec: '50g/瓶', salePrice: 128.00, sales: 200, imageUrl: '/static/logo.png' },
    { id: 109, goodsType: 1, goodsName: '创可贴', manufacturer: '云南白药', standard: '国标', packageType: '小包', spec: '100片/盒', salePrice: 5.00, sales: 9999, imageUrl: '/static/logo.png' },
    { id: 118, goodsType: 1, goodsName: '云南白药牙膏', manufacturer: '云南白药', standard: '国标', packageType: '盒装', spec: '100g留兰香', salePrice: 32.00, sales: 8800, imageUrl: '/static/logo.png' },
    { id: 119, goodsType: 1, goodsName: '风湿止痛膏', manufacturer: '云南白药', standard: '省标', packageType: '小包', spec: '10贴/包', salePrice: 15.00, sales: 1200, imageUrl: '/static/logo.png' },

    // --- 修正药业 ---
    { id: 110, goodsType: 1, goodsName: '斯达舒', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '24片/盒', salePrice: 22.00, sales: 1500, imageUrl: '/static/logo.png' },
    { id: 111, goodsType: 1, goodsName: '肺宁颗粒', manufacturer: '修正药业', standard: '省标', packageType: '大包', spec: '10g*6袋', salePrice: 18.00, sales: 60, imageUrl: '/static/logo.png' },
    { id: 120, goodsType: 1, goodsName: '消糜栓', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '7枚/盒', salePrice: 38.00, sales: 400, imageUrl: '/static/logo.png' },
    { id: 121, goodsType: 1, goodsName: '唯达宁喷剂', manufacturer: '修正药业', standard: '国标', packageType: '瓶装', spec: '20ml', salePrice: 16.50, sales: 2300, imageUrl: '/static/logo.png' },

    // --- 太极集团 ---
    { id: 112, goodsType: 1, goodsName: '藿香正气口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.50, sales: 3200, imageUrl: '/static/logo.png' },
    { id: 113, goodsType: 1, goodsName: '急支糖浆', manufacturer: '太极集团', standard: '国标', packageType: '瓶装', spec: '200ml/瓶', salePrice: 16.00, sales: 220, imageUrl: '/static/logo.png' },
    { id: 122, goodsType: 1, goodsName: '鼻窦炎口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*12支', salePrice: 25.00, sales: 550, imageUrl: '/static/logo.png' },

    // --- 补充品类 ---
    { id: 123, goodsType: 1, goodsName: '复合维生素B片', manufacturer: '华润三九', standard: '国标', packageType: '瓶装', spec: '100片/瓶', salePrice: 8.50, sales: 6000, imageUrl: '/static/logo.png' },
    { id: 124, goodsType: 1, goodsName: '维生素C咀嚼片', manufacturer: '修正药业', standard: '省标', packageType: '瓶装', spec: '100片/瓶', salePrice: 19.90, sales: 4200, imageUrl: '/static/logo.png' },
    { id: 125, goodsType: 1, goodsName: '葡萄糖酸钙口服液', manufacturer: '哈药六厂', standard: '国标', packageType: '盒装', spec: '10ml*12支', salePrice: 22.50, sales: 3100, imageUrl: '/static/logo.png' },
    { id: 126, goodsType: 1, goodsName: '碳酸钙D3片', manufacturer: '朗迪制药', standard: '国标', packageType: '瓶装', spec: '60片/瓶', salePrice: 45.00, sales: 2800, imageUrl: '/static/logo.png' },
    { id: 127, goodsType: 1, goodsName: '牛黄解毒片', manufacturer: '北京同仁堂', standard: '国标', packageType: '瓶装', spec: '96片/瓶', salePrice: 12.00, sales: 1800, imageUrl: '/static/logo.png' },
    { id: 128, goodsType: 1, goodsName: '红霉素软膏', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '10g/支', salePrice: 3.50, sales: 12000, imageUrl: '/static/logo.png' },
    { id: 129, goodsType: 1, goodsName: '氯雷他定片', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '6片/盒', salePrice: 15.80, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 130, goodsType: 1, goodsName: '布洛芬缓释胶囊', manufacturer: '芬必得', standard: '国标', packageType: '盒装', spec: '20粒/盒', salePrice: 28.00, sales: 15000, imageUrl: '/static/logo.png' },
    { id: 131, goodsType: 1, goodsName: '双黄连口服液', manufacturer: '哈药六厂', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.00, sales: 900, imageUrl: '/static/logo.png' }
];

// ==========================================
// 2. 【处方调剂】数据池 (GoodsType = 2, 使用 PricePerGram)
// ==========================================
const dbDispensing = [
    { id: 201, goodsType: 2, goodsName: '柴胡 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片5g)', pricePerGram: 2.50, sales: 10000, imageUrl: '/static/logo.png' },
    { id: 202, goodsType: 2, goodsName: '甘草 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片3g)', pricePerGram: 1.20, sales: 8000, imageUrl: '/static/logo.png' },
    { id: 203, goodsType: 2, goodsName: '当归 (配方颗粒)', manufacturer: '江阴天江', standard: '国标', spec: '1g(相当于饮片4g)', pricePerGram: 4.80, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 204, goodsType: 2, goodsName: '黄芪 (配方颗粒)', manufacturer: '江阴天江', standard: '省标', spec: '1g(相当于饮片6g)', pricePerGram: 3.50, sales: 6000, imageUrl: '/static/logo.png' },
    { id: 205, goodsType: 2, goodsName: '金银花 (配方颗粒)', manufacturer: '华润三九', standard: '国标', spec: '1g(相当于饮片5g)', pricePerGram: 5.00, sales: 3000, imageUrl: '/static/logo.png' },
    { id: 206, goodsType: 2, goodsName: '茯苓 (配方颗粒)', manufacturer: '华润三九', standard: '省标', spec: '1g(相当于饮片10g)', pricePerGram: 2.00, sales: 4000, imageUrl: '/static/logo.png' },
    { id: 207, goodsType: 2, goodsName: '白术 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片5g)', pricePerGram: 2.80, sales: 2000, imageUrl: '/static/logo.png' },
    { id: 208, goodsType: 2, goodsName: '党参 (配方颗粒)', manufacturer: '江阴天江', standard: '国标', spec: '1g(相当于饮片5g)', pricePerGram: 3.20, sales: 3500, imageUrl: '/static/logo.png' },
    { id: 209, goodsType: 2, goodsName: '陈皮 (配方颗粒)', manufacturer: '一方制药', standard: '省标', spec: '1g(相当于饮片6g)', pricePerGram: 1.50, sales: 4200, imageUrl: '/static/logo.png' }
];

// ==========================================
// 3. 内存数据库 (Stateful)
// ==========================================
// 注意：每次修改代码保存后，这里会被重置
let _cartDatabase = []; // 购物车
let _orderDatabase = []; // 订单 (这里初始为空，保证你进入订单列表是干净的)

export default {
    // ---------------- 商品接口 ----------------
    
    // 1. 查询商品列表
    'GET /api/Goods/ListByWhere': (params) => {
        let sourceData = [...dbProcurement, ...dbDispensing];
        
        let filteredList = sourceData.filter(item => {
            let match = true;
            if (params.goodsType) match = match && item.goodsType == params.goodsType;
            if (params.manufacturer) match = match && item.manufacturer === params.manufacturer;
            if (params.packageType) match = match && item.packageType === params.packageType;
            if (params.standard) match = match && item.standard === params.standard;
            if (params.keyword) {
                const kw = params.keyword.trim();
                match = match && (item.goodsName.includes(kw) || (item.manufacturer && item.manufacturer.includes(kw)));
            }
            return match;
        });
        
        if (params.sortField === 'sales') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.sales - b.sales) * factor);
        } else if (params.sortField === 'price') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            const getPrice = (p) => p.pricePerGram || p.salePrice;
            filteredList.sort((a, b) => (getPrice(a) - getPrice(b)) * factor);
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        return {
            code: 200, message: 'success',
            data: { total: filteredList.length, list: filteredList.slice(start, start + limit) }
        };
    },
    
    // 2. 获取筛选选项
    'GET /api/Goods/GetFilterOptions': (params) => {
        const isDispensing = params.businessType === 'dispensing' || params.goodsType == 2;
        const targetDB = isDispensing ? dbDispensing : dbProcurement;
        const manufacturers = [...new Set(targetDB.map(item => item.manufacturer).filter(Boolean))];
        const packageTypes = isDispensing ? [] : ['大包', '小包', '瓶装', '盒装'];
        return {
            code: 200, message: 'success',
            result: { manufacturers, packageTypes, standards: ['国标', '省标'] }
        };
    },

    // ---------------- 购物车接口 ----------------

    'POST /api/Cart/AddCart': (params) => {
        const goodsId = parseInt(params.goodsSkuId || params.id);
        const product = [...dbProcurement, ...dbDispensing].find(p => p.id === goodsId);
        if (!product) return { code: 400, message: '商品不存在' };

        let addNum = parseInt(params.goodsNum);
        if (isNaN(addNum) || addNum < 1) addNum = 1;

        const existingItem = _cartDatabase.find(item => item.goodsSkuId === goodsId);
        if (existingItem) {
            existingItem.goodsNum += addNum;
        } else {
            // [核心] 使用随机数防止 ID 重复，修复前端白屏问题
            const uniqueId = 'cart_' + new Date().getTime() + '_' + Math.floor(Math.random() * 10000);
            
            _cartDatabase.unshift({
                id: uniqueId, 
                goodsSkuId: product.id,
                goodsType: product.goodsType, 
                pricePerGram: product.pricePerGram || null,
                salePrice: product.salePrice,
                goodsName: product.goodsName,
                manufacturer: product.manufacturer,
                imageUrl: product.imageUrl,
                spec: product.spec,
                standard: product.standard,
                packageType: product.packageType,
                goodsNum: addNum
            });
        }
        return { code: 200, message: '添加成功' };
    },

    'GET /api/Cart/Load': () => {
        return { code: 200, message: 'success', data: { list: JSON.parse(JSON.stringify(_cartDatabase)) } };
    },

    'POST /api/Cart/UpdateCartNum': (params) => {
        const target = _cartDatabase.find(item => item.goodsSkuId === parseInt(params.goodsSkuId));
        if (target) {
            target.goodsNum = parseInt(params.goodsNum);
            return { code: 200, message: '修改成功' };
        }
        return { code: 400, message: '未找到' };
    },

    'POST /api/Cart/Delete': (ids) => {
        const idArr = Array.isArray(ids) ? ids : [ids];
        _cartDatabase = _cartDatabase.filter(item => !idArr.includes(item.id));
        return { code: 200, message: '删除成功' };
    },

    // ---------------- 订单接口 (核心闭环) ----------------

    // 1. 结算预览
    'GET /api/Order/GetOrderSettlement': (params) => {
        const address = {
            id: 101, name: '张三', mobile: '13800138000',
            province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城'
        };

        let goodsList = [];
        if (params.cartIds) {
            const ids = params.cartIds.split(',').map(id => id.toString());
            goodsList = _cartDatabase.filter(item => ids.includes(item.id.toString()));
        } else if (params.goodsSkuId) {
            const allGoods = [...dbProcurement, ...dbDispensing];
            const product = allGoods.find(p => p.id == params.goodsSkuId);
            if (product) {
                goodsList = [{
                    ...product,
                    goodsNum: parseInt(params.goodsNum) || 1,
                    goodsType: product.goodsType,
                    pricePerGram: product.pricePerGram,
                    salePrice: product.salePrice
                }];
            }
        }

        if (goodsList.length === 0) return { code: 400, message: '未选择有效商品' };

        const isDispensing = goodsList[0].goodsType === 2;
        let goodsAmount = 0;
        const days = parseInt(params.days) || 1;
        
        goodsList.forEach(item => {
            const price = item.pricePerGram || item.salePrice;
            const itemTotal = price * item.goodsNum * (isDispensing ? days : 1);
            goodsAmount += itemTotal;
        });

        const freight = goodsAmount >= 200 ? 0 : 10;
        const couponAmount = goodsAmount > 500 ? 50 : 0;

        return {
            code: 200, message: 'success',
            data: {
                address: address,
                goodsList: goodsList,
                totalAmount: goodsAmount.toFixed(2),
                freightAmount: freight.toFixed(2),
                couponAmount: couponAmount.toFixed(2),
                payAmount: (goodsAmount + freight - couponAmount).toFixed(2),
                prescriptionInfo: isDispensing ? { days: days, packs: params.packs || 2 } : null
            }
        };
    },

    // 2. 创建订单 (核心：存入 _orderDatabase)
    'POST /api/Order/CreateOrder': (params) => {
        if (!params.addressId) return { code: 400, message: '请选择收货地址' };
        
        const isDispensing = params.orderType == 2;
        const prefix = isDispensing ? 'CF' : 'DD'; 
        const orderNo = prefix + new Date().getTime();
        
        // 解析要购买的商品
        let orderGoods = [];
        if (params.cartIds) {
            const ids = params.cartIds.split(',');
            // 深拷贝商品信息存入订单
            orderGoods = _cartDatabase.filter(item => ids.includes(item.id.toString()))
                .map(item => JSON.parse(JSON.stringify(item)));
                
            // 从购物车移除
            _cartDatabase = _cartDatabase.filter(item => !ids.includes(item.id.toString()));
        }

        // 计算总价 (简化逻辑，实际应由后端重算)
        let payPrice = 100.00; 
        if(orderGoods.length > 0) {
             // 简单累加一下 Mock 价格
             payPrice = orderGoods.reduce((sum, item) => sum + (item.salePrice || item.pricePerGram) * item.goodsNum, 0);
        }

        // 构造新订单对象
        const newOrder = {
            id: 'ORDER_' + new Date().getTime(),
            orderNo: orderNo,
            orderStatus: 10, // 默认待付款
            orderStatusName: '待付款',
            orderType: params.orderType,
            payPrice: payPrice.toFixed(2),
            createTime: new Date().toLocaleString(),
            buyerRemark: params.buyerRemark || '',
            goodsList: orderGoods,
            // 如果是调剂单，存入处方信息
            prescriptionInfo: isDispensing ? { days: 3, packs: 2 } : null 
        };

        // 【关键】存入内存数据库，供订单列表查询
        _orderDatabase.unshift(newOrder);

        return {
            code: 200, message: '下单成功',
            data: { id: newOrder.id, orderNo: orderNo, payPrice: newOrder.payPrice }
        };
    },

    // 3. 订单列表查询 (闭环关键)
    'GET /api/Order/Load': (params) => {
        let list = [..._orderDatabase];
        
        // 筛选逻辑
        if (params.orderType && params.orderType != 0) {
            list = list.filter(item => item.orderType == params.orderType);
        }
        if (params.orderStatus) {
            list = list.filter(item => item.orderStatus == params.orderStatus);
        }

        // 模拟 Result 结构返回
        return {
            code: 200, message: 'success',
            result: list
        };
    },

    // 4. 订单详情
    'GET /api/Order/GetDetail': (params) => {
        const order = _orderDatabase.find(item => item.id == params.id);
        if (order) {
            return { code: 200, message: 'success', data: order };
        }
        return { code: 404, message: '订单不存在' };
    },
	// ... (接在原本的 GetDetail 接口后面)
	
	    // 5. [新增] 获取订单各状态数量 (用于更新个人中心角标)
	    'GET /api/Order/GetOrderCount': () => {
	        const counts = {
	            payment: _orderDatabase.filter(o => o.orderStatus === 10).length, // 待付款
	            delivery: _orderDatabase.filter(o => o.orderStatus === 30).length, // 待发货
	            received: _orderDatabase.filter(o => o.orderStatus === 40).length, // 待收货
	            refund: 0 // 退款暂不计算
	        };
	        return { code: 200, message: 'success', result: counts };
	    },
	
	    // 6. [新增] 模拟支付接口
	    'POST /api/Order/Pay': (params) => {
	        const order = _orderDatabase.find(o => o.id == params.orderId);
	        if (!order) return { code: 404, message: '订单不存在' };
	        
	        if (order.orderStatus !== 10) return { code: 400, message: '订单状态不正确' };
	
	        // 修改状态：10(待付款) -> 30(待发货)
	        order.orderStatus = 30;
	        order.orderStatusName = '待发货';
	        
	        return { code: 200, message: '支付成功' };
	    }
}