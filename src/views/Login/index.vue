<style lang="less" scoped>
.container {
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    background-image: url('../../../public/Login_Background.png');
}
.left-side {
    flex: 1;    
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // .logo {
    //     margin-bottom: 40px;
    //     img {
            
    //         height: 600px;
    //     }
    // }
}

.title-container {
    position: relative;
    padding: 40px 60px;
    border-radius: 20px;
    overflow: hidden;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.text-magic {
    position: relative;
    font: 900 48px 'Microsoft YaHei';
    color: transparent;
    background: linear-gradient(90deg, 
        #4facfe 0%, 
        #00f2fe 50%, 
        #4facfe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 200% auto;
    animation: gradient 5s linear infinite;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: 2px;
}

.text-magic::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    filter: blur(10px);
    mix-blend-mode: lighten;
    opacity: 0.8;
}

.subtitle {
    position: relative;
    margin-top: 20px;
    font-size: 24px;
    font-weight: 500;
    color: transparent;
    background: linear-gradient(90deg, 
        #ffd700 10%, 
        #ff8c00 30%, 
        #00ffff 50%, 
        #9400d3 70%, 
        #ffd700 90%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 200% auto;
    animation: gradient 4s linear infinite;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
}

.subtitle::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    filter: blur(8px);
    mix-blend-mode: lighten;
    opacity: 0.7;
    z-index: -1;
}

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* 背景光晕特效 */
.title-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, 
        rgba(79, 172, 254, 0.1) 10%, 
        transparent 30%);
    animation: rotate 10s linear infinite;
    transform-origin: center;
}


.right-side {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .login-form {
        width: 350px;
        padding: 20px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        
    }
    .form-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .login-button {
        width: 100%;
        margin-top: 20px;
    }
}
</style>

<template>
    <div class = "container">
        <div class="left-side">
            <div class="title-container">
                <span class="text-magic">勤工俭学考勤系统</span>
                <div class="subtitle">智慧校园 · 高效管理</div>
            </div>
        </div>
        <div class="right-side">
            <div class="login-form">
                <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
                    <el-tab-pane label="登录" name="login">
                        <el-form :model = "loginForm" :rules = "rules" ref="loginFormRef">
                            <el-form-item prop="userName">
                                <el-input v-model="loginForm.userName" placeholder="请输入用户名" :prefix-icon="UserFilled"></el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" :prefix-icon="Lock"></el-input>
                            </el-form-item>
                            <el-form-item prop="validCode">
                                <el-input v-model="loginForm.validCode" placeholder="请输入验证码" :prefix-icon="Lock">
                                    <template #append>
                                        <span @click="countDownChange" style="cursor: pointer">{{ countDown.validText }}</span>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <div class="form-footer">
                                
                                <el-link type="primary" @click="dialog = true">忘记密码</el-link>
                            </div>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="注册" name="register">
                        <el-form :model = "registerForm" :rules = "rules" ref="registerFormRef">
                            <el-form-item prop="userName">
                                <el-input v-model="registerForm.userName" placeholder="请输入用户名" :prefix-icon="UserFilled"></el-input>
                            </el-form-item>
                            <el-form-item prop="realName">
                                <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" :prefix-icon="UserFilled"></el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" :prefix-icon="Lock"></el-input>
                            </el-form-item>
                            <el-form-item prop="againPassWord">
                                <el-input type="password" v-model="registerForm.againPassWord" placeholder="请再次输入密码" :prefix-icon="Lock"></el-input>
                            </el-form-item>
                            <el-form-item prop="number">
                                <el-input v-model="registerForm.number" placeholder="请输入学号" :prefix-icon="UserFilled"></el-input>
                            </el-form-item>
                            <el-form-item prop="email">
                                <el-input v-model="registerForm.email" placeholder="请输入邮箱" :prefix-icon="Message"></el-input>
                            </el-form-item>
                            <el-form-item prop="phone">
                                <el-input v-model="registerForm.phone" placeholder="请输入手机号" :prefix-icon="Iphone"></el-input>
                            </el-form-item>
                            <el-form-item prop="sex">
                                <el-radio-group v-model="registerForm.sex">
                                    <el-radio value="男">男</el-radio>
                                    <el-radio value="女">女</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item prop="departmentId">
                                <el-select v-model="registerForm.departmentId" placeholder="请选择部门">
                                    <el-option label="航空制造与工程学部" value="1"></el-option>
                                    <el-option label="电子信息与自动化学部" value="2"></el-option>
                                    <el-option label="经济管理学部" value="3"></el-option>
                                    <el-option label="航空服务与传媒学部" value="4"></el-option>
                                    <el-option label="文学与体育学部" value="5"></el-option>
                                    <el-option label="计算机学部" value="6"></el-option>
                                    <el-option label="马克思主义学院" value="7"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item prop="roleId">
                                <el-select v-model="registerForm.roleId" placeholder="请选择角色">
                                    <el-option label="教师" value="2"></el-option>
                                    <el-option label="学生" value="3"></el-option>
                                    <!--<el-option label="游客" value="6"></el-option>-->
                                </el-select>
                            </el-form-item>
                            <el-form-item prop="validCode">
                                <el-input v-model="registerForm.validCode" placeholder="请输入验证码" :prefix-icon="Lock">
                                    <template #append>
                                        <span @click="countDownChange" style="cursor: pointer">{{ countDown.validText }}</span>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
                <el-button type="primary" class="login-button" @click="submitForm(activeName === 'login' ? loginFormRef : registerFormRef)">{{ activeName === 'register' ? '注册' : '登录' }}</el-button>
            </div>
        </div>
    </div>
    <el-drawer
        v-model="dialog"
        title="修改密码"
        :before-close="handleClose"
        direction="ltr"
        class="demo-drawer"
    >
        <div class="demo-drawer__content">
            <el-form :model = "forgetForm" :rules = "forgetRulers" ref="forgetFormRef">
                <el-form-item prop="userName">
                    <el-input v-model="forgetForm.userName" placeholder="请输入用户名" :prefix-icon="UserFilled"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="forgetForm.password" placeholder="请输入新密码" :prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item prop="againPassWord">
                    <el-input type="password" v-model="forgetForm.againPassWord" placeholder="请再次输入新密码" :prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item prop="validCode">
                    <el-input v-model="forgetForm.validCode" placeholder="请输入验证码" :prefix-icon="Lock">
                        <template #append >
                            <span @click="forgetCountDownChange" style="cursor: pointer">{{ forgetCountDown.validText }}</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button @click="cancelForm">取消</el-button>
                <el-button type="primary" :loading="loading" @click="onClick(forgetFormRef)">
                    {{ loading ? '提交中 ...' : '提交' }}
                </el-button>
            </el-form>
        </div>
    </el-drawer>
