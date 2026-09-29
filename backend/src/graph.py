from typing import TypedDict, Literal

from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama


# --------------------------------------------------
# STATE
# --------------------------------------------------

class StudyState(TypedDict):
    query: str
    route: str
    answer: str
    sources: list
    history: list


# --------------------------------------------------
# CREATE GRAPH
# --------------------------------------------------

def create_study_graph(rag_tool, calculator_tool):

    llm = ChatOllama(
        model="llama3.2",
        temperature=0
    )


    # --------------------------------------------------
    # HELPER: FORMAT CHAT HISTORY
    # --------------------------------------------------

    def format_history(history):

        if not history:
            return "No previous conversation."

        formatted = []

        for item in history:

            role = item.get("role", "")
            content = item.get("content", "")

            formatted.append(
                f"{role}: {content}"
            )

        return "\n".join(formatted)


    # --------------------------------------------------
    # NODE 1: ROUTER
    # --------------------------------------------------

    def router_node(state: StudyState):

        query = state["query"]

        history_text = format_history(
            state.get("history", [])
        )

        prompt = f"""
You are a router for a smart study assistant.

Classify the CURRENT user question into exactly ONE
of these categories:

RAG
- Question related to uploaded study notes.
- Question asking about definitions or concepts from notes.
- Follow-up question about something previously discussed
  from the study notes.
- Examples:
  "What is int?"
  "Explain Python data types"
  "Give me an example of it"

CALCULATOR
- Mathematical or arithmetic calculation.
- Examples:
  "25 * 8"
  "100 / 4"

DIRECT
- General conversation that does not require study notes.
- Examples:
  "Hello"
  "Who are you?"

Previous conversation:
{history_text}

Current user question:
{query}

Return ONLY one word:

RAG
CALCULATOR
DIRECT
"""

        response = llm.invoke(prompt)

        route = response.content.strip().upper()

        # Fallback if the model returns unexpected text
        if route not in [
            "RAG",
            "CALCULATOR",
            "DIRECT"
        ]:
            route = "DIRECT"

        print(
            f"\nRouter selected: {route}"
        )

        return {
            "route": route
        }


    # --------------------------------------------------
    # NODE 2: RAG
    # --------------------------------------------------

    def rag_node(state: StudyState):

        query = state["query"]

        history_text = format_history(
            state.get("history", [])
        )

        result = rag_tool.invoke(
            {
                "query": query
            }
        )

        context = result.get(
            "context",
            ""
        )

        sources = result.get(
            "sources",
            []
        )

        if not context:

            return {
                "answer":
                    "I could not find this information "
                    "in the uploaded study notes.",
                "sources": []
            }

        prompt = f"""
You are a helpful study assistant.

Answer the current question using the uploaded
study-note context.

Use the previous conversation only to understand
follow-up references such as:

"explain it"
"give me an example"
"what about the second one"

Do not invent facts that are not supported by
the study notes.

Previous conversation:
{history_text}

Study-note context:
{context}

Current question:
{query}

Answer:
"""

        response = llm.invoke(
            prompt
        )

        return {
            "answer": response.content,
            "sources": sources
        }


    # --------------------------------------------------
    # NODE 3: CALCULATOR
    # --------------------------------------------------

    def calculator_node(state: StudyState):

        query = state["query"]

        result = calculator_tool.invoke(
            {
                "expression": query
            }
        )

        return {
            "answer": f"The result is {result}",
            "sources": []
        }


    # --------------------------------------------------
    # NODE 4: DIRECT LLM
    # --------------------------------------------------

    def direct_node(state: StudyState):

        query = state["query"]

        history_text = format_history(
            state.get("history", [])
        )

        prompt = f"""
You are a helpful study assistant.

Use the previous conversation when needed so that
follow-up messages make sense.

Previous conversation:
{history_text}

Current question:
{query}

Respond naturally.
"""

        response = llm.invoke(
            prompt
        )

        return {
            "answer": response.content,
            "sources": []
        }


    # --------------------------------------------------
    # ROUTING FUNCTION
    # --------------------------------------------------

    def route_question(
        state: StudyState
    ) -> Literal[
        "rag",
        "calculator",
        "direct"
    ]:

        route = state["route"]

        if route == "RAG":
            return "rag"

        elif route == "CALCULATOR":
            return "calculator"

        return "direct"


    # --------------------------------------------------
    # BUILD GRAPH
    # --------------------------------------------------

    graph = StateGraph(
        StudyState
    )


    # Add nodes

    graph.add_node(
        "router",
        router_node
    )

    graph.add_node(
        "rag",
        rag_node
    )

    graph.add_node(
        "calculator",
        calculator_node
    )

    graph.add_node(
        "direct",
        direct_node
    )


    # START → Router

    graph.add_edge(
        START,
        "router"
    )


    # Router → conditional destination

    graph.add_conditional_edges(
        "router",
        route_question,
        {
            "rag": "rag",
            "calculator": "calculator",
            "direct": "direct"
        }
    )


    # Finish

    graph.add_edge(
        "rag",
        END
    )

    graph.add_edge(
        "calculator",
        END
    )

    graph.add_edge(
        "direct",
        END
    )


    return graph.compile()