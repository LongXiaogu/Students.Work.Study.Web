<style lang="less" scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .el-date-picker-date {
    flex-wrap: wrap;
    row-gap: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    padding: 0 10px;

    ._label {
      white-space: nowrap;
    }

    .filter-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }

  .el-table {
    flex: 1;
    overflow: auto;
  }

  .pagination-block {
    margin-top: 10px;
    padding: 8px;
    background: #fff;
  }
}
</style>

<template>
  <div class="container">
    <div class="el-date-picker-date">
      <div class="filter-left">
        <el-button class="btn-search" type="primary" @click="open()" style="width: 80px">新增</el-button>
        <span class="_label">开始时间：</span>
        <el-date-picker style="width: 200px" v-model="starTimeRef" type="datetime" placeholder="开始查询时间" format="YYYY-MM-DD"/>
        <span class="_label">结束时间：</span>
        <el-date-picker style="width: 200px" v-model="endTimeRef" type="datetime" placeholder="结束查询时间" format="YYYY-MM-DD"/>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="查询学号(工号)或真实姓名" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="id" label="序号" width="60" />
      <el-table-column prop="number" label="学号" width="120" />
      <el-table-column prop="userName" label="用户名" width="300" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="sex" label="性别" width="60" />
      <el-table-column prop="email" label="邮箱" width="300" />
      <el-table-column prop="phoneNumber" label="电话号码" width="120" />
      <el-table-column prop="lockoutEnd" label="锁定截止时间" width="240" />
      <el-table-column prop="age" label="年龄" width="60" />
      <el-table-column prop="departmentId" show-overflow-tooltip label="部门" width="120" />
      <el-table-column prop="roleId" show-overflow-tooltip label="角色" width="120" />
      <el-table-column prop="isActive" label="状态" width="120" >
        <template #default="scope">
            <el-tag :type="scope.row.isActive === true? 'success' : 'danger'">{{ scope.row.isActive ? '生效' : '失效' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createDate" label="创建时间" width="240" />
      <el-table-column prop="updateDate" label="修改时间" width="240" />
      <el-table-column fixed="right" label="操作" width="160">
            <template #default="scope">
                <el-button type="primary" @click="openedit(scope.row)">编辑</el-button>
                <el-button type="danger" @click="deleteUser(scope.row)">禁用</el-button>
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-block">
      <el-pagination
        v-model:current-page="queryCondition.pageIndex"
        v-model:page-size="queryCondition.pageSize"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog v-model = 'dialogVisible' :before-close = 'beforeClose' title = '添加用户信息' width = '500px'> 
      <el-form ref="formRef" label-width="100px" label-position="left" :model="form" :rules="rules">
        <el-form-item prop="userName" label="用户名">
            <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="realName" label="真实姓名">
            <el-input v-model="form.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
            <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="number" label="学号">
            <el-input v-model="form.number" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="phoneNumber" label="手机号">
            <el-input v-model="form.phoneNumber" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="sex" label="性别">
            <el-radio-group v-model="form.sex">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item prop="age" label="年龄">
            <el-input v-model="form.age" placeholder="请输入年龄"></el-input>
        </el-form-item>
        <el-form-item prop="departmentId" label="部门">
            <el-select v-model="form.departmentId" placeholder="请选择部门">
                <el-option label="航空制造与工程学部" value="1"></el-option>
                <el-option label="电子信息与自动化学部" value="2"></el-option>
                <el-option label="经济管理学部" value="3"></el-option>
                <el-option label="航空服务与传媒学部" value="4"></el-option>
                <el-option label="文学与体育学部" value="5"></el-option>
                <el-option label="计算机学部" value="6"></el-option>
                <el-option label="马克思主义学院" value="7"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="isActive" label="状态">
            <el-radio-group v-model="form.isActive">
                <el-radio :value="false">失效</el-radio>
                <el-radio :value="true">生效</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item prop="roleId" label="角色">
            <el-select v-model="form.roleId" placeholder="请选择角色">
                <el-option label="管理员" value="1"></el-option>
                <el-option label="教师" value="2"></el-option>
                <el-option label="学生" value="3"></el-option>
                <el-option label="游客" value="6"></el-option>
            </el-select>
        </el-form-item>                
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formRef)">确认</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model = 'dialogVisible2' :before-close = 'beforeClose2' title = '编辑用户信息' width = '500px'> 
      <el-form ref="formRef2" label-width="100px" label-position="left" :model="form2" :rules="rules">
        <el-form-item prop="id" label="序号">
          <el-input v-model="form2.id" disabled></el-input>
        </el-form-item>
        <el-form-item prop="userName" label="用户名">
            <el-input v-model="form2.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="realName" label="真实姓名">
            <el-input v-model="form2.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item prop="number" label="学号">
            <el-input v-model="form2.number" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
            <el-input v-model="form2.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="phoneNumber" label="手机号">
            <el-input v-model="form2.phoneNumber" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="sex" label="性别">
            <el-radio-group v-model="form2.sex">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item prop="age" label="年龄">
            <el-input v-model="form2.age" placeholder="请输入年龄"></el-input>
        </el-form-item>
        <el-form-item prop="departmentId" label="部门">
            <el-select v-model="form2.departmentId" placeholder="请选择部门">
                <el-option label="航空制造与工程学部" value="1"></el-option>
                <el-option label="电子信息与自动化学部" value="2"></el-option>
                <el-option label="经济管理学部" value="3"></el-option>
                <el-option label="航空服务与传媒学部" value="4"></el-option>
                <el-option label="文学与体育学部" value="5"></el-option>
                <el-option label="计算机学部" value="6"></el-option>
                <el-option label="马克思主义学院" value="7"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="isActive" label="状态">
            <el-radio-group v-model="form2.isActive">
                <el-radio :value="false">失效</el-radio>
                <el-radio :value="true">生效</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item prop="roleId" label="角色">
            <el-select v-model="form2.roleId" placeholder="请选择角色">
                <el-option label="管理员" value="1"></el-option>
                <el-option label="教师" value="2"></el-option>
                <el-option label="学生" value="3"></el-option>
                <el-option label="游客" value="6"></el-option>
            </el-select>
        </el-form-item>       
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmEdit(formRef2)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive ,onMounted ,ref, nextTick} from 'vue';
import { querytUsers, createUser ,updateUser,disableUser} from '../../api';
import dayjs from 'dayjs';

