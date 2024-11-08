<template>
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录
        </h2>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div class="mt-1">
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  v-model="form.username"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
            </div>
  
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div class="mt-1">
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  v-model="form.password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
            </div>
  
            <div>
              <label for="captcha" class="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <div class="mt-1 flex">
                <input 
                  id="captcha" 
                  name="captcha" 
                  type="text" 
                  required 
                  v-model="form.captcha"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                <div 
                  class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  @click="refreshCaptcha"
                >
                  {{ captchaText }}
                </div>
              </div>
            </div>
  
            <div>
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :disabled="isLoading"
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </form>
  
          <div v-if="error" class="mt-4 text-center text-sm text-red-600">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import config from '@/util/config'

  export default {
    setup() {
      const form = reactive({
        username: '',
        password: '',
        captcha: ''
      })

      const captchaText = ref('')
      const captchaId = ref('')
      const error = ref('')
      const isLoading = ref(false)
      const router = useRouter()

      async function getCaptcha() {
        try {
          console.log(config.getSetting('API_BASE_URL'))
          const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/captcha`)
          if (!response.ok) {
            throw new Error('获取验证码失败')
          }
          const data = await response.json()
          captchaId.value = data.captchaId
          captchaText.value = data.captcha
        } catch (err) {
          error.value = err.message
        }
      }

      async function refreshCaptcha() {
        await getCaptcha()
        form.captcha = '' // 清空验证码输入
      }

      async function handleSubmit() {
        if (!form.username || !form.password || !form.captcha) {
          error.value = '请填写所有字段'
          return
        }

        isLoading.value = true
        error.value = ''

        try {
          const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...form,
              captchaId: captchaId.value
            }),
            credentials: 'include' // 携带凭证
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || '登录失败')
          }

          // 登录成功，存储会话信息
          localStorage.setItem('session', data.session)
          console.log('登录成功:', data)

          // 跳转到主页或其他页面
          router.push('/opt')
        } catch (err) {
          error.value = err.message
        } finally {
          isLoading.value = false
          await refreshCaptcha() // 刷新验证码
        }
      }

      async function checkLogin() {
        try {
          const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/checkLogin`, {
            credentials: 'include' // 携带凭证
          })
          const data = await response.json()
          if (data.loggedIn) {
            router.push('/opt') // 如果已登录，跳转到/opt
          }
        } catch (err) {
          console.error('Error checking login status:', err)
        }
      }

      onMounted(async () => {
        await getCaptcha()
        await checkLogin() // 检查用户是否已登录
      })

      return {
        form,
        captchaText,
        error,
        isLoading,
        handleSubmit,
        refreshCaptcha
      }
    }
  }
  </script>