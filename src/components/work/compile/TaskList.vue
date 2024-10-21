<template>
  <div>
    <!-- 渲染任务列表 -->
    <TaskItem
      v-for="task in filteredTasks"
      :key="task.id"
      :task="task"
      @edit-task="openEditModal"
      @view-task="openViewModal" 
    />

    <!-- 只引入一次分页组件 -->
    <TaskPagination
      :totalTasks="filteredTypeTaskNum"
      :tasksPerPage="tasksPerPage"
      :currentPage="currentPage"
      @page-changed="handlePageChange"
      @tasks-per-page-changed="handleTasksPerPageChange"
    />

    <!-- 编辑任务弹窗 -->
    <TaskEditModal
      v-if="isEditModalOpen"
      :task="selectedTask"
      @close="closeEditModal"
      @save="saveTask"
    />

    <!-- 查看任务弹窗 -->
    <TaskEditModal
      v-if="isViewModalOpen"
      :task="selectedTask"
      @close="closeViewModal"
      :isViewOnly=true
    />
  </div>
  <showMessage ref="showMessageRef" />
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue';
import TaskItem from '@/components/work/compile/TaskItem.vue';
import TaskPagination from '@/components/work/compile/PaginationBar.vue';
import TaskEditModal from '@/components/work/compile/EditModalBar.vue';
import config from '@/util/config';
import showMessage from '@/components/common/showMessage.vue';

const showMessageRef = ref(null);
const tasks = ref([]); // 从 JSON 文件加载的任务数据
const currentPage = ref(1); // 当前页码
const tasksPerPage = ref(5); // 每页显示的任务数
const isEditModalOpen = ref(false); // 控制编辑弹窗是否显示
const isViewModalOpen = ref(false); // 控制查看弹窗是否显示
const selectedTask = ref(null); // 当前选中的任务
const filters = ref({
  taskcategory: '',
  status: '',
  search: ''
});

// 通过任务类型、状态、搜索进行筛选后的任务数
const filteredTypeTaskNum = computed(() => {
  return tasks.value.filter(task => {
    return (
      (filters.value.taskcategory === '' || task.taskcategory === filters.value.taskcategory) &&
      (filters.value.status === '' || task.status === filters.value.status) &&
      (filters.value.search === '' || task.title.includes(filters.value.search))
    );
  }).length;
});

// 当前页的任务数据
const filteredTasks = computed(() => {
  if (tasks.value.length === 0) {
    return [];
  }
  
  const start = (currentPage.value - 1) * tasksPerPage.value;
  const end = start + tasksPerPage.value;

  const filteredTypeTasks = tasks.value.filter(task => {
    return (
      (filters.value.taskcategory === '' || task.taskcategory === filters.value.taskcategory) &&
      (filters.value.status === '' || task.status === filters.value.status) &&
      (filters.value.search === '' || task.title.includes(filters.value.search))
    );
  });
  return filteredTypeTasks.slice(start, end);
});

onMounted(() => {
  loadTasks();
});

async function loadTasks() {
  try {
    const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/userWorkTasks`, {
      credentials: 'include' // 确保请求时携带 Cookie
    });
    const data = await response.json();
    tasks.value = data;
  } catch (error) {
    console.error('无法加载任务数据:', error);
  }
}

// 处理页码变化事件
function handlePageChange(newPage) {
  currentPage.value = newPage;
}

// 处理每页任务数变化事件
function handleTasksPerPageChange(newTasksPerPage) {
  tasksPerPage.value = newTasksPerPage;
  currentPage.value = 1; // 每页条数变化时，返回第一页
}

// 打开编辑任务的弹窗
function openEditModal(task) {
  selectedTask.value = task;
  isEditModalOpen.value = true;
}

// 关闭编辑弹窗
function closeEditModal() {
  isEditModalOpen.value = false;
  selectedTask.value = null;
}

// 打开查看任务的弹窗
function openViewModal(task) {
  selectedTask.value = task;
  isViewModalOpen.value = true;
}

// 关闭查看弹窗
function closeViewModal() {
  isViewModalOpen.value = false;
  selectedTask.value = null;
}

// 保存编辑的任务
function saveTask(updatedTask, closeHandle) {
  const index = tasks.value.findIndex(task => task.id === updatedTask.id);
  if (index !== -1) {
    tasks.value.splice(index, 1, updatedTask); // 更新任务
  }
  if (closeHandle) {
    closeEditModal(); // 关闭弹窗
  }
}

// 处理筛选条件
function handleFilterTasks(filter) {
  filters.value[filter.type] = filter.value;
}

function applyFilters() {
  currentPage.value = 1; // 应用筛选条件时，返回第一页
}

// 新增任务
async function addTask(newTask) {
  try {
    const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/addUserWorkTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 确保请求时携带凭证
      body: JSON.stringify(newTask)
    });
    const result = await response.json();
    newTask.id = result.id
    showMessageRef.value.showMessage(result.message);
    // 更新任务列表
    tasks.value.unshift(newTask);
  } catch (error) {
    showMessageRef.value.showMessage("错误：" + error.message);
  }
}

// 暴露 addTask 函数给父组件
defineExpose({
  addTask,
  handleFilterTasks,
  applyFilters
});
</script>
