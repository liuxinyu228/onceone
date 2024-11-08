<template>
  <div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-1/2">
      <h2 class="text-xl font-bold mb-4">关联风险项</h2>
      <div class="mb-4">
        <p><strong>风险标题:</strong> {{ task.title }}</p>
        <p><strong>风险内容:</strong> {{ task.reportcontent }}</p>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">选择保障项:</label>
        <div class="h-40 overflow-y-auto border rounded p-2">
          <div v-for="item in assuranceItems" :key="item.id" class="mb-2">
            <label :for="'assurance-item-' + item.id" class="flex items-center p-2 border rounded cursor-pointer" 
                   :class="{ 'bg-blue-500 text-white': item.selected, 'hover:bg-gray-100 active:bg-gray-200': !item.selected }">
              <input type="checkbox" :id="'assurance-item-' + item.id" :value="item.id" v-model="item.selected" class="mr-2">
              <div>
                <p><strong>标题:</strong> {{ item.title }}</p>
                <p><strong>内容:</strong> <span :class="item.reportcontent ? '' : 'text-gray-500'">{{ item.reportcontent || '请检查对应保障项是否完成' }}</span></p>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow mr-2" @click="saveSelection">保存</button>
        <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
  <showMessage ref="showMessageRef" />
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue';
import axios from 'axios';
import config from '@/util/config';
import showMessage from '@/components/common/showMessage.vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const assuranceItems = ref([]);
const showMessageRef = ref(null);

onMounted(fetchItems);

async function fetchItems(){
    try {
    const response = await axios.get(`${config.getSetting("API_BASE_URL")}/api/riskLinkAssurance`, {
      params: {
        riskId: props.task.id,
        workClassification: props.task.work_classification	
      },
      withCredentials: true
    });
    assuranceItems.value = response.data.data;
  } catch (error) {
    showMessageRef.value.showMessage("获取关联保障项失败!");
  }
}

async function saveSelection() {
  const selectedAssuranceIds = assuranceItems.value
    .filter(item => item.selected)
    .map(item => item.id);

  try {
    await axios.post(`${config.getSetting("API_BASE_URL")}/api/riskLinkAssurance`, {
      riskId: props.task.id,
      assuranceList: selectedAssuranceIds
    }, {
      withCredentials: true
    });

    showMessageRef.value.showMessage("关联保障项成功!");
  } catch (error) {
    showMessageRef.value.showMessage("关联保障项失败!");
  }
}
</script>
