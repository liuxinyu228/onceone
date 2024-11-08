const winston = require('winston');
const path = require('path');

// 使用绝对路径定义日志目录路径

 // Start of Selection
const logDirectory = path.resolve(__dirname, '../../logs');

// 配置 winston 日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') })
    ]
});

// 如果在开发环境中，也将日志输出到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
