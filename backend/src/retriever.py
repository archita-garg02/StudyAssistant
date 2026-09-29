class Retriever:
    def __init__(self, vectorstore, embedding_manager):
        self.vectorstore = vectorstore
        self.embedding_manager = embedding_manager

    def retrieve(self, query, top_k=3):
        # 1. Convert question into embedding
        query_embedding = self.embedding_manager.model.encode([query])[0]

        # 2. Search ChromaDB
        results = self.vectorstore.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )

        return results