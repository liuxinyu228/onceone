<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{{ title }}</h1>
    
    <div class="flex justify-between mb-4">
      <div class="flex space-x-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="border rounded px-2 py-1"
        />
        <select
          v-model="selectedCategory"
          class="border rounded px-2 py-1"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <button
        @click="addItemShowModal"
        class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
      >
        Add TaskTemplate
      </button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th v-for="header in headers" 
                :key="header" 
                class="p-2 text-left text-gray-600 font-semibold text-sm border-b">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedItems" :key="item.id" 
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
            <td class="p-2 border-b">
              <span class="block truncate w-40"> 
                {{ item.title.length > 30 ? item.title.slice(0, 30) + '...' : item.title }}
              </span>
            </td>
            <td class="p-2 border-b">{{ item.work_classification }}</td>
            <td class="p-2 border-b">
              <span class="block truncate w-40">
                {{ item.description.length > 30 ? item.description.slice(0, 30) + '...' : item.description }}
              </span>
            </td>
            <td class="p-2 border-b">
              <span class="block truncate w-40">
                {{ item.guide.length > 30 ? item.guide.slice(0, 30) + '...' : item.guide }}
              </span>
            </td>
            <td class="p-2 border-b">{{ item.taskcategory }}</td>
            <td class="p-2 border-b">
              <button
                @click="editItemShowModal(item)"
                class="text-blue-600 hover:underline mr-2"
              >
                Edit
              </button>
              <button
                @click="confirmDeleteItem(item.id)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="flex justify-between items-center mt-4">
      <div class="flex items-center space-x-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
        >
          &lt;
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
      <select
        v-model="itemsPerPage"
        class="border rounded px-2 py-1"
      >
        <option :value="5">5 per page</option>
        <option :value="10">10 per page</option>
        <option :value="20">20 per page</option>
      </select>
    </div>
  </div>

  <showMessage ref="showMessageRef"></showMessage>

  <optConfirm ref="optConfirmRef"></optConfirm>
  <TaskModal
    :showTaskModal="showTaskModal"
    :editingTask="editingTask"
    @close="showTaskModal = false"
    @save="saveTask"
  />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios' // 确保你已经安装了 axios
import config from '@/util/config'
import showMessage from '@/components/common/showMessage.vue'
import TaskModal from '@/components/admin/TaskModal.vue' // 引入 TaskModal 组件
import optConfirm from '@/components/common/optConfirm.vue'

const title = ref('TaskTemplate Management')
const headers = ['title', 'work_classification', 'description', 'guide', 'taskcategory']
const searchQuery = ref('')
const selectedCategory = ref('All')
const categories = ['All','新技术新业务安全评估', '涉诈风险安全评估']
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showMessageRef = ref(null)
const optConfirmRef = ref(null)
const showTaskModal = ref(false) // 控制 TaskModal 的显示
const editingTask = ref({}) // 存储当前编辑的任务

const items = ref([]) // 初始化为空数组

// 新增：根据接口获取数据
const fetchItems = async (taskType) => {
  try {
    const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/admin/taskTemplate/${taskType}`, {withCredentials:true})
    if (response.status == 200){
      items.value = response.data // 假设返回的数据格式正确
    }else{
      showMessageRef.value.showMessage("Error:",response.data.message)
    }
  } catch (error) {
    showMessageRef.value.showMessage("Error","Error fetching items:"+error)
  }
}

// 在组件挂载时调用 fetchItems
onMounted(() => {
  fetchItems('ALL') // 传入 'ALL'
})

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
    ( selectedCategory.value === 'All' || 
     (selectedCategory.value === '新技术新业务安全评估' && item.work_classification === '101') ||
     (selectedCategory.value === '涉诈风险安全评估' && item.work_classification === '102'))
  )
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const addItemShowModal = () => {
  editingTask.value = {} // 清空编辑任务
  showTaskModal.value = true // 显示 TaskModal
}

const editItemShowModal = (item) => {
  if (item) {
    editingTask.value = { ...item }
    showTaskModal.value = true // 显示 TaskModal
  }
}

const deleteItem = async (taskTemplateId) => {
  // Implement delete item logic
  try {
        const response = await axios.delete(`${config.getSetting('API_BASE_URL')}/api/admin/taskTemplate/`, {
          data: { taskTemplateId },
          withCredentials: true
        });
        console.log("status:",response.status)
        if (response.status === 200) {
          // 移除items中的指定元素
          items.value = items.value.filter(item => item.id !== taskTemplateId) 
        }
      } catch (error) {
        showMessageRef.value.showMessage('Error deleting user: ' + error.message)
      }
  showMessageRef.value.showMessage("Success","删除成功")
}

const confirmDeleteItem = async (id) => {
  const delConfirm = await optConfirmRef.value.showConfirm("确定要删除吗？")
  if (delConfirm){
    deleteItem(id)
  }
}

const saveTask = async (updatedTask) => {
  console.log("uid",updatedTask.id)
  if (!updatedTask.id) {
    // 如果没有 ID，视为新任务
    await addItemSubmit(updatedTask)
  } else {
    // 更新现有任务
    await updateItemSubmit(updatedTask)
  }
  showTaskModal.value = false // 关闭 TaskModal
}

const addItemSubmit =async (updatedTask) => {
  try {
  const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/admin/taskTemplate`,
  updatedTask,
  {withCredentials: true}
  );
  if (response.status === 201){
    fetchItems('ALL')
    showMessageRef.value.showMessage("add item success!")
  }
  }catch(error){
    showMessageRef.value.showMessage("add item has error:"+error)
  }
}

const updateItemSubmit = async (updatedTask) =>{
  try {
  const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/admin/updateTaskTemplate/${updatedTask.id}`,
  updatedTask,
  {withCredentials: true}
  );
  if (response.status === 200){ 
    showMessageRef.value.showMessage("update item success!")
    const index = items.value.findIndex(item => item.id === updatedTask.id)
    if (index !== -1) {
      items.value[index] = { ...updatedTask }
    }
  }
  }catch(error){
    showMessageRef.value.showMessage("update item has error:"+error)
  }
}   


</script>
