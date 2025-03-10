import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'  // 中文语言包
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'  // 中文日期库
import './styles/style.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import store from './store'

// 刷新后的动态路由添加
const localData = localStorage.getItem('SMSS_VUE_STORE')

if(localData){
  store.commit('dynamicMenu',JSON.parse(localData).menu.routerList)
  store.state.menu.routerList.forEach(item => {
    router.addRoute('Home',item)
  })
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('SMSS_TOKEN')
  // 登录页面直接放行
  if(!token && to.path !== '/login'){
    return next('/login')
  }else if(token && to.path === '/login'){
    return next('/')
  } else {
    return next()
  }
})

// 配置dayjs中文
dayjs.locale('zh-cn')

// src/main.js 或 src/App.vue
const baseURL = import.meta.env.VITE_API_BASE_URL;
console.log('Environment:', import.meta.env);
console.log('API Base URL:', baseURL);

const app = createApp(App)

// 配置ElementPlus中文
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册其他模块
app.use(router)
app.use(store)

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')