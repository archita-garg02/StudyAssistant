import uuid

import chromadb


class VectorStore:

    def __init__(
        self,
        persist_directory="chroma_db",
        collection_name="study_notes"
    ):

        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection = (
            self.client.get_or_create_collection(
                name=collection_name
            )
        )


    def add_documents(
        self,
        documents,
        embeddings
    ):

        ids = []
        texts = []
        metadatas = []


        for document in documents:

            ids.append(
                str(uuid.uuid4())
            )

            texts.append(
                document.page_content
            )

            metadatas.append(
                document.metadata
            )


        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )


        print(
            f"Added {len(documents)} chunks "
            f"to ChromaDB"
        )


    def document_exists(
        self,
        filename
    ):

        try:

            result = self.collection.get(
                where={
                    "source": {
                        "$eq": filename
                    }
                }
            )


            return len(
                result.get(
                    "ids",
                    []
                )
            ) > 0


        except Exception:

            return False

def delete_document(self, filename):

    result = self.collection.get(
        where={
            "source": {
                "$eq": filename
            }
        }
    )

    ids = result.get(
        "ids",
        []
    )

    if not ids:
        return 0

    self.collection.delete(
        ids=ids
    )

    print(
        f"Deleted {len(ids)} chunks "
        f"for {filename}"
    )

    return len(ids)