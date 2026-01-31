import { useUserStore } from '@/stores/user'

const API_BASE_URL = 'http://localhost:3000/api'

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

  // 如果有 token，自动添加到 Authorization header
  if (userStore.token) {
    headers.Authorization = `Bearer ${userStore.token}`
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '请求失败')
    }

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
 * DELETE 请求
 */
export function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'DELETE' })
}

export default request