// mock/goods.js

// 1. 模拟的数据库 (为了演示翻页，我多复制了几条数据)
const dbGoods = [
    { id: 101, goodsName: '感冒灵颗粒 (热销)', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*9袋', salePrice: 15.50, sales: 5000, imageUrl: '/static/logo.png' },
    { id: 102, goodsName: '感冒灵颗粒 (便携)', manufacturer: '华润三九', standard: '省标', packageType: '小包', spec: '5g*12袋', salePrice: 9.90, sales: 1200, imageUrl: '/static/logo.png' },
    { id: 103, goodsName: '板蓝根颗粒', manufacturer: '华润三九', standard: '国标', packageType: '大包', spec: '10g*20袋', salePrice: 12.00, sales: 800, imageUrl: '/static/logo.png' },
    { id: 104, goodsName: '六味地黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '120丸/瓶', salePrice: 48.00, sales: 3000, imageUrl: '/static/logo.png' },
    { id: 105, goodsName: '安宫牛黄丸', manufacturer: '北京同仁堂', standard: '国标', packageType: '盒装', spec: '3g*1丸', salePrice: 580.00, sales: 100, imageUrl: '/static/logo.png' },
    { id: 106, goodsName: '大活络丹', manufacturer: '北京同仁堂', standard: '企标', packageType: '大包', spec: '3.5g*10丸', salePrice: 35.00, sales: 600, imageUrl: '/static/logo.png' },
    { id: 107, goodsName: '云南白药气雾剂', manufacturer: '云南白药', standard: '国标', packageType: '瓶装', spec: '85g+30g', salePrice: 28.50, sales: 4500, imageUrl: '/static/logo.png' },
    { id: 108, goodsName: '三七粉', manufacturer: '云南白药', standard: '省标', packageType: '瓶装', spec: '50g/瓶', salePrice: 128.00, sales: 200, imageUrl: '/static/logo.png' },
    { id: 109, goodsName: '创可贴', manufacturer: '云南白药', standard: '企标', packageType: '小包', spec: '100片/盒', salePrice: 5.00, sales: 9999, imageUrl: '/static/logo.png' },
    { id: 110, goodsName: '斯达舒', manufacturer: '修正药业', standard: '国标', packageType: '盒装', spec: '24片/盒', salePrice: 22.00, sales: 1500, imageUrl: '/static/logo.png' },
    { id: 111, goodsName: '肺宁颗粒', manufacturer: '修正药业', standard: '省标', packageType: '大包', salePrice: 18.00, sales: 60, imageUrl: '/static/logo.png' },
    { id: 112, goodsName: '藿香正气口服液', manufacturer: '太极集团', standard: '国标', packageType: '盒装', spec: '10ml*10支', salePrice: 14.50, sales: 3200, imageUrl: '/static/logo.png' },
    { id: 113, goodsName: '急支糖浆', manufacturer: '太极集团', standard: '国标', packageType: '瓶装', salePrice: 16.00, sales: 220, imageUrl: '/static/logo.png' }
];

export default {
    'GET /api/Goods/GetFilterOptions': (params) => {
        return {
            code: 200,
            message: 'success',
            result: {
                manufacturers: ['华润三九', '北京同仁堂', '云南白药', '修正药业', '太极集团'],
                packageTypes: ['大包', '小包', '瓶装', '盒装'],
                standards: ['国标', '省标', '企标']
            }
        };
    },

    'GET /api/Goods/ListByWhere': (params) => {
        console.log('Mock拦截参数:', params);
        
        // 1. 先过滤
        let filteredList = dbGoods.filter(item => {
            const matchBrand = params.manufacturer ? item.manufacturer === params.manufacturer : true;
            const matchPkg = params.packageType ? item.packageType === params.packageType : true;
            const matchStd = params.standard ? item.standard === params.standard : true;
            const matchKw = params.keyword ? (item.goodsName.includes(params.keyword) || item.manufacturer.includes(params.keyword)) : true;
            return matchBrand && matchPkg && matchStd && matchKw;
        });

        // 2. 再排序
        if (params.sortField === 'sales') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.sales - b.sales) * factor);
        } else if (params.sortField === 'price') {
            const factor = params.sortOrder === 'asc' ? 1 : -1;
            filteredList.sort((a, b) => (a.salePrice - b.salePrice) * factor);
        }

        // 3. 【核心修改】真实的分页逻辑
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        // 只返回这一页的数据！
        const pagedList = filteredList.slice(start, end);

        return {
            code: 200,
            message: 'success',
            data: {
                total: filteredList.length,
                list: pagedList
            }
        };
    }
}