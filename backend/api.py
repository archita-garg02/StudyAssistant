from pathlib import Path
from typing import List, Dict
import json

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langchain_ollama import ChatOllama

from src.loader import load_pdf
from src.chunking import split_documents
from src.embeddings import EmbeddingManager
from src.vectorstore import VectorStore
from src.retriever import Retriever
from src.tools.rag_tool import create_rag_tool
from src.tools.calculator_tool import calculator
from src.graph import create_study_graph


# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="Smart Study Assistant API",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# UPLOAD DIRECTORY
# --------------------------------------------------

UPLOAD_DIR = Path("data/uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class QuestionRequest(BaseModel):
    question: str

    history: List[Dict[str, str]] = Field(
        default_factory=list
    )


class QuizRequest(BaseModel):
    topic: str = ""
    count: int = 5

class FlashcardRequest(BaseModel):
    topic: str = ""
    count: int = 8

class SummaryRequest(BaseModel):
    topic: str = ""
    mode: str = "summary"


# --------------------------------------------------
# INITIALIZE AI SYSTEM
# --------------------------------------------------

print(
    "\nInitializing Smart Study Assistant...\n"
)


# Embedding model
embedding_manager = EmbeddingManager()


# Vector database
vectorstore = VectorStore()


# Retriever
retriever = Retriever(
    vectorstore=vectorstore,
    embedding_manager=embedding_manager
)


# RAG tool
rag_tool = create_rag_tool(
    retriever
)


# LangGraph
study_graph = create_study_graph(
    rag_tool=rag_tool,
    calculator_tool=calculator
)


# Separate LLM for quiz generation
quiz_llm = ChatOllama(
    model="llama3.2",
    temperature=0
)


print(
    "\nSmart Study Assistant ready!\n"
)


# --------------------------------------------------
# HOME ROUTE
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message":
            "Smart Study Assistant API is running"
    }


# --------------------------------------------------
# HEALTH ROUTE
# --------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok",

        "vector_records":
            vectorstore.collection.count()
    }


# --------------------------------------------------
# ASK QUESTION
# --------------------------------------------------

