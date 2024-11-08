<template>
  <div v-if="showUserModal" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ editingUser.id ? 'Edit User' : 'Add User' }}
              </h3>
              <div class="mt-2">
                <form @submit.prevent="handleSaveUser">
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="username" class="block text-sm font-medium text-gray-700 capitalize">username <span class="text-red-500">*</span></label>
                    </div>
                    <div>
                      <input v-model="localEditingUser.username" id="username" type="text" class="w-full border p-2 mb-4" required>
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="email" class="block text-sm font-medium text-gray-700 capitalize">email</label>
                    </div> 
                    <div>
                      <input v-model="localEditingUser.email" id="email" type="email" class="w-full border p-2 mb-4">
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="phone" class="block text-sm font-medium text-gray-700 capitalize">phone</label>
                    </div>
                    <div>
                      <input v-model="localEditingUser.phone" id="phone" type="tel" class="w-full border p-2 mb-4" pattern="^1[3-9]\d{9}$" placeholder="13800138000">
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="status" class="block text-sm font-medium text-gray-700 capitalize">status</label>
                    </div>
                    <div>
                      <select v-model="localEditingUser.status" id="status" class="w-full border p-2 mb-4 bg-white shadow">
                        <option value="0">正常</option>
                        <option value="1">锁定</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="is_admin" class="block text-sm font-medium text-gray-700 capitalize">is_admin</label>
                    </div>
                    <div>
                      <select v-model="localEditingUser.is_admin" id="is_admin" class="w-full border p-2 mb-4 bg-white shadow">
                        <option value="1">是</option>
                        <option value="0">否</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="group_id" class="block text-sm font-medium text-gray-700 capitalize">group_id</label>
                    </div>
                    <div>
                      <input v-model="localEditingUser.group_id" id="group_id" type="text" class="w-full border p-2 mb-4">
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2">
                      <label for="persona_id" class="block text-sm font-medium text-gray-700 capitalize">工作角色</label>
                    </div>
                    <div>
                      <select v-model="localEditingUser.persona_id" id="persona_id" class="w-full border p-2 mb-4 bg-white shadow">
                        <option value="606">评估人员</option>
                        <option value="707">业务经理</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
                    <button type="submit" class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                      Save
                    </button>
                    <button @click="closeUserModal" type="button" class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

export default {
  props: {
    showUserModal: Boolean,
    editingUser: Object,
  },
  data() {
    return {
      localEditingUser: { ...this.editingUser }
    };
  },
  watch: {
    editingUser(newVal) {
      this.localEditingUser = { ...newVal };
    },
  },
  methods: {
    handleSaveUser() {
      // 初始化值为空的参数
      const updatedUser = {
        username: this.localEditingUser.username || '',
        status: this.localEditingUser.status || 0,
        email: this.localEditingUser.email || '',
        is_admin: this.localEditingUser.is_admin || 0,
        phone: this.localEditingUser.phone || '',
        group_id: this.localEditingUser.group_id || 1,
        persona_id: this.localEditingUser.persona_id || 606
      };

      // 如果存在id，则添加id参数
      if (this.localEditingUser.id) {
        updatedUser.id = this.localEditingUser.id;
      }

      this.$emit('save', updatedUser);
      this.closeUserModal();
    },
    closeUserModal() {
      this.$emit('close');
    },
  },
};
</script>

