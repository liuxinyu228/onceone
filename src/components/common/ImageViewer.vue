<template>
    <div class="image-viewer">
      <img :src="imageUrl" alt="图片加载失败" />
    </div>
  </template>
  
  <script>
  import config from '@/util/config';
  export default {
    data() {
      return {
        imageID: '',
        fileId: '',
        imageUrl: ''
      };
    },
    created() {
      // 通过路由参数获取图片URL
      this.imageID = this.$route.query.imageID;
      this.fileId = this.$route.query.fileId;
      this.imageUrl = `${config.getSetting('API_BASE_URL')}/api/downloadTaskMaterial/${this.imageID}?fileId=${this.fileId}`;
    }
  };
  </script>
  
  <style scoped>
  .image-viewer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
  </style>
  