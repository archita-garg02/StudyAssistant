from langchain_core.tools import tool


def create_rag_tool(retriever):

    @tool
    def search_notes(query: str) -> dict:
        """
        Search the uploaded study notes.

        Use this tool when the user asks a question
        related to the uploaded notes.

        Returns:
        - context: relevant text from the notes
        - sources: filename and page information
        """

        results = retriever.retrieve(
            query,
            top_k=3
        )

        documents_found = results["documents"][0]
        metadatas_found = results["metadatas"][0]


        if not documents_found:
            return {
                "context": "",
                "sources": []
            }


        context = "\n\n".join(
            documents_found
        )


        sources = []


        for metadata in metadatas_found:

            source = metadata.get(
                "source",
                "Unknown source"
            )

            page = metadata.get(
                "page_label",
                metadata.get(
                    "page",
                    "Unknown"
                )
            )


            source_item = {
                "source": source,
                "page": page
            }


            if source_item not in sources:
                sources.append(
                    source_item
                )


        return {
            "context": context,
            "sources": sources
        }


    return search_notes