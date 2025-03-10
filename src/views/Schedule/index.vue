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
  .student-select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .selected-student {
    width: 100%;
    padding: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #606266;
  }
}
</style>

<template>
  <div class="container">
    <div class="el-date-picker-date">
      <div class="filter-left">
        <el-button class="btn-search" type="primary" @click="openAdd()" style="width: 80px">新增排班</el-button>
        <span class="_label">开始时间：</span>
        <el-date-picker style="width: 200px" v-model="starTimeRef" type="datetime" placeholder="开始查询时间" format="YYYY-MM-DD"/>
        <span class="_label">结束时间：</span>
        <el-date-picker style="width: 200px" v-model="endTimeRef" type="datetime" placeholder="结束查询时间" format="YYYY-MM-DD"/>
      </div>
      <div class="filter-right">
        <el-input v-model="conditionRef" style="width: 240px" placeholder="请填写学生姓名或岗位名称" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="id" label="序号" width="100"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="100"></el-table-column>
      <el-table-column prop="title" label="岗位名称" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="200">
        <template #default="scope">
          <el-tag type="warning" v-if="scope.row.status === 1">待换班</el-tag>
          <el-tag type="info" v-else-if = "scope.row.status === 2">已退班</el-tag>
          <el-tag type="success" v-else>已确认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="original_Student_Name" label="原排班学生" width="200"></el-table-column>
      <el-table-column prop="scheduleDate" label="排班日期" width="200"></el-table-column>
      <el-table-column prop="timeSlot" label="时间段" width="200">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.timeSlot === 1">13:30-16:30</el-tag>
          <el-tag type="success" v-else-if = "scope.row.timeSlot === 2">19:00-22:00</el-tag>
          <el-tag type="success" v-else-if = "scope.row.timeSlot === 0">08:30-11:30</el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
              <el-button type="primary" @click="openedit(scope.row)">换班</el-button>
              <el-button type="danger" @click="deleteInfo(scope.row)">退班</el-button>
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

    <el-dialog v-model = 'dialogVisibleAdd' :before-close = 'beforeCloseAdd' title = '添加排班' width = '500px'> 
      <el-form ref="formAddRef" label-width="100px" label-position="left" :model="formAdd" :rules="rules">
        <el-form-item label = "岗位名称" prop = "postId">
          <el-select v-model="formAdd.postId" filterable placeholder="请选择岗位名称" style="width: 240px">
            <el-option v-for="item in postList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label = "开始日期" prop = "startDate">
          <el-date-picker v-model="formAdd.startDate" type="datetime" placeholder="开始日期" style="width: 240px" format="YYYY-MM-DD"/>
        </el-form-item>
        <el-form-item label = "结束日期" prop = "endDate">
          <el-date-picker v-model="formAdd.endDate" type="datetime" placeholder="结束日期" style="width: 240px" format="YYYY-MM-DD"/>
        </el-form-item>
      </el-form>
      <template #footer>
          <el-button type="primary" @click="confirm(formAddRef)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model = 'dialogVisibleEdit' :before-close = 'beforeCloseEdit' title = '编辑岗位信息' width = '500px'> 
      <el-form ref="formEditRef" label-width="100px" label-position="left" :model="formEdit" :rules="rules">
          <el-form-item label = "序号" prop = "Id">
            <el-input v-model="formEdit.Id" disabled></el-input>
          </el-form-item>
          <el-form-item label = "学生姓名" prop = "studentName">
            <el-input v-model="formEdit.studentName" disabled></el-input>
          </el-form-item>
          <el-form-item label = "岗位名称" prop = "postName">
            <el-input v-model="formEdit.postName" disabled></el-input>
          </el-form-item>
          <!-- 原有表单项 -->
          <el-form-item label="换班学生" prop="newStudentId">
            <div class="student-select-wrapper">
              <el-input v-model="formEdit.searchKey" placeholder="请输入换班学生学号或姓名" @keyup.enter="handleStudentSearch" >
                <template #append>
                  <el-button type="primary" @click="handleStudentSearch">查询</el-button>
                </template>
              </el-input>
              <div v-if="formEdit.newStudentName" class="selected-student">
                学生ID：{{formEdit.targetStudentId}} 已选学生：{{ formEdit.newStudentName }}（学号：{{ formEdit.newStudentId }}）
              </div>
            </div>
          </el-form-item>
        </el-form>

        <!-- 学生选择弹窗 -->
        <el-dialog v-model="studentDialogVisible" title="选择学生" width="60%">
          <el-table :data="studentList" highlight-current-row @current-change="handleStudentSelect" style="width: 100%" >
            <el-table-column prop="id" label="用户ID" width="120"></el-table-column>
            <el-table-column prop="number" label="学号" width="120"></el-table-column>
            <el-table-column prop="realName" label="姓名"></el-table-column>
            <el-table-column prop="departmentId" show-overflow-tooltip label="部门" width="120" />
          </el-table>
          <template #footer>
            <el-button @click="studentDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmStudentSelection">确认选择</el-button>
          </template>
        </el-dialog>
      <template #footer>
        <el-button type="primary" @click="confirmEdit(formEditRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive ,onMounted ,ref, nextTick} from 'vue';
