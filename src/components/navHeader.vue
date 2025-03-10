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
.avatar-uploader .avatar {
  width: 50px;
  height: 50px;
  display: block;
}

.avatar-uploader .el-upload:hover {
  border-color:  #27a5f9;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 50px;
  height: 50px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:  border-color 0.2s ease;
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
                    <el-avatar :src="userAvatarURL" />
                    <p class = "user-name">{{ userInfo.name }}</p>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="updateUerInfo">修改信息</el-dropdown-item>
                        <el-dropdown-item command="cancel">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
    <el-dialog title="修改信息" v-model="dialogVisible" width="40%" :before-close="handleClose">
        <el-form ref="formRef" :model="form" label-width="85px" label-position="right" :rules = "rules">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.userName" clearable placeholder="请输入用户名" disabled></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.realName" clearable placeholder="请输入姓名" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" clearable placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phoneNumber">
                <el-input v-model="form.phoneNumber" clearable placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item label="头像">
                <el-upload
                    class="avatar-uploader"
                    :http-request="handleUpload"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                >
                    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    <template #tip>
                        <div class="el-upload__tip" v-if="uploading">
                            上传进度：{{ progress }}%
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item label="年龄" prop="age">
                <el-input v-model="form.age" clearable placeholder="请输入年龄"></el-input>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="form.sex">
                    <el-radio value="男">男</el-radio>
                    <el-radio value="女">女</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="工号/学号" prop="number">
                <el-input v-model="form.number" clearable placeholder="请输入工号/学号"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
                <el-button type="primary" @click="handleSubmit(formRef)">保存</el-button>
            </template>
    </el-dialog>
</template>

<script setup>
    import { useStore } from 'vuex'  // 引入store
    import { useRoute, useRouter } from 'vue-router'  // 引入route, router, 用于获取当前路由信息, 切换路由
    import { computed , ref, reactive, onMounted } from 'vue'; // 引入computed, 用于监听store中的state变化
    import { Plus } from '@element-plus/icons-vue'
    import { uploadAvatar, updateMyInfo } from '../api'

    const userInfo = JSON.parse(localStorage.getItem('SMSS_USER_INFO'))

    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const selectedTab = computed(() => store.state.menu.selectMenu) // 监听store中的selectedTab变化
    const dialogVisible = ref(false)
    const formRef = ref(null)

    const imageUrl = ref('')
    const progress = ref(0);
    const uploading = ref(false);

    const form = reactive({
        id: userInfo.id,
        realName: userInfo.realName,
        email: userInfo.email,
        phoneNumber: userInfo.phone,
        age: userInfo.age,
        sex: userInfo.sex,
        number: userInfo.number,
        avatarUrl: userInfo.avatar,
        userName: userInfo.name
    })

    const handleClose = () => {
        dialogVisible.value = false
    }

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
        if(command === 'updateUerInfo'){
            dialogVisible.value = true
            console.log(dialogVisible.value)
            if(userInfo.avatar === null){
                imageUrl.value = `https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png`
            }else{
                imageUrl.value = userInfo.avatar.replace(/\\/g, '/') !== '' ? `${process.env.VITE_API_BASE_URL}${userInfo.avatar.replace(/\\/g, '/')}`: `https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png`
            }
            
        }
    }
    // const handleAvatarSuccess = (response, uploadFile) => {
    //     if (response.data.code === 200) {
    //         imageUrl.value = URL.createObjectURL(uploadFile.raw)
    //         form.avatar = response.data.filePath
    //         ElMessage.success('头像上传成功')
    //     } else {
    //         ElMessage.error(response.data.message || '上传失败')
    //     }
    // }

    const beforeAvatarUpload = (rawFile) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        const isImage = validTypes.includes(rawFile.type)
        const isLt5M = rawFile.size / 1024 / 1024 < 5

        if (!isImage) {
            ElMessage.error('只能上传 JPG/PNG/GIF 格式!')
            return false
        }
        if (!isLt5M) {
            ElMessage.error('头像大小不能超过5MB!')
            return false
        }
        return true
    }
    const handleUpload = async (options) => {
        const formData = new FormData();
        formData.append('file', options.file);
        try
        {
            uploading.value = true;
            progress.value = 0;

            await uploadAvatar(formData,{
                onUploadProgress: (progressEvent) => {
                    progress.value = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                    );
                }
            }).then(response => {
                if(response.data.code === 200){
                    imageUrl.value = URL.createObjectURL(options.file)
                    form.avatarUrl = response.data.data
                    console.log(response.data.data)
                    ElMessage.success('上传成功')
                }
            })


        }catch(error){
            ElMessage.error(error.response?.data?.message || '上传失败')
        }finally{
            uploading.value = false;
            progress.value = 0;
        }
    }
    const userAvatarURL = computed(() => {
        if(userInfo.avatar === null){
            return `https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png`
        }
        const cleanPath = userInfo.avatar.replace(/\\/g, '/')
        console.log(cleanPath)
        return cleanPath !== '' ? `${process.env.VITE_API_BASE_URL}${cleanPath}`: `https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png`
    })

    const handleSubmit = async (EditRef) => {
        if(!EditRef) return

        await EditRef.validate((valid,field)=> {
            if(valid){
                updateMyInfo(form).then(response => {
                    if(response.data.code === 200){
                        ElMessage.success('修改成功')
                        dialogVisible.value = false
                        localStorage.setItem('SMSS_USER_INFO',JSON.stringify(response.data.data))
                        // 刷新页面
                        window.location.reload()
                    }else{
                        ElMessage.error(response.data.message)
                    }
                })
            }else{
                ElMessage.error('请检查输入项')
            }
        })   

    }
    const rules = {
        realName: [
            { required: true, message: '请输入姓名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        phoneNumber: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { type: 'phone', message: '手机号格式不正确', trigger: 'blur' }
        ],
        age: [
            { required: true, message: '请输入年龄', trigger: 'blur' },
        ],
        number: [
            { required: true, message: '请输入工号/学号', trigger: 'blur' },
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
    }
    onMounted(() => {
        
    })
</script>
