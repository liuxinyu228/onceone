<template>
  <div :class="['bg-gray-800 text-white', sidebarOpen ? 'w-64' : 'w-20', 'flex-shrink-0 transition-all duration-300']">
    <div class="p-4 flex items-center justify-between">
      <h1 :class="['font-bold transition-all duration-300', sidebarOpen ? 'text-2xl' : 'text-lg']">
        {{ sidebarOpen ? 'Admin Dashboard' : 'AD' }}
      </h1>
      <button @click="toggleSidebar" class="text-white focus:outline-none">
        <MenuIcon v-if="!sidebarOpen" class="h-6 w-6" />
        <XIcon v-else class="h-6 w-6" />
      </button>
    </div>
    <nav class="mt-8">
      <a @click="setActiveTab('users')" :class="['block py-2 px-4 text-sm hover:bg-gray-700 transition duration-200', { 'bg-gray-700': activeTab === 'users' }]">
        <div class="flex items-center">
          <UserIcon class="h-5 w-5 mr-2" />
          <span :class="{ 'hidden': !sidebarOpen }">User Management</span>
        </div>
      </a>
      <a @click="setActiveTab('tasks')" :class="['block py-2 px-4 text-sm hover:bg-gray-700 transition duration-200', { 'bg-gray-700': activeTab === 'tasks' }]">
        <div class="flex items-center">
          <ClipboardListIcon class="h-5 w-5 mr-2" />
          <span :class="{ 'hidden': !sidebarOpen }">Task Management</span>
        </div>
      </a>
      <a @click="setActiveTab('workManagement')" :class="['block py-2 px-4 text-sm hover:bg-gray-700 transition duration-200', { 'bg-gray-700': activeTab === 'workManagement' }]">
        <div class="flex items-center">
          <ClipboardListIcon class="h-5 w-5 mr-2" />
          <span :class="{ 'hidden': !sidebarOpen }">Work Management</span>
        </div>
      </a>
      <a @click="setActiveTab('knowledgeManager')" :class="['block py-2 px-4 text-sm hover:bg-gray-700 transition duration-200', { 'bg-gray-700': activeTab === 'workManagement' }]">
        <div class="flex items-center">
          <ClipboardListIcon class="h-5 w-5 mr-2" />
          <span :class="{ 'hidden': !sidebarOpen }">knowledgeManager</span>
        </div>
      </a>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { MenuIcon, XIcon, UserIcon, ClipboardListIcon } from 'lucide-vue-next'

export default {
  components: {
    MenuIcon,
    XIcon,
    UserIcon,
    ClipboardListIcon
  },
  setup(props, { emit }) {
    const sidebarOpen = ref(false)
    const activeTab = ref('users')

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }

    // 新增：检测屏幕大小
    const checkScreenSize = () => {
      console.log(window.innerWidth)
      if (window.innerWidth < 768) { // 小于768px时
        sidebarOpen.value = false
      } else {
        sidebarOpen.value = true
      }
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize) // 监听窗口大小变化
    })

    const setActiveTab = (tab) => {
      activeTab.value = tab
      emit('update:activeTab', tab)
    }

    return {
      sidebarOpen,
      activeTab,
      toggleSidebar,
      setActiveTab
    }
  }
}
</script>
