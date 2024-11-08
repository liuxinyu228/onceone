import ExportMenu from '@/components/work/editor/plugins/ExportMenu/'
import withCtrlS from '@/components/work/editor/plugins/withCtrlS'
import { Boot } from '@wangeditor/editor'
import config from '@/util/config'
const editorConfig = {
    MENU_CONF: {
      uploadImage: {
        server: `${config.getSetting("API_BASE_URL")}/api/statement/images`,
        meta: {
          statement_id: '',
          statement_name: ""
        },
        withCredentials: true,
      }
    }
}

Boot.registerMenu(ExportMenu)
Boot.registerModule(withCtrlS) //ctrl+s 保存

export default editorConfig
