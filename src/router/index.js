import {createRouter, createWebHashHistory} from 'vue-router'

import Layout from '../views/Home.vue'
import Login from '../views/Login/index.vue'


const localData = localStorage.getItem('SMSS_VUE_STORE')


const routers = [
    {
        path: '/',
        component: Layout,
        name: 'Home',
        redirect: to => {
            // 检查是否存在token
            const token = localStorage.getItem('SMSS_TOKEN');
            if (!token) {
                return '/login'; // 不重定向，由路由守卫处理
            }
            const localData = localStorage.getItem('SMSS_VUE_STORE');
            if (localData) {
                const parsedData = JSON.parse(localData);
                const menu = parsedData.menu.routerList[0];
                if (menu.children && menu.children.length > 0) {
                    return menu.children[0].meta.path;
                } else {
                    return menu.meta.path;
                }
            } else {
                // 无SMSS_VUE_STORE但有token，可能数据异常，清除token并跳转登录
                localStorage.removeItem('SMSS_VUE_STORE');
                localStorage.removeItem('SMSS_TOKEN');
                return '/login';
            }
        },
        children:[]
    },
    {
        path: '/login',
        component: Login
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routers
})

export default router