const starTimeRef = ref('')
const endTimeRef = ref('')
const conditionRef = ref('')
const formRef = ref(null)

const formRef2 = ref(null)

// 表单数据
const form = reactive({
    userName: '',
    realName: '',
    password: '',
    number: '',
    email: '',
    phoneNumber: '',
    sex: '',
    departmentId: '',
    roleId: '',
    isActive: '',
    age: '',
    lockoutEnd: '',
    createDate: '',
    updateDate: ''
})

const form2 = reactive({
    id: '',
    userName: '',
    realName: '',
    number: '',
    email: '',
    phoneNumber: '',
    sex: '',
    age: '',
    departmentId: '',
    roleId: '',
    isActive: '',
    createDate: '',
    updateDate: ''
})

//列表数据
const tableData = reactive({
    list:[],
    total:0
})

// 查询条件数据
const queryCondition = reactive({
  condition: conditionRef,
  startDate: starTimeRef,
  endDate: endTimeRef,
  pageIndex: 1,
  pageSize: 10,
});

const handleSizeChange = (size) => {
    queryCondition.pageSize = size
    getListData()

}

const handleCurrentChange = (currentPage) => {
    queryCondition.pageIndex = currentPage
    getListData()
}

onMounted(()=>{
  getListData();
})

// 获取列表数据
const getListData = () => {
    console.log({
      condition: queryCondition.condition,
      startTime: queryCondition.starTime,
      endTime: queryCondition.endTime,
      pageIndex: queryCondition.pageIndex,
      pageSize: queryCondition.pageSize
  })
  querytUsers(queryCondition).then(res => {
      console.log(res.data.data);
      console.log(res.data.total);
      const list = res.data.data;
      const total = res.data.total;
      list.forEach(item => {
        if(item.lockoutEnd != null)
          item.lockoutEnd = dayjs(item.lockoutEnd).format('YYYY-MM-DD HH:mm:ss');
        item.createDate = dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss');
        item.updateDate = dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss');
        switch (item.departmentId){
            case 1:
                item.departmentId = '航空制造与工程学部'
                break;
            case 2:
                item.departmentId = '电子信息与自动化学部'
                break;
            case 3:
                item.departmentId = '经济管理学部'
                break;
            case 4:
                item.departmentId = '航空服务与传媒学部'
                break;
            case 5:
                item.departmentId = '文学与体育学部'
                break;
            case 6:
                item.departmentId = '计算机学部'
                break;
            case 7:
                item.departmentId = '马克思主义学院'
                break;
            default:
                item.departmentId = '未知'
        }
        switch (item.roleId){
            case 1:
                item.roleId = '管理员'
                break;
            case 2:
                item.roleId = '教师'
                break;
            case 3:
                item.roleId = '学生'
                break;
            case 6:
                item.roleId = '游客'
                break;
            default:
                item.roleId = '未知'
        }
      })
      
      tableData.list = list
      tableData.total = total
  })
}

