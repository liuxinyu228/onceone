<template>
  <div class="bg-white p-4 mb-4 shadow-md rounded-lg relative">
    <button @click="deleteTask" class="absolute top-2 right-2 text-gray-400 hover:text-red-500">
      <XIcon class="w-5 h-5" />  
    </button>
    <div class="flex justify-between items-center">
      <div :itemid="task.id">
        <span :class="statusClass">{{ task.status }}</span>
        <h3 class="text-lg font-bold">{{ task.title }}</h3>
        <p class="text-gray-500">
          任务类型: {{ task.taskcategory }} <br />
          任务描述: {{ task.description.length > 15 ? task.description.slice(0, 15) + '...' : task.description }} <br />
          开始时间: {{ task.created_at }} <br />
          修改时间: {{ task.updated_at }}
        </p>
      </div>
      <div>
        <div class="flex space-x-2">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow" @click="editTask">编辑</button>
          <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow" @click="viewTask">查看</button>
        </div>
        <div v-if="task.taskcategory === '风险项'" class="mt-2">
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow" @click="linkRisk">关联保障项</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue-next';

export default {
  components: {
    XIcon,
  },
  props: {
    task: Object,
  },
  computed: {
    statusClass() {
      switch (this.task.status) {
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
    },
  },
  methods: {
    editTask() {
      this.$emit('edit-task', this.task); // 触发编辑事件，传递当前任务
    },
    viewTask() {
      this.$emit('view-task', this.task); // 触发查看事件，传递当前任务
    },
    linkRisk() {
      this.$emit('link-risk', this.task); // 触发关联风险项事件，传递当前任务
    },
    deleteTask() {
      this.$emit('delete-task', this.task); // 触发删除事件,传递当前任务
    },
  },
};
</script>
