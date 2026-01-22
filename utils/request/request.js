// utils/request/request.js

// 1. 引入刚才写的 Mock 文件
import mockGoods from '@/mock/goods.js' 

// 【修改点】这里直接定义后台地址，不从 constant 引入了
const URL_API = 'http://112.126.75.108:5000'; 

// 合并所有 Mock 数据
const mockData = {
    ...mockGoods
}

// 【Mock 开关】开发时开启 (true)，对接后台时改成 (false)
const USE_MOCK = true;

const request = (options) => {
    return new Promise((resolve, reject) => {
        // --- 2. Mock 拦截逻辑开始 ---
        if (USE_MOCK) {
            // 拼接 key，例如 "GET /api/Goods/GetFilterOptions"
            const method = (options.method || 'GET').toUpperCase();
            
            // 兼容处理：确保 mockKey 格式正确
            // 有时候 options.url 可能带 baseURL，有时候不带，这里主要拦截路径部分
            // 简单起见，我们假设 options.url 就是 /api/... 开头的
            const mockKey = `${method} ${options.url}`;
            
            // 如果在 Mock 数据里找到了这个接口
            if (mockData[mockKey]) {
                console.log(`[Mock拦截成功] ${mockKey}`);
                
                // 模拟网络延迟 0.5秒
                setTimeout(() => {
                    const response = mockData[mockKey](options.data || options.params);
                    resolve(response);
                }, 500);
                return; // 拦截成功，不再发送真实请求
            } else {
                console.log(`[Mock未匹配，放行] ${mockKey}`);
            }
        }
        // --- Mock 拦截逻辑结束 ---

        // 3. 原有的真实请求逻辑
        uni.request({
            url: URL_API + options.url, // 使用上面定义的 URL_API
            method: options.method || 'GET',
            data: options.data || options.params,
            header: {
                'Authorization': uni.getStorageSync('token') || '',
                'content-type': 'application/json'
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    // 兼容后端不同的返回格式
                    // 有的后端把数据放在 res.data.result，有的是 res.data.data
                    resolve(res.data);
                } else {
                    reject(res);
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export default request;