//弹窗
const dialogVisible = ref(false)
const beforeClose = (action, instance) => {
    dialogVisible.value = false
}
const dialogVisible2 = ref(false)
const beforeClose2 = (action, instance) => {
    dialogVisible2.value = false
}

// 打开弹窗
const open = () =>{
    dialogVisible.value = true
}
const openedit = (row) =>{
    dialogVisible2.value = true
    nextTick(() => {
        if (row) {
            form2.id = row.id
            form2.userName = row.userName
            form2.realName = row.realName
            form2.number = row.number
            form2.email = row.email
            form2.phoneNumber = row.phoneNumber
            form2.sex = row.sex
            form2.age = row.age
            form2.isActive = row.isActive
            form2.createDate = row.createDate
            form2.updateDate = row.updateDate
        }
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return;
  await formEl.validate((valid, fields) => {
    if(valid){
      form.createDate = dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      form.updateDate = dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      createUser(form).then(res =>{
        if(res.data.code === 200){
          dialogVisible.value = false
          getListData()
          clearForm()
          ElMessage.success({
            message: res.data.message,
          })
        }
      })
    }else{
      console.log('error submit!!', fields);
    }
  })
}
//修改
const confirmEdit = async (formEl) => {
  console.log(form2)
  if(!formEl) return;
  await formEl.validate((valid, fields) => {
    if(valid){
      form2.updateDate = dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      form2.createDate = dayjs(form2.createDate).format('YYYY-MM-DDTHH:mm:ss[Z]')
      updateUser(form2).then(res =>{
        if(res.data.code === 200){
          dialogVisible2.value = false
          getListData()
          ElMessage.success({
            message: res.data.message,
          })
        }
      })
    }else{
      console.log('error submit!!', fields);
    }
  })
}

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

const rules = {
  userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, validator:validatePassword, trigger: 'blur' }
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
    phoneNumber: [
        { required: true, validator:validateUser, trigger: 'blur' }
    ],
    sex: [
        { required: true, message: '请选择性别', trigger: 'change' }
    ],
    departmentId: [
        { required: true, message: '请选择部门', trigger: 'change' }
    ],
    roleId: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ],
    isActive: [
        { required: true, message: '请选择状态', trigger: 'change' }
    ],
    age: [
        { required: true, message: '请输入年龄', trigger: 'blur' }
    ]
}

const deleteUser = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    disableUser(row.id).then(res => {
      if (res.data.code === 200) {
        getListData();
        ElMessage.success({
          message: res.data.message,
        });
      }
    });
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}

// 清空添加表单
const clearForm = () => {
  form.userName = ''
  form.realName = ''
  form.password = ''
  form.number = ''
  form.email = ''
  form.phoneNumber = ''
  form.sex = ''
  form.departmentId = ''
  form.roleId = ''
  form.isActive = ''
  form.age = ''
}

</script>