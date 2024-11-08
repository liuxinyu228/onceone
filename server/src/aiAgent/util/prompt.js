const fs = require('fs');
const path = require('path');

// 新增的工具函数
function readPromptFile(fileName) {
    const filePath = path.join(__dirname, fileName);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.trim();
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
        return null;
    }
}

module.exports = {
    readPromptFile
}