@app.post("/ask")
def ask_question(
    request: QuestionRequest
):

    question = request.question.strip()

    if not question:

        return {
            "answer":
                "Please enter a question.",

            "route":
                "NONE",

            "sources":
                []
        }


    try:

        result = study_graph.invoke(
            {
                "query":
                    question,

                "route":
                    "",

                "answer":
                    "",

                "sources":
                    [],

                "history":
                    request.history
            }
        )


        return {
            "answer":
                result.get(
                    "answer",
                    "I could not generate an answer."
                ),

            "route":
                result.get(
                    "route",
                    "UNKNOWN"
                ),

            "sources":
                result.get(
                    "sources",
                    []
                )
        }


    except Exception as error:

        print(
            "Question error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# UPLOAD PDF
# --------------------------------------------------

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    # ----------------------------------------------
    # VALIDATE FILE
    # ----------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )


    if not file.filename.lower().endswith(
        ".pdf"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )


    try:

        # ------------------------------------------
        # 1. SAVE PDF
        # ------------------------------------------

        file_path = (
            UPLOAD_DIR /
            Path(file.filename).name
        )

        if vectorstore.document_exists(
            str(file_path)
        ):
            raise HTTPException(
                status_code=400,
                detail=
                    "This PDF has already been uploaded."
            )

        contents = await file.read()


        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded PDF is empty."
            )


        with open(
            file_path,
            "wb"
        ) as f:

            f.write(contents)


        print(
            f"\nUploaded PDF: {file_path}"
        )


        # ------------------------------------------
        # 2. LOAD PDF
        # ------------------------------------------

        documents = load_pdf(
            str(file_path)
        )


        if not documents:

            raise HTTPException(
                status_code=400,
                detail=
                    "No readable pages were found in the PDF."
            )


        print(
            f"Loaded {len(documents)} pages"
        )


        # ------------------------------------------
        # 3. CHUNK PDF
        # ------------------------------------------

        chunks = split_documents(
            documents,
            chunk_size=1000,
            chunk_overlap=200
        )


        if not chunks:

            raise HTTPException(
                status_code=400,
                detail=
                    "No text chunks could be created."
            )


        print(
            f"Created {len(chunks)} chunks"
        )


        # ------------------------------------------
        # 4. GENERATE EMBEDDINGS
        # ------------------------------------------

        embeddings = (
            embedding_manager
            .generate_embeddings(
                chunks
            )
        )


        # ------------------------------------------
        # 6. ADD NEW DOCUMENTS
        # ------------------------------------------

        vectorstore.add_documents(
            chunks,
            embeddings
        )


        # ------------------------------------------
        # 7. RESPONSE
        # ------------------------------------------

        return {
            "message":
                "PDF uploaded successfully",

            "filename":
                file.filename,

            "pages":
                len(documents),

            "chunks":
                len(chunks),

            "vector_records":
                vectorstore
                .collection
                .count()
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "PDF upload error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# QUIZ GENERATION
# --------------------------------------------------

@app.post("/quiz")
def generate_quiz(
    request: QuizRequest
):

    try:

        # ------------------------------------------
        # VALIDATE COUNT
        # ------------------------------------------

        if request.count < 1:

            raise HTTPException(
                status_code=400,
                detail=
                    "Quiz count must be at least 1."
            )


        if request.count > 10:

            raise HTTPException(
                status_code=400,
                detail=
                    "Maximum quiz count is 10."
            )


        # ------------------------------------------
        # TOPIC
        # ------------------------------------------

        topic = request.topic.strip()


        query = (
            topic
            if topic
            else
            "Important concepts from the study notes"
        )


        # ------------------------------------------
        # RETRIEVE STUDY CONTENT
        # ------------------------------------------

        results = retriever.retrieve(
            query,
            top_k=5
        )


        documents_found = (
            results
            .get(
                "documents",
                [[]]
            )[0]
        )


        if not documents_found:

            raise HTTPException(
                status_code=400,
                detail=
                    "No study notes found. "
                    "Please upload a PDF first."
            )


        context = "\n\n".join(
            documents_found
        )


        # ------------------------------------------
        # QUIZ PROMPT
        # ------------------------------------------

        prompt = f"""
You are a study assistant.

Generate exactly {request.count}
DIFFERENT multiple-choice questions
using ONLY the study-note context below.

IMPORTANT RULES:

- Every question must be unique.
- Do not repeat the same concept in different wording.
- Cover different concepts from the provided notes.
- Do not create duplicate questions.
- Questions should test different parts of the study material.

Each question must contain:

- question
- exactly 4 options
- correctAnswer as an integer from 0 to 3
- short explanation

Do not use information outside
the provided study-note context.

Return ONLY valid JSON.

Do not include markdown.

Do not include ```json.

Do not include any text before
or after the JSON.

Required JSON format:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "Short explanation"
  }}
]

Study-note context:

{context}

Topic:

{topic if topic else "General study notes"}
"""


        # ------------------------------------------
        # CALL OLLAMA
        # ------------------------------------------

        response = quiz_llm.invoke(
            prompt
        )


        raw_content = (
            response
            .content
            .strip()
        )


        # ------------------------------------------
        # CLEAN POSSIBLE MARKDOWN
        # ------------------------------------------

        if raw_content.startswith(
            "```json"
        ):

            raw_content = (
                raw_content[7:]
            )


        elif raw_content.startswith(
            "```"
        ):

            raw_content = (
                raw_content[3:]
            )


        if raw_content.endswith(
            "```"
        ):

            raw_content = (
                raw_content[:-3]
            )


        raw_content = (
            raw_content.strip()
        )


        # ------------------------------------------
        # PARSE JSON
        # ------------------------------------------

        try:

            quiz = json.loads(
                raw_content
            )

        except json.JSONDecodeError:

            print(
                "\nInvalid quiz JSON:"
            )

            print(
                raw_content
            )

            raise HTTPException(
                status_code=500,
                detail=
                    "The AI returned an invalid quiz format."
            )


        # ------------------------------------------
        # BASIC VALIDATION
        # ------------------------------------------

        if not isinstance(
            quiz,
            list
        ):

            raise HTTPException(
                status_code=500,
                detail=
                    "Quiz response must be a list."
            )


        for index, item in enumerate(
            quiz
        ):

            if not isinstance(
                item,
                dict
            ):

                raise HTTPException(
                    status_code=500,
                    detail=
                        f"Invalid quiz item "
                        f"at index {index}."
                )


            required_fields = [
                "question",
                "options",
                "correctAnswer",
                "explanation"
            ]


            for field in required_fields:

                if field not in item:

                    raise HTTPException(
                        status_code=500,
                        detail=
                            f"Missing field "
                            f"'{field}' "
                            f"in quiz item "
                            f"{index}."
                    )


            if len(
                item["options"]
            ) != 4:

                raise HTTPException(
                    status_code=500,
                    detail=
                        f"Quiz item "
                        f"{index} "
                        f"must contain "
                        f"exactly 4 options."
                )


        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return {
            "topic":
                topic
                if topic
                else
                "General",

            "count":
                len(quiz),

            "quiz":
                quiz
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Quiz error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

@app.post("/flashcards")
def generate_flashcards(
    request: FlashcardRequest
):

    try:

        if request.count < 1:
            raise HTTPException(
                status_code=400,
                detail="Flashcard count must be at least 1."
            )

        if request.count > 20:
            raise HTTPException(
                status_code=400,
                detail="Maximum flashcard count is 20."
            )

        topic = request.topic.strip()

        query = (
            topic
            if topic
            else "Important concepts from the study notes"
        )

        # Retrieve useful chunks
        results = retriever.retrieve(
            query,
            top_k=6
        )

        documents_found = results.get(
            "documents",
            [[]]
        )[0]

        if not documents_found:
            raise HTTPException(
                status_code=400,
                detail=
                    "No study notes found. "
                    "Please upload a PDF first."
            )

        context = "\n\n".join(
            documents_found
        )

        prompt = f"""
You are a study assistant.

Create exactly {request.count} flashcards
using ONLY the study-note context below.

Each flashcard must contain:

- question
- answer

Keep the question concise.
Keep the answer clear and useful for revision.

Return ONLY valid JSON.

Do not include markdown.
Do not include ```json.
Do not include any text outside the JSON.

Required format:

[
  {{
    "question": "What is an integer?",
    "answer": "An integer is a whole number without decimals."
  }}
]

Study-note context:

{context}

Topic:

{topic if topic else "General study notes"}
"""

        response = quiz_llm.invoke(
            prompt
        )

        raw_content = (
            response.content.strip()
        )

        # Remove markdown fences if model adds them
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]

        elif raw_content.startswith("```"):
            raw_content = raw_content[3:]

        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]

        raw_content = raw_content.strip()

        try:
            flashcards = json.loads(
                raw_content
            )

        except json.JSONDecodeError:

            print(
                "Invalid flashcard JSON:"
            )

            print(raw_content)

            raise HTTPException(
                status_code=500,
                detail=
                    "The AI returned an invalid flashcard format."
            )

        if not isinstance(
            flashcards,
            list
        ):
            raise HTTPException(
                status_code=500,
                detail=
                    "Flashcard response must be a list."
            )

        for index, card in enumerate(
            flashcards
        ):

            if (
                "question" not in card
                or
                "answer" not in card
            ):
                raise HTTPException(
                    status_code=500,
                    detail=
                        f"Invalid flashcard "
                        f"at index {index}."
                )

        return {
            "topic":
                topic
                if topic
                else "General",

            "count":
                len(flashcards),

            "flashcards":
                flashcards
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Flashcard error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.delete("/documents/{filename}")
def delete_document(filename: str):

    try:

        file_path = (
            UPLOAD_DIR /
            Path(filename).name
        )

        source = str(file_path)


        deleted_chunks = (
            vectorstore.delete_document(
                source
            )
        )


        if deleted_chunks == 0:
            raise HTTPException(
                status_code=404,
                detail=
                    "PDF was not found "
                    "in the knowledge base."
            )


        # Delete physical PDF too
        if file_path.exists():
            file_path.unlink()


        return {
            "message":
                "PDF removed successfully",

            "filename":
                filename,

            "deleted_chunks":
                deleted_chunks,

            "vector_records":
                vectorstore
                .collection
                .count()
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "Delete PDF error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# SUMMARY / KEY POINTS / REVISION NOTES
# --------------------------------------------------

@app.post("/summary")
def generate_summary(
    request: SummaryRequest
):

    try:

        # ------------------------------------------
        # MODE
        # ------------------------------------------

        mode = request.mode.strip().lower()

        allowed_modes = [
            "summary",
            "keypoints",
            "revision"
        ]


        if mode not in allowed_modes:

            raise HTTPException(
                status_code=400,
                detail="Invalid summary mode."
            )


        # ------------------------------------------
        # TOPIC
        # ------------------------------------------

        topic = request.topic.strip()


        query = (
            topic
            if topic
            else
            "Important concepts from the study notes"
        )


        # ------------------------------------------
        # RETRIEVE CONTENT
        # ------------------------------------------

        results = retriever.retrieve(
            query,
            top_k=8
        )


        documents_found = results.get(
            "documents",
            [[]]
        )[0]


        if not documents_found:

            raise HTTPException(
                status_code=400,
                detail=
                    "No study notes found. "
                    "Please upload a PDF first."
            )


        context = "\n\n".join(
            documents_found
        )


        # ------------------------------------------
        # MODE-SPECIFIC INSTRUCTIONS
        # ------------------------------------------

        if mode == "summary":

            instruction = """
Create a clear and concise study summary.

Explain the important concepts in simple language.

Use short paragraphs.

Do not add information that is not present
in the provided study notes.
"""


        elif mode == "keypoints":

            instruction = """
Extract the most important points from
the study notes.

Return them as clear bullet points.

Each point should be short and useful
for quick revision.

Do not add information outside the notes.
"""


        else:

            instruction = """
Create structured revision notes.

Organize the content using headings,
subheadings, bullet points and short
explanations.

Highlight definitions, important facts,
concepts and examples when present.

The result should be useful for
exam revision.

Use only the provided study notes.
"""


        # ------------------------------------------
        # PROMPT
        # ------------------------------------------

        prompt = f"""
You are an intelligent study assistant.

{instruction}

Study-note context:

{context}

Requested topic:

{topic if topic else "General study notes"}
"""


        # ------------------------------------------
        # GENERATE
        # ------------------------------------------

        response = quiz_llm.invoke(
            prompt
        )


        generated_text = (
            response.content.strip()
        )


        if not generated_text:

            raise HTTPException(
                status_code=500,
                detail=
                    "The AI returned an empty response."
            )


        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return {
            "topic":
                topic
                if topic
                else "General",

            "mode":
                mode,

            "summary":
                generated_text
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "Summary generation error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

# --------------------------------------------------
# GET UPLOADED DOCUMENTS
# --------------------------------------------------

@app.get("/documents")
def get_documents():

    try:

        documents = (
            vectorstore.list_documents()
        )


        return {
            "documents":
                documents,

            "count":
                len(documents)
        }


    except Exception as error:

        print(
            "Get documents error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )