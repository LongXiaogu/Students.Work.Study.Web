import request from "../utils/request.js";

// 发送验证码
export const loginCode = (data) =>{
    return request.post(`/Authorize/SendLoginCode?userName=${data.userName}`,data)
}
// 发送注册验证码
export const registerCode = (data) =>{
    return request.post(`/Authorize/SendRegisterCode?phoneNumber=${data.phone}`,data)
}

// 发送重置密码验证码
export const resetPasswordCode = (data) =>{
    return request.post(`/Authorize/SendResetPasswordToken?userName=${data.userName}`,data)
}

// 登录
export const login = (data) =>{
    return request.post('/Authorize/Login',data)
}

// 注册
export const register = (data) =>{
    return request.post('/Authorize/Register',data)
}

// 获取用户信息
export const querytUsers = (params) =>{
    return request.get('/User/QueryUsers',{params})
}

// 添加用户
export const createUser = (data) => {
    return request.post(`/User/CreateUser?password=${data.password}`,data)
}

// 停用用户
export const disableUser = (id) => {
    return request.delete(`/User/DeleteUser?id=${id}`)
}

// 更改用户信息
export const updateUser = (data) => {
    return request.put(`/User/UpdateUser`,data)
}

// 修改本人信息
export const updateMyInfo = (data) => {
    return request.put('/User/UpdateUserInfo',data)
}

// 上传用户头像
export const uploadAvatar = (data) => {
    return request.post('/User/UploadUserAvatar',data)
}


// 获取岗位信息
export const queryPositions = (params) => {
    return request.get('/Post/GetPostList',{params})
}

// 获取可申请岗位信息
export const queryApplyPositions = () => {
    return request.get('/Post/GetPostListForStudent')
}


// 添加岗位
export const addPost = (data) => {
    return request.post('/Post/CreatePost',data)
}

// 停用岗位
export const disablePost = (id) => {
    return request.delete(`/Post/DeletePost?id=${id}`)
}

// 更改岗位信息
export const updatePost = (data) => {    
    return request.put('/Post/UpdatePost',data)
}

// 获取薪资配置信息
export const querySalaryConfigs = (params) => {
    return request.get('/SalaryConfig/GetSalaryConfig',{params})
}

// 删除薪资配置
export const deleteSalaryConfig = (id) => {
    return request.delete(`/SalaryConfig/DeleteSalaryConfig?id=${id}`)
}

// 更新薪资配置
export const updateSalaryConfig = (data) => {
    return request.put('/SalaryConfig/UpdateSalaryConfig',data)
}

// 添加薪资配置
export const addSalaryConfig = (data) => {
    return request.post('/SalaryConfig/CreateSalaryConfig',data)
}

// 获取职位名称
export const queryPostNames = (params) => {
    return request.get('/Post/GetPostName',{params})
}

// 计算薪资
export const calculateSalary = (data) => {
    return request.get(`/Salary/CalculateSalaries?startDate=${data.startDate}&endDate=${data.endDate}`)
}

// 导出薪资明细
export const exportSalaryDetail = (data) => {
    return request.get(`/Salary/ExportSalaries?startDate=${data.startDate}&endDate=${data.endDate}`,{responseType: 'blob'})
}

// 获取薪资明细
export const querySalaryDetail = (params) => {
    return request.get('/Salary/GetSalaryStatistics',{params})
}

// 审核薪资
export const auditSalary = (data) => {
    return request.post('/Salary/AuditSalary',data)
}

// 获取通知日志信息
export const queryNoticeLogs = (params) => {
    return request.get('/NotificationLog/GetNotificationLogByDate',{params})
}

// 获取通知配置
export const queryNoticeConfig = (params) => {
    return request.get('/NotificationConfig/GetNotificationConfigs',{params})
}

// 添加通知配置
export const addNoticeConfig = (data) => {
    return request.post('/NotificationConfig/CreateNotificationConfig',data)
}

// 删除通知配置
export const deleteNoticeConfig = (id) => {
    return request.delete(`/NotificationConfig/DeleteNotificationConfig?id=${id}`)
}

// 更改通知配置
export const updateNoticeConfig = (data) => {
    return request.put(`/NotificationConfig/UpdateNotificationConfig`,data)
}

// 获取通知模板
export const queryNoticeTemplates = (params) => {
    return request.get('/NotificationTemplate/GetNotificationTemplateByCondition',{params})
}

