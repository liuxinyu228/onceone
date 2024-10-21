<template>
    <div class="flex h-screen bg-gray-100" :class="{ 'flex-col': isMobile }">
      <button
        v-if="isMobile"
        @click="showMobileMenu = !showMobileMenu"
        class="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
      </button>
      <!-- 左侧导航栏 -->
      <nav class="w-64 bg-white shadow-md" :class="{ 'hidden': isMobile && !showMobileMenu }">
        <div class="p-4">
          <h1 class="text-xl font-bold text-gray-800">参考材料管理</h1>
        </div>
        <ul class="mt-4">
          <li
            v-for="item in navItems"
            :key="item.id"
            @click="handleNavClick(item.id)"
            class="px-4 py-3 cursor-pointer hover:bg-gray-200 transition duration-300"
            :class="{ 'bg-blue-100 font-semibold text-blue-600': currentView === item.id }"
          >
            <component :is="item.icon" class="w-5 h-5 inline-block mr-2" />
            {{ item.name }}
          </li>
        </ul>
      </nav>
  
      <!-- 主界面区域 -->
      <main class="flex-1 p-8 overflow-auto">
        <!-- 上传参考材料 -->
        <div v-if="currentView === 'upload'" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">上传参考材料</h2>
          <div class="mb-4">
            <input
              v-model="documentDescription"
              placeholder="请输入文档描述"
              class="w-full p-2 border rounded"
            />
          </div>
          <div
            @drop.prevent="handleFileDrop"
            @dragover.prevent
            @dragenter="isDragging = true"
            @dragleave="isDragging = false"
            :class="{ 'bg-blue-100 border-blue-500 border-solid': isDragging }"
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition duration-300"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              class="hidden"
              accept=".txt,.pdf,.doc,.docx"
            />
            <p class="text-gray-600 mb-2">拖拽文件到此或点击选择文件上传</p>
            <button
              @click="$refs.fileInput.click()"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              选择文件
            </button>
          </div>
          <button
            @click="confirmUpload"
            class="w-full bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300 mt-4"
          >
            确认上传
          </button>
          <ul v-if="uploadStatus.length" class="mt-4">
            <li v-for="(status, index) in uploadStatus" :key="index" class="text-gray-600">
              {{ status }}
            </li>
          </ul>
        </div>
  
        <!-- 管理段落内容 -->
        <div v-if="currentView === 'manage'" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">管理段落内容</h2>
          <div v-if="!selectedMaterial" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="material in materials"
              :key="material.docs_id"
              @click="selectMaterial(material.docs_id)"
              class="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-300"
            >
              <h3 class="text-lg font-semibold mb-2">{{ material.filename }}</h3>
              <p class="text-gray-600">上传时间: {{ material.updated_at }}</p>
            </div>
          </div>
          <div v-else>
            <div class="flex justify-between items-center mb-4">
              <button @click="selectedMaterial = null" class="text-blue-500 hover:text-blue-700">
                返回材料列表
              </button>
              <div class="flex space-x-4">
                <button
                  @click="addParagraph"
                  class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  添加新段落
                </button>
                <button
                  @click="saveChanges"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                >
                  保存更改
                </button>
              </div>
            </div>

            <div v-if="selectedMaterial.paragraphs.length > 0">
              <div
                v-for="(paragraph, index) in paginatedParagraphs"
                :key="index" 
                class="bg-white shadow rounded-lg p-4 mb-4"
              >
                <input
                  v-model="paragraph.section_title"
                  @input="updateChangeLog(paragraph.content_id, 'section_title', paragraph.section_title)"
                  placeholder="段落标题"
                  class="w-full p-2 mb-2 border rounded"
                />
                <textarea
                  v-model="paragraph.section_content"
                  @input="updateChangeLog(paragraph.content_id, 'section_content', paragraph.section_content)"
                  rows="3"
                  placeholder="段落内容"
                  class="w-full p-2 border rounded"
                ></textarea>
                <div class="mt-2 flex justify-end">
                  <button
                    @click="deleteParagraph(paragraph.content_id)"
                    class="text-red-500 hover:text-red-700 mr-2"
                  >
                    删除
                  </button>
                </div>
              </div>
              
              <!-- 添加分页组件 -->
              <div class="flex justify-center mt-4">
                <button 
                  @click="currentPage > 1 && currentPage--"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  上一页
                </button>

                <template v-for="page in totalPages" :key="page">
                  <button
                    v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                    @click="currentPage = page"
                    :class="{ 'bg-blue-500 text-white': currentPage === page, 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100 hover:text-blue-700': currentPage !== page }"
                    class="px-4 py-2 text-sm font-medium"
                  >
                    {{ page }}
                  </button>
                  <span
                    v-else-if="page === currentPage - 2 || page === currentPage + 2"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    ...
                  </span>
                </template>

                <button
                  @click="currentPage < totalPages && currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-r border-0 border-l border-gray-700 hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  下一页
                </button>
              </div>

            </div>
            <p v-else class="text-gray-600">该材料没有段落内容。</p>
          </div>
        </div>
  
        <!-- 材料列表展示 -->
        <div v-if="currentView === 'list'" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">材料列表</h2>
          <div v-if="materials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="material in materials"
              :key="material.docs_id"
              class="bg-white shadow rounded-lg p-4"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold">{{ material.filename }}</h3>
                <button
                  @click="revectorizeMaterial(material.docs_id)"
                  class="text-yellow-500 hover:text-yellow-700"
                >
                  重新向量化
                </button>
              </div>
              <p class="text-gray-600 mb-2">上传时间: {{ material.updated_at }}</p>
              <div class="flex justify-end items-center">
                <button
                  @click="togglePublic(material.docs_id)"
                  :class="material.is_public ? 'text-blue-500' : 'text-gray-500'"
                  class="hover:text-blue-700 mr-2"
                >
                  {{ material.is_public ? '公开' : '私密' }}
                </button>
                <button
                  @click="editMaterial(material.docs_id)"
                  class="text-green-500 hover:text-green-700 mr-2"
                >
                  编辑
                </button>
                <button
                  @click="deleteMaterial(material.docs_id)"
                  class="text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-600">暂无上传的参考材料。</p>
        </div>
      </main>
    </div>
    <showMessage ref="showMessageRef"/>
    <optConfirm ref="optConfirmRef"/>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { UploadIcon, ListIcon, PencilIcon } from 'lucide-vue-next'
  import axios from 'axios'
  import config from '@/util/config';
  import showMessage from '@/components/common/showMessage.vue';
  import optConfirm from '@/components/common/optConfirm.vue';
  
  // 配置 Axios 全局选项
  axios.defaults.withCredentials = true;
  
  const currentView = ref('upload')
  const uploadedFile = ref(null)
  const selectedMaterial = ref(null)
  const materials = ref([])
  const showMessageRef = ref(null)
  const optConfirmRef = ref(null)
  
  const isDragging = ref(false)
  const isMobile = ref(false)
  const showMobileMenu = ref(false)
  
  const navItems = [
    { id: 'upload', name: '上传参考材料', icon: UploadIcon },
    { id: 'manage', name: '管理段落内容', icon: PencilIcon },
    { id: 'list', name: '材料列表', icon: ListIcon },
  ]
  
  const uploadStatus = ref([])
  
  const changeLog = ref({}) // 初始化变更对象
  
  const documentDescription = ref('') // 新增的文档描述变量
  
  const handleFileDrop = (event) => {
    event.preventDefault(); // 阻止浏览器默认行为
    const file = event.dataTransfer.files[0];
    if (file) {
      // 创建一个模拟的事件对象
      const simulatedEvent = {
        target: {
          files: [file]
        }
      };
      // 调用 handleFileSelect 函数
      handleFileSelect(simulatedEvent);
    }
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadedFile.value = file;
      uploadStatus.value.push(`已选择: ${file.name}`);
    }
  };
  
  const confirmUpload = async () => {
    if (!documentDescription.value.trim()) {
      showMessageRef.value.showMessage('请填写文档描述');
      return;
    }

    if (!uploadedFile.value) {
      showMessageRef.value.showMessage('请先选择文件');
      return;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('document', uploadedFile.value);
    formData.append('description', documentDescription.value); // 使用用户输入的描述

    try {
      uploadStatus.value.push(`${uploadedFile.value.name} 正在解析`);
      // 调用后端接口
      await axios.post(`${config.getSetting("API_BASE_URL")}/api/aiAgent/upload-doc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      uploadStatus.value.push(`${uploadedFile.value.name} 解析完成`);
    } catch (error) {
      showMessageRef.value.showMessage('上传失败:'+error);
      uploadStatus.value.push('上传失败');
    }
  };
  
  const addParagraph = () => {
    if (selectedMaterial.value) {
      selectedMaterial.value.paragraphs.push({content_id: '', section_title: '', section_content: '' })
    }
  }
  
  const deleteParagraph = async (contentId) => {
    const ack = await optConfirmRef.value.showConfirm("是否删除段落?")
    if(!ack){
        return
    }
    try {
        await axios.delete(`${config.getSetting("API_BASE_URL")}/api/aiAgent/delete-paragraph`, {
        data: { content_id: contentId }
      });
      showMessageRef.value.showMessage("段落删除成功");

      // 从 selectedMaterial 中移除已删除的段落
      selectedMaterial.value.paragraphs = selectedMaterial.value.paragraphs.filter(paragraph => paragraph.content_id !== contentId);
    } catch (error) {
        showMessageRef.value.showMessage('删除段落遇到错误：'+error);
    }
  }
  
  const selectMaterial = (id) => {
    selectedMaterial.value = materials.value.find(material => material.docs_id === id)
    // 不重置 changeLog，以便用户可以在多个材料中进行修改
  }
  
  const editMaterial = (id) => {
    selectMaterial(id)
    currentView.value = 'manage'
  }
  
  const updateChangeLog = (contentId, field, value) => {
    if (!changeLog.value[contentId]) {
      changeLog.value[contentId] = { content_id: contentId }
    }
    changeLog.value[contentId][field] = value
  }

  
  const saveChanges = async () => {
    const changes = Object.values(changeLog.value);
    if (changes.length > 0) {
      try {
        // 检查并初始化每个变更对象的必要字段
        for (const change of changes) {
          if (!change.content_id) {
            // 如果 content_id 为空,则调用 saveAdd 函数
            await saveAdd(change);
          } else {
            const selectedParagraph = selectedMaterial.value.paragraphs.find(p => p.content_id === change.content_id);
            if (selectedParagraph) {
              if (!change.section_title) {
                change.section_title = selectedParagraph.section_title;
              }
              if (!change.section_content) {
                change.section_content = selectedParagraph.section_content;
              }
            }
          }
        }

        // 提交有 content_id 的变更对象到后端
        const updatedChanges = changes.filter(change => change.content_id);
        if (updatedChanges.length > 0) {
          await axios.post(`${config.getSetting("API_BASE_URL")}/api/aiAgent/update-paragraph`, updatedChanges);
          showMessageRef.value.showMessage("保存段落内容变更成功");
        }

        changeLog.value = {}; // 保存后重置变更对象
        
      } catch (error) {
        showMessageRef.value.showMessage('修改段落遇到错误：' + error);
      }
    } else {
      showMessageRef.value.showMessage('没有变更内容需要保存');
    }
  };

  const saveAdd = async (change) => {
    try {
      const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/aiAgent/add-paragraph`, {
        docs_id: selectedMaterial.value.docs_id,
        section_title: change.section_title || '',
        section_content: change.section_content || ''
      });
      const newContentId = response.data.content_id;
      
      // 从 selectedMaterial.value.paragraphs 中删除 content_id 为空的值
      selectedMaterial.value.paragraphs = selectedMaterial.value.paragraphs.filter(p => p.content_id);

      // 添加新的段落到 selectedMaterial.value.paragraphs
      const newParagraph = {
        content_id: newContentId,
        section_title: change.section_title,
        section_content: change.section_content
      };
      selectedMaterial.value.paragraphs.push(newParagraph);
      
      showMessageRef.value.showMessage("添加新段落成功");
    } catch (error) {
      showMessageRef.value.showMessage('添加新段落遇到错误：' + error);
    }
  };


  const togglePublic = async (docs_id) => {
    try {
      const response = await axios.post(`${config.getSetting("API_BASE_URL")}/api/aiAgent/toggle-doc-public`, {
        docs_id: docs_id
      });
      console.log('Visibility toggled:', response.data);

      // 更新 materials 中的 is_public 状态
      const material = materials.value.find(material => material.docs_id === docs_id);
      if (material) {
        material.is_public = !material.is_public;
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  }
  
  const deleteMaterial = async (id) => {
    const ack = await optConfirmRef.value.showConfirm("是否删除文档?")
    if(!ack){
        return
    }
    try {
        await axios.delete(`${config.getSetting("API_BASE_URL")}/api/aiAgent/delete-doc`, {
        data: { docs_id: id }
      });
      showMessageRef.value.showMessage('删除文档成功！');

      // 从 materials 中移除已删除的文档
      materials.value = materials.value.filter(material => material.docs_id !== id);
    } catch (error) {
        showMessageRef.value.showMessage('删除文档失败:'+error);
    }
  }

  const revectorizeMaterial = async (docs_id) => {
    const ack = await optConfirmRef.value.showConfirm("是否重新向量化?")
    if(!ack){
        return
    }
    try {
        await axios.post(`${config.getSetting("API_BASE_URL")}/api/aiAgent/reset-material-vector`, {
        docs_id: docs_id
      });
      showMessageRef.value.showMessage('重新向量化成功！');
    } catch (error) {
      showMessageRef.value.showMessage('重新向量化失败：' + error);
    }
  }
  
//   const removeFile = () => {
//     uploadedFile.value = null
//   }
  
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  
  // 获取文档的逻辑
  const fetchDocs = async () => {
    try {
      const response = await axios.get(`${config.getSetting("API_BASE_URL")}/api/aiAgent/get-docs`)
      materials.value = response.data
    } catch (error) {
        showMessageRef.value.showMessage('获取文档段落失败：'+error)
    }
  }

  const handleNavClick = (viewId) => {
    currentView.value = viewId;
    fetchDocs(); // 每次点击导航项时调用 fetchDocs
  };

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // 调用 fetchDocs 函数初始化 materials
    fetchDocs()
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  // 分页相关
  const pageSize = 5
  const currentPage = ref(1)

  const paginatedParagraphs = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    return selectedMaterial.value.paragraphs.slice(startIndex, endIndex)
  })

  const totalPages = computed(() => {
    return Math.ceil(selectedMaterial.value.paragraphs.length / pageSize)
  })

 
  </script>











