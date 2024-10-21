from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from docs_agent import DocsAgent
import asyncio

app = FastAPI()
docs_agent = DocsAgent()

# 示例 pydantic 模型用于请求体的验证
class QueryModel(BaseModel):
    query: str

@app.post("/vectorize-text")
async def vectorize_text(query_model: QueryModel):
    try:
        query = query_model.query
        
        # 假设 docs_agent.encode_sentence 是同步函数
        # 使用 run_in_threadpool 以异步方式调用同步函数
        vector = await asyncio.to_thread(docs_agent.encode_sentence, query)
        
        return {"query": query, "vector": vector}
    except Exception as e:
        # 捕获异常，返回 500 错误
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
