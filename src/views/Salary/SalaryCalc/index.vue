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
        <el-date-picker style="width: 200px" v-model="starTimeRef" type="datetime" placeholder="计算开始时间" format="YYYY-MM-DD"/>
        <span class="_label">结束时间：</span>
        <el-date-picker style="width: 200px" v-model="endTimeRef" type="datetime" placeholder="计算结束时间" format="YYYY-MM-DD"/>
        <el-button type="primary" style="width: 80px;" @click = "calculateFun">开始计算</el-button>
        <el-button type="primary" style="width: 80px;" @click = "exportFun">导出</el-button>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="岗位名称/学生姓名" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="id" label="序号" width="100"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="150"></el-table-column>
      <el-table-column prop="postName" label="岗位名称" width="150"></el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="150"></el-table-column>
      <el-table-column prop="endDate" label="结束日期" width="150"></el-table-column>
      <el-table-column prop="hour" label="工时" width="150"></el-table-column>
      <el-table-column prop="hourlyPay" label="应发工资" width="150"></el-table-column>
      <el-table-column prop="baseSalary" label="基本工资" width="150"></el-table-column>
      <el-table-column prop="lateDeduction" label="迟到扣款" width="150"></el-table-column>
      <el-table-column prop="absenceDeduction" label="缺勤扣款" width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="150">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.status === 1">已批准</el-tag>
          <el-tag type="info" v-else-if = "scope.row.status === 2">已支付</el-tag>
          <el-tag type="warning" v-else>待处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalSalary" label="总工资" width="150"></el-table-column>
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

    <el-dialog v-model = 'dialogVisibleCalc' :before-close = 'beforeCloseCalc' title = '计算详情' width = '500px'> 
      <el-table :data="calcTable.list" style="width: 100%; height: 100%">
        <el-table-column prop="id" label="序号" width="100"></el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="150"></el-table-column>
        <el-table-column prop="postName" label="岗位名称" width="150"></el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="150"></el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="150"></el-table-column>
        <el-table-column prop="hour" label="工时" width="150"></el-table-column>
        <el-table-column prop="hourlyPay" label="应发工资" width="150"></el-table-column>
        <el-table-column prop="baseSalary" label="基本工资" width="150"></el-table-column>
        <el-table-column prop="lateDeduction" label="迟到扣款" width="150"></el-table-column>
        <el-table-column prop="absenceDeduction" label="缺勤扣款" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 1">已批准</el-tag>
            <el-tag type="info" v-else-if = "scope.row.status === 2">已支付</el-tag>
            <el-tag type="warning" v-else>待处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSalary" label="总工资" width="150"></el-table-column>
      </el-table>
      <template #footer>
          <el-button type="primary" @click="beforeCloseCalc">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '审核详情' width = '500px'> 
      <el-form ref="formEditRef" label-width="100px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label = "序号" prop = "id">
            <el-input v-model="formEdit.id" placeholder="序号" disabled></el-input>
          </el-form-item>
          <el-form-item label = "学生姓名" prop = "studentName">
            <el-input v-model="formEdit.studentName" placeholder="学生姓名" disabled></el-input>
          </el-form-item>
          <el-form-item label = "岗位名称" prop = "postName">
            <el-input v-model="formEdit.postName" placeholder="岗位名称" disabled></el-input>
          </el-form-item>
          <el-form-item label = "开始日期" prop = "startDate">
            <el-input v-model="formEdit.startDate" placeholder="开始日期" disabled></el-input>
          </el-form-item>
          <el-form-item label = "结束日期" prop = "endDate">
            <el-input v-model="formEdit.endDate" placeholder="结束日期" disabled></el-input>
          </el-form-item>
          <el-form-item label = "工时" prop = "hour">
            <el-input v-model="formEdit.hour" placeholder="工时" ></el-input>
          </el-form-item>
          <el-form-item label = "应发工资" prop = "hourlyPay">
            <el-input v-model="formEdit.hourlyPay" placeholder="应发工资" ></el-input>
          </el-form-item>
          <el-form-item label = "基本工资" prop = "baseSalary">
            <el-input v-model="formEdit.baseSalary" placeholder="基本工资" ></el-input>
          </el-form-item>
          <el-form-item label = "迟到扣款" prop = "lateDeduction">
            <el-input v-model="formEdit.lateDeduction" placeholder="迟到扣款" ></el-input>
          </el-form-item>
          <el-form-item label = "缺勤扣款" prop = "absenceDeduction">
            <el-input v-model="formEdit.absenceDeduction" placeholder="缺勤扣款" ></el-input>
          </el-form-item>
          <el-form-item label = "总工资" prop = "totalSalary">
            <el-input v-model="formEdit.totalSalary" placeholder="总工资" ></el-input>
          </el-form-item>
          <el-form-item label = "状态" prop = "status">
            <el-radio-group v-model="formEdit.status">
                <el-radio :value=0>待处理</el-radio>
                <el-radio :value=1>已批准</el-radio>
                <el-radio :value=2>已支付</el-radio>
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
import {querySalaryDetail,exportSalaryDetail,calculateSalary,auditSalary } from '../../../api';
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
const dialogVisibleCalc = ref(false)
// 编辑弹窗状态
const dialogVisibleEdit = ref(false)

