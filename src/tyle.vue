<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="bg-white shadow-md rounded-none w-full max-w-2xl p-8">
        <h2 class="text-2xl font-bold mb-6">表单编辑</h2>
        <form @submit.prevent="submitForm">
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="title" v-model="form.title" class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="description" v-model="form.description" class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            
            <div>
              <label for="guide" class="block text-sm font-medium text-gray-700">Guide</label>
              <input type="text" id="guide" v-model="form.guide" class="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            
            <div class="relative">
              <label for="workClassification" class="block text-sm font-medium text-gray-700">Work Classification</label>
              <div class="mt-1">
                <button type="button" @click="toggleDropdown('workClassification')" class="relative w-full bg-white border border-gray-300 rounded-none shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <span class="block truncate">{{ form.workClassification || '请选择' }}</span>
                  <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </button>
              </div>
              <ul v-if="openDropdown === 'workClassification'" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-none py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                <li @click="selectOption('workClassification', '新技术新业务安全评估')" class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100">
                  新技术新业务安全评估
                </li>
                <li @click="selectOption('workClassification', '涉诈风险安全评估')" class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100">
                  涉诈风险安全评估
                </li>
              </ul>
            </div>
            
            <div class="relative">
              <label for="taskCategory" class="block text-sm font-medium text-gray-700">Task Category</label>
              <div class="mt-1">
                <button type="button" @click="toggleDropdown('taskCategory')" class="relative w-full bg-white border border-gray-300 rounded-none shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <span class="block truncate">{{ form.taskCategory || '请选择' }}</span>
                  <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </button>
              </div>
              <ul v-if="openDropdown === 'taskCategory'" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-none py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                <li @click="selectOption('taskCategory', '保障项')" class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100">
                  保障项
                </li>
                <li @click="selectOption('taskCategory', '风险项')" class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100">
                  风险项
                </li>
              </ul>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="cancelForm" class="inline-flex justify-center rounded-none border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
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
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { ChevronDownIcon } from 'lucide-vue-next'
  
  const form = reactive({
    title: '',
    description: '',
    guide: '',
    workClassification: '',
    taskCategory: ''
  })
  
  const openDropdown = ref(null)
  
  const toggleDropdown = (dropdown) => {
    openDropdown.value = openDropdown.value === dropdown ? null : dropdown
  }
  
  const selectOption = (field, value) => {
    form[field] = value
    openDropdown.value = null
  }
  
  const submitForm = () => {
    // 在这里处理表单提交逻辑
    console.log('Form submitted:', form)
  }
  
  const cancelForm = () => {
    // 在这里处理取消操作
    console.log('Form cancelled')
  }
  </script>