</template>

<script setup>
import {ref, reactive,computed, toRaw} from 'vue';
import { UserFilled, Lock, Message, Iphone } from '@element-plus/icons-vue';
import { loginCode , registerCode, login ,register, getMenuList, forgetPasswordCode, resetPassword} from '../../api';
import { useRouter } from 'vue-router';
import { useStore} from 'vuex';

const router = useRouter();

// v-model绑定表单数据 登录
const loginForm = reactive({
    userName: '',
    password: '',
    validCode: '',
})

// v-model绑定表单数据 注册
const registerForm = reactive({
    userName: '',
    realName: '',
    password: '',
    number: '',
    email: '',
    phone: '',
    sex: '',
    departmentId: '',
    roleId: '',
    validCode: '',
    againPassWord: '',
})

// 忘记密码
const forgetForm = reactive({
    userName: '',
    validCode: '',
    password: '',
    againPassWord: '',
})

const dialog = ref(false)
const loading = ref(false)
const forgetFormRef = ref()

// 表单验证
const validateUser = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入手机号'))
    } else {
        const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
        phoneReg.test(value) ? callback() : callback(new Error('请输入正确的手机号'))
    }
}
const validatePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        const passwordReg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        passwordReg.test(value) ? callback() : callback(new Error('密码格式不对,请输入至少6位密码,包含大写字母,小写字母,数字'))
    }
}

const validateAgainPassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password && value !== forgetForm.password) {
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}

// 表单规则
const rules = {
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { validator:validatePassword, trigger: 'blur' }
    ],
    validCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' }
    ],
    realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    number: [
        { required: true, message: '请输入学号', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' }
    ],
    phone: [
        { validator:validateUser, trigger: 'blur' }
    ],
    againPassWord: [
        { validator:validateAgainPassword, trigger: 'blur' }
    ],

}

// 验证码
const countDown =  reactive({
    validText: '获取验证码',
    time: 60,
})
let flag = false;

const activeName = ref('login')

const countDownChange = () =>{
    // 防止多次被点击
    if(flag){
        return;
    }
    flag = true
    if(activeName.value === 'login')
    {
        if(loginForm.userName === '' ){
            ElMessage.error('请输入用户名')
            flag = false
            return;
        }

        loginCode({userName : loginForm.userName}).then(({data}) => {
            if(data.code === 200){
                ElMessage.success('验证码发送成功')
            }
        })
    }
    else
    {
        registerCode({phone : registerForm.phone}).then(({data}) => {
            if(data.code === 200){
                ElMessage.success('验证码发送成功')
            }
        })
    }
    // 倒计时
    const time =setInterval(() => {
      if (countDown.time <= 0) {
        countDown.time = 60
        countDown.validText = '获取验证码'
        flag = false
        clearInterval(time)
      } else {
        countDown.time--
        countDown.validText = countDown.time + '秒后重试'
      }
    }, 1000);
}

