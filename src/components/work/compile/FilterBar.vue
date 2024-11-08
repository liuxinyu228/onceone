<template>
    <div class="flex space-x-4">
      <select class="border-gray-300 p-2 rounded-md" @change="filterTasks('taskcategory', $event.target.value)">
        <option value="">任务类型</option>
        <option value="风险项">风险项</option>
        <option value="保障项">保障项</option>
        <option value="协助项">协助项</option>
      </select>
      <select class="border-gray-300 p-2 rounded-md" @change="filterTasks('status', $event.target.value)">
        <option value="">状态</option>
        <option value="待开始">待开始</option>
        <option value="进行中">进行中</option>
        <option value="整改中">整改中</option>
        <option value="已完成">已完成</option>
      </select>
      <input type="text" placeholder="根据任务标题搜索任务" class="border-gray-300 p-2 rounded-md flex-1" @input="filterTasks('search', $event.target.value)">
      <button class="bg-blue-500 text-white p-2 rounded-md" @click="applyFilters">搜索</button>
    </div>
  </template>

<script>
export default {
  methods: {
    filterTasks(type, value) {
      this.$emit('filter-tasks', { type, value });
    },
    applyFilters() {
      this.$emit('apply-filters');
    }
  }
};
</script>
