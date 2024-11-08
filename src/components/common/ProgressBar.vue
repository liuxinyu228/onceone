<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
      <div class="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div class="bg-blue-500 h-4 rounded-full" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="flex justify-end">
        <button @click="$emit('cancel')" class="bg-gray-500 text-white px-4 py-2 rounded">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '上传进度'
    },
    progress: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
/* 你可以在这里添加样式 */
</style>
