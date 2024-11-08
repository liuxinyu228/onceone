// const { TextCut } = require('./texthandler');

// 手动测试
// const outputDir = './docs';
// const textCut = new TextCut(outputDir);

// // // 测试 ensureDirSync
// // console.log('Testing ensureDirSync...');
// // textCut.ensureDirSync(outputDir);

// 测试 splitDocByChapter
// console.log('Testing splitDocByChapter...');
// textCut.splitDocByChapter('./docs/测试文件.docx').then(resultDir => {
//     console.log(`splitDocByChapter Chapters saved to: ${resultDir}`);
// });

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

const JingweiAgent = require('./agent/jingweiAgent');
const ChatGlmModel = require('./model/aiModel');
const config = require('../config/config');

const agent = new JingweiAgent(new ChatGlmModel(config.getSetting('OPENAI_API_URL'), config.getSetting('OPENAI_API_KEY'), config.getSetting('OPENAI_API_MODEL')));
// risks = [{risk_guide: '评估业务所承载的信息类型复杂度，如即时通信、社交平台、信息发布平台、搜索引擎、视频网站、视频会议等承载的文字、图片、语音、视频、会话等信息，如果存在多元化信息类型，则加大了涉诈信息处置难度。', risk_content: '业务系统具有图片、视频类型的信息', risk_level: '高'},
//     {risk_guide: '评估业务是否限制办理企业的规模或资质，是否需要客户提供特定资源或满足指定条件等，如果未对上述情况进行限制，则存在反诈能力不完善的小规模企业等混入的风险。', risk_content: '业务开通流程中为对企业资质进行审核', risk_level: '高'}
// ]
// mitigations = `
// 业务信息风险高，需要从以下方面考虑保障措施：
// *对于易发布或传播涉讼信息的业务类型，应审核公开发布的信息，确保符合相关法规和政策。,
// *应用关键词过滤技术，自动检测和拦截涉讼内容，确保内容合法。,
// *实时监控并立即停止和删除非法传播的信息内容，避免进一步扩散。,
// *具备识别潜在受害人的能力，并能对相关风险进行监测和预警。,
// *企业应向社会公布违法信息用户投诉举报途径，设立处理用户举报的岗位，依法公开透明的接受和处理违法信息用户举报。
// `
// agent.getMitigations(risks, mitigations).then(response => {
//     const c = response.content;
//     const jsonC = JSON.parse(c.replace(/==JSON==/g, '').trim());
//     console.log(JSON.stringify(jsonC));
// });
const docs = [{
    description: '业务系统具有图片、视频类型的信息',
    guide: '评估业务所承载的信息类型复杂度，如即时通信、社交平台、信息发布平台、搜索引擎、视频网站、视频会议等承载的文字、图片、语音、视频、会话等信息，如果存在多元化信息类型，则加大了涉诈信息处置难度。',
    reportcontent:"业务系统具由图片、视频类型的信息",
    riskvalue: '高'
},
{
    description: '业务开通流程中为对企业资质进行审核',
    guide: '评估业务是否限制办理企业的规模或资质，是否需要客户提供特定资源或满足指定条件等，如果未对上述情况进行限制，则存在反诈能力不完善的小规模企业等混入的风险。',
    reportcontent:"为对企业资质进行审核在业务开通流程中",
    riskvalue: '高'
}]
agent.review(docs).then(response => {
    console.log(JSON.stringify(response));
});
