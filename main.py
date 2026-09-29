from src.loader import load_pdf
from src.chunking import split_documents
from src.embeddings import EmbeddingManager
from src.vectorstore import VectorStore
from src.retriever import Retriever

from src.tools.rag_tool import create_rag_tool
from src.tools.calculator_tool import calculator

from src.graph import create_study_graph


def main():

    print("\n========== SMART STUDY ASSISTANT ==========\n")

    # -------------------------------------------------
    # STEP 1: LOAD PDF
    # -------------------------------------------------

    pdf_path = "data/pdf_files/attention.pdf"

    documents = load_pdf(pdf_path)

    print(f"\nLoaded {len(documents)} page documents.")


    # -------------------------------------------------
    # STEP 2: SPLIT DOCUMENTS INTO CHUNKS
    # -------------------------------------------------

    chunks = split_documents(
        documents,
        chunk_size=1000,
        chunk_overlap=200
    )

    print(f"Total chunks created: {len(chunks)}")


    # -------------------------------------------------
    # STEP 3: INITIALIZE EMBEDDING MODEL
    # -------------------------------------------------

    embedding_manager = EmbeddingManager()


    # -------------------------------------------------
    # STEP 4: INITIALIZE VECTOR STORE
    # -------------------------------------------------

    vectorstore = VectorStore()


    # -------------------------------------------------
    # STEP 5: INGEST ONLY IF VECTOR DB IS EMPTY
    # -------------------------------------------------

    existing_records = vectorstore.collection.count()

    if existing_records == 0:

        print("\nVector store is empty.")
        print("Generating embeddings and storing chunks...\n")

        embeddings = embedding_manager.generate_embeddings(
            chunks
        )

        vectorstore.add_documents(
            chunks,
            embeddings
        )

    else:

        print(
            f"\nVector store already contains "
            f"{existing_records} records."
        )

        print("Skipping document ingestion.")


    # -------------------------------------------------
    # STEP 6: CREATE RETRIEVER
    # -------------------------------------------------

    retriever = Retriever(
        vectorstore=vectorstore,
        embedding_manager=embedding_manager
    )


    # -------------------------------------------------
    # STEP 7: CREATE RAG TOOL
    # -------------------------------------------------

    rag_tool = create_rag_tool(
        retriever
    )


    # -------------------------------------------------
    # STEP 8: CREATE LANGGRAPH WORKFLOW
    # -------------------------------------------------

    study_graph = create_study_graph(
        rag_tool=rag_tool,
        calculator_tool=calculator
    )


    # -------------------------------------------------
    # STEP 9: CHAT LOOP
    # -------------------------------------------------

    while True:

        print("\n------------------------------------------")

        query = input(
            "\nAsk the Smart Study Assistant "
            "(type 'exit' to stop): "
        ).strip()

        if query.lower() == "exit":
            print("\nGoodbye!")
            break

        if not query:
            print("Please enter a question.")
            continue


        # ---------------------------------------------
        # RUN LANGGRAPH
        # ---------------------------------------------

        try:

            result = study_graph.invoke(
                {
                    "query": query,
                    "route": "",
                    "answer": ""
                }
            )


            # -----------------------------------------
            # DISPLAY ROUTE
            # -----------------------------------------

            route = result.get(
                "route",
                "UNKNOWN"
            )

            print("\n========== ROUTE ==========")
            print(route)


            # -----------------------------------------
            # DISPLAY FINAL ANSWER
            # -----------------------------------------

            answer = result.get(
                "answer",
                "No answer was generated."
            )

            print("\n========== FINAL ANSWER ==========")
            print(answer)


        except Exception as e:

            print("\n========== ERROR ==========")
            print(e)


if __name__ == "__main__":
    main()