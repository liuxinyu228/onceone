<template>
  <div class="flex justify-between items-center mt-4">
    <div>共 {{ totalTasks }} 条</div>
    <div class="flex items-center">
      <button
        class="px-3 py-1 mx-1 border rounded"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="px-3 py-1 mx-1 border rounded"
        :class="{'bg-blue-500 text-white': currentPage === page}"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        class="px-3 py-1 mx-1 border rounded"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
    <div>
      <select v-model="tasksPerPageLocal" @change="handleTasksPerPageChange" class="border p-1 rounded">
        <option :value="5">5条/页</option>
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    totalTasks: {
      type: Number,
      required: true,
    },
    tasksPerPage: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      tasksPerPageLocal: this.tasksPerPage, // 本地变量来存储每页任务数
    };
  },
  computed: {
    totalPages() {
      const totalPages = Math.ceil(this.totalTasks / this.tasksPerPageLocal);
      return totalPages > 0 ? totalPages : 1;  // 确保最少1页
    },
  },
  methods: {
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.$emit('page-changed', page);
      }
    },
    handleTasksPerPageChange() {
      this.$emit('tasks-per-page-changed', this.tasksPerPageLocal); // 通知父组件更新每页任务数
      this.$emit('page-changed', 1); // 切换每页任务数时回到第一页
    },
  },
};
</script>
