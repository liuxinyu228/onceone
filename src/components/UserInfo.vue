<template>
  <div :class="['user-info', { 'collapsed': isCollapsed }]">
    <span class="username" @click="toggleOptions">
      <UserRoundPen class="icon" />
      <span v-if="!isCollapsed">{{ userInfo ? userInfo.username : '加载中...' }}</span>
    </span>
    <div v-if="showOptions" :class="optionsClass" class="options">
      <button class="btn-secondary" @click="logout">
        <LogOut class="icon" />
        <span v-if="!isCollapsed">退出</span>
      </button>
      <button class="btn-secondary" @click="showPasswordModal = true">
        <KeySquare class="icon" />
        <span v-if="!isCollapsed">修改密码</span>
      </button>
    </div>
  </div>
  <div v-if="showPasswordModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showPasswordModal = false">&times;</span>
      <h2>修改密码</h2>
      <form @submit.prevent="changePassword">
        <div class="mb-4 relative">
          <label for="oldPassword">旧密码:</label>
          <input :type="oldPasswordType" v-model="oldPassword" required />
          <span @click="toggleOldPasswordType" class="toggle-password">
            {{ oldPasswordType === 'password' ? '</>' : '<?>' }}
          </span>
        </div>
        <div class="mb-4 relative">
          <label for="newPassword">新密码:</label>
          <input :type="newPasswordType" v-model="newPassword" required />
          <span @click="toggleNewPasswordType" class="toggle-password">
            {{ newPasswordType === 'password' ? '</>' : '<?>' }}
          </span>
        </div>
        <button type="submit">提交</button>
      </form>
      <p v-if="passwordError" class="error">{{ passwordError }}</p>
    </div>
  </div>
  <show-message ref="messageBox"></show-message>
</template>

<script>
import axios from 'axios';
import config from '@/util/config'
import showMessage from '@/components/common/showMessage.vue'
import Cookies from 'js-cookie';
import { UserRoundPen, KeySquare, LogOut } from 'lucide-vue-next';

export default {
  props: {
    orientation: {
      type: String,
      default: 'down',
      validator: value => ['up', 'down'].includes(value)
    }
  },
  components: {
    showMessage,
    UserRoundPen,
    KeySquare,
    LogOut
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
      newPasswordType: 'password',
      isCollapsed: false
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
          Cookies.remove('taskInfo');
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
    },
    handleResize() {
      this.isCollapsed = window.innerWidth < 768;
    }
  },
  mounted() {
    this.getUserInfo();
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  position: relative;
  transition: all 0.3s;
}

.collapsed {
  padding: 0.5rem;
}

.username {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
  margin-right: 0.5rem;
}

.options {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.btn-secondary {
  display: flex;
  align-items: center;
  color: #4a5568;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.modal-content {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 24rem;
}

.close {
  cursor: pointer;
  color: #718096;
  transition: color 0.3s;
}

.close:hover {
  color: #4a5568;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #718096;
}
</style>