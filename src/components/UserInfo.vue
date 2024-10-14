<template>
  <div class="user-info flex justify-between items-center p-4 bg-gray-100 rounded relative">
    <span class="username font-bold" @click="toggleOptions">{{ userInfo ? userInfo.userId : '加载中...' }}</span>
    <div v-if="showOptions" :class="optionsClass" class="options bg-white shadow-md rounded p-2 inline-flex flex-col">
      <button class="btn-secondary text-black hover:bg-gray-300 py-2 px-1 rounded" @click="logout">退出</button>
      <button class="btn-secondary text-black hover:bg-gray-300 py-2 px-1 rounded" @click="showPasswordModal = true">修改密码</button>
    </div>
  </div>
  <div v-if="showPasswordModal" class="modal fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div class="modal-content bg-white border border-gray-300 shadow-lg rounded-lg p-6 w-96">
      <span class="close cursor-pointer text-gray-500 hover:text-gray-700" @click="showPasswordModal = false">&times;</span>
      <h2 class="text-xl font-semibold mb-4">修改密码</h2>
      <form @submit.prevent="changePassword">
        <div class="mb-4 relative">
          <label for="oldPassword" class="block text-sm font-medium text-gray-700">旧密码:</label>
          <input :type="oldPasswordType" v-model="oldPassword" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          <span @click="toggleOldPasswordType" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500">
            {{ oldPasswordType === 'password' ? '</>' : '<?>' }}
          </span>
        </div>
        <div class="mb-4 relative">
          <label for="newPassword" class="block text-sm font-medium text-gray-700">新密码:</label>
          <input :type="newPasswordType" v-model="newPassword" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          <span @click="toggleNewPasswordType" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500">
            {{ newPasswordType === 'password' ? '</>' : '<?>' }}
          </span>
        </div>
        <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">提交</button>
      </form>
      <p v-if="passwordError" class="error text-red-500 mt-2">{{ passwordError }}</p>
    </div>
  </div>
  <show-message ref="messageBox"></show-message>
</template>

<script>
import axios from 'axios';
import config from '../util/config'
import showMessage from './showMessage.vue'
import Cookies from 'js-cookie'; // 引入 js-cookie 库

export default {
  props: {
    orientation: {
      type: String,
      default: 'down', // 默认向下弹出
      validator: value => ['up', 'down'].includes(value)
    }
  },
  components: {
    showMessage
  },
  data() {
    return {
      showOptions: false,
      userInfo: null,
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      passwordError: '',
      oldPasswordType: 'password',
      newPasswordType: 'password'
    };
  },
  computed: {
    optionsClass() {
      return this.orientation === 'up' ? 'options-up' : 'options-down';
    }
  },
  methods: {
    toggleOptions() {
      this.showOptions = !this.showOptions;
    },
    logout() {
      axios.post(`${config.getSetting('API_BASE_URL')}/api/logout`, {}, { withCredentials: true })
        .then(response => {
          console.log(response.data.message);
          Cookies.remove('taskInfo'); // 删除 userId 的 Cookie
          this.$router.push('/login');
        })
        .catch(error => {
          console.error('Logout failed:', error.response.data.message);
        });
    },
    getUserInfo() {
      axios.get(`${config.getSetting('API_BASE_URL')}/api/getUserInfo`, { withCredentials: true })
        .then(response => {
          this.userInfo = response.data;
          console.log('User Info:', this.userInfo);
        })
        .catch(error => {
          console.error('Error fetching user info:', error.message);
        });
    },
    changePassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        this.passwordError = '新密码必须至少包含八个字符，包括大小写字母、数字和特殊字符。';
        return;
      }
      axios.post(`${config.getSetting('API_BASE_URL')}/api/updatePassword`, { oldPassword: this.oldPassword, newPassword: this.newPassword }, { withCredentials: true })
        .then(response => {
          this.$refs.messageBox.showMessage(response.data.message);
          this.showPasswordModal = false;
        })
        .catch(error => {
          this.$refs.messageBox.showMessage('修改密码失败: ' + error.response.data.message);
        });
    },
    toggleOldPasswordType() {
      this.oldPasswordType = this.oldPasswordType === 'password' ? 'text' : 'password';
    },
    toggleNewPasswordType() {
      this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
    }
  },
  mounted() {
    this.getUserInfo();
  }
};
</script>

<style scoped>
.user-info {
  position: relative;
}

.options-down {
  position: absolute;
  top: 100%;
  left: 0;
  transform: translateY(10px);
}

.options-up {
  position: absolute;
  bottom: 100%;
  left: 0;
  transform: translateY(-10px);
}

.modal {
  z-index: 50;
}
</style>
