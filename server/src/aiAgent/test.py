import requests

# 定义请求的URL
url = "http://127.0.0.1:8000/vectorize-text"

# 定义请求的JSON数据
data = {
    "query": """ 测试数据"""
}

# 发送POST请求
import time

start_time = time.time()  # 记录开始时间
response = requests.post(url, json=data)
end_time = time.time()  # 记录结束时间

print(f"请求花费时间: {end_time - start_time} 秒")  # 打印请求花费的时间

# 打印响应
print(response.json())
