const connection = require('../config/db');

class cardUser {
  // 查询所有用户
  static getAllUsers(callback) {
    const sql = 'SELECT id, username, status, email, is_admin, phone, group_id, persona_id, TO_CHAR(created_at, \'YYYY-MM-DD\') as created_at FROM card_users';
    connection.query(sql, callback);
  }

  // 根据ID查询用户
  static getUserById(id, callback) {
    const sql = 'SELECT * FROM card_users WHERE id = $1';
    connection.query(sql, [id], callback);
  }

  // 新增用户
  static addUser(user, callback) {
    // 定义user对象的结构
    const userStructure = {
      username: user.username ? user.username : "opp",
      password: user.password ? user.password : "opopopoppopopo",
      status: user.status ? user.status : 0,
      email: user.email ? user.email : "",
      phone: user.phone ? user.phone : "",
      is_admin: user.is_admin ? user.is_admin : 0,
      group_id: user.group_id ? user.group_id : 999, 
      persona_id: user.persona_id ? user.persona_id : 606
    };

    const sql = 'INSERT INTO card_users (username, password, status, email, phone, is_admin, group_id, persona_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
    connection.query(sql, Object.values(userStructure), callback);
  }

  // 锁定用户
  static lockUser(id, callback) {
    const sql = 'UPDATE card_users SET status = 1 WHERE id = $1';
    connection.query(sql, [id], callback);
  }

  // 解锁用户
  static unlockUser(id, callback) {
    const sql = 'UPDATE card_users SET status = 0 WHERE id = $1';
    connection.query(sql, [id], callback);
  }

  // 修改用户
  static updateUser(id, user, callback) {
    const userStructure = {
      username: user.username,
      status: user.status,
      email: user.email,
      phone: user.phone,
      is_admin: user.is_admin,
      group_id: user.group_id,
      persona_id: user.persona_id
    };
    const sql = 'UPDATE card_users SET username = $1, status = $2, email = $3, phone = $4, is_admin = $5, group_id = $6, persona_id = $7 WHERE id = $8';
    connection.query(sql, [...Object.values(userStructure), id], callback);
  }

  // 修改用户密码
  static updatePassword(id, newPassword, callback) {
    const sql = 'UPDATE card_users SET password = $1 WHERE id = $2';
    connection.query(sql, [newPassword, id], callback);
  }

  // 删除用户
  static deleteUser(id, callback) {
    const sql = 'DELETE FROM card_users WHERE id = $1';
    connection.query(sql, [id], callback);
  }
}

module.exports = cardUser;
