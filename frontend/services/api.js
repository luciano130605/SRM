import axios from 'axios'

const api = axios.create({
    baseURL: "http://192.168.0.192:3011"
})

function limpiarSesion() {
    localStorage.removeItem('srm_token')
    localStorage.removeItem('srm_refresh_token')
    localStorage.removeItem('srm_user')
    window.dispatchEvent(new Event('srm:logout'))
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('srm_token')

    config.headers = config.headers || {}
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status

        if (status !== 401 || originalRequest?._retry || originalRequest?.url === '/auth/refresh') {
            return Promise.reject(error)
        }

        const refreshToken = localStorage.getItem('srm_refresh_token')

        if (!refreshToken) {
            limpiarSesion()
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            const response = await api.post('/auth/refresh', { refreshToken })
            const { session, user } = response.data.data

            if (!session?.accessToken) {
                limpiarSesion()
                return Promise.reject(error)
            }

            localStorage.setItem('srm_token', session.accessToken)
            localStorage.setItem('srm_refresh_token', session.refreshToken || refreshToken)

            if (user) {
                localStorage.setItem('srm_user', JSON.stringify(user))
            }

            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            limpiarSesion()
            return Promise.reject(refreshError)
        }
    }
)

export default api
