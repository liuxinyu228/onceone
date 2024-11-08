// 编写一个使用对称加密的函数,
const CryptoJS = require('crypto-js');


const key = 'liuxinyuqwe123@'
export function encrypt(data) {
  const encrypted = CryptoJS.AES.encrypt(data, key).toString();
  return encrypted;
}

export function decrypt(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}

export function formatDate() {
  // 获取当前时间 格式为YYYY-MM-DD HH:mm
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
}



