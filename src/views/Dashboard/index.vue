<template>
  <div class="attendance-container">
    <!-- 顶部操作区域 -->
    <div class="header">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic title="当前月份" :value="currentMonth" />
        </el-col>
        <el-col :span="16" class="operation-buttons">
          <el-button type="primary" @click="handleCheckIn">签到</el-button>
          <el-button type="warning" @click="handleCheckOut">签退</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计信息 -->
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="需签到次数" :value="stats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已签到次数" :value="stats.completed" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="异常次数" :value="stats.abnormal" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="未签到次数" :value="stats.total - stats.completed - stats.abnormal" />
        </el-col>
      </el-row>
    </div>

    <!-- 排班日历 -->
    <div class="calendar">
      <div v-for="day in calendarDays" :key="day.date" class="day-card">
        <div class="day-header">{{ dayjs(day.date).format('DD') }}</div>
        <div class="time-slots">
          <div v-for="slot in timeSlots" :key="slot.value"class="time-slot":class="getSlotStatus(day.date, slot.value)">
            {{ slot.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 排班列表 -->
    <el-table :data="schedules" style="width: 100%">
      <el-table-column prop="scheduleDate" label="日期" :formatter="formatDate" sortable />
      <el-table-column prop="timeSlot" label="时间段">
        <template #default="{row}">
          {{ formatTimeSlot[row.timeSlot] }}
        </template>
      </el-table-column>
      <el-table-column prop="title" label="岗位" />
      <el-table-column prop="status" label="状态">
        <template #default="{row}">
          {{ formatStatus[row.status] }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getStudentScheduleByStudent, checkIn ,getCheckInRecords, checkOut} from '../../api'
import isBetween from 'dayjs/plugin/isBetween';

// 使用 isBetween 插件
dayjs.extend(isBetween);

// 模拟数据
const mockSchedules = []

// 响应式数据
const currentMonth = ref(dayjs().format('YYYY-MM'))
const schedules = ref(mockSchedules)
const checkInRecords = ref([])
// 在响应式数据部分添加打卡记录
const checkInData = ref([])

// 统计计算
const stats = computed(() => {
  const confirmedSchedules = schedules.value.filter(s => s.status === 0) // 假设已确认状态为0
  return {
    total: confirmedSchedules.length,
    completed: checkInData.value.filter(r => r.status === 'normal').length,
    abnormal: checkInData.value.filter(r => r.status !== 'normal').length
  }
})

// 时间枚举
const timeSlots = [
  { label: '上午', value: 0, timeRange: ['08:15', '11:45'] },
  { label: '下午', value: 1, timeRange: ['13:15', '16:45'] },
  { label: '晚上', value: 2, timeRange: ['18:45', '22:15'] }
]

const formatTimeSlot = ['上午', '下午', '晚上']

const formatStatus = ['已确认', '待换班', '已退班']

const formatDate = (row, column) => {
  return dayjs(row.scheduleDate).format('YYYY-MM-DD')
}

// 获取当月日历
const calendarDays = computed(() => {
  const days = []
  const start = dayjs().startOf('month')
  const end = dayjs().endOf('month')
  
  let current = start
  while (current.isBefore(end)) {
    days.push({ date: current.format('YYYY-MM-DD') })
    current = current.add(1, 'day')
  }
  return days
})

// 获取排班数据
const fetchSchedules = async () => {
  try {
    const loaclData = JSON.parse(localStorage.getItem('SMSS_USER_INFO'));
    const params = {
      number : loaclData.number,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD')
    }
    console.log(params)
    getStudentScheduleByStudent(params).then(res =>{
      if(res.data.code === 200){
        console.log("data",res.data.data)
        schedules.value = res.data.data
        ElMessage.success('获取排班数据成功')
        console.log("schedules",schedules.value)
      }
    })

    // schedules.value = mockSchedules
  } catch (error) {
    ElMessage.error('获取排班数据失败')
  }
}

// 签到处理
const handleCheckIn = async () => {
  
  const currentTime = dayjs()
  console.log("当前时间:",currentTime)
  const currentSlot = timeSlots.find(slot => {
    const [start, end] = slot.timeRange
    return currentTime.isBetween(
      dayjs().set('hour', start.split(':')[0]).set('minute', start.split(':')[1]),
      dayjs().set('hour', end.split(':')[0]).set('minute', end.split(':')[1])
    )
  })

  if (!currentSlot) {
    ElMessage.warning('当前不在可签到时间段')
    return
  }

  // 验证排班是否存在
  const validSchedule = schedules.value.find(s => 
    dayjs(s.scheduleDate).isSame(currentTime, 'day') &&
    s.timeSlot === currentSlot.value &&
    s.status === 0
  )

  if (!validSchedule) {
    ElMessage.warning('还不是签到时间')
    return
  }

  try {
    // 调用实际签到接口
    // const res = await checkInApi({
    //   postId: validSchedule.postId,
    //   Date: currentTime.format('YYYY-MM-DD'),
    //   Time: currentTime.format('HH:mm:ss'),
    //   TimeSlot: currentSlot.value
    // })

    const data = {
      postId: validSchedule.postId,
      date: currentTime.format('YYYY-MM-DD'),
      timeSlot: currentSlot.value
    }

    console.log("data",data)
    checkIn(data).then(res => {
      if(res.data.code === 200){
        // checkInData.value.push({
        //   id: res.data.id,
        //   date: currentTime.format('YYYY-MM-DD'),
        //   timeSlot: currentSlot.value,
        //   time: currentTime,
        //   status: currentTime.isAfter(
        //     dayjs().set('hour', currentSlot.timeRange[0].split(':')[0])
        //       .set('minute', currentSlot.timeRange[0].split(':')[1])
        //       .add(5, 'minute')
        //   ) ? 'late' : 'normal'
        // })
        ElMessage.success('签到成功')
        fetchCheckInRecords()
      }
    })
  } catch (error) {
    ElMessage.error('签到失败')
  }
}

// 签退处理
const handleCheckOut = async () => {
  const currentTime = dayjs()
  const currentSlot = timeSlots.find(slot => {
    const [start, end] = slot.timeRange
    return currentTime.isBetween(
      dayjs().set('hour', start.split(':')[0]).set('minute', start.split(':')[1]),
      dayjs().set('hour', end.split(':')[0]).set('minute', end.split(':')[1])
    )
  })

  if (!currentSlot) {
    ElMessage.warning('当前不在可签退时间段')
    return
  }

  // 验证排班是否存在
  const validSchedule = schedules.value.find(s => 
    dayjs(s.scheduleDate).isSame(currentTime, 'day') &&
    s.timeSlot === currentSlot.value &&
    s.status === 0
  )

  if (!validSchedule) {
    ElMessage.warning('当前无有效排班')
    return
  }
  
  // 调用实际签退接口
  try{
    const data = {
      id: checkInData.value.find(r => 
        dayjs(r.date).isSame(currentTime, 'day') && 
        r.timeSlot.value === currentSlot.value
      ).id
    }
    console.log("测试", checkInData.value.find(r => 
        dayjs(r.date).isSame(currentTime, 'day') && 
        r.timeSlot.value === currentSlot.value
      ))
    checkOut(data).then(res => {
      if(res.data.code === 200){
        ElMessage.success('签退成功')
        fetchCheckInRecords()
      }
    })
  }catch(error){
    ElMessage.error('签退失败')
  }
  
}

// 获取打卡记录
const fetchCheckInRecords = async () => {
  const loaclData = JSON.parse(localStorage.getItem('SMSS_USER_INFO'));
    const params = {
      number : loaclData.number,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD')
    }
  getCheckInRecords(params).then((res) =>{
    if(res.data.code === 200){
      const list = res.data.data
      checkInData.value = list.map(item => {
        return {
          id: item.id,
          date: item.date,
          timeSlot:  timeSlots.find(slot => {
            const [start, end] = slot.timeRange
            return dayjs(item.actual_Start_Time).isBetween(
              dayjs(item.actual_Start_Time).set('hour', start.split(':')[0]).set('minute', start.split(':')[1]),
              dayjs(item.actual_Start_Time).set('hour', end.split(':')[0]).set('minute', end.split(':')[1])
            )
          }),
          time: dayjs(item.actual_Start_Time),
          status: item.status === 0 ? 'normal' : 'late'
        }
      })
      console.log(" checkInData.value",checkInData.value)
    }
  })
}


// 样式处理
const getSlotStatus = (date, slot) => {
  // 1. 查找对应排班
  const schedule = schedules.value.find(s => 
    dayjs(s.scheduleDate).isSame(date, 'day') && 
    s.timeSlot === slot &&
    s.status === 0 // 已确认状态
  )

  if (!schedule) return 'gray' // 无有效排班

  // 2. 查找打卡记录
  const record = checkInData.value.find(r => 
    dayjs(r.date).isSame(date, 'day') && 
    r.timeSlot.value === slot
  )

  if (!record) return 'blue' // 有排班但未打卡
  
  // // 3. 判断是否迟到
  // const timeRange = timeSlots.find(t => t.value === slot).timeRange
  // const [startHour, startMinute] = timeRange[0].split(':')
  // const lateThreshold = dayjs(record.time)
  //   .set('hour', startHour)
  //   .set('minute', startMinute)
  //   .add(20, 'minute') // 可提前15分钟打卡，20分钟的打卡时间，超过即视为迟到

  // console.log("lateThreshold",lateThreshold)
  // return dayjs(record.time).isAfter(lateThreshold) ? 'red' : 'green'
  return record.status === 'late' ? 'red' : 'green'
}

onMounted(() => {
  fetchSchedules()
  fetchCheckInRecords()
  console.log("目前时间为",dayjs().format('YYYY-MM-DD HH:mm:ss'))
})
</script>

<style lang="less" scoped>
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-slot {
  padding: 5px;
  border-radius: 4px;
  text-align: center;
  
  &.green { background: #207f06; }
  &.red { background: #d94343; }
  &.gray { background: #f5f7fa; }
  &.blue{background: #035486;}
}

.stats {
  margin: 20px 0;
}

.operation-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>