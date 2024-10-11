<template>
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">参考文件管理</h1>
  
          <!-- Create Directory Form -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-2">创建新目录</h2>
            <div class="flex">
              <input
                v-model="newDirectoryName"
                type="text"
                placeholder="Enter directory name"
                class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                @click="createDirectory"
                class="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create
              </button>
            </div>
          </div>
  
          <!-- File Structure -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-2">File Structure</h2>
            <div class="border border-gray-200 rounded-md">
              <div v-for="(directory, index) in directories" :key="index" class="border-b border-gray-200 last:border-b-0">
                <div
                  @click="toggleDirectory(index)"
                  class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                >
                  <span class="font-medium text-gray-700">{{ directory.name }}</span>
                  <svg
                    class="w-5 h-5 text-gray-500 transform transition-transform duration-200"
                    :class="{ 'rotate-90': directory.isOpen }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div v-if="directory.isOpen" class="px-4 py-2">
                  <ul class="list-disc list-inside">
                    
                    <li v-for="file in directory.files" :key="file.name" class="text-gray-600 flex justify-between items-center mb-2">
                      {{ file.name }}
                      <div>
                        <button
                          @click="downloadFile(file.id)"
                          class="ml-4 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          下载
                        </button>
                        <button
                          @click="deleteFile(file.id)"
                          class="ml-4 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  </ul>
                  <!-- Add File Form -->
                  <div class="mt-2 flex">
                    <p
                      class="flex-grow px-3 py-2 border border-gray-300  rounded-l-md " 
                      >上传文件:</p>
                    <input
                      type="file"
                      @change="handleFileChange"
                      class="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      @click="addFile(directory)"
                      class="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
  <div v-if="showErrorModal" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                操作详情
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="showErrorModal = false" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 删除确认弹窗 -->
  <div v-if="showDeleteConfirmModal" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                确认删除
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  你确定要删除这个文件吗？
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="confirmDeleteFile" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
            确认
          </button>
          <button @click="showDeleteConfirmModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script>
  import axios from 'axios'
  import config from '../../../../util/config'

  export default {
    data() {
      return {
        directories: [],
        newDirectoryName: '',
        newFileName: '',
        newFile: null,
        showErrorModal: false,
        errorMessage: '',
        showDeleteConfirmModal: false,
        fileIdToDelete: null
      }
    },
    methods: {
      showMessage(message) {
        this.errorMessage = message;
        this.showErrorModal = true;
      },
      async fetchDirectories() {
        try {
          const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/directories`, {
            withCredentials: true
          })
          this.directories = response.data
        } catch (error) {
          console.error('Error fetching directories:', error)
        }
      },
      createDirectory() {
        if (this.newDirectoryName.trim()) {
          axios.post(`${config.getSetting('API_BASE_URL')}/api/directories`, {
            name: this.newDirectoryName.trim()
          }, {
            withCredentials: true
          })
          .then(response => {
            if (response.data.status) {
              this.directories.push(response.data.directory)
              this.newDirectoryName = ''
            } else {
              this.showMessage(response.data.message || '新增目录失败');
            }
          })
          .catch(err => {
            this.showMessage(err.message);
          })
        }
      },
      async addFile(directory) {
        if (this.newFile) {
          const formData = new FormData()
          formData.append('file', this.newFile)
          formData.append('directory_id', directory.id)

          try {
            await axios.post(`${config.getSetting('API_BASE_URL')}/api/files`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              withCredentials: true
            }).then(response => {
              directory.files.push(response.data)
              this.newFileName = ''
              this.newFile = null
              this.showMessage(response.data.message || '文件上传成功');
            }).catch(error => {
              this.showMessage(error.message);
            })
          } 
          catch (error) {
            console.error('Error adding file:', error)
          }
        }
      },
      toggleDirectory(index) {
        this.directories[index].isOpen = !this.directories[index].isOpen
      },
      handleFileChange(e) {
        this.newFile = e.target.files[0]
      },
      deleteFile(fileId) {
        this.fileIdToDelete = fileId;
        this.showDeleteConfirmModal = true;
      },
      confirmDeleteFile() {
        if (this.fileIdToDelete !== null) {
          axios.delete(`${config.getSetting('API_BASE_URL')}/api/files/${this.fileIdToDelete}`, {
            withCredentials: true
          })
          .then(response => {
            if(response.data.success){
              this.directories.forEach(directory => {
                const fileIndex = directory.files.findIndex(file => file.id === this.fileIdToDelete)
                if (fileIndex !== -1) {
                  directory.files.splice(fileIndex, 1)
                }
              })
              this.showMessage(response.data.message || '文件删除成功');
            } else {
              this.showMessage('文件删除失败:' + `${response.data.message}` + '，请稍后再试。');
            }
          })
          .catch(error => {
            this.showMessage(error.message);
          })
          .finally(() => {
            this.showDeleteConfirmModal = false;
            this.fileIdToDelete = null;
          });
        }
      },
      downloadFile(fileId) {
        const link = document.createElement('a');
        link.href = `${config.getSetting('API_BASE_URL')}/api/files/${fileId}/download`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    mounted() {
      this.fetchDirectories()
    }
  }
  </script>