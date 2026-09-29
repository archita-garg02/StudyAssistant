from langchain_ollama import ChatOllama
from langchain.agents import create_agent


def create_study_agent(rag_tool, calculator_tool):
    model = ChatOllama(
        model="llama3.2",
        temperature=0
    )

    tools = [
        rag_tool,
        calculator_tool
    ]

    system_prompt = """
You are a smart study assistant.

Your job is to answer user questions using the available tools.

Rules:
1. If the question is related to the uploaded study notes,
   use the search_notes tool.

2. If the question requires arithmetic calculation,
   use the calculator tool.

3. If a tool is not needed, answer directly.

4. Do not invent information from the study notes.

5. If the notes do not contain the answer, say that clearly.
"""

    agent = create_agent(
        model=model,
        tools=tools,
        system_prompt=system_prompt
    )

    return agent