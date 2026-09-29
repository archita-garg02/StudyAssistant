import os
import uuid
import chromadb


class VectorStore:
    def __init__(
        self,
        collection_name="study_notes",
        persist_directory="vector_store"
    ):
        self.collection_name = collection_name
        self.persist_directory = persist_directory

        os.makedirs(self.persist_directory, exist_ok=True)

        self.client = chromadb.PersistentClient(
            path=self.persist_directory
        )

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )

        print(
            f"Vector store ready. Existing records: "
            f"{self.collection.count()}"
        )

    def add_documents(self, documents, embeddings):

        if len(documents) != len(embeddings):
            raise ValueError(
                "Number of documents and embeddings must be equal"
            )

        ids = []
        texts = []
        metadatas = []
        embedding_list = []

        for i, (doc, embedding) in enumerate(
            zip(documents, embeddings)
        ):
            doc_id = f"chunk_{uuid.uuid4().hex[:8]}_{i}"

            ids.append(doc_id)

            texts.append(doc.page_content)

            metadata = dict(doc.metadata)
            metadata["chunk_index"] = i

            metadatas.append(metadata)

            embedding_list.append(
                embedding.tolist()
            )

        self.collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas,
            embeddings=embedding_list
        )

        print(
            f"Added {len(documents)} chunks to ChromaDB"
        )

        print(
            f"Total records: {self.collection.count()}"
        )