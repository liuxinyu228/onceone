<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-4 rounded shadow-lg w-full max-w-sm">
      <h2 class="text-lg font-bold mb-2">确认操作</h2>
      <p class="mb-4">{{ message }}</p>
      <div class="flex justify-end space-x-2">
        <button @click="confirm" class="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          确认
        </button>
        <button @click="cancel" class="bg-red-500 text-white p-2 rounded hover:bg-red-600">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const visible = ref(false)
    const message = ref('')
    const resolveCallback = ref(null)

    const showConfirm = (msg) => {
      message.value = msg
      visible.value = true
      return new Promise((resolve) => {
        resolveCallback.value = resolve
      })
    }

    const confirm = () => {
      visible.value = false
      if (resolveCallback.value) {
        resolveCallback.value(true)
      }
    }

    const cancel = () => {
      visible.value = false
      if (resolveCallback.value) {
        resolveCallback.value(false)
      }
    }

    return {
      visible,
      message,
      showConfirm,
      confirm,
      cancel
    }
  }
}
</script>
