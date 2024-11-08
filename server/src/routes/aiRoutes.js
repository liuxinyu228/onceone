const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const logger = require('../utils/log');
const {TextVector} = require('../aiAgent/texthandler');
const KnowledgeAgent = require('../aiAgent/agent/knowledgeAgent');
const ChatGlmModel = require('../aiAgent/model/aiModel');
const config = require('../config/config');
const JingweiAgent = require('../aiAgent/agent/jingweiAgent');
const uuid = require('uuid');
const { error } = require('winston');
const { data } = require('autoprefixer');

const GenerationRiskData = new Map();

router.get('/norm-docs', async (req, res) => {
    const client = await db.connect();

    try {
        const query = `
            SELECT docs_id, filename, description
            FROM card_agent_docs
            WHERE is_public = true
        `;
        const result = await client.query(query);
        const publicDocs = result.rows;

        logger.info("/norm-docs 获取公开文档成功");
        res.status(200).json(publicDocs);
    } catch (error) {
        logger.error('/norm-docs 获取公开文档错误:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.post('/stream-ask', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const {question, docs_id, limit_entry = 5} = req.body;
    logger.info("/stream-ask question:", question);
    const textVector = new TextVector();
    const question_vector = await textVector.vectorize(question);
    // 查询数据库以获取参考内容
    const query = `
        SELECT section_content 
        FROM card_agent_doc_content 
        WHERE docs_id = ANY($1)
        ORDER BY vector <-> $2
        LIMIT $3
    `;
    const values = [docs_id, JSON.stringify(question_vector.vector), limit_entry];

    try {
        const result = await db.query(query, values);
        const referenceContent = result.rows.map(row => row.section_content).join('\n');
        const Model = new ChatGlmModel(config.getSetting('OPENAI_API_URL'), config.getSetting('OPENAI_API_KEY'), config.getSetting('OPENAI_API_MODEL'));
        const agent = new KnowledgeAgent(Model);

        const outputStream = {
            write: (content) => res.write(`data: ${content}\n\n`),
            end: () => res.end()
        };

        await agent.generateStreamResponse(referenceContent, question, outputStream);
    } catch (error) {
        logger.error('/stream-ask Database query error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/start-generation', async (req, res) => {
    // 启动风险缓解措施生成接口
    const { risks, work_classification } = req.body;
    const generationRiskId = uuid.v4();

    GenerationRiskData.set(generationRiskId, { risks, work_classification });
    console.log("GenerationRiskData:", GenerationRiskData);

    res.json({error:0,data: generationRiskId });
});

router.get('/get-mitigations', async (req, res) => {
    // 获取风险缓解措施接口
    const generationRiskId = req.query.generationRiskId;
    const generationRiskData = GenerationRiskData.get(generationRiskId);
    console.log("generationRiskId:", generationRiskId);
    if (!generationRiskData) {
        res.status(404).send('Invalid generation risk ID');
        return;
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const { risks, work_classification } = generationRiskData;
    const client = await db.connect();

    try {
        // 发送第一个事件,表示处理已经开始
        res.write(`event: start\ndata: ${JSON.stringify({message: '开始获取风险缓解措施...'})}\n\n`);

        // 在这里执行你的处理逻辑,例如数据库查询,AI模型调用等
        // 在处理过程中,你可以多次发送事件,以提供进度更新
        // 发送第一个进度更新事件
        res.write(`event: progress\ndata: ${JSON.stringify({progress: 0, message: '开始获取风险缓解措施...'})}\n\n`);

        const query = `
            SELECT task_module, assure
            FROM card_task_assurance_suggest
            where work_classification = $1
        `;
        const values = [work_classification];
        const result = await client.query(query, values);
        
        // 发送第二个进度更新事件
        res.write(`event: progress\ndata: ${JSON.stringify({progress: 30, message: '已获取风险保障措施...'})}\n\n`);
        
        const mitigations = result.rows.map(row => 
            `${row.task_module}风险高,需要从以下方面考虑保障措施:${row.assure}`
        ).join('\n');

        const Model = new ChatGlmModel(config.getSetting('OPENAI_API_URL'), config.getSetting('OPENAI_API_KEY'), config.getSetting('OPENAI_API_MODEL'));
        const agent = new JingweiAgent(Model);

        // 将响应对象作为写入流传递
        const response = await agent.getMitigations(risks, mitigations, res);
        
        if (response) {
            // 发送结果事件
            // 发送最后一个进度更新事件
            res.write(`event: progress\ndata: ${JSON.stringify({progress: 100, message: '风险缓解措施获取完成'})}\n\n`);
            res.write(`event: result\ndata: ${JSON.stringify(response)}\n\n`);
        } else {
            res.write(`event: error\ndata: ${JSON.stringify({error: '未找到有效的 JSON 数据'})}\n\n`);
        }
        
        res.end();
    } catch (error) {
        logger.error('/get-mitigations Database query error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({error: '获取风险缓解措施时出错'})}\n\n`);
    } finally {
        // 关闭连接
        res.end();
        client.release();
        GenerationRiskData.delete(generationRiskId);
        req.session.generationRiskId = null;
    }
});

router.post('/review-items', async (req, res) => {
    try {
        const { items } = req.body;
        const Model = new ChatGlmModel(config.getSetting('OPENAI_API_URL'), config.getSetting('OPENAI_API_KEY'), config.getSetting('OPENAI_API_MODEL'));
        const agent = new JingweiAgent(Model);
        const response = await agent.review(items);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(400).json({error:1,message:'AI接口返回数据有错误'});
        }
    } catch (error) {
        logger.error('/review-items has error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;