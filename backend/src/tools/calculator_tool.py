from langchain_core.tools import tool


@tool
def calculator(expression: str) -> str:
    """
    Evaluate a basic mathematical expression.
    Use this tool when the user asks for arithmetic calculations.
    """

    try:
        result = eval(
            expression,
            {"__builtins__": {}},
            {}
        )

        return str(result)

    except Exception as e:
        return f"Calculation error: {e}"