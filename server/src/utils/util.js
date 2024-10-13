const CryptoJS = require('crypto-js');

const key = 'liuxinyuqwe123@';

class Util {
  // 新增加密函数
  static encrypt(data) {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  }

  static decrypt(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
}

module.exports = Util;
