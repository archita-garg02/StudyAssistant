from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama


class RAGChain:
    def __init__(self):
        self.llm = ChatOllama(
            model="llama3.2",
            temperature=0
        )

        self.prompt = ChatPromptTemplate.from_template(
            """
You are a helpful study assistant.

Answer the question using only the context below.

If the answer is not present in the context, say:
"I could not find this information in the provided notes."

Context:
{context}

Question:
{question}

Answer:
"""
        )

    def generate_answer(self, question, retrieved_documents):
        context = "\n\n".join(retrieved_documents)

        chain = self.prompt | self.llm

        response = chain.invoke(
            {
                "context": context,
                "question": question
            }
        )

        return response.content