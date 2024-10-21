class ExportMenu {
    constructor() {
        this.title = '导出'
        this.tag = 'button'
    }

    // 获取菜单执行时的 value ，用不到则返回空字符串或 false
    getValue() {
        return ''
    }

    // 菜单是否需要激活（如选中加粗文本，"加粗"菜单会激活），用不到则返回 false
    isActive() {
        return false
    }

    // 菜单是否需要禁用（如选中 H1 ，"引用"菜单被禁用），用不到则返回 false
    isDisabled() {
        return false
    }

    // 点击菜单时触发的函数
    exec(editor) {
        if (this.isDisabled()) return
        
        // 弹出导出选项
        const menuType = window.prompt('请选择导出类型: 1. PDF  2. Word', '1')
        if (menuType === '1') {
            this.exportPDF(editor)
        } else if (menuType === '2') {
            this.exportWord(editor)  
        }
    }

    // 导出为PDF
    exportPDF() {
        // 获取编辑器内容的HTML
        // const html = editor.getHtml()
        // 这里可以使用第三方库将HTML转换为PDF,如jsPDF、html2canvas等
        // 示例: window.open(`data:application/pdf;base64,${btoa(html)}`) 
        alert('导出PDF功能,可参考 https://www.wangeditor.com/v5/development.html#%E6%B3%A8%E5%86%8C%E6%96%B0%E8%8F%9C%E5%8D%95 自行实现')
    }

    // 导出为Word  
    exportWord() {
        // 获取编辑器内容的HTML
        // const html = editor.getHtml()
        // 这里可以使用第三方库将HTML转换为Word,如docx、mammoth等
        // 示例: window.open(`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${btoa(html)}`)
        alert('导出Word功能,可参考 https://www.wangeditor.com/v5/development.html#%E6%B3%A8%E5%86%8C%E6%96%B0%E8%8F%9C%E5%8D%95 自行实现')
    }
}

export default ExportMenu
