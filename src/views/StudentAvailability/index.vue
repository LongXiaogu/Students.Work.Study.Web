<template>
  <div class="calendar-container">
    <!-- 月份导航 -->
    <div class="month-navigation">
      <el-button @click="changeMonth(-1)">上个月</el-button>
      <div class="current-month">{{ currentMonth }}</div>
      <el-button @click="changeMonth(1)">下个月</el-button>
    </div>

    <!-- 日历主体 -->
    <div class="calendar-grid">
      <div v-for="day in calendarDays" :key="day.date" class="day-card">
        <div class="day-header">
          {{ day.date }} ({{ day.weekday }})
        </div>
        <div class="time-slots">
          <el-button v-for="slot in timeSlots" :key="slot.key" class="slot-button" :type="getSlotStatus(day.date, slot.key) ? 'primary' : 'info'" @click="toggleSlot(day.date, slot.key)">
            {{ slot.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-area">
      <el-button type="success" @click="handleSubmit">提交可用时间</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import {submitFreeTime ,queryFreeTime} from '../../api'
import dayjs from 'dayjs';

// 时间段配置
const timeSlots = [
  { key: 'morning', label: '上午' ,flag: 0},
  { key: 'afternoon', label: '下午', flag: 1 },
  { key: 'evening', label: '晚上', flag: 2 }
];

// 当前显示的月份
const currentDate = ref(new Date());

// 存储选择状态的数据结构：Array<{ date: string, timeSlot: string, status: boolean }>
const selections = ref([]);

// 生成当前月份的所有日期
const calendarDays = computed(() => {
  const days = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // 获取当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date: `${day}`,
      fullDate: formatDate(date),
      weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    });
  }
  return days;
});

// 格式化日期为YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// 切换月份
const changeMonth = (offset) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
};

// 获取当前月份显示文本
const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  });
});

// 切换时间段状态
const toggleSlot = (day, slotKey) => {
  const fullDate = `${formatDate(currentDate.value).slice(0, 8)}${day.padStart(2, '0')}`;
  const slotLabel = timeSlots.find(slot => slot.key === slotKey)?. flag ?? null;

  // 查找是否已经存在该日期和时间段的记录
  const existingIndex = selections.value.findIndex(
    item => item.date === fullDate && item.timeSlot === slotLabel
  );

  if (existingIndex !== -1) {
    // 如果存在，更新状态
    selections.value[existingIndex].status = !selections.value[existingIndex].status;
  } else {
    // 如果不存在，添加新记录
    selections.value.push({
      date: fullDate,
      timeSlot: slotLabel,
      status: true
    });
  }
};

// 获取时间段状态
const getSlotStatus = (day, slotKey) => {
  const fullDate = `${formatDate(currentDate.value).slice(0, 8)}${day.padStart(2, '0')}`;
  const slotLabel = timeSlots.find(slot => slot.key === slotKey)?.flag ?? null;

  const existingRecord = selections.value.find(
    item => item.date === fullDate && item.timeSlot === slotLabel
  );

  return existingRecord ? existingRecord.status : false;
};

// 从后端获取数据
const fetchAvailability = async () => {
  try {
    // 模拟后端接口调用
    // const response = await axios.get('/api/availability');
    queryFreeTime().then((res) => {
      if(res.data.code === 200){
        const list = res.data.data
        //console.log('后端数据：', list);
        
        
        selections.value = list.map(item => ({
          date: dayjs(item.date).format('YYYY-MM-DD'), // 日期
          timeSlot: item.time_Slot, // 时间段
          status: item.status // 状态
        }));
        console.log('后端数据：', selections.value);
      }
    })
    //console.log('后端数据：', selections.value);
    // const mockData = [
    //   { date: '2025-03-01', timeSlot: 0, status: true },
    //   { date: '2025-03-01', timeSlot: 1, status: false },
    //   { date: '2025-03-02', timeSlot: 1, status: true }
    // ];

    // 将后端数据映射到 selections
    // selections.value = mockData;
  } catch (error) {
    ElMessage.error('获取数据失败');
  }
};

// 提交处理
const handleSubmit = () => {
  try {
    // 构造符合后端接口要求的数据结构
    const requestData = {
      availability: selections.value.map(item => ({
        date: item.date, // 日期
        timeSlot: item.timeSlot, // 时间段
        status: item.status // 状态
      }))
    };
    // 这里调用你的后端API
    // const response = await axios.post('/api/availability', selections.value);
    console.log('提交数据：', requestData);
    submitFreeTime(requestData).then((res) => {
      if(res.data.code === 200){
        ElMessage.success('提交成功');
        // 提交成功后重新获取数据
        fetchAvailability();   
      }
    })
   
  } catch (error) {
    ElMessage.error('提交失败');
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchAvailability();
});
</script>

<style lang="less" scoped>
.calendar-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.current-month {
  font-size: 1.5em;
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  min-height: 120px;
}

.day-header {
  font-size: 0.9em;
  margin-bottom: 8px;
  text-align: center;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.slot-button {
  padding: 5px;
  height: auto;
  margin: 0%;
}

.submit-area {
  margin-top: 30px;
  text-align: center;
}
</style>