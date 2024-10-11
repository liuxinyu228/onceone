<template>
  <div v-if="activeTab === 'users'">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">User Management</h2>
      <button @click="openUserModal()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Add User
      </button>
    </div>
    <div class="mb-4 flex flex-wrap items-center justify-between">
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <input v-model="userSearch" @input="handleUserSearch" type="text" placeholder="Search users..." class="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
      </div>
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <select v-model="userFilter" @change="handleUserFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div class="w-full md:w-1/3">
        <select v-model="userPagination.itemsPerPage" @change="handleItemsPerPageChange('user')" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300">
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
            <th v-for="header in userHeaders" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ header }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td v-for="header in userHeaders" :key="`${user.id}-${header}`" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user[header] }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openUserModal(user)" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
              <button @click="confirmDeleteUser(user.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex flex-wrap justify-between items-center">
      <div class="w-full sm:w-auto mb-4 sm:mb-0">
        <span class="text-sm text-gray-700">
          Showing {{ userPagination.start + 1 }} to {{ userPagination.end }} of {{ filteredUsers.length }} users
        </span>
      </div>
      <div class="w-full sm:w-auto flex justify-center sm:justify-end">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button @click="userPagination.current--" :disabled="userPagination.current === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Previous
          </button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {{ userPagination.current }} of {{ userPagination.total }}
          </span>
          <button @click="userPagination.current++" :disabled="userPagination.current === userPagination.total" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </nav>
      </div>
    </div>

    <!--消息弹窗-->
    <div v-if="message" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
        <p class="text-gray-800 mb-4">{{ message }}</p>
        <button @click="closeMessage" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          确定
        </button>
      </div>
    </div>

    <UserModal
      :showUserModal="showUserModal"
      :editingUser="editingUser"
      @save-user="saveUser"
      @close-user-modal="closeUserModal"
    />
  </div>

  <optConfirm ref="optConfirmRef" />
</template>

<script>
import UserModal from './UserModal.vue';
import axios from 'axios';
import config from '../../util/config'
import optConfirm from '../optConfirm.vue'
import { ref } from 'vue'

export default {
  components: {
    UserModal,
    optConfirm
  },
  setup() {
    const optConfirmRef = ref(null); // 定义optConfirmRef
    return { optConfirmRef }
  },
  data() {
    return {
      activeTab: 'users',
      userHeaders: ['username', 'email', 'phone', 'status', 'is_admin', 'group_id', 'persona_id'],
      users: [],
      showUserModal: false,
      editingUser: {},
      userSearch: '',
      userFilter: '',
      userPagination: {
        current: 1,
        itemsPerPage: 5,
      },
      message: '', // 新增错误信息变量
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(this.userSearch.toLowerCase()) ||
                              user.email.toLowerCase().includes(this.userSearch.toLowerCase())
        const matchesFilter = this.userFilter === '' || user.status === this.userFilter
        return matchesSearch && matchesFilter
      })
    },
    total() {
      return Math.ceil(this.filteredUsers.length / this.userPagination.itemsPerPage)
    },
    start() {
      return (this.userPagination.current - 1) * this.userPagination.itemsPerPage
    },
    end() {
      return Math.min(this.start + this.userPagination.itemsPerPage, this.filteredUsers.length)
    },
    paginatedUsers() {
      return this.filteredUsers.slice(this.start, this.end)
    }
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/getAllUsers`, { withCredentials: true }); // 携带凭证
        this.users = response.data;
      } catch (error) {
        this.message = 'Error fetching users: ' + error.message;
      }
    },
    handleUserSearch() {
      this.userPagination.current = 1
    },
    handleUserFilter() {
      this.userPagination.current = 1
    },
    handleItemsPerPageChange() {
      this.userPagination.current = 1
    },
    openUserModal(user = {}) {
      this.editingUser = { ...user };
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
    },
    saveUser(user) {
      if (user.id) {
        this.updateUser(user);
      } else {
        this.addUser(user);
      }
    },
    async addUser(user) {
      try {
        console.log(user)
        const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/addUser`, user, { withCredentials: true });
        if (response.status === 201) {
        user.id = response.data.userId;
        this.users.push(user);
        this.message = '用户创建成功，初始密码为：' + response.data.password;
        } else {
          this.message = 'Error adding user: ' + response.data.message;
        }
      } catch (error) {
        this.message = 'Error adding user: ' + error.message;
      }
    },
    async updateUser(user) {
      try {
        const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/updateUser`, user, { withCredentials: true });
        if (response.status === 200) {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users.splice(index, 1, user);
          }
        }
      } catch (error) {
        this.message = 'Error updating user: ' + error.message;
      }
    },
    
    async confirmDeleteUser(user_id) {
      if (this.optConfirmRef) { // 使用this.optConfirmRef
        const confirmed = await this.optConfirmRef.showConfirm('您确定要删除此用户吗？');
        if (confirmed) {
          this.deleteUser(user_id);
        }
      }
    },

    async deleteUser(user_id) {
      try {
        const response = await axios.delete(`${config.getSetting('API_BASE_URL')}/api/deleteUser`, {
          data: { user_id },
          withCredentials: true
        });
        if (response.status === 200) {
          this.message = '用户删除成功';
          const index = this.users.findIndex(u => u.id === user_id);
          if (index !== -1) {
            this.users.splice(index, 1);
          }
        }
      } catch (error) {
        this.message = 'Error deleting user: ' + error.message;
      }
    },
    closeMessage() {
      this.message = '';
    }
  }
}
</script>