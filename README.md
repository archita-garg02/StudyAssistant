# 📚 Smart Study Assistant

Smart Study Assistant is an AI-powered learning application that allows students to upload multiple PDF study notes and interact with them using **Retrieval-Augmented Generation (RAG)**.

The application combines **LangChain, LangGraph, ChromaDB, Sentence Transformers, Ollama, FastAPI, and React** to provide context-aware question answering, source references, quizzes, flashcards, summaries, revision notes, calculator support, and conversational history.

---

## ✨ Features

- 📄 Upload multiple PDF study notes
- 🗑️ Remove individual PDFs from the knowledge base
- 🔍 Ask questions from uploaded notes
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Source filename and page references
- 💬 Conversational history for follow-up questions
- 🔀 LangGraph-based intelligent routing
- 🧮 Calculator tool
- 🧠 AI-generated quizzes
- 🗂️ AI-generated flashcards
- 📝 AI-generated summaries
- 📌 Key-point generation
- 📖 Revision notes generation
- 📊 Quiz score calculation
- 🤖 Local LLM using Ollama
- 🗃️ Persistent ChromaDB vector database
- ⚡ FastAPI REST backend
- ⚛️ React + Vite frontend

---

# 🧠 How It Works

```text
              Multiple PDF Uploads
                       │
                       ▼
                  PyPDFLoader
                       │
                       ▼
             PDF Pages / Documents
                       │
                       ▼
       RecursiveCharacterTextSplitter
                       │
                       ▼
                    Chunks
                       │
                       ▼
          all-MiniLM-L6-v2
                       │
                       ▼
                  Embeddings
                       │
                       ▼
                   ChromaDB
                       │
                       ▼
                User Question
                       │
                       ▼
               LangGraph Router
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
            RAG    CALCULATOR   DIRECT
             │         │         │
             ▼         ▼         ▼
         Retriever   Math Tool   Ollama
             │
             ▼
          ChromaDB
             │
             ▼
      Relevant PDF Chunks
             │
             ▼
           Ollama
             │
             ▼
     Answer + Source Pages
```

---

# 🏗️ Project Architecture

```text
SmartStudyAssistant/
│
├── backend/
│   │
│   ├── api.py
│   │
│   ├── data/
│   │   └── uploads/
│   │
│   ├── chroma_db/
│   │
│   └── src/
│       │
│       ├── __init__.py
│       ├── loader.py
│       ├── chunking.py
│       ├── embeddings.py
│       ├── vectorstore.py
│       ├── retriever.py
│       ├── graph.py
│       │
│       └── tools/
│           ├── __init__.py
│           ├── rag_tool.py
│           └── calculator_tool.py
│
├── frontend-web/
│   │
│   ├── src/
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   │
│   │   ├── components/
│   │   │   ├── QuizPanel.jsx
│   │   │   └── FlashcardPanel.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── pyproject.toml
├── uv.lock
└── README.md
```

---

# 🛠️ Tech Stack

## Backend

- Python
- FastAPI
- LangChain
- LangGraph
- ChromaDB
- Sentence Transformers
- PyPDF
- Uvicorn

## Frontend

- React
- JavaScript
- Vite
- CSS

## AI / RAG

- Retrieval-Augmented Generation
- Ollama
- Llama 3.2
- Sentence Transformers
- `all-MiniLM-L6-v2`
- ChromaDB

## Development Tools

- Git
- GitHub
- WSL Ubuntu
- `uv`
- npm

---

# 📄 PDF Processing

When a PDF is uploaded, it goes through the following pipeline:

```text
PDF
 │
 ▼
PyPDFLoader
 │
 ▼
Extracted Pages
 │
 ▼
RecursiveCharacterTextSplitter
 │
 ▼
Text Chunks
 │
 ▼
Sentence Transformer
 │
 ▼
384-dimensional Embeddings
 │
 ▼
ChromaDB
```

Unlike the earlier version of the project, uploading a new PDF does **not replace the previous PDF data**.

Multiple PDFs can exist in the knowledge base at the same time.

Example:

```text
ChromaDB

├── python_notes.pdf
├── dbms_notes.pdf
└── operating_system.pdf
```

The assistant can retrieve relevant chunks from the stored study material when answering questions.

