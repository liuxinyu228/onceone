<template>
    <div :class="['sidebar', { 'collapsed': isCollapsed }]">
      <div>
        <h1 v-if="!isCollapsed" class="text-2xl font-bold">onceone</h1>
        <nav class="mt-6">
          <ul>
            <li class="mb-2">
              <router-link to="/compile" class="nav-item" active-class="text-blue-600" exact-active-class="text-blue-600">
                <NotebookPen class="icon" />
                <span v-if="!isCollapsed">评估任务</span>
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/compile/timeline" class="nav-item" active-class="text-blue-600" exact-active-class="text-blue-600">
                <CalendarCheck class="icon" />
                <span v-if="!isCollapsed">事件时间线</span>
              </router-link>
            </li>
            <li v-if="userInfo.personaId !== 707" class="mb-2">
              <router-link to="/compile/filemanager" class="nav-item" active-class="text-blue-600" exact-active-class="text-blue-600">
                <FileBadge class="icon" />
                <span v-if="!isCollapsed">参考文件管理</span>
              </router-link>
            </li>

            <li>
              <router-link to="/compile/knowledge" class="nav-item" active-class="text-blue-600" exact-active-class="text-blue-600">
                <SquareLibrary class="icon" />
                <span v-if="!isCollapsed">知识库</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/compile/statement" class="nav-item" active-class="text-blue-600" exact-active-class="text-blue-600">
                <ScrollText class="icon" />
                <span v-if="!isCollapsed">文档管理</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
      <!-- UserInfo 组件 -->
      <div class="flex items-center p-2 border-t border-gray-300">
        <UserInfo :orientation="'up'"></UserInfo>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import UserInfo from '@/components/UserInfo.vue'
import Cookies from 'js-cookie'
import { decrypt } from '@/util/util.js'
import { NotebookPen, CalendarCheck, FileBadge,ScrollText,SquareLibrary } from 'lucide-vue-next'

const userInfo = JSON.parse(decrypt(Cookies.get('userInfo')))
const isCollapsed = ref(false)

const handleResize = () => {
  isCollapsed.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sidebar {
  width: 16rem;
  background-color: #f7fafc;
  max-height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.3s;
}

.collapsed {
  width: 4rem;
}

.nav-item {
  display: flex;
  align-items: center;
  color: #4a5568;
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
  margin-right: 0.5rem;
}
</style>
