const { TextCut } = require('./texthandler');

// 手动测试
const outputDir = './docs';
const textCut = new TextCut(outputDir);

// // // 测试 ensureDirSync
// // console.log('Testing ensureDirSync...');
// // textCut.ensureDirSync(outputDir);

// 测试 splitDocByChapter
console.log('Testing splitDocByChapter...');
textCut.splitDocByChapter('./docs/测试文件.docx').then(resultDir => {
    console.log(`splitDocByChapter Chapters saved to: ${resultDir}`);
});

// // 测试 splitDocByParagraphs
// console.log('Testing splitDocByParagraphs...');
// textCut.splitDocByParagraphs('./docs/测试文件.docx', 2).then(resultDir => {
//     console.log(`splitDocByParagraphs Paragraphs saved to: ${resultDir}`);
// });

// // 测试 splitDocByParagraphs
// console.log('Testing splitDocBySize...');
// textCut.splitDocBySize('./docs/测试文件.docx', 100).then(resultDir => {
//     console.log(`splitDocBySize Paragraphs saved to: ${resultDir}`);
// });

// const ChatGlmAgent = require('./aiModel');

// // 实例化 AiAgent
// const agent = new ChatGlmAgent('https://open.bigmodel.cn/api/paas/v4/chat/completions', '0481ff5191ecdef1e90e9a7f33e9a507.mQo8gNetWc29IpiG',"glm-4");

// const prompt = [
//     {
//         role: 'system',
//         content: '你是一个AI助手,名字为xiaoliu'
//     },
//     {
//         role: 'user',
//         content: '请使用字符描绘一张猫的图片'
//     }
// ];

// // 设置自定义的 prompt
// agent.setPrompt(prompt);

// // 获取整体回复
// // agent.getFullResponse().then((response) => {
// //     console.log("Full Response:", response.result);
// // }).catch((error) => {
// //     console.error(error);
// // });

// // 监听流式输出
// agent.on('stream', (data) => {
//     process.stdout.write(data.content);
// });

// // 开始流式回复
// agent.streamResponse().then(() => {
//     console.log("Stream Ended");
// }).catch((error) => {
//     console.error(error);
// });
// const KnowledgeAgent = require('./knowledgeAgent');
// const ChatGlmModel = require('./aiModel');

// // 测试完整响应
// async function testGenerateFullResponse() {
//     const mockModel = new ChatGlmModel('https://open.bigmodel.cn/api/paas/v4/chat/completions', '0481ff5191ecdef1e90e9a7f33e9a507.mQo8gNetWc29IpiG',"glm-4");
//     const agent = new KnowledgeAgent(mockModel);

//     const response = await agent.generateFullResponse('云空间打印产品是一款结合文件云存储及快捷打印的小程序应用。开通后会提供用户指定大小的存储空间，它提供了移动端文件的上传、下载、分享、打印等功能，并可以配置绑定指定型号打印机进行手机快捷文件打印。同时订购人可以维护自己的群组，可以邀请家庭成员、朋友、工作伙伴进入群组，共享文件及打印机。', '云空间打印的功能是什么？');
//     console.log('Full Response:', response.content);
// }

// // 测试流式响应
// async function testGenerateStreamResponse() {
//     const mockModel = new ChatGlmModel('https://open.bigmodel.cn/api/paas/v4/chat/completions', '0481ff5191ecdef1e90e9a7f33e9a507.mQo8gNetWc29IpiG',"glm-4");
//     const agent = new KnowledgeAgent(mockModel);

//     const outputStream = {
//         write: (content) => process.stdout.write(content),
//         end: () => console.log('Stream Ended')
//     };

//     await agent.generateStreamResponse('云空间打印产品是一款结合文件云存储及快捷打印的小程序应用。开通后会提供用户指定大小的存储空间，它提供了移动端文件的上传、下载、分享、打印等功能，并可以配置绑定指定型号打印机进行手机快捷文件打印。同时订购人可以维护自己的群组，可以邀请家庭成员、朋友、工作伙伴进入群组，共享文件及打印机。', '云空间打印能共享文件吗？', outputStream);
// }

// // testGenerateFullResponse();
// testGenerateStreamResponse();
