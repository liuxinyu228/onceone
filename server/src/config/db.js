// server/config/db.js
// const mysql = require('mysql'); // 卸载 MySQL 模块
const { Pool } = require('pg'); // 引入 pg 模块
const config = require('./config');

// 创建连接池
const pool = new Pool({
  host: config.getSetting('DB_IP'),
  user: config.getSetting('DB_USER'),
  password: config.getSetting('DB_PASSWORD'),
  database: config.getSetting('DB_DATABASE'),
  max: 10, // 设置连接池的最大连接数
  // 确保使用 UTF-8 编码
  client_encoding: 'UTF8'
});

// 获取连接
pool.connect((err, client, release) => { // 修改为 pg 的连接方式
  if (err) throw err;
  console.log('Connected to the database using pool!');
  release(); // 释放连接回连接池
});

module.exports = pool;
