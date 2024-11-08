const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileManagerRoutes = require('./routes/filemanager')
const knowledgeManagerRoutes = require('./aiAgent/KnowledgeManagerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const statementRoutes = require('./routes/statementRoutes');
const app = express();
const cors = require('cors');
const session = require('express-session');
const config = require('./config/config');
app.use(express.json()); // 用于解析JSON格式的请求体
app.use(cors({
  origin: config.getSetting('BROWSER_URL'), // 前端地址
  credentials: true // 允许携带凭证
}));

app.use(session({
  secret: 'liuxinyu',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cookieParser()); // 使用 cookie-parser 中间件

// 登录检查中间件
function isLoggedIn(req, res, next) {
  const excludedPaths = ['/captcha', '/checkLogin','/login'];
  if (excludedPaths.includes(req.path)) {
    return next();
  }
  if (req.session && req.session.user_id) {
    return next();
  } else {
    return res.status(401).json({ message: '用户未登录' });
  }
}

// 管理员权限检查中间件
function isAdmin(req, res, next) {
  if (req.session && req.session.is_admin === 1) {
    return next();
  } else {
    return res.status(403).json({ status:false, message: '需要管理员权限' });
  }
}

function isPersona(req, res, next) {
  // 606 是评估人员权限
  // get /timeline接口不需要权限
  // get /timeline/:id/download接口不需要权限
  const excludedPaths = ['/timeline'];
  const downloadPathRegex = /^\/timeline\/[^/]+\/download$/;
  console.log(req.path)

  if (excludedPaths.includes(req.path) && req.method === 'GET') {
    return next();
  }

  if (downloadPathRegex.test(req.path) && req.method === 'GET') {
    return next();
  }

  if (req.session && req.session.persona_id === 606) {
    return next();
  } else {
    return res.status(403).json({ status: false, message: '需要评估人员权限' });
  }
}

// 使用用户路由
app.use('/api', [userRoutes, taskRoutes,aiRoutes]);
app.use('/api/statement', statementRoutes);
app.use('/api/filemanager' , isPersona, fileManagerRoutes);
app.use('/api/admin' , isAdmin, adminRoutes);
app.use('/api/aiAgent',isAdmin,knowledgeManagerRoutes);


module.exports = app;
