<style lang="less" scoped>
.aside-container {
    height: 100%;
    border: 0px;
    /* 新增过渡动画 */
    transition: width 0.3s ease-in-out;
    -webkit-transition: width 0.3s ease-in-out;
    
    .logo-lg {
        margin: 0;
        font-size: 20px;
        text-align: center;
        height: 50px;
        line-height: 50px;
        color: #fcfcfc;
        font-family: 'SimSun';
        padding: 0;
        /* 新增过渡动画 */
        transition: width 0.3s ease-in-out;
        -webkit-transition: width 0.3s ease-in-out;
    }
}

/* 覆盖 element-plus 默认过渡 */
.el-menu--collapse {
    transition: width 0.3s ease-in-out, transform 0.3s ease-in-out !important;
}


</style>

<template>
  <!-- 移除内联的 width 样式 -->
  <el-menu
    :class="['aside-container', isCollapse ? 'collapse' : 'expand']"
    active-text-color="#ffd04b"
    background-color="#27a5f9"
    text-color="#fff"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse"
    :default-active="active"
  >
    <!-- 移除内联的 width 样式 -->
    <p class="logo-lg" :style="{ width: isCollapse ? '64px' : '230px' }">{{ isCollapse ? 'SMSS' : '勤工俭学考勤管理系统' }}</p>
    <Menu :index="1" :menuData="menuData"/>
  </el-menu>
</template>

<script lang="ts" setup>
import Menu from './treeMenu.vue';
import { useRouter } from 'vue-router';
import { reactive, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';

const router = useRouter();
// const menuData = reactive(router.options.routes[0].children || []);
const store = useStore();

const menuData = computed(() => store.state.menu.routerList);

const isCollapse = computed(() => store.state.menu.isCollapse);

const handleOpen = (index) => {
    console.log('Open menu:', index);
};

const handleClose = (index) => {
    console.log('Close menu:', index);
};

const active = computed(() => store.state.menu.menuActive)
</script>
