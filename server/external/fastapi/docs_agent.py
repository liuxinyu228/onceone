from sentence_transformers import SentenceTransformer

class DocsAgent:
    def __init__(self):
        # 加载预训练的句子向量模型
        self.model = SentenceTransformer('./aiModel/all-MiniLM-L6-v2')

    def encode_sentence(self,text: str):
        # 使用模型将文本向量化
        return self.model.encode(text).tolist()
if __name__ == "__main__":
    docs_agent = DocsAgent()
    print(docs_agent.encode_sentence("Hello, world!"))
