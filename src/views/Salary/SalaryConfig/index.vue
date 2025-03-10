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
        <el-button class="btn-search" type="primary" @click="openAdd()" style="width: 80px">新增</el-button>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="岗位名称" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    
    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="id" label="序号" ></el-table-column>
      <el-table-column prop="postName" label="岗位名称" width="200" ></el-table-column>
      <el-table-column prop="baseSalary" label="底薪(元/月)" ></el-table-column>
      <el-table-column prop="hourlyRate" label="薪资(元/小时)" ></el-table-column>
      <el-table-column prop="latePenalty" label="迟到扣款(元)" ></el-table-column>
      <el-table-column prop="absencePenalty" label="缺勤扣款(元)" ></el-table-column>
      <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deleteInfo(scope.row)">删除</el-button>
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

    <el-dialog v-model = 'dialogVisibleAdd' :before-close = 'beforeCloseAdd' title = '添加薪资配置信息' width = '500px'> 
      <el-form ref="formAddRef" label-width="110px" label-position="left" :model="formAdd" :rules="rules">
          <el-form-item label = "岗位名称" prop = "postId">
            <el-select v-model="formAdd.postId" filterable placeholder="请选择岗位名称" style="width: 240px">
              <el-option v-for="item in postList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label = "底薪(元/月)" prop = "baseSalary">
            <el-input v-model="formAdd.baseSalary"></el-input>
          </el-form-item>
          <el-form-item label = "薪资(元/小时)" prop = "hourlyRate">
            <el-input v-model="formAdd.hourlyRate"></el-input>
          </el-form-item>
          <el-form-item label = "迟到扣款(元)" prop = "latePenalty">
            <el-input v-model="formAdd.latePenalty"></el-input>
          </el-form-item>
          <el-form-item label = "缺勤扣款(元)" prop = "absencePenalty">
            <el-input v-model="formAdd.absencePenalty"></el-input>
          </el-form-item>
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formAddRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑薪资配置信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="120px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label = "序号" prop = "id">
            <el-input v-model="formEdit.id" disabled></el-input>
          </el-form-item>
          <el-form-item label = "岗位ID" prop = "postId">
            <el-input v-model="formEdit.postId" disabled></el-input>
          </el-form-item>
          <el-form-item label = "岗位名称" prop = "postName">
            <el-input v-model="formEdit.postName" disabled></el-input>
          </el-form-item>
          <el-form-item label = "底薪(元/月)" prop = "baseSalary">
            <el-input v-model="formEdit.baseSalary"></el-input>
          </el-form-item>
          <el-form-item label = "薪资(元/小时)" prop = "hourlyRate">
            <el-input v-model="formEdit.hourlyRate"></el-input>
          </el-form-item>
          <el-form-item label = "迟到扣款(元)" prop = "latePenalty">
            <el-input v-model="formEdit.latePenalty"></el-input>
          </el-form-item>
          <el-form-item label = "缺勤扣款(元)" prop = "absencePenalty">
            <el-input v-model="formEdit.absencePenalty"></el-input>
          </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmEdit(formEditRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive ,onMounted ,ref, nextTick} from 'vue';
import { querySalaryConfigs, deleteSalaryConfig, updateSalaryConfig, addSalaryConfig , queryPostNames} from '../../../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { fi } from 'element-plus/es/locales.mjs';

dayjs.extend(utc);

// 搜索条件
const conditionRef = ref('')

// 添加弹窗状态
const dialogVisibleAdd = ref(false)
// 编辑弹窗状态
const dialogVisibleEdit = ref(false)

// 添加弹窗表单数据
const formAdd = reactive({
    postId: '',
    baseSalary: '',
    hourlyRate: '',
    latePenalty: '',
    absencePenalty: '',
})
// 编辑弹窗表单数据
const formEdit = reactive({
    id: '',
    postId : '',
    postName: '',
    baseSalary: '',
    hourlyRate: '',
    latePenalty: '',
    absencePenalty: '',
})
// 添加弹窗表单实例
const formAddRef = ref(null)
// 编辑弹窗表单实例
const formEditRef = ref(null)


//列表数据
const tableData = reactive({
    list:[],
    total:0
})

//岗位列表
let postList = ref([])

// 查询条件数据
const queryCondition = reactive({
  condition: conditionRef,
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
    queryPostNames().then(res => {
      console.log(res.data.data)
      postList = res.data.data
    })
})

// 获取列表数据
const getListData = () => {
    querySalaryConfigs(queryCondition).then(res => {
        tableData.list = res.data.data
        tableData.total = res.data.total
    })
}

const beforeCloseAdd = (action, instance) => {
    dialogVisibleAdd.value = false
}

const beforeCloseEdit = (action, instance) => {
    dialogVisibleEdit.value = false
}

// 打开弹窗
const openAdd = () =>{
    dialogVisibleAdd.value = true
}
const openedit = (row) =>{
    dialogVisibleEdit.value = true
    nextTick(() => {
        formEdit.id = row.id
        formEdit.postId = row.postId
        formEdit.postName = row.postName
        formEdit.baseSalary = row.baseSalary
        formEdit.hourlyRate = row.hourlyRate
        formEdit.latePenalty = row.latePenalty
        formEdit.absencePenalty = row.absencePenalty
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return
  await formEl.validate((valid,fields) => {
      if (valid) {
        console.log(formAdd)
          addSalaryConfig(formAdd).then(() => {
            ElMessage.success('添加成功')
            dialogVisibleAdd.value = false
            getListData()
            clearFormAdd()
          })
      }else{
        ElMessage.error('请检查输入内容')
        console.log('error submit!!', fields)
      }
  })
}

//修改
const confirmEdit = async (formEl) => {
   if(!formEl) return
   await formEl.validate((valid,fields) => {
      if (valid) {
          updateSalaryConfig(formEdit).then(() => {
            ElMessage.success('修改成功')
            dialogVisibleEdit.value = false
            getListData()
          })
      }else{
        ElMessage.error('请检查输入内容')
        console.log('error submit!!', fields)
      }
   })
}


const rules = {
  postId: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
  ],
  baseSalary: [
    { required: true, message: '请输入底薪', trigger: 'blur' },
  ],
  hourlyRate: [
    { required: true, message: '请输入每小时工资', trigger: 'blur' },
  ],
  latePenalty: [
    { required: true, message: '请输入迟到扣款', trigger: 'blur' },
  ],
  absencePenalty: [
    { required: true, message: '请输入缺勤扣款', trigger: 'blur' },
  ],
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSalaryConfig(row.id).then(() => {
      ElMessage.success('删除成功') 
      getListData()
    })
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}

// 清空添加弹窗表单数据
const clearFormAdd = () => {
  formAdd.postId = ''
  formAdd.baseSalary = ''
  formAdd.hourlyRate = ''
  formAdd.latePenalty = ''
  formAdd.absencePenalty = ''
}

</script>