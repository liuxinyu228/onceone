const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db'); // 引入数据库配置
const router = express.Router();
const logger = require('../utils/log');

const UPLOAD_FILE_BASE = "../../uploads/";

// 设置文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, UPLOAD_FILE_BASE));
  },
  filename: (req, file, cb) => {
    const tempFileName = uuidv4(); // 使用 uuid 生成临时文件名
    cb(null, tempFileName);
  }
});

const upload = multer({ storage });

// 获取目录和文件
router.get('/directories', async (req, res) => {
  try {
    const directories = await db.query("SELECT * FROM directories");
    const dirPromises = directories.rows.map(async (dir) => {
      const files = await db.query("SELECT * FROM files WHERE directory_id = $1", [dir.id]);
      dir.files = files.rows; // 将文件添加到目录对象中
      return dir;
    });
    const results = await Promise.all(dirPromises);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建目录
router.post('/directories', (req, res) => {
  const { name } = req.body;
  const personaId = req.session.personaId; // 获取 persona_id

  if (personaId == 707) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  db.query("SELECT * FROM directories WHERE name = $1", [name], (err, rows) => {
    if (rows.length > 0) {
      return res.json({ status: false, message: '目录名称已存在' });
    }

    db.query("INSERT INTO directories (name, isOpen) VALUES ($1, $2)", [name, 0], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const newDirectory = { id: result.insertId, name, files: [], isOpen: false };
      const uploadBasePath = path.join(__dirname, UPLOAD_FILE_BASE, "filemanager");
      if (!fs.existsSync(uploadBasePath)) {
        fs.mkdirSync(uploadBasePath, { recursive: true });
      }
      const directoryPath = path.join(uploadBasePath, name);
      fs.mkdirSync(directoryPath, { recursive: true });
      res.json({ status: true, directory: newDirectory });
    });
  });
});

// 添加文件
router.post('/files', upload.single('file'), (req, res) => {
  const { directory_id } = req.body;
  const personaId = req.session.personaId; // 获取 persona_id

  const filename  = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

  if (personaId == 707) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  db.query("SELECT * FROM directories WHERE id = $1", [directory_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message }); // 确保使用 return
    }

    if (results.rows.length > 0) {
      const directory = results.rows[0];

      // 查询当前目录下是否有同名文件
      db.query("SELECT * FROM files WHERE directory_id = $1 AND name = $2", [directory_id, filename], (err, results) => {
        if (err) {
          return res.status(500).json({ message: err.message }); // 确保使用 return
        }

        if (results.rows.length > 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'File name already exists in the directory' }); // 确保使用 return
        }

        const newFilePath = path.join(UPLOAD_FILE_BASE, 'filemanager', directory.name, filename);
        db.query("INSERT INTO files (name, path, directory_id) VALUES ($1, $2, $3) RETURNING id", [filename, newFilePath, directory_id], (err, result) => { // 添加了 RETURNING id
          if (err) {
            return res.status(500).json({ error: err.message }); // 确使用 return
          }
          const newFile = { id: result.rows[0].id, name: filename, path: newFilePath }; // 现在可以正确获取新插入记录的 id
          const targetPath = path.join(__dirname, newFilePath);
          fs.rename(req.file.path, targetPath, (err) => {
            if (err) {
              return res.status(500).json({ error: '文件存储失败' }); // 确保使用 return
            }
            res.json(newFile); // 确保在此之后没有其他响应操作
          });
        });
      });
    } else {
      res.status(404).json({ error: 'Directory not found' }); // 确保使用 return
    }
  });
});

// 删除文件
router.delete('/files/:file_id', (req, res) => {
  const { file_id } = req.params;
  const personaId = req.session.personaId; // 获取 persona_id

  if (personaId == 707) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  db.query("SELECT * FROM files WHERE id = $1", [file_id], (err, results) => {
    if (results.rows.length > 0) {
      const file = results.rows[0];
      const filePath = path.join(__dirname, file.path);
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({ error: '文件删除失败' });
        }
        db.query("DELETE FROM files WHERE id = $1", [file_id], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true });
        });
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// 下载文件
router.get('/files/:file_id/download', (req, res) => {
  const { file_id } = req.params;
    db.query("SELECT * FROM files WHERE id = $1", [file_id], (err, results) => { // 修改了占位符
    
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "database error" });
      }

      if (results.rows.length > 0) {
      const file = results.rows[0];
      const filePath = path.join(__dirname, file.path);
      res.download(filePath, file.name, (err) => {
        if (err) {
          return res.status(500).json({ error: '文件下载失败' });
        }
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// 添加时间线事件
router.post('/timeline', upload.single('attachment_path'), (req, res) => {
  const { title, date, description } = req.body;
  const personaId = req.session.personaId; // 获取 persona_id

  if (personaId == 707) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const attachment = req.file;
  let attachmentPath = null;
  if (attachment) {
    const uploadDir = path.join(__dirname, UPLOAD_FILE_BASE, "timeline", date, title);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const decodedOriginalName = Buffer.from(attachment.originalname, 'latin1').toString('utf8');
    const absoluteAttachmentPath = path.join(uploadDir, decodedOriginalName);
    attachmentPath = path.relative(__dirname, absoluteAttachmentPath);
    fs.renameSync(attachment.path, absoluteAttachmentPath);
  }

  db.query(
    "INSERT INTO card_timeLine (title, date, description, attachment_path) VALUES ($1, $2, $3, $4)", // 修改了占位符
    [title, date, description, attachmentPath],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, title, date, description, "attachment_path": attachmentPath });
    }
  );
});

// 获取时间线事件
router.get('/timeline', (req, res) => {
  db.query("SELECT * FROM card_timeLine ORDER BY date ASC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(results.rows);
  });
});

// 下载时间线附件
router.get('/timeline/:id/download', async (req, res) => {
  const { id } = req.params;

  const client = await db.connect();
  try {
      const query = `
          SELECT * FROM card_timeline WHERE id = $1;
      `;
      const result = await client.query(query, [id]);

      if (result.rows.length > 0) {
          const event = result.rows[0];
          if (event.attachment_path) {
              const filePath = path.join(__dirname, event.attachment_path);
              res.download(filePath, path.basename(filePath), (err) => {
                  if (err) {
                      logger.error(`/timeline/:id/download 文件下载失败: ${err.message}`);
                      return res.status(500).json({ error: '文件下载失败', message: err.message });
                  }
              });
          } else {
              res.status(404).json({ error: '附件不存在' });
          }
      } else {
          res.status(404).json({ error: '事件未找到' });
      }
  } catch (err) {
      logger.error(`/timeline/:id/download 数据库查询错误: ${err.message}`);
      res.status(500).json({ error: '数据库查询错误', message: err.message });
  } finally {
      client.release();
  }
});

module.exports = router;
