<template>
  <div class="user-info flex justify-between items-center p-4 bg-gray-100 rounded relative">
    <span class="username font-bold" @click="toggleOptions">{{ userInfo ? userInfo.userId : '加载中...' }}</span>
    <div v-if="showOptions" :class="optionsClass" class="options bg-white shadow-md rounded p-2">
      <button class="btn-secondary text-black hover:bg-gray-300 py-2 px-4 rounded" @click="logout">退出</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../util/config'

export default {
  props: {
    orientation: {
      type: String,
      default: 'down', // 默认向下弹出
      validator: value => ['up', 'down'].includes(value)
    }
  },
  data() {
    return {
      showOptions: false,
      userInfo: null,
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
</style>
