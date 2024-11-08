const axios = require('axios');
const EventEmitter = require('events');
const logger = require('../../utils/log');

class ChatGlmModel extends EventEmitter {
    constructor(apiUrl, apiKey,model) {
        super();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.output = {
            id: '',
            content: '',
        };
    }

    // 设置自定义 prompt
    setPrompt(prompt) {
        this.prompt = prompt;
    }

    // 发送请求到 ChatGLM 模型，获取整体输出
    async getFullResponse() {
        try {
            logger.info("调用AI模式传入的prompt:", this.prompt);
            const response = await axios.post(
                this.apiUrl,
                {
                    messages: this.prompt,
                    model: this.model,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const jsonData = response.data; // 直接使用 response.data
            const result = {
                id: jsonData.id,
                content: jsonData.choices[0]?.message?.content || '' // 根据实际结构调整
            }
            result.content = result.content.replace(/\s+/g, '');
            logger.info("调用AI模型全返回成功，返回内容：", result);
            return result;
        } catch (error) {
            logger.error('Error fetching response:', error);
        }
    }

    // 发送流式请求到 ChatGLM 模型
    async streamResponse() {
        try {
            logger.info("调用AI模式传入的prompt:", this.prompt);
            const response = await axios.post(
                this.apiUrl,
                {
                    messages: this.prompt,
                    model: this.model,
                    stream: true // 流式请求
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                }
            );

            let buffer = ''; // 用于存储不完整的数据块
            logger.info('正在调用AI模型流式返回');
            response.data.on('data', (chunk) => {
                buffer += chunk.toString(); // 将新数据块添加到缓冲区

                // 按 'data: ' 分割缓冲区
                const parts = buffer.split('data: ');

                // 处理每个部分，最后一个部分可能是不完整的
                for (let i = 0; i < parts.length - 1; i++) {
                    const dataStr = parts[i].trim();
                    if (dataStr) {
                        try {
                            this.emit('stream', this.formatResponse(dataStr));
                        } catch (parseError) {
                            log.error('Error parsing JSON:', parseError);
                            // 处理解析错误
                        }
                    }
                }

                // 将最后一个部分（可能是不完整的）保留在缓冲区中
                buffer = parts[parts.length - 1];
            });

            response.data.on('end', () => {
                logger.info('调用AI模型流式返回结束');
                this.emit('end');
            });
        } catch (error) {
            logger.error('Error fetching response:', error);
        }
    }

    // 格式化输出为 JSON 格式
    formatResponse(data) {
        const jsonData = JSON.parse(data);
        this.output.id = jsonData.id;
        this.output.content = jsonData.choices[0]?.delta?.content || '';
        return this.output;
    }
}



module.exports = ChatGlmModel;
