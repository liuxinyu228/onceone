const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileManagerRoutes = require('./utils/filemanager')
const app = express();
const cors = require('cors');
const session = require('express-session');

app.use(express.json()); // 用于解析JSON格式的请求体
app.use(cors({
  origin: 'http://127.0.0.1:8080', // 前端地址
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
  if (req.session && req.session.userId) {
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

// 使用用户路由
app.use('/api', isLoggedIn, userRoutes);
app.use('/api', isLoggedIn, taskRoutes);
app.use('/api', isLoggedIn, fileManagerRoutes);
app.use('/api/admin', isLoggedIn, isAdmin, adminRoutes);

module.exports = app;