// 编辑弹窗表单数据
const formEdit = reactive({
    id: '',
    studentName: '',
    postName: '',
    startDate: '',
    endDate: '',
    hour: '',
    hourlyPay: '',
    baseSalary: '',
    lateDeduction: '',
    absenceDeduction: '',
    totalSalary: '',
    status: '',
})
// 编辑弹窗表单实例
const formEditRef = ref(null)


//列表数据
const tableData = reactive({
    list:[],
    total:0
})

const calcTable = ref({
    list:[],
    total:0
})

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
})

// 获取列表数据
const getListData = () => {
    querySalaryDetail(queryCondition).then(res =>{
      if(res.data.code === 200){
        const list = res.data.data
        list.forEach(item => {
          item.startDate = dayjs(item.startDate).format('YYYY-MM-DD')
          item.endDate = dayjs(item.endDate).format('YYYY-MM-DD')
        })
        tableData.list = list
        tableData.total = res.data.total
      }
    })
}

const beforeCloseCalc = (action, instance) => {
    dialogVisibleCalc.value = false
    calcTable.list = []
    calcTable.total = 0
}

const beforeCloseEdit = (action, instance) => {
    dialogVisibleEdit.value = false
}

// 打开弹窗
const openCalc = () =>{
    dialogVisibleCalc.value = true
}
const openedit = (row) =>{
    dialogVisibleEdit.value = true
    nextTick(() => {
      formEdit.id = row.id
      formEdit.studentName = row.studentName
      formEdit.postName = row.postName
      formEdit.startDate = row.startDate
      formEdit.endDate = row.endDate
      formEdit.hour = row.hour
      formEdit.hourlyPay = row.hourlyPay
      formEdit.baseSalary = row.baseSalary
      formEdit.lateDeduction = row.lateDeduction
      formEdit.absenceDeduction = row.absenceDeduction
      formEdit.totalSalary = row.totalSalary
      formEdit.status = row.status
    })
}


// 计算薪资
const calculateFun = async () => {
  console.log(starTimeRef.value, endTimeRef.value)
  if(!starTimeRef.value || !endTimeRef.value) {
    ElMessage.error('请选择计算时间')
    return
  }
  const startDate = dayjs(starTimeRef.value).format('YYYY-MM-DDTHH:mm:ss[Z]')
  const endDate = dayjs(endTimeRef.value).format('YYYY-MM-DDTHH:mm:ss[Z]')
  const params = {
    startDate: startDate,
    endDate : endDate,
  }
  console.log(params)
  await calculateSalary(params).then(res => {
    if(res.data.code === 200){
      ElMessage.success(res.data.message)
      const list = res.data.data
      list.forEach(item => {
        item.startDate = dayjs(item.startDate).format('YYYY-MM-DD')
        item.endDate = dayjs(item.endDate).format('YYYY-MM-DD')
      })
      calcTable.list = list
      calcTable.total = res.data.total
      openCalc()
      getListData()
    }
  })
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  await auditSalary(formEdit).then(res => {
    if(res.data.code === 200){
      ElMessage.success(res.data.message)
      dialogVisibleEdit.value = false
      getListData()
    }
  })
}


const rules = {
  status: [
      { required: true, message: '请选择状态', trigger: 'blur' }
  ],
  hour: [
      { required: true, message: '请输入工时', trigger: 'blur' }
  ],
  hourlyPay: [
      { required: true, message: '请输入应发工资', trigger: 'blur' }
  ],
  baseSalary: [
      { required: true, message: '请输入基本工资', trigger: 'blur' }
  ],
  lateDeduction: [
      { required: true, message: '请输入迟到扣款', trigger: 'blur' }
  ],
  absenceDeduction: [
      { required: true, message: '请输入缺勤扣款', trigger: 'blur' }
  ],
  totalSalary: [
      { required: true, message: '请输入总工资', trigger: 'blur' }
  ]
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}

const exportFun = () => {
  if(!starTimeRef.value || !endTimeRef.value) {
    ElMessage.error('请选择计算时间')
    return
  }
  const startDate = dayjs(starTimeRef.value).format('YYYY-MM-DDTHH:mm:ss[Z]')
  const endDate = dayjs(endTimeRef.value).format('YYYY-MM-DDTHH:mm:ss[Z]')
  const params = {
    startDate: startDate,
    endDate : endDate,
  }
  exportSalaryDetail(params).then(res => {
    if(res.status === 200){
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = '工资明细_' + dayjs(starTimeRef.value).format('YYYYMMDD') + '_' + dayjs(endTimeRef.value).format('YYYYMMDD') + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  })
  .catch(error => {
    console.error("下载失败:", error.message);
    alert(error.message); // 显示错误信息
  })
}
</script>