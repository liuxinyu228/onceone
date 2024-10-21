const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const log = require('../utils/log');
const {TextVector} = require('../aiAgent/texthandler');
const KnowledgeAgent = require('../aiAgent/knowledgeAgent');
const ChatGlmModel = require('../aiAgent/aiModel');

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

        log.info("/norm-docs 获取公开文档成功");
        res.status(200).json(publicDocs);
    } catch (error) {
        log.error('/norm-docs 获取公开文档错误:', error);
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
    log.info("/stream-ask question:", question);
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
        const Model = new ChatGlmModel('https://open.bigmodel.cn/api/paas/v4/chat/completions', '0481ff5191ecdef1e90e9a7f33e9a507.mQo8gNetWc29IpiG', "glm-4");
        const agent = new KnowledgeAgent(Model);

        const outputStream = {
            write: (content) => res.write(`data: ${content}\n\n`),
            end: () => res.end()
        };

        await agent.generateStreamResponse(referenceContent, question, outputStream);
    } catch (error) {
        log.error('/stream-ask Database query error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;