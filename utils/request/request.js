// utils/request/request.js

// 1. 引入 Mock 文件 (保留引入，防止报错)
import mockGoods from '@/mock/goods.js' 

// 配置正式后端 API 地址
const URL_API = 'https://www.yaoduoduo.top'; 

// Mock 开关 (关闭)
const USE_MOCK = false;

const mockData = { ...mockGoods }

// 定义基础请求函数
const request = (options) => {
    return new Promise((resolve, reject) => {
        // --- Mock 拦截逻辑 ---
        if (USE_MOCK) {
            const method = (options.method || 'GET').toUpperCase();
            const mockKey = `${method} ${options.url}`;
            if (mockData[mockKey]) {
                console.log(`[Mock] ${mockKey}`);
                setTimeout(() => resolve(mockData[mockKey](options.data || options.params)), 500);
                return; 
            }
        }

        // --- 真实请求 ---
        const fullUrl = options.url.startsWith('http') ? options.url : URL_API + options.url;
        
        // 获取本地 Token
        const token = uni.getStorageSync('token');

        uni.request({
            url: fullUrl,
            method: options.method || 'GET',
            data: options.data || options.params, 
            header: {
                // 【核心修复】必须加上 'Bearer ' 前缀 (注意 Bearer 后面有个空格)
                'Authorization': token ? `Bearer ${token}` : '', 
                'content-type': 'application/json',
                ...options.header
            },
            success: (res) => {
                // 打印请求结果，方便调试
                console.log(`[Response] ${options.url}`, res.data);
                
                if (res.statusCode === 200) {
                    // 部分后端成功也可能返回 code != 200，这里视情况处理
                    resolve(res.data);
                } else if (res.statusCode === 401) {
                    // Token 过期或无效
                    uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
                    // 可选：自动跳转登录页
                    // uni.navigateTo({ url: '/pages/login/index' });
                    reject(res);
                } else {
                    console.error('请求错误:', res);
                    reject(res);
                }
            },
            fail: (err) => {
                console.error('网络错误:', err);
                uni.showToast({ title: '网络请求失败', icon: 'none' });
                reject(err);
            }
        });
    });
}

// 挂载方法
request.get = (url, params, header = {}) => request({ url, method: 'GET', params, header });
request.post = (url, data, header = {}) => request({ url, method: 'POST', data, header });
request.put = (url, data, header = {}) => request({ url, method: 'PUT', data, header });
request.delete = (url, data, header = {}) => request({ url, method: 'DELETE', data, header });

export default request;