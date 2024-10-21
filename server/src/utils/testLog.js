const logger = require('./log');

// 测试信息日志
logger.info('This is an info message');

// 测试错误日志
logger.error('This is an error message');

// 检查控制台输出（仅在非生产环境中）
console.log('Check the console for log output if not in production environment.');

// 检查日志文件
console.log('Check the log directory for "error.log" and "combined.log" files.');