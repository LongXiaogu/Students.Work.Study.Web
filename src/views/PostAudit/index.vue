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
      <el-table-column prop="id" label="序号" width="200"></el-table-column>
      <el-table-column prop="title" label="岗位名称" width="200"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="200"></el-table-column>
      <el-table-column prop="applyDate" label="申请日期" width="200"></el-table-column>
      <el-table-column prop="responseDate" label="回复日期" width="200"></el-table-column>
      <el-table-column prop="isPass" label="是否通过" width="200">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.isPass">通过</el-tag>
          <el-tag type="danger" v-else>未通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="responseMessage" label="回复信息" width="200"></el-table-column>
      <el-table-column show-overflow-tooltip prop="applyMessage" label="申请信息" width="200"></el-table-column>

      <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">审核</el-button>
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

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '审核' width = '500px'> 
      <el-form ref="formEditRef" label-width="150px" label-position="left" :model="formEdit" :rules="rules">
        <el-form-item label="序号">
          <el-input v-model="formEdit.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="formEdit.title" disabled></el-input>
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="formEdit.studentName" disabled></el-input>
        </el-form-item>
        <el-form-item label="申请信息">
          <el-input type="textarea" v-model="formEdit.applyMessage" disabled></el-input>
        </el-form-item>
        <el-form-item label="回复信息">
          <el-input type="textarea" maxlength="200" :rows="5" show-word-limit v-model="formEdit.responseMessage" placeholder="请输入回复信息"></el-input>
        </el-form-item>
        <el-form-item label="是否通过">
          <el-radio-group v-model="formEdit.isPass">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">未通过</el-radio>
          </el-radio-group>
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
import  {getApplyPositions ,auditApplyPosition} from '../../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// 开始时间
const starTimeRef = ref('')
// 结束时间
const endTimeRef = ref('')
// 搜索条件
const conditionRef = ref('')
// 编辑弹窗状态
const dialogVisibleEdit = ref(false)

// 编辑弹窗表单数据
const formEdit = reactive({
  id: '',
  title: '',
  studentName: '',
  applyMessage: '',
  responseMessage: '',
  isPass: false,
})

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
  getApplyPositions(queryCondition).then(res => {
    const list = res.data.data.map(item => {
      item.applyDate = dayjs(item.applyDate).format('YYYY-MM-DD HH:mm:ss')
      item.responseDate = item.responseDate !== "0001-01-01T00:00:00" ? dayjs(item.responseDate).format('YYYY-MM-DD HH:mm:ss') : ''
      return item
    })

    tableData.list = list

    tableData.total = res.data.total
  })
  
}


const beforeCloseEdit = (action, instance) => {
    dialogVisibleEdit.value = false
}

// 打开弹窗
const openedit = (row) =>{
    dialogVisibleEdit.value = true
    nextTick(() => {
        formEdit.id = row.id
        formEdit.title = row.title
        formEdit.studentName = row.studentName
        formEdit.applyMessage = row.applyMessage
        formEdit.responseMessage = row.responseMessage
        formEdit.isPass = row.isPass
    })
}


//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  await formEl.validate((valid,fields) => {
    if(valid){
      const data = {
        applyId : formEdit.id,
        message : formEdit.responseMessage,
        isPass : formEdit.isPass,
      }

      console.log(data)
      auditApplyPosition(data).then(res => {
        if(res.data.code === 200){
          dialogVisibleEdit.value = false
          ElMessage.success('操作成功')
          formEdit.responseMessage = ''
          formEdit.isPass = false
          getListData()
        }
      })
    }else{
      ElMessage.error('请检查输入项')
    }
  })
}


const rules = {
  responseMessage: [
    { required: true, message: '请输入回复信息', trigger: 'blur' },
    { type: 'number', message: '请输入数字', trigger: 'blur' },
    { type: 'string', message: '请输入字符串', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' },
  ],
  isPass: [
    { required: true, message: '请选择是否通过', trigger: 'change' },
  ],

}
</script>