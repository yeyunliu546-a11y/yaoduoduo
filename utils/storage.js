/**  
 * 缓存数据优化  
 * const storage = require('@/utils/storage');  
 * import storage from '@/utils/storage'  
 * 使用方法 【  
 *     一、设置缓存  
 *         string    storage.set('k', 'string你好啊');  
 *         json      storage.set('k', { "b": "3" }, 2);  
 *         array     storage.set('k', [1, 2, 3]);  
 *         boolean   storage.set('k', true);  
 *     二、读取缓存  
 *         默认值    storage.get('k')  
 *         string    storage.get('k', '你好')  
 *         json      storage.get('k', { "a": "1" })  
 *     三、移除/清理    
 *         移除: storage.remove('k');  
 *         清理：storage.clear();   
 * 】  
 * @type {String}  
 */

// utils/storage.js
const postfix = '_expiry' // 缓存有效期后缀

const storage = {
  /**
   * 设置缓存
   * @param {string} k - 键名
   * @param {*} v - 键值
   * @param {number} t - 有效期（单位：秒）
   */
  set(k, v, t) {
    uni.setStorageSync(k, v)
    const seconds = parseInt(t)
    if (seconds > 0) {
      const timestamp = Date.now() / 1000 + seconds
      uni.setStorageSync(k + postfix, String(timestamp))
    } else {
      uni.removeStorageSync(k + postfix)
    }
  },

  /**
   * 获取缓存
   * @param {string} k - 键名
   * @param {*} def - 默认值（可选）
   * @returns {*} 缓存值 或 默认值
   */
  get(k, def = false) {
    const deadtimeStr = uni.getStorageSync(k + postfix)
    if (deadtimeStr) {
      const deadtime = parseFloat(deadtimeStr)
      if (deadtime < Date.now() / 1000) {
        // 已过期，清理并返回默认值
        this.remove(k)
        return def
      }
    }

    const res = uni.getStorageSync(k)
    if (res !== null && res !== undefined && res !== '') {
      return res
    }

    return def
  },

  /**
   * 删除指定缓存
   * @param {string} k - 键名
   */
  remove(k) {
    uni.removeStorageSync(k)
    uni.removeStorageSync(k + postfix)
  },

  /**
   * 清理所有缓存
   */
  clear() {
    uni.clearStorageSync()
  }
}

// ✅ 关键：使用 ES Module 默认导出
export default storage