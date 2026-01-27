// mock/cart.js

export default {
	// 追加到 mock/goods.js 的 export default 中
	
	    // 模拟获取购物车列表接口
	    'GET /api/Cart/Load': (params) => {
	        console.log('Mock拦截: 获取购物车列表', params);
	        // 构造一些购物车数据 (基于之前的dbGoods，增加购物车特有字段)
	        const cartList = [
	            { 
	                id: 'cart_001', // 购物车记录ID
	                goodsSkuId: 101, 
	                goodsName: '感冒灵颗粒 (热销)', 
	                imageUrl: '/static/logo.png',
	                spec: '10g*9袋', 
	                salePrice: 15.50, 
	                goodsNum: 2,      // 购买数量
	                isSelected: true  // 是否选中
	            },
	            { 
	                id: 'cart_002', 
	                goodsSkuId: 123, 
	                goodsName: '复合维生素B片', 
	                imageUrl: '/static/logo.png',
	                spec: '100片/瓶', 
	                salePrice: 8.50, 
	                goodsNum: 1,
	                isSelected: false 
	            },
	             { 
	                id: 'cart_003', 
	                goodsSkuId: 105, 
	                goodsName: '安宫牛黄丸', 
	                imageUrl: '/static/logo.png',
	                spec: '3g*1丸', 
	                salePrice: 580.00, 
	                goodsNum: 1,
	                isSelected: true 
	            }
	        ];
	
	        return {
	            code: 200,
	            message: 'success',
	            data: cartList // 根据接口文档，这里直接返回数组列表
	        };
	    },
    // 模拟添加购物车接口
    'POST /api/Cart/AddCart': (params) => {
        console.log('Mock拦截: 添加购物车', params);
        
        // 模拟后端返回的数据结构
        return {
            code: 200,
            message: '成功',
            result: {
                // 模拟购物车总数量增加（例如返回一个随机数或固定值）
                cartTotal: Math.floor(Math.random() * 10) + 1
            }
        };
    }
}