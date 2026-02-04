import { useUserStore } from '@/stores/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * 图片 URL 处理工具函数
 * @param {string} image - 图片 URL 或 base64 数据
 * @returns {string} - 处理后的图片 URL
 */
export function getImageUrl(image) {
  if (!image) return 'https://placehold.co/300x300?text=No+Image';

  // 如果是 base64 数据，直接返回
  if (image.startsWith('data:image')) {
    return image;
  }

  // 如果是完整 URL，直接返回
  return image;
}

/**
 * 通用 API 请求函数
 * @param {string} endpoint - API 端点（不包含基础 URL）
 * @param {Object} options - fetch 选项
 * @returns {Promise<Object>} - 返回 JSON 数据
 */
async function request(endpoint, options = {}) {
  const userStore = useUserStore()
  const url = `${API_BASE_URL}${endpoint}`

  // 设置默认 headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 登录和注册接口不需要携带 token
  const isAuthEndpoint = endpoint.startsWith('/auth/login') || 
                         endpoint.startsWith('/auth/register')

  // 如果有 token 且不是认证接口，自动添加到 Authorization header
  if (userStore.token && !isAuthEndpoint) {
    headers.Authorization = `Bearer ${userStore.token}`
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)

    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = '请求失败'
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          errorMessage = data.message || errorMessage
        } else {
          // 如果不是 JSON，尝试读取文本
          const text = await response.text()
          errorMessage = text || errorMessage
        }
      } catch (e) {
        errorMessage = `请求失败 (${response.status})`
      }
      throw new Error(errorMessage)
    }

    // 解析成功响应
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API 请求错误:', error)
    throw error
  }
}

/**
 * GET 请求
 */
export function get(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export function post(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT 请求
 */
export function put(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * PATCH 请求
 */
export function patch(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE 请求
 */
export function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'DELETE' })
}

// 导出 useUserStore 供组件使用
export { useUserStore }

export default request