---

# 📚 Multiple PDF Support

Users can upload several study documents.

Example:

```text
📚 Uploaded Notes

📄 python_notes.pdf
📄 dbms_notes.pdf
📄 operating_system.pdf
```

Each document is stored independently in ChromaDB using source metadata.

A duplicate PDF filename can be detected before storing duplicate vectors.

---

# 🗑️ Remove PDF

Each uploaded PDF can be removed individually.

Example:

```text
📄 python_notes.pdf          ×
📄 dbms_notes.pdf            ×
📄 operating_system.pdf      ×
```

When a user removes a PDF:

```text
Click ×
   │
   ▼
React Frontend
   │
   ▼
DELETE API
   │
   ▼
Find PDF chunks in ChromaDB
   │
   ▼
Delete matching vectors
   │
   ▼
Delete stored PDF
   │
   ▼
Update frontend
```

Other uploaded PDFs remain available.

---

# 🔍 Retrieval-Augmented Generation

Questions related to uploaded notes are handled using RAG.

Example:

```text
User
 │
 ▼
"What is an integer?"
 │
 ▼
LangGraph Router
 │
 ▼
RAG
 │
 ▼
Create Question Embedding
 │
 ▼
Similarity Search in ChromaDB
 │
 ▼
Retrieve Relevant Chunks
 │
 ▼
Question + Context
 │
 ▼
Ollama / Llama 3.2
 │
 ▼
Final Answer
```

This allows the assistant to generate answers using relevant information from the student's uploaded study notes.

---

# 🔀 LangGraph Routing

LangGraph decides how a user query should be processed.

The project currently contains three main routes:

```text
                User Query
                    │
                    ▼
             LangGraph Router
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
         RAG    CALCULATOR   DIRECT
```

## RAG

Used when a question should be answered using uploaded notes.

Example:

```text
Explain Python data types.
```

---

## CALCULATOR

Used for mathematical calculations.

Example:

```text
25 * 8
```

Result:

```text
200
```

---

## DIRECT

Used when the question does not require the uploaded notes or calculator.

Example:

```text
Hello
```

---

# 💬 Conversational History

The React frontend sends previous conversation messages along with the latest question.

Example:

```text
User:
What is inheritance?

Assistant:
Inheritance allows one class to acquire properties
and behavior from another class.

User:
Give me an example of it.
```

Conversation history helps the router and LLM understand references such as:

```text
it
that
this
this concept
the previous one
```

---

# 📚 Source References

RAG answers return source metadata whenever available.

Example:

```text
Sources

📄 python_notes.pdf
Page 18

📄 python_notes.pdf
Page 19
```

This helps users verify generated answers against their original study material.

---

# 🧠 Quiz Generation

Users can automatically generate quizzes from uploaded study material.

Each quiz question can contain:

- Question
- Four options
- Correct answer
- Explanation

Example:

```json
{
  "question": "Which Python data type represents whole numbers?",
  "options": [
    "float",
    "int",
    "str",
    "bool"
  ],
  "correctAnswer": 1,
  "explanation": "The int data type represents whole numbers."
}
```

The React frontend displays questions one at a time.

After selecting an option, the user can see whether the answer was:

```text
✅ Correct
```

or:

```text
❌ Incorrect
```

The final score is displayed after completing the quiz.

Example:

```text
Quiz Completed

Score: 4 / 5

80%
```

---

# 🗂️ Flashcard Generation

The application can automatically generate revision flashcards from uploaded notes.

Each flashcard contains:

```text
Question
   ↕
Answer
```

Example:

```text
Question:

What is an integer?

        ↓

Answer:

An integer is a whole number without a decimal part.
```

Users can navigate using:

```text
Previous
Show Answer
Next
```

---

# 📝 AI Study Summaries

The application can generate study material in three formats.

## Summary

Creates a concise explanation of the uploaded material.

```text
📝 Summary
```

---

## Key Points

Extracts important points for quick study.

```text
📌 Key Points
```

---

## Revision Notes

Creates structured notes for exam revision.

```text
📖 Revision Notes
```

The backend retrieves relevant study-note chunks from ChromaDB before sending them to the LLM.

---

# 🔌 API Endpoints

The FastAPI backend exposes REST APIs used by the React frontend.

