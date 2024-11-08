const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');  // 用于生成唯一ID
const router = express.Router();
const db = require('../config/db');  // 引入数据库连接
const cardUser = require('../models/cardUser'); // 引入cardUser模型

// 使用 body-parser 来解析请求体
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// 存储生成的验证码
let captchas = {};

// 生成验证码的简单函数 (可以根据需要修改)
function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4位数字验证码
}

// /captcha 接口，生成并返回验证码
router.get('/captcha', (req, res) => {
    const captcha = generateCaptcha();
    const captchaId = uuidv4();  // 为验证码生成唯一ID

    // 保存验证码，绑定到会话
    captchas[captchaId] = captcha;
    req.session.captchaId = captchaId;  // 将 captchaId 绑定到用户 session

    res.json({ captchaId, captcha });  // 返回给客户端
});

// /login 接口，处理登录逻辑
router.post('/login', (req, res) => {
    const { username, password, captchaId, captcha } = req.body;

    console.log(username, password, captchaId, captcha);

    // 验证验证码
    if (!captchaId || !captchas[captchaId] || captchas[captchaId] !== captcha) {
        return res.status(400).json({ message: 'Invalid or expired captcha' });
    }

    // 查询数据库中的用户信息
    const query = 'SELECT id, username, is_admin, password, status, group_id, persona_id FROM card_users WHERE username = $1';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.rows.length === 0 || results.rows[0].password !== password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results.rows[0];

        // 检查用户状态
        if (user.status === 1) {
            return res.status(403).json({ message: 'User account is locked' });
        }

        // 登录成功，创建 session
        req.session.user_id = user.id;
        req.session.user_name = user.username;
        req.session.group_id = user.group_id;
        req.session.persona_id = user.persona_id;
        req.session.is_admin = user.is_admin;

        console.log("登陆成功：", req.session);

        // 登录成功后删除已使用的验证码
        delete captchas[captchaId];

        res.json({ message: 'Login successful', session: req.sessionID });
    });
});

// 新增 /checkLogin 接口，检查用户是否已登录
router.get('/checkLogin', (req, res) => {
    if (req.session.user_id) {
        res.json({ loggedIn: true, userId: req.session.user_id });
    } else {
        res.json({ loggedIn: false });
    }
});

// 新增 /getUserInfo 接口，获取当前登录用户的 userId、groupId 和 personaId
router.get('/getUserInfo', (req, res) => {
    if (req.session.user_id) {
        res.json({
            username: req.session.user_name,
            userId: req.session.user_id,
            groupId: req.session.group_id,
            personaId: req.session.persona_id
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

// 新增 /logout 接口，处理用户注销
router.post('/logout', (req, res) => {
    if (req.session) {
        // 销毁会话
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed', error: err });
            }
            res.status(200).json({ message: 'Logout successful' });
        });
    } else {
        res.status(400).json({ message: 'No active session' });
    }
});

// 新增 /checkAdmin 接口，检查用户是否为管理员
router.get('/checkAdmin', (req, res) => {
    if (req.session && req.session.is_admin === 1) {
        res.json({ isAdmin: true });
    } else {
        res.json({ isAdmin: false });
    }
});

// 新增 /updatePassword 接口，修改用户密码
router.post('/updatePassword', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user_id;

    console.log(userId, oldPassword, newPassword);

    // 验证用户是否已登录
    if (!req.session.user_id || req.session.user_id !== userId) {
        return res.status(401).json({ message: 'User not logged in or unauthorized' });
    }

    // 查询数据库中的用户信息以验证旧密码
    const query = 'SELECT id, password FROM card_users WHERE username = $1';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.rows.length === 0 || results.rows[0].password !== oldPassword) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        const userId = results.rows[0].id;

        // 调用 cardUser 的 updatePassword 方法
        cardUser.updatePassword(userId, newPassword, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

module.exports = router;
