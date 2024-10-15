<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            选择已存在的任务
          </h2>
        </div>
        
        <!-- 搜索栏 -->
        <div class="flex justify-center">
          <div class="relative w-full max-w-xl">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索任务..."
              class="w-full px-4 py-2 text-gray-900 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              @input="handleSearch"
            />
            <button
              class="absolute right-0 top-0 mt-2 mr-2"
              @click="handleSearch"
            >
              <SearchIcon class="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>
  
        <!-- 任务列表 -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  业务系统名称
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  负责人
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  评估类型
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in displayedTasks" :key="task.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ task.system_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ task.superintendent_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ task.work_classification }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ task.created_at }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="selectTask(task)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    选择
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- 分页 -->
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div class="flex flex-1 justify-between items-center">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              上一页
            </button>
            <span class="mx-2 text-sm text-gray-700">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
  
        <!-- 返回按钮 -->
        <div class="flex justify-center mt-4">
          <button
            @click="$emit('back')"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { encrypt } from '@/util/util.js'
  import Cookies from 'js-cookie'
  import config from '@/util/config'

  export default {
    setup() {
      const tasks = ref([])
      const searchQuery = ref('')
      const currentPage = ref(1)
      const itemsPerPage = 5
      const totalPages = ref(1)

      const fetchTasks = async () => {
        try {
          const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/userWorks`, {
            credentials: 'include' // 携带凭证
          });
          const data = await response.json();

          // 确保 data.data 和 data.total 存在
          if (data.data && data.total !== undefined) {
            tasks.value = data.data
            totalPages.value = Math.ceil(data.total / itemsPerPage)
          } else {
            console.error('Unexpected response format:', data)
          }
        } catch (error) {
          console.error('Error fetching tasks:', error)
        }
      }

      onMounted(() => {
        fetchTasks()
      })

      const filteredTasks = computed(() => {
        return tasks.value.filter(task =>
          task.system_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          task.superintendent_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          task.work_classification.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      })

      const displayedTasks = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredTasks.value.slice(start, end)
      })

      const handleSearch = () => {
        currentPage.value = 1
      }

      const prevPage = () => {
        if (currentPage.value > 1) {
          currentPage.value--
        }
      }

      const nextPage = () => {
        if (currentPage.value < totalPages.value) {
          currentPage.value++
        }
      }

      return {
        tasks,
        searchQuery,
        currentPage,
        itemsPerPage,
        filteredTasks,
        totalPages,
        displayedTasks,
        handleSearch,
        prevPage,
        nextPage
      }
    },
    methods: {
      selectTask(task) {
        console.log('选择的任务:', task)
        const taskInfo = {
          system_name: task.system_name,
          work_classification: task.work_classification
        }
        Cookies.set('taskInfo', encrypt(JSON.stringify(taskInfo)), { path: '/' })
        this.$router.push({
          path: '/compile',
        })
      }
    }
  }
  </script>
