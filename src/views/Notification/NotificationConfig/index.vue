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
        <el-input v-model="conditionRef" style="width: 240px" placeholder="岗位名称" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="configId" label="序号" width="100"></el-table-column>
      <el-table-column prop="serviceType" label="服务类型" width="180">
        <template #default="scope">{{ scope.row.serviceType === 1 ? '短信' : '邮件' }}</template>
      </el-table-column>
      <el-table-column prop="providerName" label="服务商" width="180"></el-table-column>
      <el-table-column prop="apiKey" show-overflow-tooltip label="API Key" width="180"></el-table-column>
      <el-table-column prop="templateId" label="模板ID" width="180"></el-table-column>
      <el-table-column prop="sender" show-overflow-tooltip label="签名" width="100"></el-table-column>
      <el-table-column prop="isDefault" label="默认配置" width="100">
        <template #default="scope">{{ scope.row.isDefault === true ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="180"></el-table-column>
      <el-table-column prop="accessKeyId" show-overflow-tooltip label="AccessKeyId" width="180"></el-table-column>
      <el-table-column prop="accessKeySecret" show-overflow-tooltip label="AccessKeySecret" width="180"></el-table-column>
      <el-table-column prop="providerUrl" label="服务商URL" width="180"></el-table-column>
      <el-table-column prop="iv" label="IV" show-overflow-tooltip width="180"></el-table-column>
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

    <el-dialog v-model = 'dialogVisibleAdd' :before-close = 'beforeCloseAdd' title = '添加配置信息' width = '500px'> 
      <el-form ref="formAddRef" label-width="150px" label-position="left" :model="formAdd" :rules="rules">

              <el-form-item label="服务商" prop="providerName">
                  <el-input v-model="formAdd.providerName"></el-input>
              </el-form-item>
              <el-form-item label="服务类型" prop="serviceType">
                  <el-radio-group v-model="formAdd.serviceType">
                    <el-radio :value="0">邮件</el-radio>
                    <el-radio :value="1">短信</el-radio>
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="模板ID" prop="templateId">
                  <el-input v-model="formAdd.templateId"></el-input>
              </el-form-item>
              <el-form-item label="签名" prop="sender">
                  <el-input v-model="formAdd.sender"></el-input>
              </el-form-item>
              <el-form-item label="默认配置" prop="isDefault">
                <el-radio-group v-model="formAdd.isDefault">
                  <el-radio :value=false>否</el-radio>
                  <el-radio :value=true>是</el-radio>
              </el-radio-group>
              </el-form-item>
              <el-form-item label="AccessKeyId" prop="accessKeyId">
                  <el-input v-model="formAdd.accessKeyId"></el-input>
              </el-form-item>
              <el-form-item label="AccessKeySecret" prop="accessKeySecret">
                  <el-input v-model="formAdd.accessKeySecret"></el-input>
              </el-form-item>
              <el-form-item label="服务商URL" prop="providerUrl">
                  <el-input v-model="formAdd.providerUrl"></el-input>
              </el-form-item>
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formAddRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑岗位信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="150px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label="序号" prop="configId">
              <el-input v-model="formEdit.configId" disabled></el-input>
          </el-form-item>
          <el-form-item label="服务商" prop="providerName">
              <el-input v-model="formEdit.providerName"></el-input>  
          </el-form-item>
          <el-form-item label="服务类型" prop="serviceType">
              <el-radio-group v-model="formEdit.serviceType">
                  <el-radio :value="0">邮件</el-radio>
                  <el-radio :value="1">短信</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="formEdit.templateId"></el-input>
          </el-form-item>
          <el-form-item label ="API Key" prop="apiKey">
              <el-input v-model="formEdit.apiKey" disabled></el-input>
          </el-form-item>
          <el-form-item label="签名" prop="sender">
              <el-input v-model="formEdit.sender"></el-input>
          </el-form-item>
          <el-form-item label="默认配置" prop="isDefault">
              <el-radio-group v-model="formEdit.isDefault">
                  <el-radio :value=false>否</el-radio>
                  <el-radio :value=true>是</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="AccessKeyId" prop="accessKeyId">
              <el-input v-model="formEdit.accessKeyId"></el-input>
          </el-form-item>
          <el-form-item label="AccessKeySecret" prop="accessKeySecret">
              <el-input v-model="formEdit.accessKeySecret"></el-input>
          </el-form-item>
          <el-form-item label="服务商URL" prop="providerUrl">
              <el-input v-model="formEdit.providerUrl"></el-input>
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
import {queryNoticeConfig, addNoticeConfig, deleteNoticeConfig, updateNoticeConfig } from '../../../api';
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
  providerName:'',
  serviceType:0,
  templateId:'',
  sender:'',
  isDefault:false,
  accessKeyId:'',
  accessKeySecret:'',
  providerUrl:''  

})
// 编辑弹窗表单数据
const formEdit = reactive({
  configId:'',
  providerName:'',
  serviceType:0,
  templateId:'',
  sender:'',
  isDefault:false,
  accessKeyId:'',
  accessKeySecret:'',
  providerUrl:'',
  apiKey:''
    
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
  queryNoticeConfig(queryCondition).then(res => {
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
      formEdit.configId = row.configId
      formEdit.providerName = row.providerName
      formEdit.serviceType = row.serviceType
      formEdit.templateId = row.templateId
      formEdit.sender = row.sender
      formEdit.isDefault = row.isDefault
      formEdit.accessKeyId = row.accessKeyId
      formEdit.providerUrl = row.providerUrl
      formEdit.apiKey = row.apiKey
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addNoticeConfig(formAdd).then(res => {
        if(res.data.code === 200){
          ElMessage.success(res.data.message)
          dialogVisibleAdd.value = false
          formAdd.providerName = ''
          formAdd.serviceType = 0
          formAdd.templateId = ''
          formAdd.sender = ''
          formAdd.isDefault = false
          formAdd.accessKeyId = ''
          formAdd.accessKeySecret = ''
          formAdd.providerUrl = ''
          nextTick(() => {
            getListData()
          })
        }
      })
    } else {
      ElMessage.error('请检查输入项')
    }
  })
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      updateNoticeConfig(formEdit).then(res => {
        if(res.data.code === 200){
          ElMessage.success(res.data.message)
          dialogVisibleEdit.value = false
          formEdit.providerName = ''
          formEdit.serviceType = 0
          formEdit.templateId = ''
          formEdit.sender = ''
          formEdit.isDefault = false
          formEdit.accessKeyId = ''
          formEdit.accessKeySecret = ''
          formEdit.providerUrl = ''
          nextTick(() => {
            getListData()
          })
        }
      })
    } else {
      ElMessage.error('请检查输入项')
    }
  })
  
}


const rules = {
  providerName: [
    { required: true, message: '请选择服务商', trigger: 'blur' }
  ],
  serviceType: [
    { required: true, message: '请选择服务类型', trigger: 'blur' }
  ],
  templateId: [
    { required: true, message: '请输入模板ID', trigger: 'blur' }
  ],
  sender: [
    { required: true, message: '请输入签名', trigger: 'blur' }
  ],
  isDefault: [
    { required: true, message: '请选择默认配置', trigger: 'blur' }
  ],
  accessKeyId: [
    { required: true, message: '请输入AccessKeyId', trigger: 'blur' }
  ],
  accessKeySecret: [
    { required: true, message: '请输入AccessKeySecret', trigger: 'blur' }
  ],
  providerUrl: [
    { required: true, message: '请输入服务商URL', trigger: 'blur' }
  ],
  
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
      deleteNoticeConfig(row.configId).then(res => {
        if(res.data.code === 200){
          ElMessage.success(res.data.message)
          nextTick(() => {
            getListData()
          })
        }
      })
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}
</script>