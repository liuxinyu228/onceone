const logger = require('../utils/log');
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { JSDOM } = require('jsdom');
const config = require('../config/config');

class TextVector {
    constructor() {
        // 确保端口号和路径正确
        this.apiUrl = `${config.getSetting("UTILS_URL")}/vectorize-text`;
    }

    async vectorize(text) {
        try {
            logger.info('调用向量化API');
            const response = await fetch(this.apiUrl, { // 使用 TextVector.apiUrl
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: text }) // 确保请求体的键名与 FastAPI 模型一致
            });

            if (!response.ok) {
                logger.error('调用向量化API失败:', response.status);
                return {"query": text, "vector": []};
            }
            logger.info("向量化完成!");
            const data = await response.json();
            return data;
        } catch (error) {
            logger.error('调用向量化API失败', error);
            return {"query": text, "vector": []};
        }
    }
}

class TextCut {
    constructor(outputDir) {
        this.outputDir = outputDir; // 类属性：文件输出目录
        this.ensureDirSync(this.outputDir); // 确保输出目录存在
    }

    // 使用原生fs的ensureDirSync替代逻辑
    ensureDirSync(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // 创建目录，recursive选项确保父目录也会被创建
        }
    }

    async splitDocByChapter(filePath) {
        // 读取Word文件并转换为HTML格式
        let result = await mammoth.convertToHtml({ path: filePath });
        let html = result.value;  // HTML 内容

        // 解析HTML结构
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // 定义存储分割后的结构
        let sections = [];
        let currentTitle = null;
        let currentContent = [];

        // 遍历HTML的子元素
        document.body.childNodes.forEach(node => {
            if (node.tagName && node.tagName.match(/^H[12]$/)) {
                // 如果是标题标签（H1, H2）
                if (currentTitle) {
                    // 如果当前已经有一个标题，将上一个标题及其内容存入sections
                    sections.push({ 
                        title: currentTitle.replace(/<[^>]+>/g, '').trim(), 
                        content: currentContent.join('').replace(/<[^>]+>/g, '').trim() 
                    });
                }
                // 更新当前标题，清空内容
                currentTitle = node.textContent.trim();
                currentContent = [];
            } else {
                // 如果是内容部分，累积到currentContent
                if (node.outerHTML) {
                    currentContent.push(node.outerHTML.trim());
                }
            }
        });

        // 处理最后一段
        if (currentTitle) {
            sections.push({ 
                title: currentTitle.replace(/<[^>]+>/g, '').trim(), 
                content: currentContent.join('').replace(/<[^>]+>/g, '').trim() 
            });
        }

        let outDirId = uuidv4();
        let outputDirPath = path.join(this.outputDir, outDirId);

        // 确保输出目录存在
        this.ensureDirSync(outputDirPath);

        // 保存每个章节
        sections.forEach((section, index) => {
            let chapterFileName = path.join(outputDirPath, `chapter_${index + 1}.txt`);
            let content = {
                title:section.title,
                content: section.title + "\n" + section.content
            }
            fs.writeFileSync(chapterFileName, JSON.stringify(content));
        });

        logger.info(`文档已按章节切割并保存到 ${outputDirPath}`);
        return outputDirPath;
    }

    async splitDocByParagraphs(filePath, maxParagraphs) {
        // 读取Word文件并转换为HTML格式
        let result = await mammoth.convertToHtml({ path: filePath });
        let html = result.value;

        // 按<p>标签分割
        let paragraphs = html.split(/<\/p>/).filter(part => part.trim() !== "");
        
        let partCounter = 0;
        let currentChunk = [];
        let outDirId = uuidv4();
        let outputDirPath = path.join(this.outputDir, outDirId);

        // 确保输出目录存在
        this.ensureDirSync(outputDirPath);

        // 按段落计数保存
        paragraphs.forEach((paragraph, index) => {
            // 去除HTML标签
            let cleanParagraph = paragraph.replace(/<[^>]+>/g, '').trim();
            currentChunk.push(cleanParagraph);
            
            if ((index + 1) % maxParagraphs === 0 || index === paragraphs.length - 1) {
                partCounter++;
                let fileName = path.join(this.outputDir, outDirId, `part_${partCounter}.txt`);
                let content = {
                    title: "",
                    content: currentChunk.join('\n')
                }
                fs.writeFileSync(fileName, JSON.stringify(content)); // 将数组转换为字符串
                currentChunk = [];
            }
        });

        logger.info(`文档已按段落切割并保存到 ${this.outputDir}/${outDirId}`);
        return path.join(this.outputDir, outDirId);
    }

    async splitDocBySize(filePath, maxSizeChars) {
        // 读取Word文件并转换为HTML格式
        let result = await mammoth.convertToHtml({ path: filePath });
        let html = result.value;

        // 去除HTML标签
        let cleanText = html.replace(/<[^>]+>/g, '').trim();
        
        let partCounter = 0;
        let currentChunk = '';
        let outDirId = uuidv4();
        let outputDirPath = path.join(this.outputDir, outDirId);

        // 确保输出目录存在
        this.ensureDirSync(outputDirPath);

        // 按字符计数保存
        for (let i = 0; i < cleanText.length; i++) {
            currentChunk += cleanText[i];

            if (currentChunk.length >= maxSizeChars || i === cleanText.length - 1) {
                partCounter++;
                let fileName = path.join(this.outputDir, outDirId, `part_${partCounter}.txt`);
                let content = {
                    title: "",
                    content: currentChunk
                }
                fs.writeFileSync(fileName, JSON.stringify(content));
                currentChunk = '';
            }
        }

        logger.info(`文档已按字符大小切割并保存到 ${this.outputDir}/${outDirId}`);
        return path.join(this.outputDir, outDirId);
    }
}


module.exports = {TextVector, TextCut};
