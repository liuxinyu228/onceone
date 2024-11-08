import config from '@/util/config'

class ExportMenu  {
    constructor() {
        this.title = '导出'
        this.tag = 'select'
        this.width = 60
        this.currentStatementId = window.IMLOCAL.store.state.currentStatementId
    }

    getOptions(editor) {
        console.log("all:",editor.getAllMenuKeys())
        const options = [
          { value: '导出', text: '导出' },
          { value: 'word', text: 'Word' },
          { value: 'pdf', text: 'PDF' }
        ]
        return options
    }

    getValue(editor){
        console.log(editor)
        return '导出'
    }

    isDisabled(editor){
        console.log(editor)
        return false
    }

    exec(editor , value) {
        if (value === 'word') {
            this.exportWord(editor)
        } else if (value === 'pdf') {
            this.exportPDF(editor)
        }
    }

    // 导出为PDF
    exportPDF(editor) {
        const statementId = this.currentStatementId;

        // 发送GET请求到/download/pdf接口
        fetch(`${config.getSetting('API_BASE_URL')}/api/statement/download/pdf?statement_id=${statementId}`,{
            credentials: 'include' // 添加此选项以携带凭证
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('下载PDF失败');
                }
                return response.blob();
            })
            .then(blob => {
                // 创建一个下载链接并模拟点击
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `statement_${statementId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('导出PDF失败:', error);
                alert('导出PDF失败，请稍后重试');
            });
        return editor
    }

    // 导出为Word
    exportWord(editor) {
        console.log(editor)
        // const html = editor.getHtml()
        // 使用第三方库如docx将HTML转为Word并下载 
        // 示例:
        // import { Document, Packer } from 'docx'
        // const doc = new Document({ sections: [{ children: [new Paragraph(html)] }] })
        // Packer.toBlob(doc).then(blob => saveAs(blob, 'content.docx'))
        alert('导出Word功能,请自行实现')
    }
}

export default ExportMenu
