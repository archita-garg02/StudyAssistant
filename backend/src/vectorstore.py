import uuid

import chromadb

from pathlib import Path

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


    # --------------------------------------------------
    # ADD DOCUMENTS
    # --------------------------------------------------

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


    # --------------------------------------------------
    # CHECK IF DOCUMENT EXISTS
    # --------------------------------------------------

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


            ids = result.get(
                "ids",
                []
            )


            return len(ids) > 0


        except Exception as error:

            print(
                "Document existence check error:",
                error
            )

            return False


    # --------------------------------------------------
    # DELETE ONE DOCUMENT
    # --------------------------------------------------

    def delete_document(
        self,
        filename
    ):

        try:

            # Find all chunks belonging
            # to this PDF
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


            # Document does not exist
            if not ids:

                print(
                    f"No chunks found for {filename}"
                )

                return 0


            # Delete only matching chunks
            self.collection.delete(
                ids=ids
            )


            print(
                f"Deleted {len(ids)} chunks "
                f"for {filename}"
            )


            return len(ids)


        except Exception as error:

            print(
                "Document deletion error:",
                error
            )

            raise

def list_documents(self):

    try:

        result = self.collection.get(
            include=["metadatas"]
        )

        metadatas = result.get(
            "metadatas",
            []
        )

        documents = set()


        for metadata in metadatas:

            if not metadata:
                continue


            source = metadata.get(
                "source"
            )


            if source:

                filename = Path(
                    source
                ).name

                documents.add(
                    filename
                )


        return sorted(
            documents
        )


    except Exception as error:

        print(
            "List documents error:",
            error
        )

        return []