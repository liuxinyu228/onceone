// server/config/db.js
// const mysql = require('mysql'); // 卸载 MySQL 模块
const { Pool } = require('pg'); // 引入 pg 模块

// 创建连接池
const pool = new Pool({
  host: '39.105.23.5',
  user: 'postgres',
  password: 'liuliu228@',
  database: 'onceone',
  max: 10 // 设置连接池的最大连接数
});

// 获取连接
pool.connect((err, client, release) => { // 修改为 pg 的连接方式
  if (err) throw err;
  console.log('Connected to the database using pool!');
  release(); // 释放连接回连接池
});

module.exports = pool;
