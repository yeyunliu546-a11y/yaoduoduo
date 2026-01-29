// mock/goods.js

// 1. 【药品采购】数据池 (原有的成品药数据，保持不变)
const dbProcurement = [
    // --- 华润三九 ---
    { id: 101, goodsName: '感冒灵颗粒 (热销)', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*9袋', salePrice: 15.50, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 102, goodsName: '感冒灵颗粒 (便携)', manufacturer: '华润三九', standard: '省标', packageType: '小包', spec: '5g*12袋', salePrice: 9.90, sales: 1200, imageUrl: '/static/logo.png' },
    { id: 103, goodsName: '板蓝根颗粒', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*20袋', salePrice: 12.00, sales: 800, imageUrl: '/static/logo.png' },
    { id: 114, goodsName: '三九胃泰颗粒', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '20g*6袋', salePrice: 28.00, sales: 2100, imageUrl: '/static/logo.png' },
    { id: 115, goodsName: '正天丸', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '6g*10袋', salePrice: 19.50, sales: 600, imageUrl: '/static/logo.png' },

    // --- 北京同仁堂 ---
    { id: 104, goodsName: '六味地黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '120丸/瓶', salePrice: 48.00, sales: 3000, imageUrl: '/static/logo.png' },
    { id: 105, goodsName: '安宫牛黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '3g*1丸', salePrice: 580.00, sales: 100, imageUrl: '/static/logo.png' },
    { id: 106, goodsName: '大活络丹', manufacturer: '北京同仁堂', standard: '国标', packageType: '大包', spec: '3.5g*10丸', salePrice: 35.00, sales: 600, imageUrl: '/static/logo.png' },
    { id: 116, goodsName: '乌鸡白凤丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '9g*10丸', salePrice: 45.00, sales: 1500, imageUrl: '/static/logo.png' },
    { id: 117, goodsName: '感冒清热颗粒', manufacturer: '北京同仁堂', standard: '省标', packageType: '大包', spec: '12g*10袋', salePrice: 18.00, sales: 900, imageUrl: '/static/logo.png' },

    // --- 云南白药 ---
    { id: 107, goodsName: '云南白药气雾剂', manufacturer: '云南白药', standard: '国标', packageType: '瓶装', spec: '85g+30g', salePrice: 28.50, sales: 4500, imageUrl: '/static/logo.png' },
    { id: 108, goodsName: '三七粉', manufacturer: '云南白药', standard: '省标', packageType: '瓶装', spec: '50g/瓶', salePrice: 128.00, sales: 200, imageUrl: '/static/logo.png' },
    { id: 109, goodsName: '创可贴', manufacturer: '云南白药', standard: '国标', packageType: '小包', spec: '100片/盒', salePrice: 5.00, sales: 9999, imageUrl: '/static/logo.png' },
    { id: 118, goodsName: '云南白药牙膏', manufacturer: '云南白药', standard: '国标', packageType: '盒装', spec: '100g留兰香', salePrice: 32.00, sales: 8800, imageUrl: '/static/logo.png' },
    { id: 119, goodsName: '风湿止痛膏', manufacturer: '云南白药', standard: '省标', packageType: '小包', spec: '10贴/包', salePrice: 15.00, sales: 1200, imageUrl: '/static/logo.png' },

    // --- 修正药业 ---
    { id: 110, goodsName: '斯达舒', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '24片/盒', salePrice: 22.00, sales: 1500, imageUrl: '/static/logo.png' },
    { id: 111, goodsName: '肺宁颗粒', manufacturer: '修正药业', standard: '省标', packageType: '大包', spec: '10g*6袋', salePrice: 18.00, sales: 60, imageUrl: '/static/logo.png' },
    { id: 120, goodsName: '消糜栓', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '7枚/盒', salePrice: 38.00, sales: 400, imageUrl: '/static/logo.png' },
    { id: 121, goodsName: '唯达宁喷剂', manufacturer: '修正药业', standard: '国标', packageType: '瓶装', spec: '20ml', salePrice: 16.50, sales: 2300, imageUrl: '/static/logo.png' },

    // --- 太极集团 ---
    { id: 112, goodsName: '藿香正气口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.50, sales: 3200, imageUrl: '/static/logo.png' },
    { id: 113, goodsName: '急支糖浆', manufacturer: '太极集团', standard: '国标', packageType: '瓶装', spec: '200ml/瓶', salePrice: 16.00, sales: 220, imageUrl: '/static/logo.png' },
    { id: 122, goodsName: '鼻窦炎口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*12支', salePrice: 25.00, sales: 550, imageUrl: '/static/logo.png' },

    // --- 补充品类 ---
    { id: 123, goodsName: '复合维生素B片', manufacturer: '华润三九', standard: '国标', packageType: '瓶装', spec: '100片/瓶', salePrice: 8.50, sales: 6000, imageUrl: '/static/logo.png' },
    { id: 124, goodsName: '维生素C咀嚼片', manufacturer: '修正药业', standard: '省标', packageType: '瓶装', spec: '100片/瓶', salePrice: 19.90, sales: 4200, imageUrl: '/static/logo.png' },
    { id: 125, goodsName: '葡萄糖酸钙口服液', manufacturer: '哈药六厂', standard: '国标', packageType: '盒装', spec: '10ml*12支', salePrice: 22.50, sales: 3100, imageUrl: '/static/logo.png' },
    { id: 126, goodsName: '碳酸钙D3片', manufacturer: '朗迪制药', standard: '国标', packageType: '瓶装', spec: '60片/瓶', salePrice: 45.00, sales: 2800, imageUrl: '/static/logo.png' },
    { id: 127, goodsName: '牛黄解毒片', manufacturer: '北京同仁堂', standard: '国标', packageType: '瓶装', spec: '96片/瓶', salePrice: 12.00, sales: 1800, imageUrl: '/static/logo.png' },
    { id: 128, goodsName: '红霉素软膏', manufacturer: '华润三九', standard: '国标', packageType: '盒装', spec: '10g/支', salePrice: 3.50, sales: 12000, imageUrl: '/static/logo.png' },
    { id: 129, goodsName: '氯雷他定片', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '6片/盒', salePrice: 15.80, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 130, goodsName: '布洛芬缓释胶囊', manufacturer: '芬必得', standard: '国标', packageType: '盒装', spec: '20粒/盒', salePrice: 28.00, sales: 15000, imageUrl: '/static/logo.png' },
    { id: 131, goodsName: '双黄连口服液', manufacturer: '哈药六厂', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.00, sales: 900, imageUrl: '/static/logo.png' }
];

// 2. 【处方调剂】数据池 (新增的中药配方颗粒)
const dbDispensing = [
    { id: 201, goodsName: '柴胡 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片5g)', salePrice: 2.50, sales: 10000, imageUrl: '/static/logo.png' },
    { id: 202, goodsName: '甘草 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片3g)', salePrice: 1.20, sales: 8000, imageUrl: '/static/logo.png' },
    { id: 203, goodsName: '当归 (配方颗粒)', manufacturer: '江阴天江', standard: '国标', spec: '1g(相当于饮片4g)', salePrice: 4.80, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 204, goodsName: '黄芪 (配方颗粒)', manufacturer: '江阴天江', standard: '省标', spec: '1g(相当于饮片6g)', salePrice: 3.50, sales: 6000, imageUrl: '/static/logo.png' },
    { id: 205, goodsName: '金银花 (配方颗粒)', manufacturer: '华润三九', standard: '国标', spec: '1g(相当于饮片5g)', salePrice: 5.00, sales: 3000, imageUrl: '/static/logo.png' },
    { id: 206, goodsName: '茯苓 (配方颗粒)', manufacturer: '华润三九', standard: '省标', spec: '1g(相当于饮片10g)', salePrice: 2.00, sales: 4000, imageUrl: '/static/logo.png' },
    { id: 207, goodsName: '白术 (配方颗粒)', manufacturer: '一方制药', standard: '国标', spec: '1g(相当于饮片5g)', salePrice: 2.80, sales: 2000, imageUrl: '/static/logo.png' },
    { id: 208, goodsName: '党参 (配方颗粒)', manufacturer: '江阴天江', standard: '国标', spec: '1g(相当于饮片5g)', salePrice: 3.20, sales: 3500, imageUrl: '/static/logo.png' },
    { id: 209, goodsName: '陈皮 (配方颗粒)', manufacturer: '一方制药', standard: '省标', spec: '1g(相当于饮片6g)', salePrice: 1.50, sales: 4200, imageUrl: '/static/logo.png' }
];

// 3. 内存购物车 (Stateful)
let _cartDatabase = []; 

export default {
    // ---------------- 商品接口 ----------------
    
    // 获取筛选选项 (根据 businessType 返回不同的筛选条件)
    'GET /api/Goods/GetFilterOptions': (params) => {
        const type = params.businessType || 'procurement'; // 默认为采购
        
        if (type === 'dispensing') {
            // 调剂业务：只显示中药颗粒的厂家
            return {
                code: 200, message: 'success',
                result: {
                    manufacturers: ['一方制药', '江阴天江', '华润三九'],
                    packageTypes: [], // 颗粒不分包装
                    standards: ['国标', '省标']
                }
            };
        } else {
            // 采购业务：显示原有厂家
            return {
                code: 200, message: 'success',
                result: {
                    manufacturers: ['华润三九', '北京同仁堂', '云南白药', '修正药业', '太极集团', '哈药六厂', '朗迪制药', '芬必得'],
                    packageTypes: ['大包', '小包', '瓶装', '盒装'],
                    standards: ['国标', '省标']
                }
            };
        }
    },

    // 查询商品列表 (核心修改)
    'GET /api/Goods/ListByWhere': (params) => {
        console.log('Mock: 查询商品', params);
        
        // 1. 确定数据源：是查成品药，还是查颗粒？
        const type = params.businessType || 'procurement';
        const sourceData = type === 'dispensing' ? dbDispensing : dbProcurement;

        let filteredList = sourceData.filter(item => {
            // 筛选逻辑
            const matchBrand = params.manufacturer ? item.manufacturer === params.manufacturer : true;
            const matchPkg = params.packageType ? (item.packageType === params.packageType) : true;
            const matchStd = params.standard ? item.standard === params.standard : true;
            
            // 搜索逻辑 (只搜名字和厂家，无Tags)
            let matchKw = true;
            if (params.keyword) {
                const kw = params.keyword.trim();
                const matchName = item.goodsName.includes(kw);
                const matchFactory = item.manufacturer.includes(kw);
                matchKw = matchName || matchFactory;
            }

            return matchBrand && matchPkg && matchStd && matchKw;
        });

        // 排序逻辑
        if (params.sortField === 'sales') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.sales - b.sales) * factor);
        } else if (params.sortField === 'price') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.salePrice - b.salePrice) * factor);
        }

        // 分页逻辑
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            code: 200, message: 'success',
            data: { total: filteredList.length, list: filteredList.slice(start, end) }
        };
    },

    // ---------------- 购物车接口 ----------------

    'POST /api/Cart/AddCart': (params) => {
        console.log('Mock: 添加购物车', params);
        const goodsId = parseInt(params.goodsSkuId || params.id);
        
        // 尝试从两个库里找商品
        let product = dbProcurement.find(p => p.id === goodsId);
        if (!product) {
            product = dbDispensing.find(p => p.id === goodsId);
        }

        if (!product) return { code: 400, message: '商品不存在' };

        const existingItem = _cartDatabase.find(item => item.goodsSkuId === goodsId);
        
        if (existingItem) {
            existingItem.goodsNum += (params.goodsNum || 1);
        } else {
            _cartDatabase.unshift({
                id: 'cart_' + new Date().getTime(),
                goodsSkuId: product.id,
                goodsName: product.goodsName,
                manufacturer: product.manufacturer,
                imageUrl: product.imageUrl,
                spec: product.spec,
                standard: product.standard,
                packageType: product.packageType,
                salePrice: product.salePrice,
                goodsNum: params.goodsNum || 1
            });
        }
        return { code: 200, message: '添加成功', result: { cartTotal: _cartDatabase.length } };
    },

    'GET /api/Cart/Load': (params) => {
        return { code: 200, message: 'success', data: { list: JSON.parse(JSON.stringify(_cartDatabase)) } };
    },

    'POST /api/Cart/UpdateCartNum': (params) => {
        const goodsId = parseInt(params.goodsSkuId);
        const target = _cartDatabase.find(item => item.goodsSkuId === goodsId);
        if (target) {
            target.goodsNum = parseInt(params.goodsNum);
            return { code: 200, message: '修改成功' };
        }
        return { code: 400, message: '商品未找到' };
    },

    'POST /api/Cart/Delete': (ids) => {
        if (Array.isArray(ids)) {
            _cartDatabase = _cartDatabase.filter(item => !ids.includes(item.id));
        } else {
             _cartDatabase = _cartDatabase.filter(item => item.id !== ids);
        }
        return { code: 200, message: '删除成功' };
    }
}