// 添加通知模板
export const addNoticeTemplate = (data) => {
    return request.post(`/NotificationTemplate/CreateNotificationTemplate?templateName=${data.templateName}&templateType=${data.templateType}&content=${data.content}&field=${data.field}&isEnable=${data.isEnable}`)
}

// 删除通知模板
export const deleteNoticeTemplate = (id) => {
    return request.delete(`/NotificationTemplate/DeleteNotificationTemplate?id=${id}`)
}

// 更改通知模板
export const updateNoticeTemplate = (data) => {
    return request.put(`/NotificationTemplate/UpdateNotificationTemplate?templateId=${data.templateId}&content=${data.content}&field=${data.field}&isEnable=${data.isEnable}`)
}

// 提交空闲时间
export const submitFreeTime = (data) => {
    return request.post(`/StudentAvailability/BatchUpdateAvailability`,data)
}

// 获取空闲时间
export const queryFreeTime = () => {
    return request.get('/StudentAvailability/GetAvailability')
}
// 获取学生排班信息
export const queryStudentSchedule = (params) => {
    return request.get('/Schedule/GetSchedules',{params})
}
// 添加学生排班信息
export const addStudentSchedule = (data) => {
    return request.post(`/Schedule/GenerateSchedules`,data)
}

// 获取学生信息
export const searchStudents = (params) => {
    return request.get(`/User/GetSutudentInfo?condition=${params}`)
}

// 学生换班
export const changeClass = (data) => {
    return request.post(`/Schedule/SwapSchedule?scheduleId=${data.Id}&targetStudentId=${data.targetStudentId}`)
}

// 学生退班
export const cancelClass = (param) => {
    return request.post(`/Schedule/WithdrawSchedule?scheduleId=${param}`)
}

// 获取岗位排班信息
export const fetchSchedules = (params) => {
    return request.get(`/PositionRequirements/GetPositionRequirement?postId=${params.postId}&month=${params.month}`)
}

// 提交岗位需求信息
export const saveSchedule = (data) => {
    return request.post('/PositionRequirements/AddPositionRequirement',data)
}

// 删除岗位需求信息
export const deleteSchedule = (postId,date,timeSlot) => {
    return request.delete(`/PositionRequirements/DeletePositionRequirement?postId=${postId}&date=${date}&timeSlot=${timeSlot}`)
}

// 获取学生考勤信息
export const fetchAttendance = (params) => {
    return request.get('/Attendance/GetAttendance',{params})
}

// 修改学生考勤信息
export const updateAttendance = (data) => {
    return request.put('/Attendance/UpdateAttendance',data)
}

// 导出学生考勤信息
export const exportAttendance = (params) => {
    return request.get('/Attendance/ExportAttendance',{params,responseType: 'blob'})
}

// 通过学号获取学生排班信息
export const getStudentScheduleByStudent = (params) => {
    return request.get(`/Schedule/GetSchedulesByStudent`,{params})
}

// 学生签到
export const checkIn = (data) => {
    return request.post('/Attendance/CheckIn',data)
}

// 获取学生打卡记录
export const getCheckInRecords = (params) => {
    return request.get('/Attendance/GetAttendanceByStudent',{params})
}

// 学生签退
export const checkOut = (data) => {
    return request.post(`/Attendance/CheckOut?id=${data.id}`)
}

// 获取学生申请岗位信息
export const getApplyPositions = (params) => {
    return request.get('/PostApply/GetApplyList',{params})
}

// 审核学生申请岗位信息
export const auditApplyPosition = (data) => {
    return request.post(`/PostApply/Audit?applyId=${data.applyId}&message=${data.message}&isPass=${data.isPass}`)
}

// 学生岗位申请
export const applyPosition = (data) => {
    return request.post('/PostApply/Apply',data)
}

// 获取单个学申请岗位信息
export const getApplyPositionsByStudent = () => {
    return request.get(`/PostApply/GetMyApply`)
}

// 学生取消申请
export const cancelApplyPosition = (applyId) => {
    return request.post(`/PostApply/Cancel?applyId=${applyId}`)
}

// 获取菜单列表
export const getMenuList = () => {
    return request.get('/Menu/GetMenu')
}

// 发送忘记密码验证码
export const forgetPasswordCode = (userName) =>{
    return request.post('/Authorize/SendResetPasswordToken?userName='+userName)
}

// 重置密码
export const resetPassword = (data) => {
    return request.post('/Authorize/ForgetPassword',data)
}