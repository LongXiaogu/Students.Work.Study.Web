<style lang="less" scoped>
.flex-box {
    display: flex;
    align-items: center;
    height: 100%;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: #27a5f9;
    padding-right: 25px;

    .header-left {
        height: 100%;

        .icon {
            width: 30px;
            height: 100%;
            color: #f5f5f5;
        }

        .icon:hover {
            
            cursor: pointer;
        }
        .tab {
            padding: 0 10px;
            height: 100%;
            .text {
                margin: 0 5px;
                color: #f5f5f5;
            }
            .close {
                visibility: hidden;
                padding: 5px;
            }
            &.selected {
                a {
                    color: #000;
                }
                i {
                    color: #000;
                }
                background-color: #27a5f9;
            }
        }
        .tab:hover {
            background-color: #27a5f9;
            .close {
                visibility: inherit;  //显示关闭按钮
                cursor: pointer;    //关闭按钮可点击,鼠标形状变为手型
                color: #000;
            }
        }
        
    }
    .header-right {
        .user-name {
            margin-left: 10px;
            font-size: 20px;
            max-width: 100px; /* 设置最大宽度 */
            overflow: hidden; /* 隐藏溢出的内容 */
            white-space: nowrap; /* 防止文本换行 */
            text-overflow: ellipsis; /* 显示省略号 */
        }
    }
    a {
        height: 100%;
        color: #333;
        font-size: 15px;
    }
    
}

</style>

<template>
    <div class="header-container">
        <div class="header-left flex-box">
            <el-icon class="icon" size="20" @click="store.commit('collapseMenu')"><Fold /></el-icon>
            <ul class = "flex-box">
                <li 
                    v-for = "(item, index) in selectedTab" 
                    :key = "item.path" 
                    :class ="{selected: route.path === item.path}"
                    class = "tab flex-box">
                    <el-icon class="icon" size="16"><component :is="item.icon" /></el-icon>
                    <router-link :to = "{ path: item.path }" class = "text flex-box">
                        {{ item.name }}
                    </router-link>
                    <el-icon size="16" class="close" @click = "closeTab(item,index)"><Close /></el-icon>
                </li>
            </ul>
        </div>

        <div class="header-right">
            <el-dropdown @command="handleClick">
                <div class="el-dropdown-link flex-box">
                    <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                    <p class = "user-name">{{ userInfo.name }}</p>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="cancel">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
    import { useStore } from 'vuex'  // 引入store
    import { useRoute, useRouter } from 'vue-router'  // 引入route, router, 用于获取当前路由信息, 切换路由
    import { computed } from 'vue'; // 引入computed, 用于监听store中的state变化

    const userInfo = JSON.parse(localStorage.getItem('SMSS_USER_INFO'))

    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const selectedTab = computed(() => store.state.menu.selectMenu) // 监听store中的selectedTab变化


    const closeTab = (item, index) => {
        store.commit('closeMenu', item )
        //删除的是非当前页tag
        if(route.path!== item.path){
            return
        }
        const selectMenuData = selectedTab.value
        //删除的最后一页
        if(index === selectMenuData.length){
            //如果tag只有一页
            if(!selectMenuData.length){
                router.push('/')
            }else{
                router.push({
                    path: selectMenuData[index-1].path
                })
            }
        }else{  //删除的是中间位置
            router.push({
                path: selectMenuData[index].path
            })
        }
    }
    const handleClick = (command) => {
        if(command === 'cancel'){
            localStorage.removeItem('SMSS_USER_INFO')
            localStorage.removeItem('SMSS_TOKEN')
            localStorage.removeItem('SMSS_VUE_STORE')
            window.location.href = window.location.origin
        }
    }
</script>
