<template>
    <div class="container mx-auto p-4 h-screen flex flex-col">
      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <!-- 新增任务框 -->
        <div class="w-full md:w-1/2 bg-white p-4 rounded shadow md:block hidden">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">任务列表</h2>
            <button @click="showModal = true" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              <PlusIcon class="inline mr-2" />
              新增
            </button>
          </div>
          <div class="overflow-y-auto max-h-[35vh]">
            <div class="space-y-2">
              <div v-for="task in tasks" :key="task.id" class="bg-gray-100 p-2 rounded flex justify-between items-center">
                <span>
                  {{ task.systemName }} - {{ task.responsible }} - {{ task.end_at }} - {{ work_classification[task.work_classification] }}
                </span>
                <div class="flex space-x-2">
                  <button @click="editTask(task)" class="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600">
                    修改
                  </button>
                  <button @click="confirmDeleteTask(task.id)" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 任务详情展示区 -->
        <div class="w-full md:w-1/2 bg-white p-4 rounded shadow">
          <h2 class="text-xl font-bold mb-4">任务详情</h2>
          <div class="overflow-y-auto max-h-[35vh]">
            <div v-for="task in tasks" :key="task.id" class="mb-6 p-4 bg-gray-100 rounded">
              <h3 class="font-bold text-lg mb-2">{{ task.systemName }}</h3>
              <p class="mb-1">负责人: {{ task.responsible }}</p>
              <p class="mb-1">评估分类: {{ task.work_classification }}</p>
              <p class="mb-1">截止日期: {{ task.end_at }}</p>
              <div class="mb-1">进度: {{task.completedTasks}} / {{task.totalTasks}}</div>
              <div class="w-full bg-gray-200 rounded">
                <div
                  class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded"
                  :style="{ width: `${task.progress}%` }"
                >
                  {{ task.progress }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 协助任务区 -->
      <div class="flex-grow overflow-y-auto md:block hidden">
        <h2 class="text-xl font-bold mb-4">协助任务</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="task in assistTasks" :key="task.id" class="bg-white p-4 rounded shadow">
            <div class="flex justify-between items-center">
              <h3 class="font-bold">{{ task.title }}</h3>
              <span :class="getStatusColor(task.status)">{{ task.status }}</span>
            </div>
            <p class="mt-2 break-words" :style="{ maxWidth: '50ch' }">{{ task.description }}</p>
            <button
              @click="completeAssistTask(task.id)"
              class="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 w-full"
            >
              <CheckIcon class="inline mr-2" />
              完成
            </button>
          </div>
        </div>
      </div>
  
      <!-- 新增任务弹窗 -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-4 rounded shadow-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">{{ isEditing ? '修改任务' : '新增任务' }}</h2>
          <form @submit.prevent="isEditing ? updateTask() : addTask()" class="space-y-4">
            <label for="systemName" class="block text-sm font-medium text-gray-700">系统名称：</label>
            <input v-model="newTask.systemName" id="systemName" placeholder="系统名称" class="w-full p-2 border rounded" required />

            <label for="superintendent_name" class="block text-sm font-medium text-gray-700">系统负责人：</label>
            <input v-model="newTask.superintendent_name" id="superintendent_name" placeholder="姓名" class="w-full p-2 border rounded" required />

            <label for="superintendent_email" class="block text-sm font-medium text-gray-700">系统负责人邮箱：</label>
            <input v-model="newTask.superintendent_email" id="superintendent_email" placeholder="邮箱" class="w-full p-2 border rounded" type="email" required />

            <label for="superintendent_phone" class="block text-sm font-medium text-gray-700">系统负责人电话号码：</label>
            <input v-model="newTask.superintendent_phone" id="superintendent_phone" placeholder="电话号码" class="w-full p-2 border rounded" type="tel" required />
            
            <label for="responsible" class="block text-sm font-medium text-gray-700">评估负责人：</label>
            <select v-model="newTask.responsible" id="responsible" class="w-full p-2 border rounded bg-white" @click="fetchWorkers" required>
              <option v-for="worker in workers" :key="worker.username" :value="worker.id">
                {{ worker.username }}
              </option>
            </select>

            <label for="work_classification" class="block text-sm font-medium text-gray-700">评估类型：</label>
            <select 
                v-model="newTask.work_classification" 
                id="work_classification" 
                class="w-full p-2 border rounded bg-white" 
                :disabled="isEditing" 
                required
            >
                <option v-for="(value, key) in work_classification" :key="key" :value="key">
                    {{ value }}
                </option>
            </select>

            <label for="end_at" class="block text-sm font-medium text-gray-700">评估截止时间：</label>
            <input v-model="newTask.end_at" id="end_at" type="date" class="w-full p-2 border rounded" required />

            <div class="flex justify-end space-x-2">
              <button type="button" @click="showModal = false" class="bg-gray-300 text-black p-2 rounded hover:bg-gray-400">
                取消
              </button>
              <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                确认
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <showMessage ref="showMessageRef" />
    <optConfirm ref="optConfirmRef" />
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue'
  import axios from 'axios'
  import { PlusIcon, CheckIcon } from 'lucide-vue-next'
  import config from '@/util/config'
  import showMessage from '@/components/common/showMessage.vue'
  import optConfirm from '@/components/common/optConfirm.vue'
  
  export default {
    components: {
      PlusIcon,
      CheckIcon,
      showMessage,
      optConfirm
    },
    setup() {
      const systems = ref([])
      const assistTasks = ref([])
      const newTask = ref({
        systemName: '',
        responsible: '',
        superintendent_name: '',
        superintendent_email: '',
        superintendent_phone: '',
        end_at: '',
        work_classification: '' // 确保初始化时与下拉框的值类型一致
      })
      const showModal = ref(false)
      const workers = ref([])
      const showMessageRef = ref(null)
      const optConfirmRef = ref(null)
      const isEditing = ref(false);

      const work_classification = {
        101: '新技术新业务安全评估',
        102: '涉诈风险安全评估',
      }

      const fetchTasks = async () => {
        try {
          const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/admin/getUserWorks`, { withCredentials: true })
          systems.value = response.data.map(task => {
            const taskDetails = task.tasks
            const totalTasks = taskDetails.length
            const completedTasks = taskDetails.filter(t => t.status === '已完成').length
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return {
              id: task.system_id,
              systemName: task.system_name,
              superintendent_name: task.superintendent_name,
              superintendent_phone: task.superintendent_phone,
              superintendent_email: task.superintendent_email,
              responsible: task.username,
              responsible_id: task.user_id,
              work_classification: task.work_classification,
              end_at: task.end_at,
              status: task.status,
              progress: progress,
              completedTasks: completedTasks,
              totalTasks: totalTasks
            }
          })
        } catch (error) {
          console.error('Error fetching tasks:', error)
        }
        console.log("tasks:", systems.value)
      }

      const fetchAssistTasks = async () => {
        try {
          const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/getTaskByCategory`, {
            category: '协助项'
          }, { withCredentials: true });
  
          assistTasks.value = response.data.filter(task => task.status !== '已完成');
        } catch (error) {
          console.error('Error fetching assist tasks:', error);
        }
      }

      const fetchWorkers = async () => {
        try {
          const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/admin/getWorkers`, { withCredentials: true })
          workers.value = response.data.data
        } catch (error) {
          console.error('Error fetching workers:', error)
        }
      }

      onMounted(() => {
        fetchTasks();
        fetchAssistTasks();
        fetchWorkers();
      })

      const addTask = () => {
        // 新增任务的逻辑
        console.log('Adding task:', newTask.value)
        // 传递给后端的数据
        const data = {
          username: workers.value.find(worker => worker.id === newTask.value.responsible).username,
          groupId: workers.value.find(worker => worker.id === newTask.value.responsible).group_id,
          businessSystemName: newTask.value.systemName,
          superintendentName: newTask.value.superintendent_name,
          superintendentPhone: newTask.value.superintendent_phone,
          superintendentEmail: newTask.value.superintendent_email,  
          workClassification: newTask.value.work_classification,
          endAt: newTask.value.end_at
        }

        // 发送请求
        axios.post(`${config.getSetting('API_BASE_URL')}/api/admin/addUserWork`, data, { withCredentials: true })
          .then(response => {
            if (showMessageRef.value) {
              showMessageRef.value.showMessage(response.data.message)
            }
          })
          .catch(error => {
            console.error('Error adding task:', error);
          })
        
        newTask.value.responsible = data.username
        systems.value.push({
          ...newTask.value,
          status: '未开始',
          progress: 0,
        })
        
        newTask.value = {
          systemName: '',
          responsible: '',
          end_at: '',
          work_classification: '' // 确保初始化时与下拉框的值类型一致
        }
        showModal.value = false
      }

      const editTask = (task) => {
        console.log("responsible:", workers.value.find(worker => worker.username === task.responsible))
        newTask.value = { 
          id: task.id,
          systemName: task.systemName,
          superintendent_name: task.superintendent_name,
          superintendent_phone: task.superintendent_phone,
          superintendent_email: task.superintendent_email,
          work_classification: task.work_classification,
          responsible: workers.value.find(worker => worker.username === task.responsible),
          end_at: task.end_at,
        }
        isEditing.value = true; // 设置为编辑模式
        showModal.value = true
      }

      const updateTask = () => {
        // 修改任务的逻辑
        console.log('Updating task:', newTask.value)
        const data = {
          systemId: newTask.value.id,
          userId: workers.value.find(worker => worker.id === newTask.value.responsible).id,
          businessSystemName: newTask.value.systemName,
          superintendentName: newTask.value.superintendent_name,
          superintendentPhone: newTask.value.superintendent_phone,
          superintendentEmail: newTask.value.superintendent_email,  
          workClassification: newTask.value.work_classification,
          endAt: newTask.value.end_at
        }
        axios.put(`${config.getSetting('API_BASE_URL')}/api/admin/updateUserWork`, data, { withCredentials: true })
          .then(response => {
            if (response.status === 200) {
            if (showMessageRef.value) {
              showMessageRef.value.showMessage("修改成功")
            }
            fetchTasks(); // 重新获取任务列表
            }
          })
          .catch(error => {
            if (showMessageRef.value) {
              showMessageRef.value.showMessage("修改失败:"+error.message)
            } 
          })
        showModal.value = false
        newTask.value = {}
        isEditing.value = false; // 重置为非编辑模式
      }

      const completeAssistTask = (id) => {
        console.log("id:", id)
        const updatedTaskInfo = {
          status: '已完成',
          reportContent: '',
          riskValue: ''
        }
        axios.post(`${config.getSetting('API_BASE_URL')}/api/updateTask/${id}`, updatedTaskInfo, { withCredentials: true })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.log(error);
          })
        assistTasks.value = assistTasks.value.filter(task => task.id !== id)
      }

      const getStatusColor = (status) => {
        switch (status) {
          case '待开始':
            return 'text-yellow-500';
          case '进行中':
            return 'text-green-500';
          case '整改中':
            return 'text-red-500';
          case '已完成':
            return 'text-blue-600';
          default:
            return '';
        }
      }


      const confirmDeleteTask = async (taskId) => {
        if (optConfirmRef.value) {
          const confirmed = await optConfirmRef.value.showConfirm('您确定要删除此任务吗？')
          if (confirmed) {
            deleteTask(taskId)
          }
        }
      }

      const deleteTask = (taskId) => {
        // 执行删除操作
        axios.delete(`${config.getSetting('API_BASE_URL')}/api/admin/deleteUserWork`, { data: { systemId: taskId }, withCredentials: true })
          .then(response => {
            if (response.status === 200) {
            if (showMessageRef.value) {
              showMessageRef.value.showMessage('任务已删除')
            }
            systems.value = systems.value.filter(task => task.id !== taskId)
            }
          })
          .catch(error => {
            if (showMessageRef.value) {
              showMessageRef.value.showMessage('删除失败:'+error.message)
            }
          })

        
      }

      // 监听 tasks 的变化
      watch(systems, (newTasks) => {
        // 在这里执行需要的操作，例如刷新页码
        console.log('Tasks updated:', newTasks);
        // 当task发生变化时，应该重新渲染页面
      });

      return {
        tasks: systems,
        assistTasks,
        newTask,
        showModal,
        fetchTasks,
        fetchAssistTasks,
        addTask,
        completeAssistTask,
        getStatusColor,
        workers,
        fetchWorkers,
        work_classification,
        showMessageRef,
        optConfirmRef,
        editTask,
        confirmDeleteTask,
        isEditing,
        updateTask
      }
    }
  }
  </script>