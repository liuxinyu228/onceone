<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl relative flex">
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <X class="h-6 w-6" />
      </button>
  
      <div class="w-1/2 pr-4 space-y-8 overflow-y-auto">
        <!-- Upper Section: Content Cards -->
        <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 class="text-2xl font-bold text-gray-800">内容项</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div
              v-for="(card, index) in tasks"
              :key="index"
              class="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h3 class="text-lg font-semibold text-gray-700">{{ card.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ card.description }}</p>
              <p class="mt-2 text-gray-600">{{ card.content }}</p>
            </div>
          </div>
          <button
            @click="checkContent"
            class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            :disabled="isChecking"
          >
            {{ isChecking ? '检查中...' : '检查内容' }}
          </button>
        </div>
      </div>
  
      <div class="w-1/2 pl-4 space-y-8 overflow-y-auto">
        <!-- Lower Section: Problem Cards -->
        <div v-if="problemCards.length > 0" class="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 class="text-2xl font-bold text-gray-800">问题项</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div
              v-for="(card, index) in problemCards"
              :key="index"
              class="bg-gray-50 rounded-lg p-4 shadow-sm relative"
            >
              <h3 class="text-lg font-semibold text-gray-700">{{ card.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ card.description }}</p>
              <p class="mt-2 text-gray-600">{{ card.reportcontent }}</p>
              <div class="mt-2 space-y-2">
                <p 
                  v-for="(problem, pIndex) in card.problem"
                  :key="pIndex"
                  class="text-red-500"
                >
                  <span class="font-semibold">问题 {{ pIndex + 1 }}:</span> {{ problem.content }}
                </p>
              </div>
              <button
                @click="openEditModal(items.find(item => item.id === card.id))"
                class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded text-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                编辑
              </button>
            </div>
          </div>
          <button
            @click="saveChanges"
            class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            :disabled="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存修改' }}
          </button>
        </div>
        <div v-else class="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <p class="text-gray-500">暂无问题卡片</p>
        </div>
      </div>

    </div>
  </div>
  <showMessage ref="showMessageRef" />
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { X } from 'lucide-vue-next'
import axios from 'axios'
import config from '@/util/config'
import showMessage from '@/components/common/showMessage.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})

const items = ref([...props.tasks])
const problemCards = ref([])
const isChecking = ref(false)
const checkProgress = ref(0)
const isSaving = ref(false)
const showMessageRef = ref(null)

const emit = defineEmits(['edit', 'close'])

const checkContent = async () => {
  isChecking.value = true
  problemCards.value = []
  checkProgress.value = 0
  items.value = [...props.tasks] // 重新赋值，避免引用问题
  
  // 每五个元素打包为一个数组
  const itemChunks = []
  let temp = []
  for (let i = 0; i < items.value.length; i ++) {
    temp.push({
      id: items.value[i].id,
      title: items.value[i].title,
      description: items.value[i].description,
      guide: items.value[i].guide,
      reportcontent: items.value[i].reportcontent,
      riskvalue: items.value[i].riskvalue,
    })
    if (temp.length == 5 || i == items.value.length - 1) {
      itemChunks.push([...temp])
      temp = []
    }
  }

  // 对每个数组调用 /review-items 接口
  for (const chunk of itemChunks) {
    try {
      const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/review-items`, 
        { items: chunk }, 
        { withCredentials: true }
      )
      
      // 将返回的 problem 字段添加到对应的元素中
      // console.log("items.value:",items.value)
      response.data.forEach(item => {
        // console.log("item id:",item.id)
        const index = items.value.findIndex(i => i.id == item.id)
        if (index !== -1) {
          items.value[index].problem = item.problem
        }
      })
    } catch (error) {
      console.error('Error calling /review-items:', error)
      showMessageRef.value.showMessage('有部分内容项检查失败，请等待！')
    }
  }

  showMessageRef.value.showMessage('检查完成！')
  // 将有 problem 的元素添加到 problemCards 中
  // console.log("items.value:",items.value)
  problemCards.value = items.value.filter(item => item.problem && item.problem.length > 0)
  // console.log("problemCards.value:",problemCards.value)
  isChecking.value = false
}

const openEditModal = (card) => {
  emit('edit', card)
}


const saveChanges = async () => {
  isSaving.value = true
  // 在这里执行保存操作
  // ...
  isSaving.value = false
}
</script>