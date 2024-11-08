const { diffChars } = require('diff');

// 假设 initialContent 是初始内容，modifiedContent 是用户修改后的内容
const initialContent = '<p>这是测试文本</p>';
const modifiedContent = '<p>添加是测试文本</p>';

// 使用 jsdiff 计算差异
const diff = diffChars(initialContent, modifiedContent);
console.log(diff)

// 将差异转换为字符串
const diffString = JSON.stringify(diff);

console.log(diffString)