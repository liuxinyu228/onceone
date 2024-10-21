<template>
    <div style="border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        style="height: 500px; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Boot } from '@wangeditor/editor'
// 引入自定义菜单
import ExportMenu from '@/components/work/editor/plugins/ExportMenu'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p>hello</p>')

const toolbarConfig = {}
const editorConfig = { 
  MENU_CONF: {
    // 在这里注册自定义菜单
    exportMenu: {
      key: 'exportMenu', // 定义 menu key ：要保证唯一、不重复
      factory() {
        return new ExportMenu()
      },
    },
  }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const exportMenuConf = {
  key: 'exportMenu', // 定义 menu key ：要保证唯一、不重复
  factory() {
    return new ExportMenu()
  },
}
Boot.registerMenu(exportMenuConf)
toolbarConfig.insertKeys = {
    index: 5, // 插入的位置，基于当前的 toolbarKeys
    keys: ['exportMenu']
}
// 插入自定义菜单到工具栏
// const toolbar = [
//   'exportMenu', // 导出菜单
//   // 其他菜单...
// ]
</script>
