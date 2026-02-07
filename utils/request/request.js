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
        
        // 获取 storeId (如果登录时没存，暂时用文档里的测试ID兜底，建议后续在登录逻辑里存入 storeId)
        const storeId = uni.getStorageSync('storeId') || '1448d0f2e01143a9bdfa4634b543c945';

        // 构造请求头
        const headers = {
            'content-type': 'application/json',
            // 【修正1】认证方式改为 X-Token，且不需要 Bearer 前缀
            'X-Token': token || '', 
            // 【修正2】必须传递 platform
            'platform': 'MP-WEIXIN',
            // 【修正3】必须传递 storeId
            'storeId': storeId,
            ...options.header
        };

        uni.request({
            url: fullUrl,
            method: options.method || 'GET',
            data: options.data || options.params, 
            header: headers,
            success: (res) => {
                // 打印请求结果，方便调试
                console.log(`[Response] ${options.url}`, res.data);
                
                // HTTP 状态码判断
                if (res.statusCode === 200) {
                    // 【修正4】增加业务状态码判断
                    // 文档说明：50014 为 Token 无效或超时
                    const code = res.data.code;
                    if (code === 50014 || code === 401) {
                        uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
                        // 清除失效的 Token
                        uni.removeStorageSync('token');
                        // 延迟跳转登录页
                        setTimeout(() => {
                            uni.reLaunch({ url: '/pages/login/index' });
                        }, 1500);
                        reject(res.data);
                    } else {
                        // 正常返回（包括 code 200 或其他业务错误，交给页面处理）
                        resolve(res.data);
                    }
                } else if (res.statusCode === 401) {
                    uni.showToast({ title: '无权访问', icon: 'none' });
                    reject(res);
                } else {
                    console.error('请求错误:', res);
                    uni.showToast({ title: '服务器开小差了', icon: 'none' });
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