import { queryPostNames, queryStudentSchedule, addStudentSchedule,searchStudents,changeClass,cancelClass } from '../../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ElMessage } from 'element-plus';

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
    postId: '',
    startDate: '',
    endDate: '',
})
// 编辑弹窗表单数据
const formEdit = reactive({
    Id: '',
    studentName: '',
    postName: '',
  searchKey: '', // 搜索关键词
  newStudentId: '', // 选择的学生的 userId
  newStudentName: '', // 选择的学生的姓名
  targetStudentId: '', // 目标学生的 userId
})
// 添加弹窗表单实例
const formAddRef = ref(null)
// 编辑弹窗表单实例
const formEditRef = ref(null)

//岗位列表
let postList = ref([])

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
    queryPostNames().then(res => {
      console.log(res.data.data)
      postList = res.data.data
    })
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
    queryStudentSchedule(queryCondition).then(res => {
        if(res.data.code === 202){
          ElMessage.error(res.data.message)
        }
        if(res.data.code === 200){
          const list = res.data.data
          list.forEach(item => {
            item.scheduleDate = dayjs(item.scheduleDate).format('YYYY-MM-DD')
          })
          tableData.list = list
          tableData.total = res.data.total
          ElMessage.success(res.data.message)
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
      formEdit.Id = row.id
      formEdit.studentName = row.studentName
      formEdit.postName = row.title
      formEdit.searchKey = ''
      formEdit.newStudentId = ''
      formEdit.newStudentName = ''
      formEdit.targetStudentId = ''
    })
}


// 表单提交添加
const confirm = async (formEl) => {
  if(!formEl) return
  
  await formEl.validate((valid,field) => {
    if(valid){
      formAdd.startDate = dayjs(formAdd.startDate).format('YYYY-MM-DD')
      formAdd.endDate = dayjs(formAdd.endDate).format('YYYY-MM-DD')
      addStudentSchedule(formAdd).then(res => {
        if(res.data.code === 200){
          ElMessage.success(res.data.message)
          dialogVisibleAdd.value = false
          formEl.resetFields()
          getListData()
          formAdd.postId = ''
          formAdd.startDate = ''
          formAdd.endDate = ''
        }
      })
    }else{
      ElMessage.error('请检查输入项')
    }
  })
}

//修改
const confirmEdit = async (formEl) => {
  if(!formEl) return
  
  await formEl.validate((valid,field) => {
    if(valid){
      changeClass(formEdit).then(res => {
        if(res.data.code === 200){
          ElMessage.success(res.data.message)
          dialogVisibleEdit.value = false
          formEl.resetFields()
          getListData()
        }
      })
    }
  })
}


const rules = {
    postId: [
      { required: true, message: '请选择岗位名称', trigger: 'blur' }
    ],
    newStudentId: [
      { required: true, message: '请选择换班学生', trigger: 'change' }
    ],
    startDate: [
      { required: true, message: '请选择开始日期', trigger: 'change' }
    ],
    endDate: [
      { required: true, message: '请选择结束日期', trigger: 'change' }
    ],
  
}

const deleteInfo = (row) => {
  ElMessageBox.confirm('确认禁用该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cancelClass(row.id).then(res => {
      if(res.data.code === 200){
        ElMessage.success(res.data.message)
        getListData()
      }
    })
  }).catch(() => {
    // 取消删除时的操作，这里可以留空或者添加其他逻辑
  });
}

// 数据状态
const studentDialogVisible = ref(false); // 控制学生选择弹窗显示
const studentList = ref([]); // 学生列表数据
const selectedStudent = ref(null); // 当前选中的学生

// 搜索学生
const handleStudentSearch = async () => {
  if (!formEdit.searchKey.trim()) {
    ElMessage.warning('请输入查询内容');
    return;
  }

  try {
    // 调用搜索接口（示例）
    const res = await searchStudents(formEdit.searchKey);
    if(res.data.code === 200){
      const list = res.data.data;
      list.forEach((item) => {
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
      });
      studentList.value = list;
      studentDialogVisible.value = true;
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (error) {
    ElMessage.error('查询失败');
  }
};

// 处理学生选择
const handleStudentSelect = (student) => {
  selectedStudent.value = student;
};

// 确认选择学生
const confirmStudentSelection = () => {
  if (!selectedStudent.value) {
    ElMessage.warning('请先选择学生');
    return;
  }

  formEdit.newStudentId = selectedStudent.value.number;
  formEdit.newStudentName = selectedStudent.value.realName;
  studentDialogVisible.value = false;
  formEdit.searchKey = ''; // 清空搜索关键词
  formEdit.targetStudentId = selectedStudent.value.id; // 记录目标学生的 userId
};


// 模拟搜索学生接口
// const searchStudents = async (params) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         data: [
//           { userId: '1001', name: '张三', departmentId: '1001' },
//           { userId: '1002', name: '李四', departmentId: '1001' },
//         ],
//       });
//     }, 500);
//   });
// };


</script>