// mock/cart.js

const cartList = [
	// --- 普通采购商品 (GoodsType: 1) ---
	{
		id: 1,
		goodsId: 101,
		goodsName: '感冒灵颗粒',
		manufacturer: '华润三九',
		spec: '10g*9袋',
		price: 15.50,
		number: 2,
		image: 'https://img14.360buyimg.com/n0/jfs/t1/157929/21/23769/117397/6090f70cE5d774f76/c642220790d9a6c2.jpg',
		selected: true,
		goodsType: 1, // 1代表采购商品
		stock: 999
	},
	{
		id: 2,
		goodsId: 102,
		goodsName: '布洛芬缓释胶囊',
		manufacturer: '芬必得',
		spec: '0.3g*24粒',
		price: 28.00,
		number: 1,
		image: 'https://img14.360buyimg.com/n0/jfs/t1/135327/29/17856/87247/5fbb7d37E3339009c/9890d2977505777a.jpg',
		selected: false,
		goodsType: 1,
		stock: 50
	},
	
	// --- 处方调剂商品 (GoodsType: 2) ---
	// 模拟一张处方里的成分：柴胡、甘草
	{
		id: 3,
		goodsId: 201,
		goodsName: '柴胡 (配方颗粒)',
		manufacturer: '一方制药',
		spec: '1g/袋 (相当于饮片5g)',
		price: 0.85, // 单价 (元/g)
		number: 15, // 这里的数量通常指单剂里的克数，或者总克数，暂定为单剂克数
		image: 'https://img14.360buyimg.com/n0/jfs/t1/205347/19/16277/105761/619602e3E23337f7c/e89326e632735777.jpg',
		selected: true,
		goodsType: 2, // 2代表调剂商品
		stock: 9999
	},
	{
		id: 4,
		goodsId: 202,
		goodsName: '甘草 (配方颗粒)',
		manufacturer: '一方制药',
		spec: '0.5g/袋',
		price: 0.60, 
		number: 10, 
		image: 'https://img14.360buyimg.com/n0/jfs/t1/195972/29/15729/169493/60f7e6f8E29828277/9c0c30677567606e.jpg',
		selected: true,
		goodsType: 2,
		stock: 9999
	}
]

export default {
	'get|/api/cart/list': option => {
		return {
			status: 200,
			message: 'success',
			data: cartList
		};
	}
}