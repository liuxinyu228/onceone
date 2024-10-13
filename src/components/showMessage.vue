<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-4 rounded shadow-lg w-full max-w-sm">
      <h2 class="text-lg font-bold mb-2">消息</h2>
      <p class="mb-4">{{ message }}</p>
      <button @click="close" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full">
        确定
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const visible = ref(false)
    const message = ref('')

    const showMessage = (msg) => {
      message.value = msg
      visible.value = true
    }

    const close = () => {
      visible.value = false
    }

    return {
      visible,
      message,
      showMessage,
      close
    }
  }
}
</script>
