<template>
  <div class="flex h-screen bg-gray-100">
    <AdminSidebar @update:activeTab="updateActiveTab" />
    <div class="flex-1 flex flex-col">
      <header class="flex justify-end items-center  shadow-md p-2">
        <UserInfo/>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <UserManagement v-if="activeTab === 'users'" />
        <TaskManagement v-if="activeTab === 'tasks'" />
        <WorkManagement v-if="activeTab === 'workManagement'" />
      </main>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import UserManagement from '@/components/admin/UserManagement.vue'
import TaskManagement from '@/components/admin/TaskManagement.vue'
import WorkManagement from '@/components/admin/WorkManagement.vue'
import UserInfo from '@/components/UserInfo.vue'

export default {
  components: {
    AdminSidebar,
    UserManagement,
    TaskManagement,
    WorkManagement,
    UserInfo
  },
  setup() {
    const activeTab = ref('users')

    const updateActiveTab = (tab) => {
      activeTab.value = tab
    }

    return {
      activeTab,
      updateActiveTab
    }
  }
}
</script>