---

## Home

```http
GET /
```

Example response:

```json
{
  "message": "Smart Study Assistant API is running"
}
```

---

## Health Check

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "vector_records": 201
}
```

---

## Ask Question

```http
POST /ask
```

Example request:

```json
{
  "question": "What is int?",
  "history": []
}
```

Example response:

```json
{
  "answer": "An integer represents a whole number.",
  "route": "RAG",
  "sources": [
    {
      "source": "data/uploads/python_notes.pdf",
      "page": "18"
    }
  ]
}
```

---

## Upload PDF

```http
POST /upload-pdf
```

The endpoint:

```text
1. Validates the PDF
2. Checks for duplicate documents
3. Saves the PDF
4. Loads its pages
5. Splits pages into chunks
6. Generates embeddings
7. Stores embeddings in ChromaDB
```

Uploading another PDF does not delete previously stored documents.

---

## Delete PDF

```http
DELETE /documents/{filename}
```

Example:

```http
DELETE /documents/python_notes.pdf
```

The endpoint removes:

```text
PDF chunks from ChromaDB
        +
Stored PDF file
```

without removing the other documents.

---

## Generate Quiz

```http
POST /quiz
```

Example request:

```json
{
  "topic": "Python data types",
  "count": 5
}
```

---

## Generate Flashcards

```http
POST /flashcards
```

Example request:

```json
{
  "topic": "Python data types",
  "count": 8
}
```

Example response:

```json
{
  "topic": "Python data types",
  "count": 8,
  "flashcards": [
    {
      "question": "What is an integer?",
      "answer": "An integer is a whole number."
    }
  ]
}
```

---

## Generate Study Notes

```http
POST /summary
```

Example request:

```json
{
  "topic": "",
  "mode": "summary"
}
```

Available modes:

```text
summary
keypoints
revision
```

---

# 🧠 Embedding Model

The application uses:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Embedding dimension:

```text
384
```

The model converts both:

```text
Document chunks
      +
User questions
```

into numerical vectors.

These vectors allow ChromaDB to perform semantic similarity search.

---

# 🗃️ Vector Database

The project uses:

```text
ChromaDB
```

ChromaDB stores:

```text
Document chunk
Embedding
Metadata
Source filename
Page information
```

The database is persisted locally inside:

```text
backend/chroma_db/
```

This directory is excluded from Git because each running environment creates and maintains its own vector database.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/archita-garg02/StudyAssistant.git
```

Enter the project:

```bash
cd StudyAssistant
```

---

# 🐍 Backend Setup

Go to the backend:

```bash
cd backend
```

The project uses `uv` for Python dependency management.

If `uv` is not installed:

```bash
pip install uv
```

Install dependencies:

```bash
uv sync
```

---

# 🤖 Ollama Setup

Install Ollama from:

```text
https://ollama.com/
```

Pull Llama 3.2:

```bash
ollama pull llama3.2
```

Check installed models:

```bash
ollama list
```

You should see:

```text
NAME
llama3.2
```

---

# ▶️ Run the Backend

From:

```text
SmartStudyAssistant/backend
```

run:

```bash
uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

---

# ⚛️ Frontend Setup

Open another terminal.

Go to:

```bash
cd frontend-web
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# 🚀 Running the Complete Application

The development version requires three components.

## 1. Ollama

Check:

```bash
ollama list
```

---

## 2. FastAPI

```bash
cd backend

uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. React

Open another terminal:

```bash
cd frontend-web

npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🧪 How to Use

## Step 1

Start Ollama, FastAPI, and React.

---

## Step 2

Open:

```text
http://localhost:5173
```

---

## Step 3

Click the:

```text
+
```

button and upload a PDF.

---

## Step 4

Upload additional PDFs if required.

Example:

```text
📚 Uploaded Notes 3

📄 python.pdf
📄 dbms.pdf
📄 operating_system.pdf
```

---

## Step 5

Ask a question:

```text
What is an integer?
```

The assistant retrieves relevant content using semantic search and generates an answer.

---

## Step 6

Ask follow-up questions:

```text
Give me an example of it.
```

Conversation history is included when processing the request.

---

## Step 7

Generate a quiz:

```text
🧠 Quiz Me
```

---

