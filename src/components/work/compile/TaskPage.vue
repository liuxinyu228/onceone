<template>
  <!-- 任务卡片页面 -->
  <div class="flex">
    <!-- 主要内容 --> 
    <div class="flex-1 p-6">
      <div class="flex justify-between items-center mb-4">
        <BreadcrumbBar class="flex-1" />
        <div class="flex space-x-2">
          <button v-if="shouldShowNewTaskModal()" class="bg-sky-300 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded shadow" @click="openRiskAssuranceGenerationGuideModal">AI生成保障项</button>
          <button v-if="shouldShowNewTaskModal()" class="bg-red-300 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow" @click="openReviewContentModal">AI审核</button>
          <button v-if="shouldShowNewTaskModal()" class="bg-sky-300 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded shadow" @click="openNewTaskModal">新建任务</button>
        </div>
      </div>
      <div class="flex justify-between items-center mb-4">
        <FilterBar @filter-tasks="handleFilterTasks" @apply-filters="applyFilters" />
      </div>
      <TaskList ref="taskList" />
    </div>
  </div>  
  <NewTaskModal v-if="isNewTaskModalOpen" @close="closeNewTaskModal" @save="addNewTask" />
</template>

<script>
import BreadcrumbBar from '@/components/work/compile/BreadcrumbBar.vue';
import FilterBar from '@/components/work/compile/FilterBar.vue';
import TaskList from '@/components/work/compile/TaskList.vue';
import NewTaskModal from '@/components/work/compile/NewTaskModal.vue';
import Cookies from 'js-cookie'; // 导入 js-cookie 库
import { decrypt } from '@/util/util'; // 导入解密函数

export default {
  components: {
    BreadcrumbBar,
    FilterBar,
    TaskList,
    NewTaskModal,
  },
  data() {
    return {
      isNewTaskModalOpen: false,
    };
  },
  methods: {
    shouldShowNewTaskModal() {
      const userInfo = JSON.parse(decrypt(Cookies.get('userInfo'))); // 解密并解析 userInfo
      const personaId = userInfo.personaId; // 使用 js-cookie 获取 personaId
      return personaId !== 707; // 如果 personaId 不为 707，则显示 NewTaskModal
    },
    handleFilterTasks(filter) {
      this.$refs.taskList.handleFilterTasks(filter);
    },
    applyFilters() {
      this.$refs.taskList.applyFilters();
    },
    openNewTaskModal() {
      this.isNewTaskModalOpen = true;
      console.log('isNewTaskModalOpen:', this.isNewTaskModalOpen);
    },
    closeNewTaskModal() {
      this.isNewTaskModalOpen = false;
    },
    addNewTask(newTask) {
      this.$refs.taskList.addTask(newTask);
      this.closeNewTaskModal();
    },
    openRiskAssuranceGenerationGuideModal() {
      this.$refs.taskList.openRiskAssuranceGenerationGuide();
    },
    openReviewContentModal() {
      this.$refs.taskList.openReviewContent();
    }
  }
};
</script>
