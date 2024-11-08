<!-- src/components/work/editor/editorView.vue -->
<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 800px; overflow-y: hidden;"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
  <showMessage ref="showMessageRef" />
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { ref,shallowRef, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import editorConfig from './editorConfig'
import axios from 'axios' // 引入 axios
import config from '@/util/config'
import showMessage from '@/components/common/showMessage.vue'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const store = useStore()
const showMessageRef = ref(null)

// 接收路由参数
import { useRoute } from 'vue-router'

const route = useRoute()
const statement_name = route.params.statement_name


// 工具栏配置
const toolbarConfig = {
  insertKeys: {
    index: 29,
    keys: ['exportMenu']
  }
}

// 排除一些菜单
toolbarConfig.excludeKeys = [
  'group-video',
  'todo',
]

//上传图片参数配置
editorConfig.MENU_CONF.uploadImage.meta.statement_name = statement_name
editorConfig.MENU_CONF.uploadImage.meta.statement_id = store.state.currentStatementId

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount( () => {
  // 删除 window.IMLOCAL 对象
  delete window.IMLOCAL
  const editor = editorRef.value
  if (editor == null) return

  editor.destroy()
})


const handleCreated = (editor) => {
  // 将 store 对象注册到 window.IMLOCAL.store 属性上
  window.IMLOCAL = {
    store
  }


  editorRef.value = editor // 记录 editor 实例，重要！
  loadStatementContent(store.state.currentStatementId)
}

const loadStatementContent = async (statementId) => {
  try {
    const response = await axios.get(`${config.getSetting('API_BASE_URL')}/api/statement/content`, {
      params: {
        statement_id: statementId,
        version: 1 // 默认获取版本 1 的内容
      },
      withCredentials: true // 携带凭证
    })
    const content = response.data.data
    editorRef.value.setHtml(content)
  } catch (error) {
    showMessageRef.value.showMessage('获取内容失败', 'error')
  }
}
</script>

