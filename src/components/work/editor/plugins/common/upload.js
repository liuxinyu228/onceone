import config from '@/util/config'
import axios from 'axios' 
// 封装上传逻辑的函数
const uploadContent = async (statement_id,Content) => {
    try {
      const response = await axios.post(`${config.getSetting('API_BASE_URL')}/api/statement/content`, {
        statement_id: statement_id,
        content: Content
      }, {
        withCredentials: true // 携带凭证
      })
      console.log('上传成功:', response.data)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }

export default  uploadContent