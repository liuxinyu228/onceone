<template>
  <header class="bg-white shadow-sm z-10">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <div>
                  <a href="#" class="text-gray-400 hover:text-gray-500">
                    <HomeIcon class="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                    <span class="sr-only">Home</span>
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <a href="#" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ activeTab === 'users' ? 'User Management' : 'Task Management' }}</a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <div class="flex items-center">
          <BellIcon class="h-6 w-6 text-gray-400 mr-4" />
          <div class="flex items-center">
            <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
            <span class="ml-2 text-sm font-medium text-gray-700">John Doe</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { HomeIcon, ChevronRightIcon, BellIcon } from 'lucide-vue-next'

const activeTab = ref('users')
</script>
