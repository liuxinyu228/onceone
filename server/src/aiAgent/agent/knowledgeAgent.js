class KnowledgeAgent {
    constructor(chatGlmModel) {
        this.Model = chatGlmModel;
    }

    // 获取完整回答
    async generateFullResponse(referenceContent, question) {
        const prompt = [
            {
                role: 'system',
                content: '你是一个乐于助人的知识助手，你会根据参考内容去回答用户提问。'+
                '\n 请按照以下要求回答问题：'+
                '\n 1. 回答尽量简洁，不要使用大段文字。'
            },
            {
                role: 'user',
                content: '参考内容:' + referenceContent + '\n问题:' + question
            }
        ];
        
        // 设置 prompt
        this.Model.setPrompt(prompt);
        
        // 获取完整响应
        return await this.Model.getFullResponse();
    }

    // 获取流式回答
    async generateStreamResponse(referenceContent, question, outputStream) {
        const prompt = [
            {
                role: 'system',
                content: '你是一个乐于助人的知识助手，你会根据参考内容去回答用户提问。'+
                '\n 请按照以下要求回答问题：'+
                '\n 1. 回答尽量简洁，不要使用大段文字。'+
                '\n 2. 尽量根据参考内容回答问题，不要胡编乱造。'
            },
            {
                role: 'user',
                content: '参考内容：' + referenceContent + '\n问题：' + question
            }
        ];
        // 设置 prompt
        this.Model.setPrompt(prompt);
        
        // 监听流式响应
        this.Model.on('stream', (data) => {
            outputStream.write(data.content);
        });

        this.Model.on('end', () => {
            outputStream.end();
        });

        // 获取流式响应
        await this.Model.streamResponse();
    }
}

module.exports = KnowledgeAgent;
