// utils/request/request.js

// 1. 引入 Mock 文件 (虽然关闭了 Mock，但为了避免报错，保留引入即可，或者你可以注释掉)
import mockGoods from '@/mock/goods.js' 

// 【修改点 1】配置正式后端 API 地址
const URL_API = 'https://www.yaoduoduo.top'; 

// 合并所有 Mock 数据
const mockData = {
    ...mockGoods
}

// 【修改点 2】关闭 Mock，开启真实请求
const USE_MOCK = false;

const request = (options) => {
    return new Promise((resolve, reject) => {
        // --- 2. Mock 拦截逻辑 (USE_MOCK 为 false 时会直接跳过) ---
        if (USE_MOCK) {
            const method = (options.method || 'GET').toUpperCase();
            // 简单拼接 URL key
            const mockKey = `${method} ${options.url}`;
            
            if (mockData[mockKey]) {
                console.log(`[Mock拦截成功] ${mockKey}`);
                setTimeout(() => {
                    const response = mockData[mockKey](options.data || options.params);
                    resolve(response);
                }, 500);
                return; 
            } else {
                console.log(`[Mock未匹配，放行] ${mockKey}`);
            }
        }
        // --- Mock 拦截结束 ---

        // 3. 发起真实请求
        // 拼接完整 URL，例如: https://www.yaoduoduo.top/api/Goods/Load
        const fullUrl = URL_API + options.url;

        uni.request({
            url: fullUrl,
            method: options.method || 'GET',
            data: options.data || options.params, // 兼容 data 和 params 传参
            header: {
                // 携带 Token，登录后如果有 token 会自动带上
                'Authorization': uni.getStorageSync('token') || '',
                'content-type': 'application/json'
            },
            success: (res) => {
                // HTTP 状态码 200 表示请求成功到达服务器
                if (res.statusCode === 200) {
                    // 返回后端的数据体 (通常包含 code, message, result)
                    resolve(res.data);
                } else {
                    // HTTP 状态码非 200 (如 404, 500)
                    console.error('请求错误:', res);
                    uni.showToast({
                        title: `请求错误 ${res.statusCode}`,
                        icon: 'none'
                    });
                    reject(res);
                }
            },
            fail: (err) => {
                // 网络层面的失败 (如断网, 域名解析失败)
                console.error('网络错误:', err);
                uni.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                });
                reject(err);
            }
        });
    });
}

export default request;