<style lang="less" scoped>
span{
        font-size: 20px;
        font-family: 'SimSun';
    }
</style>

<template>
    <template v-for="(item, index) in props.menuData" >
        <el-menu-item v-if ="!item.children || item.children.length === 0"  
        :index="`${props.index}-${item.meta.id}`"
        :key = "`${props.index}-${item.meta.id}`"
        @click = "handleClick(item,`${props.index}-${item.meta.id}`)">
            <el-icon size = "20">
                <component :is="item.meta.icon"></component>
            </el-icon>
            <span>{{item.meta.name}}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="`${props.index}-${item.meta.id}`">
            <template #title>
                <el-icon size = "20">
                    <component :is="item.meta.icon"></component>
                </el-icon>
                <span>{{item.meta.name}}</span>
            </template>
            <tree-menu :menuData="item.children" :index="`${props.index}-${item.meta.id}`"></tree-menu> <!-- 递归渲染子菜单 -->
        </el-sub-menu>
    </template>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps(['menuData', 'index'])  // 接收父组件传递的menuData, index
const router = useRouter()   // 路由跳转
const store = useStore()   // 状态管理

console.log(props)  // 打印父组件传递的menuData

// 点击菜单项的事件
const handleClick = (item,active) => {
    store.commit('addMenu',item.meta)
    store.commit('updateMenuActive',active)
    router.push({path:item.meta.path})
}
</script>
