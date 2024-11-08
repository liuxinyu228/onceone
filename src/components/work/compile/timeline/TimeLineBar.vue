<template>
    <!-- 事件时间线页面 -->
    <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">事件时间线</h1>
        
        <!-- 添加事件表单 -->
        <form @submit.prevent="addEvent" class="mb-8 bg-white shadow-md rounded-lg p-6">
          <div class="mb-4">
            <label for="eventTitle" class="block text-sm font-medium text-gray-700">事件标题</label>
            <input type="text" id="eventTitle" v-model="newEvent.title" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div class="mb-4">
            <label for="eventDate" class="block text-sm font-medium text-gray-700">事件日期</label>
            <input type="date" id="eventDate" v-model="newEvent.date" required
                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div class="mb-4">
            <label for="eventDescription" class="block text-sm font-medium text-gray-700">事件描述</label>
            <textarea id="eventDescription" v-model="newEvent.description" rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          <div class="mb-4">
            <label for="eventAttachment" class="block text-sm font-medium text-gray-700">附件</label>
            <input type="file" id="eventAttachment" @change="handleFileUpload"
                   class="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100">
          </div>
          <button type="submit"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            添加事件
          </button>
        </form>
        
        <!-- 时间线 -->
        <div class="relative">
          <div class="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300"></div>
          <transition-group name="timeline" tag="div" class="space-y-8">
            <div v-for="(event, index) in sortedEvents" :key="event.id" 
                 class="relative flex items-center justify-between timeline-card"
                 :class="{ 'flex-row-reverse': index % 2 !== 0 }">
              <div class="flex items-center w-5/12 timeline-card-content" :class="{ 'justify-end': index % 2 !== 0 }">
                <div class="bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-lg w-7/12"
                     :class="{ 'mr-8': index % 2 === 0, 'ml-8': index % 2 !== 0 }">
                  <h3 class="text-lg font-semibold text-gray-900">{{ event.title }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(event.date) }}</p>
                  <p class="mt-2 text-gray-700">{{ event.description }}</p>
                  <div v-if="event.attachment_path" class="mt-2">
                    <a @click.prevent="download(event.id)"  
                       class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center cursor-pointer">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                      {{ event.attachment_path.split('\\').pop() }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white"></div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import axios from 'axios'
  import config from '@/util/config'
  
  const events = ref([])
  const newEvent = ref({
    title: '',
    date: '',
    description: '',
    attachment_path: null
  })
  

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      newEvent.value.attachment_path = file
    }
  }
  
  const addEvent = async () => {
    const formData = new FormData()
    formData.append('title', newEvent.value.title)
    formData.append('date', newEvent.value.date)
    formData.append('description', newEvent.value.description)
    if (newEvent.value.attachment_path) {
      formData.append('attachment_path', newEvent.value.attachment_path)
    }

    try {
      const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/filemanager/timeline`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // 携带凭证
      })
      events.value.push(response.data)
      newEvent.value = { title: '', date: '', description: '', attachment_path: null }
      const fileInput = document.getElementById('eventAttachment')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }
  
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/filemanager/timeline`, { withCredentials: true })
      events.value = response.data
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const download = (eventId) => {
  const url = `${config.getSetting('API_BASE_URL')}/api/filemanager/timeline/${eventId}/download`;
  window.location.href = url;
}
  
  onMounted(fetchEvents)
  
  const sortedEvents = computed(() => {
    return [...events.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  })
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  </script>
  
  <style scoped>
  .timeline-enter-active,
  .timeline-leave-active {
    transition: all 0.5s ease;
  }
  .timeline-enter-from,
  .timeline-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  @media (max-width: 768px) {
    .timeline-card {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .timeline-card-content {
      width: 100% !important;
      margin: 0 !important;
    }
  }
  </style>