const handleClick = function(tab, event) {
    if(activeName.value === 'login'){
        registerForm.userName = ''
        registerForm.realName = ''
        registerForm.password = ''
        registerForm.number = ''
        registerForm.email = ''
        registerForm.phone = ''
        registerForm.sex = ''
        registerForm.departmentId = ''
        registerForm.roleId = ''
        registerForm.validCode = ''
        registerForm.againPassWord = ''
    }
    else{
        loginForm.userName = ''
        loginForm.password = ''
        loginForm.validCode = ''
    }
    //重置表单验证
    loginFormRef.value.resetFields()
    registerFormRef.value.resetFields()

    console.log(tab, event)
}


//登录请求
const loginFormRef = ref()
const registerFormRef = ref()
const store = useStore()
const routerList = computed(() => store.state.menu.routerList)

const submitForm = async (formRef) => {
    if(!formRef){
        return;
    }
    switch(activeName.value){
        case 'login':
            await formRef.validateField(['userName','password','validCode'],(valid,fields)=>{
                if(valid){
                    login({UserName:loginForm.userName,Password:loginForm.password,Code:loginForm.validCode}).then(({data}) =>{
                        if(data.code === 200){
                            ElMessage.success('登录成功')
                            // jwt存储
                            localStorage.setItem('SMSS_TOKEN','Bearer '+data.data.token)
                            localStorage.setItem('SMSS_USER_INFO',JSON.stringify(data.data.userInfo))
                            
                            console.log(data.data.userInfo)
                            // 获取菜单信息
                            getMenuList().then((res) => {
                                if(res.data.code === 200){
                                    store.commit("dynamicMenu",res.data.data)
                                    console.log(routerList,"routerList")
                                    toRaw(routerList.value).forEach(item => {
                                        router.addRoute('Home',item)
                                    })
                                    router.push('/')
                                }
                            })

                        }
                    })
                }else{
                    console.log(fields)
                }
            })
            break;
        case 'register':
            await formRef.validateField(['userName','realName','password','againPassWord','number','email','phone','sex','departmentId','roleId','validCode'],(valid,fields)=>{
                if(valid){
                    register({
                        UserName:registerForm.userName,
                        RealName:registerForm.realName,
                        Password:registerForm.password,
                        Number:registerForm.number,
                        Email:registerForm.email,
                        Phone:registerForm.phone,
                        Sex:registerForm.sex,
                        DepartmentId:registerForm.departmentId,
                        RoleId:registerForm.roleId,
                        Code:registerForm.validCode
                    }).then(({data}) =>{
                        if(data.code === 200){
                            ElMessage.success('注册成功,请登录')
                            handleClick('login',{})
                            activeName.value = 'login'
                            countDown.time = 60
                            countDown.validText = '获取验证码'
                            flag = false
                        }
                    })
                }
            })
            break;
        default:
            break;
    }
}

const onClick =  (forgetFormRef) => {
  loading.value = true
  setTimeout(async () => {
    if(!forgetFormRef){
        return;
    }
    await forgetFormRef.validate((valid, fields) =>{
        if(valid){
            resetPassword({UserName:forgetForm.userName,Code:forgetForm.validCode,NewPassword:forgetForm.password}).then((res) => {
                if(res.data.code === 200){
                    ElMessage.success('密码修改成功,请重新登录')
                    clearforgetForm()
                    dialog.value = false
                }
            })
        }else{
            console.log('error submit!!', fields);
        }
    })
    loading.value = false
  }, 400)
}
const handleClose = (done) => {
  if (loading.value) {
    return
  }
  ElMessageBox.confirm('是否确认关闭？')
    .then(() => {
        done()
        clearforgetForm()
    })
    .catch(() => {
      // catch error
    })
}

const cancelForm = () => {
  loading.value = false
  dialog.value = false
  clearTimeout(timer)
}

const forgetCountDown = reactive({
    validText: '获取验证码',
    time: 60,
})
var forgetFlag = false;
const forgetCountDownChange = () =>{
    // 防止多次被点击
    if(forgetFlag){
        return;
    }
    forgetFlag = true
    if(forgetForm.userName === '' ){
        ElMessage.error('请输入用户名')
        forgetFlag = false
        return;
    }

    // 发送验证码
    forgetPasswordCode(forgetForm.userName).then((rew)=>{
        if(rew.data.code === 200){
            ElMessage.success('验证码发送成功')
        }
    })
    // 倒计时
    const time =setInterval(() => {
      if (forgetCountDown.time <= 0) {
        forgetCountDown.time = 60
        forgetCountDown.validText = '获取验证码'
        forgetFlag = false
        clearInterval(time)
      } else {
        forgetCountDown.time--
        forgetCountDown.validText = forgetCountDown.time + '秒后重试'
      }
    }, 1000);
}
const forgetRulers = {
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    validCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' }
    ],
    password: [
        { validator:validatePassword, trigger: 'blur' }
    ],
    againPassWord: [
        { validator:validateAgainPassword, trigger: 'blur' },

    ],

}

const clearforgetForm = () => {
    forgetForm.userName = ''
    forgetForm.validCode = ''
    forgetForm.password = ''
    forgetForm.againPassWord = ''
}
</script>
