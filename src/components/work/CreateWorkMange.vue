<template>
  <!-- 如果 currentView 是 'selection'，显示 TaskSelection 组件 -->
  <TaskSelection v-if="currentView === 'selection'" @select="handleSelection" />
  <!-- 如果 personaId 不是 707，显示 CreateTaskForm 组件 -->
  <CreateTaskForm v-else-if="currentView === 'new' && personaId !== 707" :isNewTask="isNewTask" @back="currentView = 'selection'" />
  <ExistingTaskSelection v-else-if="currentView === 'existing'" :isNewTask="isNewTask" @back="currentView = 'selection'" />
</template>

<script>
import TaskSelection from './CreateWorkSelectionBar.vue'
import CreateTaskForm from './CreateWorkFormBar.vue'
import ExistingTaskSelection from './ExistingWorkSelection.vue'
import axios from 'axios'; // 新增此行
import config from '../../util/config'

export default {
  components: {
    TaskSelection,
    CreateTaskForm,
    ExistingTaskSelection
  },
  data() {
    return {
      currentView: 'selection',
      isNewTask: true,
      personaId: null // 新增此行
    }
  },
  methods: {
    handleSelection(selection) {
      this.isNewTask = selection === 'new'
      this.currentView = selection
    },
    async fetchUserInfo() { // 新增此方法
      try {
        const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/getUserInfo`, { withCredentials: true }); // 使用 axios 进行 API 调用并携带凭证
        this.personaId = response.data.personaId;
        if (this.personaId === 707) {
          this.currentView = 'existing';
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    }
  },
  created() { // 新增此生命周期钩子
    this.fetchUserInfo();
  }
}
</script>
