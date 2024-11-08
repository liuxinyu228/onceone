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
        Add User
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
            <td class="p-2 border-b">{{ item.username }}</td>
            <td class="p-2 border-b">{{ item.status }}</td>
            <td class="p-2 border-b">{{ item.email }}</td>
            <td class="p-2 border-b">{{ item.phone }}</td>
            <td class="p-2 border-b">{{ item.is_admin }}</td>
            <td class="p-2 border-b">{{ item.group_id }}</td>
            <td class="p-2 border-b">{{ item.persona_id }}</td>
            <td class="p-2 border-b">{{ item.created_at }}</td>
            <td class="p-2 border-b">
              <button
                @click="editItemShowModal(item)"
                class="text-blue-600 hover:underline mr-2"
              >
                Edit
              </button>
              <button
                @click="lockItem(item.id)"
                class="text-yellow-600 hover:underline mr-2"
              >
                Lock
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
  <userModal
    :showUserModal="showUserModal"
    :editingUser="editingUser"
    @close="showUserModal = false"
    @save="saveTask"
  />
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios' // 确保你已经安装了 axios
import config from '@/util/config'
import showMessage from '@/components/common/showMessage.vue'
import userModal from '@/components/admin/UserModal.vue'
import optConfirm from '@/components/common/optConfirm.vue'

const title = ref('UserManagement')
const headers = ['username', 'status','email','phone' ,'is_admin', 'group_id','persona_id','created_at']
const searchQuery = ref('')
const selectedCategory = ref('All')
const categories = ['All','admin', 'user']
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showMessageRef = ref(null)
const optConfirmRef = ref(null)
const showUserModal = ref(false) // 控制 userModal 的显示
const editingUser = ref({}) // 存储当前编辑的用户

const items = ref([]) // 初始化为空数组

// 新增：根据接口获取数据
const fetchItems = async () => {
  try {
    const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/admin/getAllUsers`, {withCredentials:true})
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
  fetchItems() // 传入 'ALL'
})

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.username.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
    ( selectedCategory.value === 'All' || 
     (selectedCategory.value === 'admin' && item.is_admin === 1) ||
     (selectedCategory.value === 'user' && item.is_admin === 0))
  )
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const addItemShowModal = () => {
  editingUser.value = {}// 清空编辑用户
  console.log("editingUser:",editingUser.value)
  showUserModal.value = true // 显示 userModal
}

const editItemShowModal = (item) => {
  if (item) {
    editingUser.value = { ...item }
    showUserModal.value = true // 显示 TaskModal
  }
}

const deleteItem = async (id) => {
  // Implement delete item logic
  try {
        const response = await axios.delete(`${config.getSetting('API_BASE_URL')}/api/admin/deleteUser/`, {
          data: { id },
          withCredentials: true
        });
        console.log("status:",response.status)
        if (response.status === 200) {
          // 移除items中的指定元素
          items.value = items.value.filter(item => item.id !== id) 
        }
      } catch (error) {
        showMessageRef.value.showMessage('Error deleting user: ' + error.message)
      }
  showMessageRef.value.showMessage("Success","删除成功")
}

const confirmDeleteItem = async (id) => {
  const delConfirm = await optConfirmRef.value.showConfirm("会删除该用户所有数据包括评估进度，确定要删除吗？")
  if (delConfirm){
    deleteItem(id)
  }
}

const saveTask = async (updatedTask) => {
  if (!updatedTask.id) {
    // 如果没有 ID，视为新任务
    await addItemSubmit(updatedTask)
  } else {
    // 更新现有任务
    await updateItemSubmit(updatedTask)
  }
  showUserModal.value = false // 关闭 TaskModal
}

const addItemSubmit =async (User) => {
  try {
  const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/admin/addUser`,
  User,
  {withCredentials: true}
  );
  if (response.status === 201){
    showMessageRef.value.showMessage("用户新增成功，初始密码为："+response.data.password)
    fetchItems();
  }
  }catch(error){
    showMessageRef.value.showMessage("错误:"+error)
  }
}

const updateItemSubmit = async (updatedTask) =>{
  try {
  const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/admin/updateUser`,
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

const lockItem = async (id) => {
  try {
    const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/admin/lockUser`, { id }, { withCredentials: true });
    if (response.status === 200) {
      showMessageRef.value.showMessage("Success："+response.data.message);
      fetchItems(); // 重新获取用户列表以更新状态
    }
  } catch (error) {
    showMessageRef.value.showMessage("锁定/解锁用户时出错: " + error.message);
  }
}

</script>

