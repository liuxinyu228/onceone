const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const config = require('../config/config');
const logger = require('../utils/log');
const { decrypt } = require('../utils/util');
const puppeteer = require('puppeteer');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const encodedStatement = req.body.statement_name;
    const statement = decodeURIComponent(encodedStatement);
    const uploadDir = path.join(__dirname, '../../uploads/statement', statement);

    // 判断目录是否存在,如果不存在则创建目录
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${encodeURIComponent(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// ... 其他路由 ...
// 获取statement列表接口
router.get('/', async (req, res) => {
  const client = await db.connect();

  try {
    const user_id = req.session.user_id; // 从session中获取当前登录用户的id

    // 从 Cookie 中获取加密的系统信息并解密
    const encryptedTaskInfo = req.cookies.taskInfo;
    const systemInfo = JSON.parse(decrypt(encryptedTaskInfo));

    // 根据 system_name 和 work_classification 查询 system_id
    const systemResult = await client.query(
      'SELECT system_id FROM card_system WHERE system_name = $1 AND work_classification = $2',
      [systemInfo.system_name, systemInfo.work_classification]
    );

    if (systemResult.rows.length === 0) {
      return res.status(400).json({ errno: 1, message: '无效的系统信息' });
    }

    const system_id = systemResult.rows[0].system_id;  

    const result = await client.query(
      'SELECT * FROM card_statement WHERE user_id = $1 AND system_id = $2 ORDER BY created_at DESC',
      [user_id, system_id]
    );

    const statements = result.rows;

    res.json({ errno: 0, data: statements });
  } catch (error) {
    logger.error('获取statement列表失败:', error);
    res.status(500).json({ errno: 1, message: '获取statement列表失败' });
  } finally {
    client.release();
  }
});

// 新增statement接口
router.post('/', async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    
    const { statement_name, statement_description, state } = req.body;
    const user_id = req.session.user_id; // 从session中获取user_id
    

    // 从 Cookie 中获取加密的系统信息并解密
    const encryptedTaskInfo = req.cookies.taskInfo;
    const systemInfo = JSON.parse(decrypt(encryptedTaskInfo));

    // 根据 system_name 和 work_classification 查询 system_id
    const systemResult = await client.query(
      'SELECT system_id FROM card_system WHERE system_name = $1 AND work_classification = $2',
      [systemInfo.system_name, systemInfo.work_classification]
    );

    if (systemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ errno: 1, message: '无效的系统信息' });
    }

    const system_id = systemResult.rows[0].system_id;

    const result = await client.query(
      'INSERT INTO card_statement (statement_name, statement_description, state, user_id, system_id) VALUES ($1, $2, $3, $4, $5) RETURNING statement_id',
      [statement_name, statement_description, state, user_id, system_id]  
    );
    
    const statement_id = result.rows[0].statement_id;

    await client.query('COMMIT');

    res.json({ errno: 0, data: { statement_id,statement_name,statement_description,state } });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('新增statement失败:', error);
    res.status(500).json({ errno: 1, message: '新增statement失败' });
  } finally {
    client.release();
  }
});

// 修改statement接口
router.put('/:statement_id', async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { statement_name, statement_description, state } = req.body;
    const statement_id = req.params.statement_id;

    let updateFields = [];
    let updateValues = [];

    if (statement_name !== undefined) {
      updateFields.push('statement_name');
      updateValues.push(statement_name);
    }

    if (statement_description !== undefined) {
      updateFields.push('statement_description');
      updateValues.push(statement_description);
    }

    if (state !== undefined) {
      updateFields.push('state');
      updateValues.push(state);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ errno: 1, message: '无效的更新字段' });
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const updateQuery = `UPDATE card_statement SET ${setClause} WHERE statement_id = $${updateFields.length + 1}`;
    console.log("updateQuery",updateQuery)
    const result = await client.query(updateQuery, [...updateValues, statement_id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ errno: 1, message: 'Statement not found' });
    }

    await client.query('COMMIT');

    res.json({ errno: 0, message: '修改成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('修改statement失败:', error);
    res.status(500).json({ errno: 1, message: '修改statement失败' });
  } finally {
    client.release();
  }
});

// 删除statement接口
router.delete('/:statement_id', async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const statement_id = req.params.statement_id;
    const user_id = req.session.user_id; // 从session中获取当前登录用户的id

    // 检查statement是否属于当前用户
    const checkResult = await client.query(
      'SELECT statement_name FROM card_statement WHERE statement_id = $1 AND user_id = $2',
      [statement_id, user_id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ errno: 1, message: '无权删除该statement' });
    }

    // 删除关联的图片记录
    await client.query(
      'DELETE FROM card_statement_images WHERE statement_id = $1',
      [statement_id]
    );

    // 删除关联的文档内容记录，card_statement_content_chunks表
    await client.query(
      'DELETE FROM card_statement_content_chunks WHERE statement_id = $1',
      [statement_id]
    );

    // 删除statement记录
    await client.query(
      'DELETE FROM card_statement WHERE statement_id = $1',
      [statement_id]
    );

    await client.query('COMMIT');

    res.json({ errno: 0, message: '删除成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('删除statement失败:', error);
    res.status(500).json({ errno: 1, message: '删除statement失败' });
  } finally {
    client.release();
  }
});

