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
        <el-button class="btn-search" type="primary" @click="exportData()" style="width: 80px">导出</el-button>
        <span class="_label">开始时间：</span>
        <el-date-picker style="width: 200px" v-model="starTimeRef" type="datetime" placeholder="开始查询时间" format="YYYY-MM-DD"/>
        <span class="_label">结束时间：</span>
        <el-date-picker style="width: 200px" v-model="endTimeRef" type="datetime" placeholder="结束查询时间" format="YYYY-MM-DD"/>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="请输入岗位名称或学生姓名" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="id" label="序号" width="100"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="100"></el-table-column>
      <el-table-column prop="postName" show-overflow-tooltip label="岗位名称" width="100"></el-table-column>
      <el-table-column prop="date" label="考勤日期" width="150" ></el-table-column>
      <el-table-column prop="start_Time" label="开始时间" width="100"></el-table-column>
      <el-table-column prop="end_Time" label="结束时间" width="100"></el-table-column>
      <el-table-column prop="actual_Start_Time" label="实际开始时间" width="150"></el-table-column>
      <el-table-column prop="actual_End_Time" label="实际结束时间" width="150"></el-table-column>
      <el-table-column prop="status" show-overflow-tooltip label="状态" width="100">
        <template #default="scope">
          <span v-if="scope.row.status === 0">正常</span>
          <span v-else-if="scope.row.status === 1">迟到</span>
          <span v-else-if="scope.row.status === 2">早退</span>
          <span v-else-if="scope.row.status === 3">缺勤</span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" width="100"></el-table-column>

      <el-table-column fixed="right" label="操作" width="90">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">编辑</el-button>
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
    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑岗位信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="120px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label ="序号" prop = "id">
            <el-input v-model="formEdit.id" disabled></el-input>
          </el-form-item>
          <el-form-item label ="学生姓名" prop = "studentName">
            <el-input v-model="formEdit.studentName" disabled></el-input>
          </el-form-item>
          <el-form-item label ="岗位名称" prop = "postName">
            <el-input v-model="formEdit.postName" disabled></el-input>
          </el-form-item>
          <el-form-item label ="考勤日期" prop = "date">
            <el-input v-model="formEdit.date" disabled></el-input>
          </el-form-item>
          <el-form-item label ="开始时间" prop = "start_Time">
            <el-input v-model="formEdit.start_Time" disabled></el-input>
          </el-form-item>
          <el-form-item label ="结束时间" prop = "end_Time">
            <el-input v-model="formEdit.end_Time" disabled></el-input>
          </el-form-item>
          <el-form-item label ="实际开始时间" prop = "actual_Start_Time">
            <el-date-picker v-model="formEdit.actual_Start_Time" type="datetime" placeholder="请选择实际开始时间" format="YYYY-MM-DD HH:mm"></el-date-picker>
          </el-form-item>
          <el-form-item label ="实际结束时间" prop = "actual_End_Time">
            <el-date-picker v-model="formEdit.actual_End_Time" type="datetime" placeholder="请选择实际结束时间" format="YYYY-MM-DD HH:mm"></el-date-picker>
          </el-form-item>
          <el-form-item label ="状态" prop = "status">
            <el-select v-model="formEdit.status" placeholder="请选择状态">
              <el-option label="正常" :value="0"></el-option>
              <el-option label="迟到" :value="1"></el-option>
              <el-option label="早退" :value="2"></el-option>
              <el-option label="缺勤" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label ="备注" prop = "note">
            <el-input v-model="formEdit.note" type="textarea" :rows="2" maxlength="50" show-word-limit></el-input>
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
import {fetchAttendance,updateAttendance,exportAttendance } from '../../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ca } from 'element-plus/es/locales.mjs';
import { ElMessage } from 'element-plus';

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
    studentName: '',
    postName: '',
    date: '',
    start_Time: '',
    end_Time: '',
    actual_Start_Time: '',
    actual_End_Time: '',
    status: '',
    note: '',
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
  // 如果查询的开始时间不为空，则转换时间格式
  if(queryCondition.startDate){
      queryCondition.startDate = dayjs(queryCondition.startDate).format('YYYY-MM-DD')
  }
  // 如果查询的结束时间不为空，则转换时间格式
  if(queryCondition.endDate){
      queryCondition.endDate = dayjs(queryCondition.endDate).format('YYYY-MM-DD')
  }
  fetchAttendance(queryCondition).then(res => {
    const list = res.data.data
    list.forEach(item => {
      item.date = dayjs(item.date).format('YYYY-MM-DD')
      item.start_Time = dayjs(item.start_Time).format('HH:mm')
      item.end_Time = dayjs(item.end_Time).format('HH:mm')
      item.actual_Start_Time = dayjs(item.actual_Start_Time).format('YYYY-MM-DD HH:mm')
      item.actual_End_Time = dayjs(item.actual_End_Time).format('YYYY-MM-DD HH:mm')
    })
    tableData.list = list
    tableData.total = res.data.total
  })
}


