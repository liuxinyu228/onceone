class Config {
    constructor() {
        this.settings = {
            API_URL: "http://127.0.0.1:3000",  // 接口地址
            BROWSER_URL: "http://127.0.0.1:8080", // 前端地址
            UTILS_URL:"http://127.0.0.1:8000", // 工具地址
            DB_IP: "39.105.23.5", // 数据库IP
            DB_PORT: "5432", // 数据库端口
            DB_USER: "postgres", // 数据库用户
            DB_PASSWORD: "liuliu228@", // 数据库密码
            DB_DATABASE: "onceone", // 数据库名称
            language: 'zh', // 语言
            CHROME_PATH: "E:\\APP\\OnceOne\\server\\external\\chrome-win\\chrome.exe", // chrome路径

            OPENAI_API_KEY:"cf41bb3716d02d0588dd7d7f04047606.65CyPqD0SsfZBEy2",
            OPENAI_API_URL:"https://open.bigmodel.cn/api/paas/v4/chat/completions",
            OPENAI_API_MODEL:"glm-4",
        };
    }

    getSetting(key) {
        return this.settings[key];
    }
}

module.exports = new Config();