// 新增下载PDF接口
router.get('/download/pdf', async (req, res) => {
  const client = await db.connect();
  const { statement_id } = req.query;

  try {
    // 获取文档内容
    const result = await client.query(
      `SELECT array_agg(chunk_data ORDER BY chunk_number) as content_chunks
       FROM card_statement_content_chunks
       WHERE statement_id = $1 AND version = 1
       GROUP BY version`,
      [statement_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ errno: 1, message: '未找到文档内容' });
    }

    const content = result.rows[0].content_chunks.join('');

    // 使用puppeteer生成PDF
    const browser = await puppeteer.launch({
      executablePath: config.getSetting('CHROME_PATH'), // 您的Chrome路径
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-accelerated-2d-canvas', '--enable-aggressive-domstorage-flushing'],
      ignoreHTTPSErrors: true,
      headless: true,
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 1,
    });

    await page.setContent(`<html><body>${content}</body></html>`);
    await page.waitForSelector('body');

    const pdfPath = path.join(__dirname, '../../uploads/statement', `statement_${statement_id}.pdf`);

    await page.pdf({
      width: '800px',
      height: '1130px',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '',
      footerTemplate: '',
      path: pdfPath,
    });
    await browser.close();

    // 读取生成的PDF文件内容
    const pdfBuffer = fs.readFileSync(pdfPath);

    // 设置响应头，指示浏览器下载文件
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="statement_${statement_id}.pdf"`);

    // 发送PDF文件内容
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('生成PDF失败:', error);
    res.status(500).json({ errno: 1, message: '生成PDF失败' });
  } finally {
    client.release();
  }
});

// 图片上传接口
router.post('/images', upload.single('wangeditor-uploaded-image'), async (req, res) => {  
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const image_id = uuidv4();
    const statement_id = req.body.statement_id
    const image_path = req.file.path;

    await client.query(
      'INSERT INTO card_statement_images (image_id, statement_id, image_path) VALUES ($1, $2, $3)',
      [image_id, statement_id, image_path]
    );

    await client.query('COMMIT');

    res.json({
      errno: 0,
      data: {
        url: `${config.getSetting('API_URL')}/api/statement/images/${image_id}`,
        alt: req.file.originalname,
        href: `${config.getSetting('API_URL')}/api/statement/images/${image_id}`
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    // 删除临时上传的文件
    fs.unlinkSync(req.file.path);
    logger.error('/statement/images 上传图片失败:', error);
    res.status(500).json({ errno: 1, message: '上传图片失败' });
  } finally {
    client.release();
  }
});

// 获取图片接口
router.get('/images/:image_id', async (req, res) => {
    const client = await db.connect();

  try {
    const result = await client.query(
      'SELECT image_path FROM card_statement_images WHERE image_id = $1',
      [req.params.image_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ errno: 1, message: '图片不存在' });
    }

    const imagePath = result.rows[0].image_path;
    res.sendFile(imagePath);
  } catch (error) {
    logger.error('/statement/images 获取图片失败:', error);
    res.status(500).json({ errno: 1, message: '获取图片失败' });
  } finally {
    client.release();
  }
});

// 接收前端发送的差异数据并处理
router.post('/content', async (req, res) => {
  const client = await db.connect();
  const { statement_id, content } = req.body;

  try {
    await client.query('BEGIN');
    logger.info("开始存储文档内容，文档ID：",statement_id)
    // 更新现有版本号，将所有版本号加 1
    await client.query(
      'UPDATE card_statement_content_chunks SET version = version + 1 WHERE statement_id = $1',
      [statement_id]
    );

    // 删除版本号大于 3 的内容
    await client.query(
      'DELETE FROM card_statement_content_chunks WHERE statement_id = $1 AND version > 3',
      [statement_id]
    );

    // 将新的内容分块存储为版本 1
    const chunkSize = 1000; // 假设每个块的大小为1000字符
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunkData = content.substring(i, i + chunkSize);
      const chunkNumber = i / chunkSize + 1;

      await client.query(
        'INSERT INTO card_statement_content_chunks (statement_id, chunk_number, chunk_data, version) VALUES ($1, $2, $3, 1)',
        [statement_id, chunkNumber, chunkData]
      );
    }

    await client.query('COMMIT');
    logger.info("文档内容保存成功，文档ID：",statement_id)
    res.json({ errno: 0, message: '保存成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('文档内容保存失败，文档ID：',statement_id,error);
    res.status(500).json({ errno: 1, message: '保存失败' });
  } finally {
    client.release();
  }
});

// 获取指定版本的内容
router.get('/content', async (req, res) => {
  const client = await db.connect();
  const { statement_id, version = 1 } = req.query; // 从查询参数中获取 statement_id 和 version，version 默认为 1

  try {
    const result = await client.query(
      `SELECT array_agg(chunk_data ORDER BY chunk_number) as content_chunks
       FROM card_statement_content_chunks
       WHERE statement_id = $1 AND version = $2
       GROUP BY version`,
      [statement_id, version]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ errno: 1, message: '未找到指定版本的内容' });
    }

    const content = result.rows[0].content_chunks.join('');
    res.json({ errno: 0, data: content });
  } catch (error) {
    logger.error('获取内容失败:', error);
    res.status(500).json({ errno: 1, message: '获取内容失败' });
  } finally {
    client.release();
  }
});



module.exports = router;
