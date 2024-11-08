
class Config {
    constructor() {
        this.settings = {
            API_BASE_URL: "http://127.0.0.1:3000",  // 手动配置参数
            language: 'zh', // 手动配置参数
            // 其他配置参数
        };
    }

    getSetting(key) {
        return this.settings[key];
    }
}

export default new Config();
