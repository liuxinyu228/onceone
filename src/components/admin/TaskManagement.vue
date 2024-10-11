<template>
  <div v-if="activeTab === 'tasks'">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Task Management</h2>
      <button @click="openTaskModal()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Add Task
      </button>
    </div>
    <div class="mb-4 flex flex-wrap items-center justify-between">
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <input v-model="taskSearch" @input="handleTaskSearch" type="text" placeholder="Search tasks..." class="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
      </div>
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <select v-model="taskFilter" @change="handleTaskFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
          <option value="">All Categories</option>
          <option value="Feature">Feature</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
      <div class="w-full md:w-1/3">
        <select v-model="taskPagination.itemsPerPage" @change="handleItemsPerPageChange('task')" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
          <option :value="5">5 per page</option>
          <option :value="10">10 per page</option>
          <option :value="20">20 per page</option>
        </select>
      </div>
    </div>
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="header in taskHeaders" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ header }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="task in paginatedTasks" :key="task.id">
            <td v-for="header in taskHeaders" :key="`${task.id}-${header}`" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ task[header] }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openTaskModal(task)" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
              <button @click="deleteTask(task.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex flex-wrap justify-between items-center">
      <div class="w-full sm:w-auto mb-4 sm:mb-0">
        <span class="text-sm text-gray-700">
          Showing {{ taskPagination.start + 1 }} to {{ taskPagination.end }} of {{ filteredTasks.length }} tasks
        </span>
      </div>
      <div class="w-full sm:w-auto flex justify-center sm:justify-end">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button @click="taskPagination.current--" :disabled="taskPagination.current === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Previous
          </button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {{ taskPagination.current }} of {{ taskPagination.total }}
          </span>
          <button @click="taskPagination.current++" :disabled="taskPagination.current === taskPagination.total" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </nav>
      </div>
    </div>
  
    <task-modal
      :show-task-modal="showTaskModal"
      :editing-task="editingTask"
      :task-fields="taskFields"
      @close="closeTaskModal"
      @save="saveTask"
    />
       <!--消息弹窗-->
       <div v-if="message" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
        <p class="text-gray-800 mb-4">{{ message }}</p>
        <button @click="closeMessage" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          确定
        </button>
      </div>
    </div>
    <!-- 确认删除弹窗 -->
    <div v-if="confirmDelete" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
        <p class="text-gray-800 mb-4">确定要删除这个任务吗？</p>
        <button @click="confirmDeleteTask" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2">确定</button>
        <button @click="cancelDelete" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import TaskModal from './TaskModal.vue'
import axios from 'axios'
import config from '../../util/config'

export default {
  components: {
    TaskModal
  },
  data() {
    return {

      activeTab: 'tasks',
      taskHeaders: ['title', 'work_classification', 'description', 'guide', 'taskCategory'],
      tasks: [],
      showTaskModal: false,
      editingTask: {},
      taskSearch: '',
      taskFilter: '',
      taskPagination: {
        current: 1,
        itemsPerPage: 5
      },
      taskFields: ['title', 'work_classification', 'description', 'guide', 'taskCategory'],
      message: '', // 新增消息字段
      confirmDelete: false, // 确认删除弹窗的显示状态
      taskIdToDelete: null // 要删除的任务ID
    }
  },
  created() {
    this.fetchTasks();
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(this.taskSearch.toLowerCase()) ||
                              task.description.toLowerCase().includes(this.taskSearch.toLowerCase())
        const matchesFilter = this.taskFilter === '' || task.taskCategory === this.taskFilter
        return matchesSearch && matchesFilter
      })
    },
    paginatedTasks() {
      return this.filteredTasks.slice(this.taskPagination.start, this.taskPagination.end)
    },
    taskPaginationTotal() {
      return Math.ceil(this.filteredTasks.length / this.taskPagination.itemsPerPage)
    },
    taskPaginationStart() {
      return (this.taskPagination.current - 1) * this.taskPagination.itemsPerPage
    },
    taskPaginationEnd() {
      return Math.min(this.taskPaginationStart + this.taskPagination.itemsPerPage, this.filteredTasks.length)
    }
  },
  methods: {
    handleTaskSearch() {
      this.taskPagination.current = 1
    },
    handleTaskFilter() {
      this.taskPagination.current = 1
    },
    handleItemsPerPageChange() {
      this.taskPagination.current = 1
    },
    openTaskModal(task = {}) {
      this.editingTask = { ...task }
      this.showTaskModal = true
    },
    closeTaskModal() {
      this.showTaskModal = false
    },
    saveTask(task) {
      if (task.id) {
        this.updateTask(task)
      } else {
        this.addTask(task)
      }
    },
    async addTask(task) {
      try {
        const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/taskTemplate`, task,{ withCredentials: true });
        this.tasks.push({ ...task, id: response.data.taskId });
        this.showMessage('Task added successfully');
        this.showTaskModal = false;
      } catch (error) {
        console.error('Error adding task:', error);
        this.showMessage('Error adding task');
      }
    },
    async updateTask(task) {
      try {
        await axios.post(`${config.getSetting('API_BASE_URL')}/api/updateTaskTemplate/${task.id}`, task,{ withCredentials: true });
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks.splice(index, 1, task);
        }
        this.showTaskModal = false;
        this.showMessage('Task updated successfully');
      } catch (error) {
        console.error('Error updating task:', error);
        this.showMessage('Error updating task');
      }
    },
    async deleteTask(taskId) {
      this.taskIdToDelete = taskId;
      this.confirmDelete = true;
    },
    async confirmDeleteTask() {
      try {
        await axios.delete(`${config.getSetting('API_BASE_URL')}/api/taskTemplate/${this.taskIdToDelete}`,{ withCredentials: true });
        this.tasks = this.tasks.filter(task => task.id !== this.taskIdToDelete);
        this.confirmDelete = false;
      } catch (error) {
        console.error('Error deleting task:', error);
        this.showMessage('Error deleting task');
      }
    },
    async fetchTasks() {
      try {
        const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/taskTemplate/ALL`,{ withCredentials: true });
        const classificationMap = {
          101: '新技术新业务安全评估',
          102: '新业务涉诈风险评估'
        };
        this.tasks = response.data.map(task => ({
          ...task,
          work_classification: classificationMap[task.work_classification] || task.work_classification
        }));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        this.showMessage('Error fetching tasks');
      }
    },
    showMessage(msg) {
      this.message = msg;
    },
    closeMessage() {
      this.message = '';
    },
    cancelDelete() {
      this.confirmDelete = false;
      this.taskIdToDelete = null;
    }
  }
}
</script>