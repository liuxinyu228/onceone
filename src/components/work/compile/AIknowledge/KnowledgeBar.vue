<template>
    <div class="flex h-screen bg-gray-100">
      <!-- 左侧参考材料列表（抽屉式） -->
      <div
        class="transition-all duration-300 ease-in-out overflow-hidden"
        :class="[isDrawerOpen ? 'w-1/3' : 'w-16']"
      >
        <div class="h-full flex flex-col bg-white shadow-lg">
          <button
            @click="toggleDrawer"
            class="p-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <MenuIcon v-if="!isDrawerOpen" class="w-6 h-6" />
            <XIcon v-else class="w-6 h-6" />
          </button>
          <div class="flex-grow overflow-y-auto p-4" :class="{ 'hidden': !isDrawerOpen }">
            <h2 class="text-2xl font-bold mb-4">参考材料</h2>
            <div class="space-y-4">
              <div
                v-for="material in materials"
                :key="material.docs_id"
                @click="toggleMaterial(material.docs_id)"
                class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 ease-in-out"
                :class="{ 'rotate-y-180': material.selected }"
                style="max-width: min(20ch, 30vw); word-break: break-word;"
              >
                <div class="p-4 transition-all duration-300 ease-in-out">
                  <h3 class="text-lg font-semibold mb-2" v-if="!material.selected">{{ material.title }}</h3>
                  <div v-if="material.selected" class="card-back">
                    <p class="text-gray-600">{{ material.description }}</p>
                  </div>
                </div>
                <div
                  class="bg-blue-500 h-1 transition-all duration-300 ease-in-out"
                  :class="{ 'w-full': material.selected, 'w-0': !material.selected }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 右侧聊天窗口 -->
      <div class="flex-grow p-4 bg-white">
        <div class="h-full flex flex-col">
          <h2 class="text-2xl font-bold mb-4">聊天窗口</h2>
          <div class="flex-grow overflow-y-auto mb-4">
            <div v-for="message in messages" :key="message.id" class="mb-4 flex items-start">
              <div 
                class="w-10 h-10 rounded-full flex-shrink-0 mr-3"
                :class="message.sender === 'user' ? 'order-last ml-3 mr-0' : ''"
              >
                <!-- 这里可以放置头像图片或图标 -->
                <Bot class="w-9 h-9" v-if="message.sender === 'ai'" />
                <UserRound class="w-9 h-9" v-if="message.sender === 'user'" />
              </div>
              <div
                :class="[
                  'p-3 rounded-lg max-w-[70%]',
                  message.sender === 'user' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-200 text-gray-800'
                ]"
                style="word-break: break-word; max-width: 40ch;"
              >
                {{ message.content }}
              </div>
            </div>
          </div>
          <div class="flex">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="输入消息..."
              class="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="sendMessage"
              class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { MenuIcon, XIcon, Bot, UserRound } from 'lucide-vue-next'
  import config from '@/util/config'
  
  const materials = ref([])
  
  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/norm-docs`, {
        credentials: 'include' // 携带凭证
      })
      const publicDocs = await response.json()
      materials.value = publicDocs.map(doc => ({
        docs_id: doc.docs_id,
        title: doc.filename,
        description: doc.description,
        selected: false
      }))
    } catch (error) {
      console.error('获取公开文档数据失败:', error)
    }
  }

  // 在组件挂载后获取公开文档数据
  onMounted(fetchMaterials)
  
  const messages = ref([
    { id: 1, content: '你好！我是AI助手，有什么我可以帮助你的吗？', sender: 'ai' },
  ])
  
  const newMessage = ref('')
  const isDrawerOpen = ref(true)
  
  const toggleMaterial = (id) => {
    const material = materials.value.find(m => m.docs_id === id)
    if (material) {
      material.selected = !material.selected
    }
  }
  
  const sendMessage = async () => {
    const question = newMessage.value
    if (question.trim()) {
        messages.value.push({
            id: messages.value.length + 1,
            content: question,
            sender: 'user'
        });
    //输入框清空
    newMessage.value = ''

     // 获取所有选中的参考材料的 docs_id
     const selectedDocsIds = materials.value
      .filter(material => material.selected)
      .map(material => material.docs_id)

        try {
            const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/stream-ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    docs_id: selectedDocsIds // 默认传递的 docs_id
                }),
                credentials: 'include' // 携带凭证
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
            let done = false;

            // 创建一个新的消息对象用于存储AI的响应
            const aiMessage = {
                id: messages.value.length + 1,
                content: '',
                sender: 'ai'
            };
            messages.value.push(aiMessage);

            while (!done) {
                const { done: streamDone, value } = await reader.read();
                done = streamDone;
                result += decoder.decode(value, { stream: true });

                // 处理流式数据
                let lastNewlineIndex = result.lastIndexOf('\n');
                if (lastNewlineIndex !== -1) {
                    const lines = result.substring(0, lastNewlineIndex).split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const content = line.replace('data: ', '');
                            if (content) {
                                // 追加内容到现有的AI消息
                                aiMessage.content += content;
                                // 强制更新
                                messages.value = [...messages.value];
                            }
                        }
                    }
                    // 保留未处理的部分
                    result = result.substring(lastNewlineIndex + 1);
                }
            }
        } catch (error) {
            console.error('Error during stream-ask:', error);
        }

        newMessage.value = '';
    }
  }
  
  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value
  }
  </script>
  
  <style scoped>
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .rotate-y-180 .card-back {
    transform: rotateY(180deg);
  }
  </style>
