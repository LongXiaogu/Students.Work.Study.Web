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
  .PostSchedule {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .scheduling-container {
      padding: 20px;
    }

    .header-control {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }

    .calendar-day {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 8px;
      min-height: 150px;
      background: #fff;
      
      &.non-current-month {
        background: #f5f7fa;
        opacity: 0.6;
      }
    }

    .day-header {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 14px;
      
      .weekday {
        color: #909399;
        margin-left: 4px;
      }
    }

    .time-slot {
      height: 60px;
      margin: 4px 0;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      background: #f5f7fa;
      
      &:hover {
        background: #e4e7ed;
      }
      
      &.scheduled {
        background: #f0f9eb;
        border: 1px solid #e1f3d8;
      }
    }

    .scheduled-info {
      font-size: 12px;
      .remark {
        color: #909399;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .time-label {
      color: #909399;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
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
      <el-table-column prop="id" label="序号" width="80"></el-table-column>
      <el-table-column prop="title" label="岗位名称" width="200"></el-table-column>
      <el-table-column show-overflow-tooltip prop="description" label="岗位描述" width="200"></el-table-column>
      <el-table-column prop="createDate" label="创建时间" width="200"></el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="200"></el-table-column>
      <el-table-column prop="needPeople" label="招聘人数" width="100"></el-table-column>
      <el-table-column show-overflow-tooltip prop="demand" label="要求" width="100"></el-table-column>
      <el-table-column prop="publisherName" label="发布教师" width="100"></el-table-column>
      <el-table-column show-overflow-tooltip prop="departmentId" label="所属部门" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.status === true">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="place" label="工作地点" width="160"></el-table-column>
      <el-table-column prop="salaryPerHour" label="薪资(元/小时)" width="160"></el-table-column>
      <el-table-column prop="baseSalary" label="底薪(元/月)" width="160"></el-table-column>
      <el-table-column fixed="right" label="操作" width="260">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deleteInfo(scope.row)">禁用</el-button>
              <el-button type="success" @click="openPostSchedule(scope.row)">岗位需求</el-button>
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
          <el-form-item label="岗位名称" prop = "title">
              <el-input v-model ="formAdd.title" placeholder="请输入岗位名称" ></el-input>
          </el-form-item>
          <el-form-item label="岗位描述" prop = "description">
              <el-input v-model ="formAdd.description" placeholder="请输入岗位描述" ></el-input>
          </el-form-item>
          <el-form-item label="截止日期" prop = "deadline">
              <el-date-picker v-model ="formAdd.deadline" type="datetime" placeholder="请选择截止日期" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
          </el-form-item>
          <el-form-item label="招聘人数" prop = "needPeople">
              <el-input v-model ="formAdd.needPeople" placeholder="请输入招聘人数" ></el-input>
          </el-form-item>
          <el-form-item label="要求" prop = "demand">
              <el-input v-model ="formAdd.demand" placeholder="请输入岗位要求" ></el-input>
          </el-form-item>
          <el-form-item label="工作地点" prop = "place">
              <el-input v-model ="formAdd.place" placeholder="请输入工作地点" ></el-input>
          </el-form-item>
          <el-form-item label="所属部门" prop = "departmentId">
              <el-select v-model ="formAdd.departmentId" placeholder="请选择所属部门">
                  <el-option label="航空制造与工程学部" value="1"></el-option>
                  <el-option label="电子信息与自动化学部" value="2"></el-option>
                  <el-option label="经济管理学部" value="3"></el-option>
                  <el-option label="航空服务与传媒学部" value="4"></el-option>
                  <el-option label="文学与体育学部" value="5"></el-option>
                  <el-option label="计算机学部" value="6"></el-option>
                  <el-option label="马克思主义学院" value="7"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="状态" prop = "status">
            <el-radio-group v-model="formAdd.status">
                <el-radio :value="false">失效</el-radio>
                <el-radio :value="true">生效</el-radio>
            </el-radio-group>
          </el-form-item>
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formAddRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑岗位信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="100px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label="序号" prop = "id">
              <el-input v-model ="formEdit.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="岗位名称" prop = "title">
              <el-input v-model ="formEdit.title" placeholder="请输入岗位名称" ></el-input>
          </el-form-item>
          <el-form-item label="岗位描述" prop = "description">
              <el-input v-model ="formEdit.description" placeholder="请输入岗位描述" ></el-input>
          </el-form-item>
          <el-form-item label="截止日期" prop = "deadline">
              <el-date-picker v-model ="formEdit.deadline" type="datetime" placeholder="请选择截止日期" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
          </el-form-item>
          <el-form-item label="招聘人数" prop = "needPeople">
              <el-input v-model ="formEdit.needPeople" placeholder="请输入招聘人数" ></el-input>
          </el-form-item>
          <el-form-item label="要求" prop = "demand">
              <el-input v-model ="formEdit.demand" placeholder="请输入岗位要求" ></el-input>
          </el-form-item>
          <el-form-item label="工作地点" prop = "place">
              <el-input v-model ="formEdit.place" placeholder="请输入工作地点" ></el-input>
          </el-form-item>
          <el-form-item label="所属部门" prop = "departmentId">
              <el-select v-model ="formEdit.departmentId" placeholder="请选择所属部门">
                  <el-option label="航空制造与工程学部" value="1"></el-option>
                  <el-option label="电子信息与自动化学部" value="2"></el-option>
                  <el-option label="经济管理学部" value="3"></el-option>
                  <el-option label="航空服务与传媒学部" value="4"></el-option>
                  <el-option label="文学与体育学部" value="5"></el-option>
                  <el-option label="计算机学部" value="6"></el-option>
                  <el-option label="马克思主义学院" value="7"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="状态" prop = "status">
            <el-radio-group v-model="formEdit.status">
                <el-radio :value="false">失效</el-radio>
                <el-radio :value="true">生效</el-radio>
            </el-radio-group>
          </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmEdit(formEditRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogPostSchedule' :before-close = 'beforeClosePostSchedule' title = '岗位调度' width = '100%' class = "PostSchedule"> 
      <div class="scheduling-container">
        <!-- 头部控制栏 -->
        <div class="header-control">
          <el-button @click="prevMonth">上一月</el-button>
          <el-date-picker v-model="currentMonth" type="month" format="YYYY-MM"  value-format="YYYY-MM" @change="loadScheduleData" />
          <el-button @click="nextMonth">下一月</el-button>
        </div>

        <!-- 排班日历 -->
        <div class="calendar-grid">
          <div  v-for="day in monthDays"  :key="day.date" class="calendar-day" :class="{ 'non-current-month': !day.isCurrentMonth }" >
            <div class="day-header">
              {{ day.date.slice(8) }} 
              <span class="weekday">{{ formatWeekday(day.date) }}</span>
            </div>
            
            <!-- 时间段 -->
            <div v-for="timeSlot in timeSlots" :key="timeSlot.value" class="time-slot" :class="{ 'scheduled': getSchedule(day.date, timeSlot.value) }" @click="handleTimeSlotClick(day.date, timeSlot.value)" >
              <div v-if="getSchedule(day.date, timeSlot.value)" class="scheduled-info">
                <div>需求：{{ getSchedule(day.date, timeSlot.value)?.requiredNumber }}人</div>
                <div class="remark">{{ getSchedule(day.date, timeSlot.value)?.remark }}</div>
              </div>
              <div v-else class="time-label">{{ timeSlot.label }}</div>
            </div>
          </div>
        </div>

        <!-- 排班编辑弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
          <el-form :model="form" :rules="rules" label-width="80px">
            <el-form-item label="岗位ID" prop="postId">
              {{ form.postId }}
            </el-form-item>
            <el-form-item label="时间段">
              {{ timeSlotLabels[form.timePeriod] }}
            </el-form-item>
            <el-form-item label="日期">
              {{ form.scheduleDate }}
            </el-form-item>
            <el-form-item label="需求人数" prop="requiredNumber">
              <el-input-number  v-model="form.requiredNumber" :min="0" :max="20" controls-position="right" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="50" show-word-limit />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button type="danger" @click="deleteSchedulle(form.postId, form.scheduleDate, form.timePeriod)" style="float: left">删除</el-button>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
          </template>
        </el-dialog>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive ,onMounted ,ref, nextTick, computed} from 'vue';
import { queryPositions, addPost, disablePost, updatePost,fetchSchedules, saveSchedule, deleteSchedule} from '../../api';
import dayjs from 'dayjs';

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
    title: '',
    description: '',
    deadline: '',
    needPeople: '',
    demand: '',
    place: '',
    departmentId: '',
    status: true,
    
})

// 编辑弹窗表单数据
const formEdit = reactive({
    id: '',
    title: '',
    description: '',
    deadline: '',
    needPeople: '',
    demand: '',
    place: '',
    departmentId: '',
    status: true,
    
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
    queryPositions(queryCondition).then((res)=>{
        if(res.data.code === 200){
            const list = res.data.data
            list.forEach(item =>{
                item.createDate = dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss');
                item.deadline = dayjs(item.deadline).format('YYYY-MM-DD HH:mm:ss')
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
            })
            tableData.list = res.data.data
            tableData.total = res.data.total
        }
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
        if (row) {
            formEdit.id = row.id
            formEdit.title = row.title
            formEdit.description = row.description
            formEdit.deadline = dayjs(row.deadline).format('YYYY-MM-DD HH:mm:ss')
            formEdit.needPeople = row.needPeople
            formEdit.demand = row.demand
            formEdit.place = row.place
            formEdit.status = row.status
        }
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return
  await formEl.validate((valid,fields)=>{
    if(valid)
    {
      formAdd.deadline = dayjs(formAdd.deadline).format('YYYY-MM-DDTHH:mm:ss[Z]')
      addPost(formAdd).then((res) => {
        if(res.data.code === 200){
          ElMessage.success('添加成功')
          getListData()
          clearAddForm()
          dialogVisibleAdd.value = false
        }
      })
    }
    else
    {
      console.log('error submit!!', fields);
    }
  })
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  await formEl.validate((valid,fields)=>{
    if(valid)
    {
      formEdit.deadline = dayjs(formEdit.deadline).format('YYYY-MM-DDTHH:mm:ss[Z]')
      updatePost(formEdit).then((res) => {
        if(res.data.code === 200){
          ElMessage.success('修改成功')
          getListData()
          dialogVisibleEdit.value = false
        }
      })
    }
    else
    {
      console.log('error submit!!', fields);
    }
  })
}


const rules = {
  title: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入岗位描述', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期', trigger: 'blur' }
  ],
  needPeople: [
    { required: true, message: '请输入招聘人数', trigger: 'blur' },
  ],
  demand: [
    { required: true, message: '请输入岗位要求', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  place: [
    { required: true, message: '请输入工作地点', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ],

  requiredNumber: [
    { required: true, message: '请输入需求人数', trigger: 'blur' },
  ],
  remark: [
    { max: 50, message: '备注不能超过50字', trigger: 'blur' }
  ]
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    disablePost(row.id).then((res) => {
      if(res.data.code === 200){
        ElMessage.success('禁用成功')
        getListData()
      }
    })
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}

// 清空添加弹窗表单数据
const clearAddForm = () => {
  formAdd.title = ''
  formAdd.description = ''
  formAdd.deadline = ''
  formAdd.needPeople = ''
  formAdd.demand = ''
  formAdd.place = ''
  formAdd.departmentId = ''
  formAdd.status = true
}



const dialogPostSchedule = ref(false)

const beforeClosePostSchedule = (action, instance) => {
  dialogPostSchedule.value = false
}

const openPostSchedule = (row) => {
  dialogPostSchedule.value = true
  nextTick(() => {
    form.postId = row.id
    loadScheduleData()
  })
  
}


// 时间配置
const timeSlots = [
  { label: '上午 8:30-11:30', value: 0 },
  { label: '下午 13:30-16:30', value: 1 },
  { label: '晚上 19:00-22:00', value: 2 }
]
const timeSlotLabels = ['上午', '下午', '晚上']

// 响应式数据
const currentMonth = ref(dayjs().format('YYYY-MM'))
const scheduleList = ref([])
const dialogVisible = ref(false)

const form = reactive({
  scheduleDate: '',
  timePeriod: 0,
  requiredNumber: 1,
  remark: '',
  postId: '' // 实际应从路由或props获取
})

// 验证规则
// const rules = {
  
// }

// 计算当月所有日期
const monthDays = computed(() => {
  const monthStart = dayjs(currentMonth.value).startOf('month')
  const monthEnd = dayjs(currentMonth.value).endOf('month')
  
  const days = []
  let currentDay = monthStart

  while (currentDay.isBefore(monthEnd) || currentDay.isSame(monthEnd, 'day')) {
    days.push({
      date: currentDay.format('YYYY-MM-DD'),
      isCurrentMonth: currentDay.isSame(monthStart, 'month')
    })
    currentDay = currentDay.add(1, 'day')
  }

  return days
})

// 获取排班信息
const getSchedule = (date, timePeriod) => {
  return scheduleList.value.find(
    item => item.scheduleDate === date && item.timePeriod === timePeriod
  )
}

// 打开编辑弹窗
const handleTimeSlotClick = (date, timePeriod) => {
  const existing = getSchedule(date, timePeriod)
  
  Object.assign(form, {
    scheduleDate: date,
    timePeriod,
    requiredNumber: existing?.requiredNumber || 1,
    remark: existing?.remark || ''
  })
  
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 调用保存接口
    const data = {
      postId: form.postId,
      date: form.scheduleDate,
      timeSlot: form.timePeriod,
      requiredNumber: form.requiredNumber,
      note: form.remark
    }

    await saveSchedule(data).then((res) =>{
      if(res.data.code !== 200){
        ElMessage.error(res.data.message)
      }else{
        ElMessage.success(res.data.data)
        loadScheduleData()
        dialogVisible.value = false
      }
      
    })
    
    // // 更新本地数据
    // const index = scheduleList.value.findIndex(
    //   item => item.scheduleDate === form.scheduleDate && 
    //          item.timePeriod === form.timePeriod
    // )
    
    // if (index > -1) {
    //   scheduleList.value.splice(index, 1, { ...form })
    // } else {
    //   scheduleList.value.push({ ...form })
    // }
    
    // ElMessage.success('保存成功')
    // dialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 加载排班数据
const loadScheduleData = async () => {
  try {
    await fetchSchedules({
      month: currentMonth.value,
      postId: form.postId
    }).then((res) => {
      if(res.data.code === 200){
        const list = res.data.data
        scheduleList.value = list.map(item => {
          return {
             postId: item.positionId,
             requiredNumber: item.requiredNumber,
             remark: item.note,
             scheduleDate: dayjs(item.date).format('YYYY-MM-DD'),
             timePeriod: item.timeSlot
          }
        })
        console.log("list",list)
        
        
        console.log("scheduleList.value",scheduleList.value)
      }
    })
    // scheduleList.value = res.data
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

// 月份切换
const prevMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).subtract(1, 'month').format('YYYY-MM')
}
const nextMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).add(1, 'month').format('YYYY-MM')
}

// 辅助方法
const formatWeekday = (dateStr) => {
  return ['日', '一', '二', '三', '四', '五', '六'][dayjs(dateStr).day()]
}

const deleteSchedulle = (postId, date, timePeriod) =>{
  deleteSchedule(postId, date, timePeriod).then((res) => {
    if(res.data.code === 200){
      ElMessage.success(res.data.data)
      loadScheduleData()
      dialogVisible.value = false
    }
  })
}

// 模拟接口
// const fetchSchedules = async (params) => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve({
//         data: [
//           {
//             scheduleDate: '2025-03-05',
//             timePeriod: 0,
//             requiredNumber: 2,
//             remark: '早班需要加强人手',
//             postId: 123
//           }
//         ]
//       })
//     }, 500)
//   })
// }

// const saveSchedule = async (data) => {
//   return new Promise(resolve => {
//     setTimeout(() => resolve({ code: 200 }), 300)
//   })
// }

// 初始化加载
// loadScheduleData()
</script>