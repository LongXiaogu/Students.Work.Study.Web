<template>
  <div class="post-container">
    <!-- 新增我的申请按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="showMyApplications">我的申请</el-button>
    </div>
    <!-- 岗位列表 -->
    <el-row :gutter="20">
      <el-col 
        v-for="post in postList"  :key="post.Id"  :xs="24"  :sm="12"  :md="8"  :lg="6">
        <el-card class="post-card">
          <template #header>
            <div class="card-header">
              <span>{{ post.Title }}</span>
            </div>
          </template>

          <div class="post-content">
            <div class="post-item"><strong>描述：</strong>{{ post.Description }}</div>
            <div class="post-item"><strong>要求：</strong>{{ post.Demand }}</div>
            <div class="post-item"><strong>需求人数：</strong>{{ post.NeedPeople }}人</div>
            <div class="post-item"><strong>地点：</strong>{{ post.Place }}</div>
            <div class="post-item"><strong>部门：</strong>{{ post.DepartmentId }}</div>
            <div class="post-item"><strong>时薪：</strong>¥{{ post.SalaryPerHour }}</div>
            <div class="post-item"><strong>基本工资：</strong>¥{{ post.BaseSalary }}</div>
            <div class="post-item">
              <strong>截止时间：</strong>
              {{ dayjs(post.Deadline).format('YYYY-MM-DD') }}
            </div>
          </div>

          <template #footer>
            <el-button 
              type="primary" 
              :disabled="!post.Status"
              @click="showApplyDialog(post)"
            >
              {{ post.Status ? '立即申请' : '已截止' }}
            </el-button>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增我的申请对话框 -->
    <el-dialog v-model="myAppDialogVisible" title="我的申请记录" width="1250px">
      <el-table :data="myApplications" border stripe>
        <template #empty>
          <el-empty description="暂无申请记录" />
        </template>
        <el-table-column prop="PostTitle" label="岗位名称" width="180" />
        <el-table-column prop="ApplyTime" label="申请时间" width="400">
          <template #default="{ row }">
            {{ dayjs(row.ApplyTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop ="ResponseMessage" label="回复信息" width="400"></el-table-column>
        
        <el-table-column prop="Status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.Status)">
              {{ formatStatus(row.Status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              :disabled="row.Status !== 'pending'"
              @click="handleRevoke(row.ApplyId)"
              :loading="revokeLoading[row.ApplyId]"
            >
              撤销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 申请对话框 -->
    <el-dialog v-model="dialogVisible" title="岗位申请" :before-close="beforeClose">
      <el-form label-width="100px">
        <el-form-item label="岗位名称">
          <span>{{ selectedPost?.Title }}</span>
        </el-form-item>
        <el-form-item label="工作地点">
          <span>{{ selectedPost?.Place }}</span>
        </el-form-item>
        <el-form-item label="时薪">
          <span>¥{{ selectedPost?.SalaryPerHour }}</span>
        </el-form-item>
        <el-form-item label="截止时间">
          <span>{{ dayjs(selectedPost?.Deadline).format('YYYY-MM-DD') }}</span>
        </el-form-item>
        <el-form-item label="申请理由" prop="reason">
          <el-input
            v-model="applyForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入申请理由"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import dayjs from 'dayjs'
import { queryApplyPositions, applyPosition, getApplyPositionsByStudent, cancelApplyPosition } from '../../api'

// 响应式数据
const postList = ref([])
const dialogVisible = ref(false)
const selectedPost = ref(null)
const applyForm = ref({
  postId: null,
  reason: ''
})

// 新增响应式数据
const myAppDialogVisible = ref(false)
const myApplications = ref([])
const revokeLoading = ref({}) // 记录每个岗位的撤销加载状态

// 模拟我的申请数据
const mockApplications = [
  {
    ApplyId: 1,
    PostTitle: '图书馆管理员',
    ApplyTime: '2024-05-01 14:30:00',
    ResponseMessage: '',
    Status: 'pending' // pending / approved / rejected
  }
]


const Department = [
  "航空制造与工程学部",
  "电子信息与自动化学部",
  "经济管理学部",
  "航空服务与传媒学部",
  "文学与体育学部",
  "计算机学部",
  "马克思主义学院",
]


// 获取我的申请记录
const getMyApplications = async () => {
  try {
    // 实际应替换为接口调用
    // const res = await axios.get('/api/my-applications')
    getApplyPositionsByStudent().then((res) => {
      if(res.data.code === 200){
        const list = res.data.data.map((item) => {
          var status = 'pending'
          if(item.isPass === true){
            status = 'approved'
          }else if(item.isDeleted === true){
            status = 'quash'
          }
          else if(item.isPass === false && item.isResponse === true){
            status ='rejected'
          }else{
            status = 'pending'
          }
          return {
            ApplyId: item.id,
            PostTitle: item.title,
            ApplyTime: item.applyDate,
            ResponseMessage: item.responseMessage,
            Status: status
          }
        })
        myApplications.value = list
        ElMessage.success('获取申请记录成功')
      }
    })
  } catch (error) {
    ElMessage.error('获取申请记录失败')
  }
}


// 获取岗位列表
const getPosts = async () => {
  try {
    queryApplyPositions().then((res) => {
      if(res.data.code === 200){
        const list = res.data.data.map((item) => {
          return {
            Id: item.id,
            Title: item.title,
            Description: item.description,
            Demand: item.demand,
            NeedPeople: item.needPeople,
            Deadline: dayjs(item.deadline).format('YYYY-MM-DD'),
            Status: item.status,
            Place: item.place,
            DepartmentId: Department[item.departmentId - 1],
            SalaryPerHour: item.salaryPerHour,
            BaseSalary: item.baseSalary
          }
        })
        postList.value = list
      }
    })
    // postList.value = mockPosts
  } catch (error) {
    ElMessage.error('获取岗位列表失败')
  }
}

// 显示我的申请对话框
const showMyApplications = async () => {
  await getMyApplications()
  myAppDialogVisible.value = true
}

// 格式化状态显示
const formatStatus = (status) => {
  const statusMap = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    quash:'已撤销'
  }
  return statusMap[status] || '未知状态'
}

// 状态标签样式
const statusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    quash:'info'
  }
  return typeMap[status] || 'info'
}



// 显示申请对话框
const showApplyDialog = (post) => {
  selectedPost.value = post
  applyForm.value.postId = post.Id
  dialogVisible.value = true
}

// 提交申请
const handleApply = async () => {
  if (!applyForm.value.reason.trim()) {
    ElMessage.warning('请输入申请理由')
    return
  }

  try {
    console.log(applyForm.value)
    applyPosition(applyForm.value).then((res) => {
      if(res.data.code === 200){
        ElMessage.success('申请提交成功')
        dialogVisible.value = false
        getPosts()
        applyForm.value.reason = ''
      }else{
        ElMessage.error('申请提交失败')
      }
    })
  } catch (error) {
    ElMessage.error('申请提交失败')
  }
}

// 撤销申请
const handleRevoke = async (id) => {
  const loading = ElLoading.service({
      lock: true,
      text: '正在撤销申请...'
    })
    
  
  try {
    revokeLoading.value[id] = true
    
    cancelApplyPosition(id).then((res) => {
      if(res.data.code === 200){
        getMyApplications()
        ElMessage.success('撤销申请成功')
      }
    })
  } catch (error) {
    ElMessage.error('撤销申请失败')
  } finally {
    revokeLoading.value[id] = false
    loading.close()
  }
}


const beforeClose = (action, instance) => {
  dialogVisible.value = false
  applyForm.value.reason = ''
}

// 生命周期钩子
onMounted(() => {
  getPosts()
})
</script>

<style lang="less" scoped>

.post-container {
  padding: 20px;
}

.post-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.post-content {
  font-size: 14px;
  color: #666;
}

.post-item {
  margin: 8px 0;
  line-height: 1.5;
}

.action-bar {
  margin-bottom: 20px;
  text-align: right;
}
</style>