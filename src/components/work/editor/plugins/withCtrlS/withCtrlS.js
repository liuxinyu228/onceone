import { DomEditor} from '@wangeditor/editor'
import uploadContent from '@/components/work/editor/plugins/common/upload'
import {useStore} from 'vuex'

function withCtrlS(editor) {
  const newEditor = editor
  const store = useStore()

  setTimeout(() => {
    const { $textArea } = DomEditor.getTextarea(newEditor)
    if ($textArea == null) return

    $textArea.on('keydown', e => {
      const event = e 
      const isCtrl = event.ctrlKey || event.metaKey

      if (event.key === 's' && isCtrl) {
        event.preventDefault() // 阻止默认保存行为
        const content = newEditor.getHtml() // 获取编辑器内容
        uploadContent(store.state.currentStatementId,content) // 调用上传函数
      }
    })
  })

  return newEditor
}

export default withCtrlS
