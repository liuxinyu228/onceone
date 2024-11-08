<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-1/2">
      <h2 class="text-xl font-bold mb-4">新建任务</h2>
      <label class="block mb-2">任务类型：</label>
      <select v-model="newTask.taskcategory" class="w-full border p-2 mb-1 shadow-sm bg-white" :class="{'border-red-500': !newTask.taskcategory && submitted}">
        <option value="风险项">风险项</option>
        <option value="保障项">保障项</option>
        <option value="协助项">协助项</option>
      </select>
      <span v-if="!newTask.taskcategory && submitted" class="text-red-500 text-sm">此项为必填项</span>

      <label class="block mb-2">任务标题：</label>
      <input type="text" v-model="newTask.title" class="w-full border p-2 mb-1" :class="{'border-red-500': !newTask.title && submitted}" />
      <span v-if="!newTask.title && submitted" class="text-red-500 text-sm">此项为必填项</span>

      <label class="block mb-2">任务描述：</label>
      <textarea v-model="newTask.description" class="w-full border p-2 mb-1" :class="{'border-red-500': !newTask.description && submitted}"></textarea>
      <span v-if="!newTask.description && submitted" class="text-red-500 text-sm">此项为必填项</span>

      <label class="block mb-2" v-if="newTask.taskcategory !== '协助项'">评估指引：</label>
      <textarea v-if="newTask.taskcategory !== '协助项'" v-model="newTask.guide" class="w-full border p-2 mb-4"></textarea>
      
      <div class="flex justify-end">
        <button @click="$emit('close')" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">取消</button>
        <button @click="submitted = true; if (validateForm()) saveTask()" class="bg-blue-500 text-white px-4 py-2 rounded">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTask: {
        title: '',
        taskcategory: '',
        description: '',
        guide: '',
        status: '待开始'
      },
      submitted: false
    };
  },
  methods: {
    saveTask() {
      this.newTask.system_default_value = false;
      this.$emit('save', this.newTask);
    },
    validateForm() {
      return this.newTask.title && this.newTask.taskcategory && this.newTask.description ;
    }
  }
};
</script>
