// server/config/db.js
const mysql = require('mysql');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'liuliu228@',
  database: 'supervisor',
  connectionLimit: 10 // 设置连接池的最大连接数
});

// 获取连接
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log('Connected to the database using pool!');
  connection.release(); // 释放连接回连接池
});

module.exports = pool;