## Step 8

Generate flashcards:

```text
🗂️ Flashcards
```

---

## Step 9

Generate study notes:

```text
📝 Summary
📌 Key Points
📖 Revision Notes
```

---

## Step 10

Remove an uploaded PDF using:

```text
×
```

Only that document is removed from the knowledge base.

---

# 📁 Important Files

## `backend/api.py`

Responsible for:

- FastAPI application
- API endpoints
- PDF uploads
- PDF deletion
- Quiz generation
- Flashcard generation
- Summary generation
- RAG initialization

---

## `backend/src/loader.py`

Loads PDF documents using PyPDF.

---

## `backend/src/chunking.py`

Splits PDF pages into smaller chunks.

---

## `backend/src/embeddings.py`

Generates vector embeddings using Sentence Transformers.

---

## `backend/src/vectorstore.py`

Handles:

- ChromaDB storage
- Document insertion
- Duplicate checking
- Document deletion

---

## `backend/src/retriever.py`

Performs semantic similarity search.

---

## `backend/src/graph.py`

Contains the LangGraph routing workflow.

---

## `backend/src/tools/rag_tool.py`

Provides the RAG retrieval tool used by the graph.

---

## `backend/src/tools/calculator_tool.py`

Provides mathematical calculation functionality.

---

## `frontend-web/src/App.jsx`

Contains:

- Main React interface
- Chat state
- PDF upload state
- Multiple PDF display
- PDF removal
- Quiz controls
- Flashcard controls
- Summary controls

---

## `frontend-web/src/components/QuizPanel.jsx`

Displays generated quiz questions and calculates quiz scores.

---

## `frontend-web/src/components/FlashcardPanel.jsx`

Displays generated flashcards.

---

## `frontend-web/src/services/api.js`

Handles communication between the React frontend and FastAPI backend.

---

# 🔒 Git Ignore

Local/generated files should not be committed.

```gitignore
# Python-generated files
__pycache__/
*.py[oc]
build/
dist/
wheels/
*.egg-info

# Virtual environments
.venv/

# Environment variables
.env

# Local ChromaDB
backend/chroma_db/

# Uploaded PDFs
backend/data/uploads/

# React dependencies
frontend-web/node_modules/

# React production build
frontend-web/dist/

# IDE files
.idea/
.vscode/
```

---

# ☁️ Deployment

The application is being prepared for deployment using an **Azure Ubuntu Virtual Machine**.

The planned production architecture is:

```text
                    Internet
                       │
                       ▼
                    Nginx
                   /     \
                  /       \
          React Frontend   /api
                             │
                             ▼
                          FastAPI
                             │
                      ┌──────┴──────┐
                      │             │
                  LangGraph       ChromaDB
                      │
                      ▼
                 Ollama / Llama 3.2
```

The Azure VM will host:

```text
React production build
FastAPI backend
Ollama
Llama 3.2
ChromaDB
Nginx
```

A public deployment URL will be added after deployment is completed.

---

# 🔮 Future Improvements

Possible future enhancements include:

- 📄 Search within a selected PDF
- 💾 Persistent LangGraph conversation memory
- 💬 Chat-history sidebar
- ⚡ Streaming AI responses
- 🌙 Dark mode
- 🔐 User authentication
- 👤 Multiple user accounts
- 📊 Student progress tracking
- 🎯 Personalized study recommendations
- 📂 Organize PDFs by subject
- 🔎 Advanced document filtering
- 🧠 Improved follow-up query rewriting
- 📱 Mobile-friendly interface

---

# 🎯 Project Goal

The goal of Smart Study Assistant is to make studying more interactive by allowing students to use their own learning material as the knowledge source for an AI assistant.

Instead of manually searching through long documents, students can:

```text
Ask
 │
 ▼
Understand
 │
 ▼
Revise
 │
 ▼
Practice
 │
 ▼
Quiz
```

from a single application.

---

# 👩‍💻 Author

**Archita Garg**

B.Tech Computer Science Engineering

### GitHub

```text
https://github.com/archita-garg02
```

### Project Repository

```text
https://github.com/archita-garg02/StudyAssistant
```

---

# ⭐ Support

If you find this project useful, consider giving the repository a star.

⭐ **Smart Study Assistant**
