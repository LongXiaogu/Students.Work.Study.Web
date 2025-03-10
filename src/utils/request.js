import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
    baseURL: process.env.VITE_API_BASE_URL,
    timeout: 5000,
});

// 添加请求拦截器
request.interceptors.request.use(config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('SMSS_TOKEN')
    //不需要添加token的api
    const whiteURL = [
        '/Authorize/Login',
        '/Authorize/Register',
        '/Authorize/ForgetPassword',
        '/Authorize/SendLoginCode',
        '/Authorize/SendRegisterCode',
        '/Authorize/SendResetPasswordCode',
    ]
    if(token && whiteURL.includes(config.url) === false){
        config.headers['Authorization'] = token
    }
    return config
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
})

// 添加响应拦截器
request.interceptors.response.use(response => {
    // 对响应数据做点什么
    //对接口异常的数据，给用户提示
    if(response.data.code === 500){
        ElMessage.warning(`${response.data.message},请联系管理员`)
    }
    if(response.data.code === 501){
        ElMessage.warning(`${response.data.message}`)
    }
    if(response.data.code >= 400 && response.data.code < 500 && response.data.code != 403){
        ElMessage.error(response.data.message)
    }
    if(response.data.code === 403){
        ElMessage.error($`登录已失效，请重新登录，${response.data.message}`)
        localStorage.removeItem('SMSS_TOKEN')
        localStorage.removeItem('SMSS_USER_INFO')
        localStorage.removeItem('SMSS_VUE_STORE')
        window.location.href = window.location.origin
    }
    
    return response
}, error => {
    // 对响应错误做点什么
    ElMessage.error(`请求超时，请检查网络连接`)
    return Promise.reject(error)
})

export default request