<template>
    <div class="text-gray-500">
      <router-link to="/opt" class="hover:text-blue-600">工作台</router-link> / {{ systemName }} / {{ workClassification }}
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import { decrypt } from '@/util/util'; // 假设解密函数在 utils/util.js 中

export default {
  data() {
    return {
      systemName: '',
      workClassification: '',
      workMap:{
        101:"新技术新业务安全评估",
        102:"涉诈风险安全评估"
      }
    };
  },
  mounted() {
    const encryptedTaskInfo = Cookies.get('taskInfo');
    if (encryptedTaskInfo) {
      const decryptedTaskInfo = JSON.parse(decrypt(encryptedTaskInfo));
      this.systemName = decryptedTaskInfo.system_name || '';
      this.workClassification = this.workMap[decryptedTaskInfo.work_classification] || '';

    }
  }
};
</script>
