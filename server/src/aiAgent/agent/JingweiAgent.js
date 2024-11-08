// 精卫agent, 用于协助用户识别风险，根据风险给出对应保障措施。
const { readPromptFile } = require('../util/prompt');
const logger = require('../../utils/log');
const JSON5 = require('json5');
class JingweiAgent {
    constructor(chatModel) {
        this.Model = chatModel;
    }
    async getMitigations(risks, mitigations,res) {
        // risks:
        // [{risk_guide: '评估业务所承载的信息类型复杂度，如即时通信、社交平台、信息发布平台、搜索引擎、视频网站、视频会议等承载的文字、图片、语音、视频、会话等信息，如果存在多元化信息类型，则加大了涉诈信息处置难度。', risk_content: '业务系统具有图片、视频类型的信息', risk_level: '高'},
        //  {risk_guide: '评估业务是否限制办理企业的规模或资质，是否需要客户提供特定资源或满足指定条件等，如果未对上述情况进行限制，则存在反诈能力不完善的小规模企业等混入的风险。', risk_content: '业务开通流程中为对企业资质进行审核', risk_level: '高'}
        // ]
        // mitigations:
        // 业务信息风险高，需要从以下方面考虑保障措施：
        // *对于易发布或传播涉讼信息的业务类型，应审核公开发布的信息，确保符合相关法规和政策。,
        // *应用关键词过滤技术，自动检测和拦截涉讼内容，确保内容合法。,
        // *实时监控并立即停止和删除非法传播的信息内容，避免进一步扩散。,
        // *具备识别潜在受害人的能力，并能对相关风险进行监测和预警。,
        // *企业应向社会公布违法信息用户投诉举报途径，设立处理用户举报的岗位，依法公开透明的接受和处理违法信息用户举报。
        // `
        // 发送第三个进度更新事件 
    res.write(`event: progress\ndata: ${JSON.stringify({progress: 60, message: '正在分析风险...'})}\n\n`);
        const promptFile = readPromptFile('../pormpt/jingwei_mitigations.txt').replace(/\s+/g, '');
        const prompt = [
            {
                'role': 'system',
                'content': promptFile.replace('{{mitigations}}', JSON.stringify(mitigations))
            },
            {
                'role': 'user',
                'content': '我有以下风险项：' + JSON.stringify(risks)
            }
        ]
        // 设置 prompt
        this.Model.setPrompt(prompt);
        // 获取完整响应
        // 发送第四个进度更新事件
        res.write(`event: progress\ndata: ${JSON.stringify({progress: 90, message: '正在生成缓解措施...'})}\n\n`);  
        const response = await this.Model.getFullResponse();
        response.content = response.content.trim();
        // 提取并格式化 JSON 数据
        const jsonDataMatch = response.content.match(/==JSON==([\s\S]*?)==JSON==/);
        if (jsonDataMatch) {
            const jsonData = JSON5.parse(jsonDataMatch[1]);
            return jsonData;
        } else {
            logger.error('JingweiAgent getMitigations方法 未找到有效的 JSON 数据');
            return null;
        }
    }
    async review(data) {
        //返回JSON数据，示例为：
        //[{"title":"01","description":"业务系统具有图片、视频类型的信息","guide":"评估业务所承载的信息类型复杂度，如即时通信、社交平台、信息发布平台、搜索引擎、视频网站、视频会议等承载的文字、图片、语音、视频、会话等信息，如果存在多元化信息类型，则加大了涉诈信息处置难度。","reportcontent":"业务系统具由图片、视 频类型的信息","riskvalue":"高","problem":[{"content":"reportcontent中'具由' 存在错别字，应为'具有'","opinion":true},{"content":"reportcontent内容与description基本一致，但表述略有差异","opinion":true},{"content":"riskvalue级别为'高'，与description和guide描述的风险相符","opinion":false}]}]
        const promptFile = readPromptFile('../pormpt/jingwei_review.txt').replace(/\s+/g, '');
        const prompt = [
            {
                'role': 'system',
                'content': promptFile
            },
            {
                'role': 'user',
                'content': JSON.stringify(data)
            }
        ]
        this.Model.setPrompt(prompt);
        const response = await this.Model.getFullResponse();
        const jsonDataMatch = response.content.match(/==JSON==([\s\S]*?)==JSON==/);
        if (jsonDataMatch) {
            logger.info(`JingweiAgent review方法 找到的 JSON 数据：${JSON.stringify(jsonDataMatch[1])}`);
            const jsonData = JSON5.parse(jsonDataMatch[1]);
            return jsonData;
        } else {
            logger.error('JingweiAgent review方法 未找到有效的 JSON 数据');
            return null;
        }
    }
}

module.exports = JingweiAgent;

