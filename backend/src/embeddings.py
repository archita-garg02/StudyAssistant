from sentence_transformers import SentenceTransformer


class EmbeddingManager:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)

        print(
            "Embedding model loaded:",
            self.model_name
        )

        print(
            "Embedding dimension:",
            self.model.get_embedding_dimension()
        )

    def generate_embeddings(self, documents):
        texts = [doc.page_content for doc in documents]

        print(f"Generating embeddings for {len(texts)} chunks...")

        embeddings = self.model.encode(
            texts,
            show_progress_bar=True
        )

        print("Embedding shape:", embeddings.shape)

        return embeddings