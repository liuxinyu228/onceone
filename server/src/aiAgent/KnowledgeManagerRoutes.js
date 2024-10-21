const express = require('express');
const db = require('../config/db');
const router = express.Router();
const {TextVector, TextCut} = require('./texthandler');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const log = require('../utils/log');

// 设置 multer 用于处理文件上传
const upload = multer({ dest: 'uploads/' });

router.post('/upload-doc', upload.single('document'), async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const filePath = req.file.path;
        const filename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const description = req.body.description || '';
        log.info("/upload-doc 开始解析文档:", filename);

        // 插入记录到 card_agent_docs 表并获取 docs_id
        const insertDocQuery = `
            INSERT INTO card_agent_docs (filename, description)
            VALUES ($1, $2)
            RETURNING docs_id
        `;
        const docResult = await client.query(insertDocQuery, [filename, description]);
        const docsId = docResult.rows[0].docs_id;

        // 根据前端传递的 splitMethod 选择切割方法
        const splitMethod = req.body.splitMethod || '1'; // 默认使用方法1
        const splitParms = req.body.splitParms || {};
        const textCut = new TextCut(path.join(__dirname, '../aiAgent/docs')); // 确保路径正确

        let outputDirPath;
        switch (splitMethod) {
            case '1':
                outputDirPath = await textCut.splitDocByChapter(filePath);
                break;
            case '2':
                outputDirPath = await textCut.splitDocByParagraphs(filePath, splitParms.paragraphs || 5); // 假设每5段切割
                break;
            case '3':
                outputDirPath = await textCut.splitDocBySize(filePath, splitParms.size || 1000); // 假设每1000字符切割
                break;
            default:
                outputDirPath = await textCut.splitDocByChapter(filePath);
        }

        // 读取切割后的文件并存储到数据库
        const files = fs.readdirSync(outputDirPath);

        for (const file of files) {
            const content = fs.readFileSync(path.join(outputDirPath, file), 'utf-8');
            const jsonContent = JSON.parse(content);
            const textVector = new TextVector();
            const contentVector = await textVector.vectorize(jsonContent.content);
            const insertQuery = `
                INSERT INTO card_agent_doc_content (docs_id, section_title, section_content, vector)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertQuery, [docsId, jsonContent.title, jsonContent.content, JSON.stringify(contentVector.vector)]);
        }

        await client.query('COMMIT');
        log.info("/upload-doc 解析文档入库成功");
        res.status(200).send('Document uploaded and processed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        log.error("upload-doc:", error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
        // 删除临时上传的文件
        fs.unlinkSync(req.file.path);
    }
});

router.get('/get-docs', async (req, res) => {
    try {
        const docsQuery = `
            SELECT docs_id, filename, is_public, updated_at
            FROM card_agent_docs
        `;
        const docsResult = await db.query(docsQuery);

        const docsData = await Promise.all(docsResult.rows.map(async (doc) => {
            const contentQuery = `
                SELECT content_id, section_title, section_content
                FROM card_agent_doc_content
                WHERE docs_id = $1
            `;
            const contentResult = await db.query(contentQuery, [doc.docs_id]);

            return {
                docs_id: doc.docs_id,
                filename: doc.filename,
                updated_at: doc.updated_at,
                is_public: doc.is_public,
                paragraphs: contentResult.rows.map(content => ({
                    content_id: content.content_id,
                    section_title: content.section_title,
                    section_content: content.section_content
                }))
            };
        }));

        res.status(200).json(docsData);
    } catch (error) {
        log.error('/get-docs Database query error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/delete-doc', async (req, res) => {
    const { docs_id } = req.body;
    log.info("/delete-doc 开始删除: ",docs_id)
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 删除 card_agent_doc_content 表中的记录
        const deleteContentQuery = `
            DELETE FROM card_agent_doc_content
            WHERE docs_id = $1
        `;
        await client.query(deleteContentQuery, [docs_id]);

        // 删除 card_agent_docs 表中的记录
        const deleteDocQuery = `
            DELETE FROM card_agent_docs
            WHERE docs_id = $1
        `;
        await client.query(deleteDocQuery, [docs_id]);

        await client.query('COMMIT');
        log.info("/delete-doc 删除成功: ",docs_id);
        res.status(200).send('Document and its content deleted successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        log.error('/delete-doc Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.post('/toggle-doc-public', async (req, res) => {
    const { docs_id } = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 获取当前的 is_public 状态
        const selectQuery = `
            SELECT is_public FROM card_agent_docs WHERE docs_id = $1
        `;
        const selectResult = await client.query(selectQuery, [docs_id]);

        if (selectResult.rows.length === 0) {
           log.error("/toggle-doc-public 文档不存在: ",docs_id);
           res.status(404).send('Document not found');
           return;
        }

        const currentStatus = selectResult.rows[0].is_public;
        const newStatus = !currentStatus;

        // 更新 is_public 字段
        const updateQuery = `
            UPDATE card_agent_docs SET is_public = $1 WHERE docs_id = $2
        `;
        await client.query(updateQuery, [newStatus, docs_id]);

        await client.query('COMMIT');
        log.info("/toggle-doc-public 修改文档状态成功:",docs_id+"\t"+newStatus)
        res.status(200).send(`文档公开状态修改为： ${newStatus}`);
    } catch (error) {
        await client.query('ROLLBACK');
        log.error('/toggle-public Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.post('/update-paragraph', async (req, res) => {
    const changes = req.body; // 从请求体中获取变更对象数组
    const client = await db.connect();

    try {
        await client.query('BEGIN'); // 开始事务

        for (const change of changes) {
            const { content_id, section_title, section_content } = change;

            // 更新数据库中的记录
            const updateQuery = `
                UPDATE card_agent_doc_content
                SET section_title = $1, section_content = $2
                WHERE content_id = $3
            `;
            await client.query(updateQuery, [section_title, section_content, content_id]);
        }

        await client.query('COMMIT'); // 提交事务
        res.status(200).send('Documents updated successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // 回滚事务
        log.error('/update-doc Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.delete('/delete-paragraph', async (req, res) => {
    const { content_id } = req.body; // 从请求体中获取 content_id
    const client = await db.connect();

    try {
        await client.query('BEGIN'); // 开始事务

        // 删除数据库中的记录
        const deleteQuery = `
            DELETE FROM card_agent_doc_content
            WHERE content_id = $1
        `;
        const result = await client.query(deleteQuery, [content_id]);

        if (result.rowCount === 0) {
            // 如果没有删除任何记录，说明 content_id 不存在
            res.status(404).send('Paragraph not found');
        } else {
            await client.query('COMMIT'); // 提交事务
            res.status(200).send('Paragraph deleted successfully');
        }
    } catch (error) {
        await client.query('ROLLBACK'); // 回滚事务
        log.error('/delete-paragraph Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.post('/reset-material-vector', async (req, res) => {
    const { docs_id } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 查询指定 docs_id 的所有内容
        const selectQuery = `
            SELECT content_id, section_content
            FROM card_agent_doc_content
            WHERE docs_id = $1
        `;
        const selectResult = await client.query(selectQuery, [docs_id]);

        const textVector = new TextVector();

        for (const row of selectResult.rows) {
            const { content_id, section_content } = row;
            const contentVector = await textVector.vectorize(section_content);

            // 更新 vector 字段
            const updateQuery = `
                UPDATE card_agent_doc_content
                SET vector = $1
                WHERE content_id = $2
            `;
            await client.query(updateQuery, [JSON.stringify(contentVector.vector), content_id]);
        }

        await client.query('COMMIT');
        log.info("/reset-material-vector 重新向量化成功: ", docs_id);
        res.status(200).send('Material vector reset successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        log.error('/reset-material-vector Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

router.post('/add-paragraph', async (req, res) => {
    const { docs_id, section_title, section_content } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 创建新的段落记录
        const insertQuery = `
            INSERT INTO card_agent_doc_content (docs_id, section_title, section_content)
            VALUES ($1, $2, $3)
            RETURNING content_id
        `;
        const insertResult = await client.query(insertQuery, [docs_id, section_title, section_content]);
        const content_id = insertResult.rows[0].content_id;

        // 对新段落内容进行向量化
        const textVector = new TextVector();
        const contentVector = await textVector.vectorize(section_content);

        // 更新新段落的向量字段
        const updateQuery = `
            UPDATE card_agent_doc_content
            SET vector = $1
            WHERE content_id = $2
        `;
        await client.query(updateQuery, [JSON.stringify(contentVector.vector), content_id]);

        await client.query('COMMIT');
        log.info("/add-paragraph 添加段落成功:", content_id);
        res.status(200).json({ content_id });
    } catch (error) {
        await client.query('ROLLBACK');
        log.error('/add-paragraph Transaction error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

module.exports = router;
