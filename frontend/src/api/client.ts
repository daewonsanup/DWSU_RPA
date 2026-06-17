import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
})

// Attach CSRF token to every state-changing request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().csrfToken
  if (token && ['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

// Redirect to login on 401
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default client
