<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto relative">
        <!-- Close button -->
        <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X class="h-6 w-6" />
        </button>
  
        <div class="p-6 space-y-6">
          <!-- Top Section: Risk Items -->
          <div class="bg-blue-50 rounded-lg shadow-md overflow-auto p-4">
            <h2 class="text-lg font-semibold mb-4 text-blue-800">风险项</h2>
            <div class="flex gap-2 mb-4">
              <select v-model="riskLevelFilter" class="w-[180px] border border-blue-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">全部</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <input v-model="searchQuery" type="text" placeholder="Search risks" class="flex-grow border border-blue-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              <button class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300">
                <Search class="h-4 w-4" />
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="risk in filteredRisks" :key="risk.id" class="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                <div class="flex items-center justify-between pb-2">
                  <h3 class="text-sm font-medium text-blue-700">{{ risk.title }}</h3>
                  <input type="checkbox" :checked="selectedRisks.some(r => r.id === risk.id)" @change="handleRiskSelection(risk)" class="form-checkbox h-5 w-5 text-blue-600" />
                </div>
                <p class="text-xs text-gray-600">{{ risk.reportcontent }}</p>
                <div class="mt-1 flex justify-between text-xs">
                  <span class="text-blue-600">Level: {{ risk.riskvalue }}</span>
                  <span class="text-blue-600">Type: {{ risk.work_classification }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Middle Section: AI Generation Process -->
          <div class="bg-blue-50 rounded-lg shadow-md overflow-auto p-4">
            <h2 class="text-lg font-semibold mb-4 text-blue-800">AI Generation Process</h2>
            <div class="w-full bg-blue-100 rounded-full h-2.5 mb-4">
              <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${progress}%` }"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(log, index) in generationLogs" :key="index" class="bg-white border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-700">{{ log }}</p>
              </div>
            </div>
            <div class="mt-4 flex justify-between">
              <button @click="startGeneration" :disabled="isGenerating || selectedRisks.length === 0" class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Start Generation
              </button>
              <button @click="cancelGeneration" :disabled="!isGenerating" class="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </div>
  
          <!-- Bottom Section: Generated Safeguards -->
          <div class="bg-blue-50 rounded-lg shadow-md overflow-auto p-4">
            <h2 class="text-lg font-semibold mb-4 text-blue-800">Generated Safeguards</h2>
            <div class="flex gap-2 mb-4">
              <button @click="exportSafeguards" class="border border-blue-300 p-2 rounded-md flex items-center text-blue-600 hover:bg-blue-100 transition duration-300">
                <Download class="mr-2 h-4 w-4" /> Export
              </button>
            </div>
            <div class="overflow-auto max-h-[400px]">
              <div class="flex flex-wrap gap-4">
                <div v-for="risk in safeguards" :key="risk.risk_id" class="col-span-1 w-full">
                  <div class=" bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                    <h3 @click="toggleMitigation(risk)" class="text-sm font-medium text-blue-700 mb-2 cursor-pointer">{{ risk.risk_guide }}</h3>
                    <ul>
                      <li @click="toggleMitigation(risk)" class="text-xs text-gray-600 cursor-pointer mb-1">
                        {{ risk.risk_content }}
                      </li>
                    </ul>
                    <div v-if="risk.showMitigation" class="mt-4">
                      <h4 class="text-sm font-medium text-blue-700 mb-2">AI生成的控制措施：</h4>
                      <ul>
                        <li v-for="mitigation in risk.mitigations" :key="mitigation.title" class="flex justify-between items-center text-xs text-gray-600 mb-1">
                          {{ mitigation.title }}
                          <div>
                            <button @click="editSafeguard(risk.risk_id, mitigation)" class="text-blue-500 hover:text-blue-700 transition duration-300">
                              <Edit2 class="h-4 w-4" />
                            </button>
                            <button @click="deleteMitigation(risk.risk_id, mitigation)" class="text-red-500 hover:text-red-700 transition duration-300 ml-2">
                              <X class="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mitigation Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-xl p-6">
        <h2 class="text-xl font-semibold mb-4">Edit Mitigation</h2>
        <form @submit.prevent="saveMitigation">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input v-model="editedMitigation.title" type="text" id="title" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          </div>
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700">description</label>
            <textarea v-model="editedMitigation.description" id="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div class="mb-4">
            <label for="guide" class="block text-sm font-medium text-gray-700">Guide</label>
            <textarea v-model="editedMitigation.guide" id="guide" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeEditModal" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2">
              Cancel
            </button>
            <button type="submit" class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    <showMessage ref="showMessageRef" />
  </template>
  
  <script setup>
  import { ref, computed,defineEmits,defineProps } from 'vue'
  import { Search, Edit2, Download, X } from 'lucide-vue-next'
  import showMessage from '@/components/common/showMessage.vue';
  import config from '@/util/config'
  import axios from 'axios'; // 引入 axios
  
  const props = defineProps(['risks'],{required:true})
  // Emits
  const emit = defineEmits(['close'])
  const showMessageRef = ref(null); // 引用showMessage组件
  
  const selectedRisks = ref([])
  const isGenerating = ref(false)
  const progress = ref(0)
  const generationLogs = ref([])
  const riskLevelFilter = ref('')
  const searchQuery = ref('')
  const safeguards = ref([])
  //{"risk_id":29,"risk_guide":"用户数量","risk_content":"用户数量为一万，用户数量级别风险高","risk_level":"medium","mitigations":[{"title":"用户数量风险控制","description":"实施用户注册审核机制，确保每位用户的真实性和合法性。","guide":"建立用户身份验证流程，对注册用户提供身份证明材料审核，并对用户信息进行定期复核。"}]}
  
  const filteredRisks = computed(() => {
    return props.risks.filter(risk => {
      const levelMatch = !riskLevelFilter.value || risk.riskvalue === riskLevelFilter.value
      const searchMatch = !searchQuery.value || risk.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      return levelMatch && searchMatch
    })
  })

  const toggleMitigation = (risk) => {
    if (risk.showMitigation) {
      risk.showMitigation = false
    } else {
      risk.showMitigation = true
    }
  }
  
  const handleRiskSelection = (risk) => {
    const index = selectedRisks.value.indexOf(risk)
    if (index === -1) {
      selectedRisks.value.push(risk)
    } else {
      selectedRisks.value.splice(index, 1)
    }
  }
  
  const startGeneration = async () => {
    isGenerating.value = true
    progress.value = 0
    generationLogs.value = []


    console.log("selectedRisks.value",selectedRisks.value);
    const risksToSend = selectedRisks.value.map(risk => ({
        risk_id: risk.id,
        risk_guide: risk.guide,
        risk_content: risk.reportcontent,
        risk_level: risk.riskvalue
    }));
    const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/start-generation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            risks: risksToSend,
            work_classification: selectedRisks.value[0].work_classification,
        }),
    });

    if (!response.ok) {
        showMessageRef.value.showMessage('启动生成保护措施时出错：' + response.status);
        isGenerating.value = false;
        return;
    }
    const data = await response.json();
    console.log("response:",JSON.stringify(data));
    const generationRiskId = data.data;

    const eventSource = new EventSource(`${config.getSetting('API_BASE_URL')}/api/get-mitigations?generationRiskId=${generationRiskId}`);

    eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        progress.value = data.progress;
        generationLogs.value.push(data.message);
    });

    eventSource.addEventListener('result', (event) => {
        const data = JSON.parse(event.data);
        console.log(JSON.stringify(data));
        safeguards.value = data;
        isGenerating.value = false;
        eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
        showMessageRef.value.showMessage('Generation error:' + event.data);
        isGenerating.value = false;
        eventSource.close();
    });
  }
  
  const cancelGeneration = () => {
    isGenerating.value = false
    progress.value = 0
    generationLogs.value = []
  }
  
  const showEditModal = ref(false);
  const editedMitigation = ref({
    title: '',
    description: '',
    guide: '',
  });

  const editSafeguard = (risk_id, mitigation) => {
      editedMitigation.value = {risk_id:risk_id, ...mitigation };
      showEditModal.value = true;
  };

  const closeEditModal = () => {
    showEditModal.value = false;
  };

  const saveMitigation = () => {
    // 在这里实现保存编辑后的缓解措施的逻辑
    safeguards.value.find(s => s.risk_id === editedMitigation.value.risk_id).mitigations.find(m => m.id === editedMitigation.value.id).title = editedMitigation.value.title;
    safeguards.value.find(s => s.risk_id === editedMitigation.value.risk_id).mitigations.find(m => m.id === editedMitigation.value.id).description = editedMitigation.value.description;
    safeguards.value.find(s => s.risk_id === editedMitigation.value.risk_id).mitigations.find(m => m.id === editedMitigation.value.id).guide = editedMitigation.value.guide;
    showEditModal.value = false;
  };
  
  const exportSafeguards = async () => {
    try {
        const tasksToAdd = [];
        const mitigationIds = [];
        
        // 1. 保存保障措施到数据库
        for (const safeguard of safeguards.value) {
          if (safeguard.mitigations.length ===  0) {
            showMessageRef.value.showMessage('风险项：' + safeguard.risk_guide + '未有对应的保护措施');
            return;
          }
            for (const mitigation of safeguard.mitigations) {
                // 将每个缓解措施的信息添加到任务数组中
                tasksToAdd.push({
                    title: mitigation.title,
                    status: "待开始", // 假设初始状态为 "待开始"
                    description: mitigation.description,
                    guide: mitigation.guide,
                    taskcategory: "保障项", // 假设任务类别为 "保障项"
                });
            }
        // 发起 POST 请求到 /addUserWorkTask，传递整个任务数组
        let response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/addUserWorkTask`, { AddtaskInfo: tasksToAdd }, {
            withCredentials: true // 确保请求时携带凭证
        });

        if (response.status === 201) {
            mitigationIds.value = response.data.id;
            showMessageRef.value.showMessage('成功保存AI生成的保障措施');
        } else {
            showMessageRef.value.showMessage('生成保护措施时出错： ' + response.statusText);
            return;
        }
        
        //2.建立风险项与保障措施的关联
        response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/riskLinkAssurance`, { riskId: safeguard.risk_id, assuranceList: mitigationIds.value }, {
            withCredentials: true // 确保请求时携带凭证
        });
        if (response.status === 201) {
            showMessageRef.value.showMessage('成功建立风险项与保障措施的关联');
        } else {
            showMessageRef.value.showMessage('建立风险项与保障措施的关联时出错： ' + response.statusText);
            return;
        }
      }

    } catch (error) {
        showMessageRef.value.showMessage('Error exporting safeguards: ' + error.message);
    }
  };
  
  const closeModal = () => {
    emit('close')
  }

  const deleteMitigation = (risk_id, mitigation) => {
    const risk = safeguards.value.find(s => s.risk_id === risk_id);
    if (risk) {
      const index = risk.mitigations.indexOf(mitigation);
      if (index !== -1) {
        risk.mitigations.splice(index, 1);
      }
    }
    console.log("safeguards:",safeguards.value);
  };
  </script>
  