const beforeCloseEdit = (action, instance) => {
    dialogVisibleEdit.value = false
}


const openedit = (row) =>{
    dialogVisibleEdit.value = true
    nextTick(()=>{
        formEdit.id = row.id
        formEdit.studentName = row.studentName
        formEdit.postName = row.postName
        formEdit.date = row.date
        formEdit.start_Time = row.start_Time
        formEdit.end_Time = row.end_Time
        formEdit.actual_Start_Time = row.actual_Start_Time
        formEdit.actual_End_Time = row.actual_End_Time
        formEdit.status = row.status
        formEdit.note = row.note
    })
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  await formEl.validate((valid,field) =>{
    if(valid){
      const params = {
        id: formEdit.id,
        actualStartTime: dayjs(formEdit.actual_Start_Time).format('YYYY-MM-DDTHH:mm'),
        actualEndTime: dayjs(formEdit.actual_End_Time).format('YYYY-MM-DDTHH:mm'),
        status: formEdit.status,
        note: formEdit.note,
      }
      updateAttendance(params).then(res => {
        if(res.data.code === 200){
          ElMessage.success('修改成功')
          dialogVisibleEdit.value = false
          formEdit.id = ''
          formEdit.studentName = ''
          formEdit.postName = ''
          formEdit.date = ''
          formEdit.start_Time = ''
          formEdit.end_Time = ''
          formEdit.actual_Start_Time = ''
          formEdit.actual_End_Time = ''
          formEdit.status = 0
          formEdit.note = ''
          getListData()
        }
      }).catch(err => {
        ElMessage.error('修改失败')
      })

    }else{
      ElMessage.error('请检查输入项')
    }
  })
}


const rules = {
    actual_Start_Time: [
      { required: true, message: '请选择实际开始时间', trigger: 'blur' },
    ],
    actual_End_Time: [
      { required: true, message: '请选择实际结束时间', trigger: 'blur'  },
    ],
    status: [
      { required: true, message: '请选择状态', trigger: 'blur' },
    ],
}

const exportData = () => {
  if(!queryCondition.startDate || !queryCondition.endDate){
    ElMessage.error('请选择开始时间和结束时间')
    return
  }
  const params = {
    startDate: dayjs(queryCondition.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(queryCondition.endDate).format('YYYY-MM-DD'),
    condition: queryCondition.condition,
  }
  exportAttendance(params).then(res => {
    try{
      const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(255, 255, 255, 0.7)',
      })
      setTimeout(() => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = '学生考勤记录' + dayjs(starTimeRef.value).format('YYYYMMDD') + '_' + dayjs(endTimeRef.value).format('YYYYMMDD') + '.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        ElMessage.success('导出成功')
        loading.close()
      }, 2000);
      
    }catch(err){
      ElMessage.error(err.message)
    }
  })
}

</script>