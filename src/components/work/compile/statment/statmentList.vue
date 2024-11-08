<template>
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold text-gray-800">文档管理</h1>
              </div>
            </div>
            <div class="flex items-center">
              <button
                @click="openNewDocumentModal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon class="h-5 w-5 mr-2" />
                New Document
              </button>
            </div>
          </div>
        </div>
      </nav>
  
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div v-if="documents.length === 0" class="text-center py-12">
            <ScrollText class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">没有文档</h3>
            <p class="mt-1 text-sm text-gray-500">请创建一个新文档</p>
            <div class="mt-6">
              <button
                @click="openNewDocumentModal"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon class="h-5 w-5 mr-2" />
                New Document
              </button>
            </div>
          </div>
  
          <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DocumentCard
              v-for="doc in documents"
              :key="doc.id"
              :statement="doc"
              @edit="editDocument"
              @updateStatus="updateDocumentStatus"
              @delete="deleteDocument"
            />
          </div>
        </div>
      </main>
  
      <NewDocumentModal
        v-if="showNewDocumentModal"
        @close="closeNewDocumentModal"
        @create="createDocument"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { PlusIcon, ScrollText } from 'lucide-vue-next'
  import DocumentCard from './statmentCard.vue'
  import NewDocumentModal from './createStatmentmodal.vue'
  import config from '@/util/config'
  
  const documents = ref([])
  const showNewDocumentModal = ref(false)
  const store = useStore()
  const router = useRouter()
  
  // 获取statement列表
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/statement`, {
        withCredentials: true, // 携带凭证
      })
      documents.value = response.data.data
    } catch (error) {
      console.error('获取statement列表失败:', error)
    }
  }
  
  // 打开新建文档弹窗
  const openNewDocumentModal = () => {
    showNewDocumentModal.value = true
  }
  
  // 关闭新建文档弹窗
  const closeNewDocumentModal = () => {
    showNewDocumentModal.value = false
  }
  
  // 创建新文档
  const createDocument = async (newDoc) => {
    try {
      const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/statement`, newDoc, {
        withCredentials: true, // 携带凭证
      })
      documents.value.push(response.data.data)
      closeNewDocumentModal()
    } catch (error) {
      console.error('创statement失败:', error)
    }
  }
  
  // 编辑文档
  const editDocument = (statement_id, statement_name) => {
    store.commit('setCurrentStatementId',statement_id)
    router.push({
      path: `/editor/${statement_name}`,
    })
  }
  
  // 更新文档状态
  const updateDocumentStatus = async (docId, newStatus) => {
    try {
      await axios.put(`${config.getSetting('API_BASE_URL')}/api/statement/${docId}`, { state: newStatus }, {
        withCredentials: true, // 携带凭证
      })
      documents.value = documents.value.map(doc =>
        doc.statement_id === docId ? { ...doc, state: newStatus } : doc
      )
    } catch (error) {
      console.error('更新statement状态失败:', error)
    }
  }
  
  // 删除文档
  const deleteDocument = async (docId) => {
    try {
        await axios.delete(`${config.getSetting('API_BASE_URL')}/api/statement/${docId}`, {
        withCredentials: true, // 携带凭证
      })
      documents.value = documents.value.filter(doc => doc.statement_id !== docId)
    } catch (error) {
      console.error('删除statement失败:', error)
    }
  }
  
  onMounted(() => {
    fetchDocuments()
  })
  </script>
