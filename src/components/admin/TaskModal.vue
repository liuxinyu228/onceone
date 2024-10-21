<template>
  <div v-if="showTaskModal" class="fixed inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-75">
    <div class="bg-white shadow-md rounded-none w-full max-w-2xl p-8">
      <h2 class="text-2xl font-bold mb-6">{{ localEditingTask.id ? '编辑任务' : '添加任务' }}</h2>
      <form @submit.prevent="saveTask">
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">标题</label>
            <input v-model="localEditingTask.title" id="title" type="text" required class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">描述</label>
            <input v-model="localEditingTask.description" id="description" type="text" required class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label for="guide" class="block text-sm font-medium text-gray-700">指南</label>
            <input v-model="localEditingTask.guide" id="guide" type="text" required class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label for="work_classification" class="block text-sm font-medium text-gray-700">工作分类</label>
            <select v-model="localEditingTask.work_classification" id="work_classification" required class="mt-1 block w-full bg-white shadow-lg rounded-none border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-8">
              <option disabled value="">请选择</option>
              <option value="101">新技术新业务评估</option>
              <option value="102">涉诈风险安全评估</option>
            </select>
          </div>
          <div>
            <label for="taskcategory" class="block text-sm font-medium text-gray-700">任务类别</label>
            <select v-model="localEditingTask.taskcategory" id="taskcategory" required class="mt-1 block w-full bg-white shadow-lg rounded-none border border-gray-400 focus:border-blue-500 focus:ring-blue-500 h-8">
              <option disabled value="">请选择</option>
              <option value="保障项">保障项</option>
              <option value="风险项">风险项</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="closeTaskModal" class="inline-flex justify-center rounded-none border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            取消
          </button>
          <button type="submit" class="inline-flex justify-center rounded-none border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>    
export default {
  props: {
    showTaskModal: Boolean,
    editingTask: Object,
  },
  data() {
    return {
      localEditingTask: { ...this.editingTask }
    }
  },
  watch: {
    // 监听 editingTask 属性的变化
    editingTask: {
      // 当 editingTask 发生变化时，更新 localEditingTask
      handler(newVal) {
        this.localEditingTask = { ...newVal }
      },
      // 深度监听对象内部的变化
      deep: true,
      // 立即执行 handler 函数
      immediate: true
    }
  },
  methods: {
    closeTaskModal() {
      this.$emit('close')
    },
    saveTask() {
      this.$emit('save', { ...this.localEditingTask })
      this.closeTaskModal()
    }
  }
}
</script>