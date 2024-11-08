<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 flex items-center justify-between">
        {{ statement.statement_name }}
        <Trash2Icon class="h-5 w-5 text-gray-400 cursor-pointer" @click="$emit('delete', statement.statement_id)" />
      </h3>
      <div class="mt-2 max-w-xl text-sm text-gray-500">
        <p>{{ statement.statement_description }}</p>
      </div>
      <div class="mt-3 flex items-center">
        <span
          :class="{
            'bg-green-100 text-green-800': statement.state === 'completed',
            'bg-yellow-100 text-yellow-800': statement.state === 'active' || statement.state === 'review',
            'bg-red-100 text-red-800': statement.state === 'NotStarted',
          }"
          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
        >
          {{ statement.state }}
        </span>
      </div>
    </div>
    <div class="bg-gray-50 px-4 py-4 sm:px-6">
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('edit', statement.statement_id, statement.statement_name)"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </button>
        <div class="relative inline-block text-left">
          <select
            v-model="localStatus"
            @change="$emit('updateStatus', statement.statement_id, localStatus)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <option value="NotStarted">未开始</option>
            <option value="active">进行中</option>
            <option value="review">复审中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, Trash2Icon } from 'lucide-vue-next'
import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
  statement: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'updateStatus', 'delete'])

const localStatus = ref(props.statement.state)
</script>
