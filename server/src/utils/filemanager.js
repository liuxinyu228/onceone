const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db'); // 引入数据库配置
const router = express.Router();

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

// 创建表
db.query(`
  CREATE TABLE IF NOT EXISTS directories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isOpen BOOLEAN DEFAULT 0
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    directory_id INT,
    FOREIGN KEY (directory_id) REFERENCES directories(id)
  )
`);

// 创建 card_timeLine 表
db.query(`
  CREATE TABLE IF NOT EXISTS card_timeLine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    attachment_path VARCHAR(255)
  )
`);

// 获取目录和文件
router.get('/directories', (req, res) => {
  db.query("SELECT * FROM directories", (err, directories) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const dirPromises = directories.map(dir => {
      return new Promise((resolve, reject) => {
        db.query("SELECT * FROM files WHERE directory_id = ?", [dir.id], (err, files) => {
          if (err) {
            reject(err);
          } else {
            dir.files = files;
            resolve(dir);
          }
        });
      });
    });
    Promise.all(dirPromises)
      .then(results => res.json(results))
      .catch(err => res.status(500).json({ error: err.message }));
  });
});

// 创建目录
router.post('/directories', (req, res) => {
  const { name } = req.body;
  const personaId = req.session.personaId; // 获取 persona_id

  if (personaId == 707) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  db.query("SELECT * FROM directories WHERE name = ?", [name], (err, rows) => {
    if (rows.length > 0) {
      return res.json({ status: false, message: '目录名称已存在' });
    }

    db.query("INSERT INTO directories (name, isOpen) VALUES (?, ?)", [name, 0], (err, result) => {
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

  db.query("SELECT * FROM directories WHERE id = ?", [directory_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message }); // 确保使用 return
    }

    if (rows.length > 0) {
      const directory = rows[0];

      // 查询当前目录下是否有同名文件
      db.query("SELECT * FROM files WHERE directory_id = ? AND name = ?", [directory_id, filename], (err, rows) => {
        if (err) {
          return res.status(500).json({ message: err.message }); // 确保使用 return
        }

        if (rows.length > 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'File name already exists in the directory' }); // 确保使用 return
        }

        const newFilePath = path.join(UPLOAD_FILE_BASE, 'filemanager', directory.name, filename);
        db.query("INSERT INTO files (name, path, directory_id) VALUES (?, ?, ?)", [filename, newFilePath, directory_id], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message }); // 确保使用 return
          }
          const newFile = { id: result.insertId, name: filename, path: newFilePath };
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

  db.query("SELECT * FROM files WHERE id = ?", [file_id], (err, rows) => {
    if (rows.length > 0) {
      const file = rows[0];
      const filePath = path.join(__dirname, file.path);
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({ error: '文件删除失败' });
        }
        db.query("DELETE FROM files WHERE id = ?", [file_id], (err) => {
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
  db.query("SELECT * FROM files WHERE id = ?", [file_id], (err, rows) => {
    if (rows.length > 0) {
      const file = rows[0];
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
    "INSERT INTO card_timeLine (title, date, description, attachment_path) VALUES (?, ?, ?, ?)",
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
  db.query("SELECT * FROM card_timeLine ORDER BY date ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(rows);
  });
});

// 下载时间线附件
router.get('/timeline/:id/download', (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM card_timeLine WHERE id = ?", [id], (err, rows) => {
    if (rows.length > 0) {
      const event = rows[0];
      if (event.attachment_path) {
        const filePath = path.join(__dirname, event.attachment_path);
        res.download(filePath, path.basename(filePath), (err) => {
          if (err) {
            return res.status(500).json({ error: '文件下载失败',message:err.message });
          }
        });
      } else {
        res.status(404).json({ error: '附件不存在' });
      }
    } else {
      res.status(404).json({ error: '事件未找到' });
    }
  });
});

module.exports = router;