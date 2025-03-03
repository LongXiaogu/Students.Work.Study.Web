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
        <el-input v-model="conditionRef" style="width: 240px" placeholder="电话/邮箱" />
        <el-button class="btn-search" type="primary" @click="getListData" style="width: 80px">查询</el-button>
      </div>
    </div>
    

    <el-table :data="tableData.list" style="width: 100%; height: 100%">
      <el-table-column prop="logId" label="序号" width="80"></el-table-column>
      <el-table-column prop="receiver" label="电话" width="120"></el-table-column>
      <el-table-column prop="content" show-overflow-tooltip label="内容" width="500"></el-table-column>
      <el-table-column prop="status" label="状态" width="180">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.status === 1">已发送</el-tag>
          <el-tag type="info" v-else-if = "scope.row.status === 2">失败</el-tag>
          <el-tag type="warning" v-else>待发送</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="retryCount" label="重试次数" width="200"></el-table-column>
      <el-table-column prop="errorMessage" label="错误信息" width="200"></el-table-column>
      <el-table-column prop="sentTime" label="发送时间" width="200"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200"></el-table-column>
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
  </div>
</template>

<script setup>
import { reactive ,onMounted ,ref, nextTick} from 'vue';
import {queryNoticeLogs } from '../../../api';
import dayjs from 'dayjs';

// 开始时间
const starTimeRef = ref('')
// 结束时间
const endTimeRef = ref('')
// 搜索条件
const conditionRef = ref('')



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

onMounted(()=>{
    getListData();
})

const handleSizeChange = (size) => {
    queryCondition.pageSize = size
    getListData()

}

const handleCurrentChange = (currentPage) => {
    queryCondition.pageIndex = currentPage
    getListData()
}

// 获取列表数据
const getListData = () => {
  queryNoticeLogs(queryCondition).then(res => {
    const list = res.data.data
    list.forEach(item => {
      item.sentTime = dayjs(item.sentTime).format('YYYY-MM-DD HH:mm:ss')
      item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    tableData.list = list
    tableData.total = res.data.total;
  });
}


</script>