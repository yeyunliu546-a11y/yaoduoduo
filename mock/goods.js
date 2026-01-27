// mock/goods.js

// 1. 商品数据库 (用于查询商品信息)
const dbGoods = [
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

    // --- 补充 ---
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

// 2. 【核心】内存中的购物车数据 (Stateful)
// 初始为空，这样你删除后数据就真的没了，重启后才会清空
let _cartDatabase = []; 

export default {
    // ---------------- 商品接口 ----------------
    'GET /api/Goods/GetFilterOptions': (params) => {
        return {
            code: 200, message: 'success',
            result: {
                manufacturers: ['华润三九', '北京同仁堂', '云南白药', '修正药业', '太极集团', '哈药六厂', '朗迪制药', '芬必得'],
                packageTypes: ['大包', '小包', '瓶装', '盒装'],
                standards: ['国标', '省标']
            }
        };
    },

    'GET /api/Goods/ListByWhere': (params) => {
        console.log('Mock: 查询商品', params);
        let filteredList = dbGoods.filter(item => {
            const matchBrand = params.manufacturer ? item.manufacturer === params.manufacturer : true;
            const matchPkg = params.packageType ? item.packageType === params.packageType : true;
            const matchStd = params.standard ? item.standard === params.standard : true;
            const matchKw = params.keyword ? (item.goodsName.includes(params.keyword) || item.manufacturer.includes(params.keyword)) : true;
            return matchBrand && matchPkg && matchStd && matchKw;
        });

        if (params.sortField === 'sales') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.sales - b.sales) * factor);
        } else if (params.sortField === 'price') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.salePrice - b.salePrice) * factor);
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            code: 200, message: 'success',
            data: { total: filteredList.length, list: filteredList.slice(start, end) }
        };
    },

    // ---------------- 购物车接口 (真实逻辑) ----------------

    // 1. 添加购物车
    'POST /api/Cart/AddCart': (params) => {
        console.log('Mock: 添加购物车', params);
        // 从商品库里找到这个商品
        const goodsId = parseInt(params.goodsSkuId || params.id);
        const product = dbGoods.find(p => p.id === goodsId);

        if (!product) {
            return { code: 400, message: '商品不存在' };
        }

        // 检查购物车里是否已经有了
        const existingItem = _cartDatabase.find(item => item.goodsSkuId === goodsId);
        
        if (existingItem) {
            // 有了就增加数量
            existingItem.goodsNum += (params.goodsNum || 1);
        } else {
            // 没有就新增一条
            _cartDatabase.unshift({
                id: 'cart_' + new Date().getTime(), // 生成一个随机购物车ID
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

    // 2. 获取购物车列表
    'GET /api/Cart/Load': (params) => {
        console.log('Mock: 加载购物车', _cartDatabase.length + '条');
        return {
            code: 200, message: 'success',
            data: { list: JSON.parse(JSON.stringify(_cartDatabase)) } // 返回副本
        };
    },

    // 3. 修改数量
    'POST /api/Cart/UpdateCartNum': (params) => {
        console.log('Mock: 修改数量', params);
        const goodsId = parseInt(params.goodsSkuId);
        const target = _cartDatabase.find(item => item.goodsSkuId === goodsId);
        if (target) {
            target.goodsNum = parseInt(params.goodsNum);
            return { code: 200, message: '修改成功' };
        }
        return { code: 400, message: '商品未找到' };
    },

    // 4. 删除商品
    'POST /api/Cart/Delete': (ids) => {
        console.log('Mock: 删除商品', ids);
        // ids 可能是数组，也可能是逗号分隔字符串，这里简单处理数组
        if (Array.isArray(ids)) {
            _cartDatabase = _cartDatabase.filter(item => !ids.includes(item.id));
        } else {
            // 单个ID
             _cartDatabase = _cartDatabase.filter(item => item.id !== ids);
        }
        return { code: 200, message: '删除成功' };
    }
}