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
        <el-button class="btn-search" type="primary" @click="openAdd()" style="width: 80px">新增</el-button>
        <span class="_label">开始时间：</span>
        <el-date-picker style="width: 200px" v-model="starTimeRef" type="datetime" placeholder="开始查询时间" format="YYYY-MM-DD"/>
        <span class="_label">结束时间：</span>
        <el-date-picker style="width: 200px" v-model="endTimeRef" type="datetime" placeholder="结束查询时间" format="YYYY-MM-DD"/>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="模版名称" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="templateId" label="序号" width="100"></el-table-column>
      <el-table-column prop="templateName" label="模板名称" width="200"></el-table-column>
      <el-table-column prop="templateType" label="模板类型" width="300">
        <template #default="scope">
          <template v-if="scope.row.templateType === 0">邮件</template>
          <template v-else>短信</template>
        </template>
      </el-table-column>
      <el-table-column prop="content" show-overflow-tooltip label="模板内容" width="500"></el-table-column>
      <el-table-column prop="isEnabled" label="是否启用" width="200">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.isEnabled === true">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="200"></el-table-column>
      <el-table-column prop="filed" label="替换字段" width="200"></el-table-column>
      <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deleteInfo(scope.row)">禁用</el-button>
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

    <el-dialog v-model = 'dialogVisibleAdd' :before-close = 'beforeCloseAdd' title = '添加岗位信息' width = '500px'> 
      <el-form ref="formAddRef" label-width="100px" label-position="left" :model="formAdd" :rules="rules">
        <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="formAdd.templateName" clearable placeholder="请输入模板名称"></el-input>
          </el-form-item>
          <el-form-item label="模板类型" prop="templateType">
             <el-radio-group v-model="formAdd.templateType">
                <el-radio :value="0">邮件</el-radio>
                <el-radio :value="1">短信</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="模板内容" prop="content">
             <el-input v-model="formAdd.content" clearable placeholder="请输入模板内容"></el-input>
          </el-form-item>
          <el-form-item label="是否启用" prop="isEnable">
            <el-switch v-model="formAdd.isEnable" active-color="#13ce66" inactive-color="#ff4949">
                <span slot="open">启用</span>
                <span slot="close">禁用</span>
            </el-switch>
          </el-form-item>
          <el-form-item label="替换字段" prop="field">
             <el-input v-model="formAdd.field" clearable placeholder="请输入替换字段"></el-input>
          </el-form-item>
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formAddRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑岗位信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="100px" label-position="left" :model="formEdit" :rules="rules">
        <el-form-item label="模板ID" prop="templateId">
            <el-input v-model="formEdit.templateId" clearable disabled></el-input>
        </el-form-item>  
        <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="formEdit.templateName" clearable placeholder="请输入模板名称" disabled></el-input>
          </el-form-item>
          <el-form-item label="模板类型" prop="templateType">
             <el-radio-group v-model="formEdit.templateType" disabled>
                <el-radio :value="0">邮件</el-radio>
                <el-radio :value="1">短信</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="模板内容" prop="content">
             <el-input v-model="formEdit.content" clearable placeholder="请输入模板内容"></el-input>
          </el-form-item>
          <el-form-item label="是否启用" prop="isEnable">
            <el-switch v-model="formEdit.isEnable" active-color="#13ce66" inactive-color="#ff4949">
                <span slot="open">启用</span>
                <span slot="close">删除</span>
            </el-switch>
          </el-form-item>
          <el-form-item label="替换字段" prop="field">
             <el-input v-model="formEdit.field" clearable placeholder="请输入替换字段"></el-input>
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
import {queryNoticeTemplates , addNoticeTemplate, deleteNoticeTemplate, updateNoticeTemplate} from '../../../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// 开始时间
const starTimeRef = ref('')
// 结束时间
const endTimeRef = ref('')
// 搜索条件
const conditionRef = ref('')

// 添加弹窗状态
const dialogVisibleAdd = ref(false)
// 编辑弹窗状态
const dialogVisibleEdit = ref(false)

// 添加弹窗表单数据
const formAdd = reactive({
    templateName: '',
    templateType: 0,
    content: '',
    isEnable: true,
    field: ''

})
// 编辑弹窗表单数据
const formEdit = reactive({
    templateId: '',
    templateName: '',
    templateType: 0,
    content: '',
    isEnable: true,
    field: ''
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
    queryNoticeTemplates(queryCondition).then(res => {
        const list = res.data.data
        list.forEach(item => {
            item.createdTime = dayjs(item.createdTime).format('YYYY-MM-DD HH:mm:ss')
        })
        tableData.list = list
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
        formEdit.templateId = row.templateId
        formEdit.templateName = row.templateName
        formEdit.templateType = row.templateType
        formEdit.content = row.content
        formEdit.isEnable = row.isEnabled
        formEdit.field = row.field
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log(formAdd)
      addNoticeTemplate(formAdd).then(res => {
        if(res.data.code === 200){
          dialogVisibleAdd.value = false
          formAdd.templateName = ''
          formAdd.templateType = ''
          formAdd.content = ''
          formAdd.isEnable = true
          formAdd.field = ''
          getListData()
        }
      })
    } else {
      console.log('error submit!!');
      return false;
    }
  })
  
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log(formEdit)
      updateNoticeTemplate(formEdit).then(res => {
        if(res.data.code === 200){
          ElMessage.success('修改成功')
          dialogVisibleEdit.value = false
          formEdit.templateId = ''
          formEdit.templateName = ''
          formEdit.templateType = ''
          formEdit.content = ''
          formEdit.isEnable = true
          formEdit.field = ''
          getListData()
        }
      })
    } else {
      console.log('error submit!!');
      return false;
    }
  })
  
}


const rules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
  ],
  templateType: [
    { required: true, message: '请选择模板类型', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' },
  ],
  isEnable: [
    { required: true, message: '请选择是否启用', trigger: 'blur' }
  ],
  field: [
    { required: true, message: '请输入替换字段', trigger: 'blur' },
  ]
  
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
      deleteNoticeTemplate(row.templateId).then(res => {
        if(res.data.code === 200){
          ElMessage.success('禁用成功')
          getListData()
        } else {
          ElMessage.error('禁用失败')
        }
      })

  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}
</script>