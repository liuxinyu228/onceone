<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style="z-index: 8;">
      <div class="bg-white p-6 rounded-lg shadow-lg w-1/2" style="height: 95vh; overflow-y: auto;">
        <h2 class="text-xl font-bold mb-4">{{ isViewOnly ? '查看任务' : '编辑任务' }}</h2>
  
        <label class="block mb-2">任务标题：</label>
        <input
          v-if="editedTask.taskCategory === '协助项' && !isViewOnly"
          type="text"
          v-model="editedTask.title"
          class="w-full border p-2 mb-4"
        />
        <p v-else class="w-full border p-2 mb-4">{{ editedTask.title }}</p>
  
        <label class="block mb-2">任务类型：</label>
        <p class="w-full border p-2 mb-4">{{ editedTask.taskcategory }}</p>
  
        <label class="block mb-2">任务描述：</label>
        <input
          v-if="editedTask.taskCategory === '协助项' && !isViewOnly"
          type="text"
          v-model="editedTask.description"
          class="w-full border p-2 mb-4"
        />
        <p v-else class="w-full border p-2 mb-4">{{ editedTask.description }}</p>
  
        <label v-if="editedTask.taskCategory !== '协助项'" class="block mb-2">评估指引：</label>
        <p  v-if="editedTask.taskCategory !== '协助项'" class="w-full border p-2 mb-4">{{ editedTask.guide }}</p>
  
        <label v-if="editedTask.taskCategory !== '协助项'" class="block mb-2">检查描述：</label>
        <input
          v-if="editedTask.taskCategory !== '协助项'"
          type="text"
          v-model="editedTask.reportcontent	"
          class="w-full border p-2 mb-4"
          :disabled="isViewOnly"
        />
  
        <label v-if="editedTask.taskCategory !== '协助项'" class="block mb-2">证明材料：</label>
        <div v-if="editedTask.taskCategory !== '协助项' && !isViewOnly">
          <input
            type="file"
            accept=".jpeg,.png,.jpg"
            @change="handleFileUpload"
            class="w-full border p-2 mb-4"
          />
          <div v-if="editedTask.taskCategory !== '协助项' && editedTask.materialpath.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(file, index) in editedTask.materialpath"
              :key="index"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center"
               @click="showImageToBlank(file.id)"
              >
              <span class="mr-1">{{ file.path }}</span>
              <button
                @click="removeFile(file.id)"
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
    
        <div v-if="editedTask.taskCategory !== '协助项' && isViewOnly" class="w-full border p-2 mb-4">
          <div v-if="editedTask.materialpath.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(file, index) in editedTask.materialpath"
              :key="index"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center"
              @click="showImageToBlank(file.id)"
            >
              <span class="mr-1">{{ file.path }}</span>
            </div>
          </div>
        </div>
  
        <label v-if="editedTask.taskCategory !== '协助项'" class="block mb-2">风险判断：</label>
        <select v-if="editedTask.taskCategory !== '协助项'" v-model="editedTask.riskvalue" class="w-full border p-2 mb-4 bg-white shadow" :disabled="isViewOnly">
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
  
        <div class="flex justify-end">
          <button @click="$emit('close')" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">取消</button>
          <button v-if="!isViewOnly" @click="saveTask" class="bg-blue-500 text-white px-4 py-2 rounded">保存</button>
        </div>
      </div>
    </div>
    <div v-if="showStatusModal && editedTask.taskCategory !== '协助项'" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style="z-index: 9;">
      <div class="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 class="text-xl font-bold mb-4">选择任务状态</h2>
        <select v-model="Status" class="w-full border p-2 mb-4 bg-white shadow">
          <option value="待开始">待开始</option>
          <option value="进行中">进行中</option>
          <option value="整改中">整改中</option>
          <option value="已完成">已完成</option>
        </select>
        <div class="flex justify-end">
          <button @click="closeStatusModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">取消</button>
          <button @click="confirmStatus" class="bg-blue-500 text-white px-4 py-2 rounded">确认</button>
        </div>
      </div>
    </div>
    <div v-if="showAlert" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 " style="z-index: 10;">
      <div class="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 class="text-xl font-bold mb-4">{{ alertMessage }}</h2>
        <div class="flex justify-end">
          <button @click="closeAlert" class="bg-blue-500 text-white px-4 py-2 rounded">确认</button>
        </div>
      </div>
    </div>
    <ProgressBar v-if="showUploadProgress" :progress="uploadProgress" @cancel="cancelUpload" />
  </template>
  
  <script>
  import { formatDate } from '@/util/util';
  import axios from 'axios';
  import config from '@/util/config'
  import ProgressBar from '@/components/common/ProgressBar.vue'; // 导入进度条组件

  export default {
    components: {
      ProgressBar
    },
    props: {
      task: {
        type: Object,
        required: true,
      },
      isViewOnly: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      console.log("log:",this.initializeTask());
      return {
        editedTask: this.initializeTask(), // 初始化任务
        showStatusModal: false,
        Status: '进行中',
        showAlert: false,
        alertMessage: '',
        showUploadProgress: false,
        uploadProgress: 0,
        cancelTokenSource: null,
      };
    },
    computed: {
      downloadLink() {
        return `${config.getSetting('API_BASE_URL')}/api/downloadTaskMaterial/${this.editedTask.id}`;
      }
    },
    methods: {
      initializeTask() {
        return {
          id: this.task.id,
          title: this.task.title ? this.task.title : '',
          taskcategory: this.task.taskcategory ? this.task.taskcategory : '',
          description: this.task.description ? this.task.description : '',
          guide: this.task.guide ? this.task.guide : '',
          reportcontent	: this.task.reportcontent	 ? this.task.reportcontent	 : '',
          materialpath: this.task.materialpath ? this.task.materialpath : [],
          riskvalue: this.task.riskvalue ? this.task.riskvalue : 'low',
          status: this.task.status ? this.task.status : '待开始',
          work_classification: this.task.work_classification ? this.task.work_classification : '',
          created_at: this.task.created_at,
          updated_at: this.task.updated_at
        };
      },
      saveTask() {
        if (this.editedTask.taskCategory !== '协助项') {
          this.showStatusModal = true; // 显示状态选择弹窗
        } else {
          this.confirmStatus(); // 直接保存任务
        }
      },
      closeStatusModal() {
        this.showStatusModal = false; // 关闭状态选择弹窗
      },
      confirmStatus() {
        this.editedTask.status = this.Status; // 设置任务状态
        
        // 定义 formData 参数
        const formData = {
          status: this.editedTask.status ?  this.editedTask.status : '进行中',
          reportcontent	: this.editedTask.reportcontent	 ? this.editedTask.reportcontent	 : '',
          riskvalue: this.editedTask.riskvalue ? this.editedTask.riskvalue : 'low'
        };
        console.log(this.editedTask);
        // 使用 fetch 调用 /updateTask/:taskId 接口修改任务内容
        fetch(`${config.getSetting('API_BASE_URL')}/api/updateTask/${this.editedTask.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // 携带凭证
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (!response.ok) {
            response.json().then(data => {
              this.showAlertMessage('任务更新失败: ' + data.message);
            });
            this.showStatusModal = false; // 关闭状态选择弹窗
            return;
          }
          
          this.editedTask.updated_at = formatDate(); // 修改updated_at，格式为YYYY-MM-DD HH:mm
          this.showStatusModal = false; // 关闭状态选择弹窗
          this.$emit('save', this.editedTask, true); // 触发保存事件，并传递编辑后的任务
          this.showAlertMessage('任务更新成功');
        })
        .catch(error => {
          console.error('任务更新失败:', error);
          this.showAlertMessage('任务更新失败');
        });
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        this.showUploadProgress = true;
        this.uploadProgress = 0;

        this.cancelTokenSource = axios.CancelToken.source();

        axios.post(`${config.getSetting('API_BASE_URL')}/api/updateTaskMaterial/${this.editedTask.id}`, formData, {
          withCredentials: true,
          cancelToken: this.cancelTokenSource.token,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              this.uploadProgress = (progressEvent.loaded / progressEvent.total) * 100;
            }
          }
        })
        .then(response => {
          this.showUploadProgress = false;
          this.editedTask.materialpath = response.data.filePath;
          this.$emit('save', this.editedTask, false);
          this.showAlertMessage('文件上传成功');
        })
        .catch(error => {
          this.showUploadProgress = false;
          if (axios.isCancel(error)) {
            this.showAlertMessage('上传已取消');
          } else {
            this.showAlertMessage('文件上传失败');
          }
        });
      },
      cancelUpload() {
        if (this.cancelTokenSource) {
          this.cancelTokenSource.cancel('用户取消了上传');
          this.showUploadProgress = false;
        }
      },
      showAlertMessage(message) {
        this.alertMessage = message;
        this.showAlert = true;
      },
      closeAlert() {
        this.showAlert = false;
      },
      removeFile(fileId) {
        // 从 editedTask.materialpath 中移除指定的文件
        this.editedTask.materialpath = this.editedTask.materialpath.filter(file => file.id !== fileId);

        // 调用后端接口更新数据库
        fetch(`${config.getSetting('API_BASE_URL')}/api/removeTaskMaterial/${this.editedTask.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // 携带凭证
          body: JSON.stringify({ fileId })
        })
        .then(response => {
          if (!response.ok) {
            this.showAlertMessage('文件移除失败');
            return;
          }
          return response.json();
        })
        .then(data => {
          this.showAlertMessage('文件移除成功');
          // 更新前端的 materialpath
          this.editedTask.materialpath = data.materialpath;
        })
        .catch(error => {
          console.error('文件移除失败:', error);
          this.showAlertMessage('文件移除失败');
        });
      },
      showImageToBlank(fileId) {
          const imageID = this.editedTask.id;
          const newWindowUrl = this.$router.resolve({
          path: '/imageViewer',
          query: { 
            imageID: imageID,
            fileId: fileId
           }
        }).href;
        window.open(newWindowUrl, '_blank');
      },
    },
  };
  </script>
