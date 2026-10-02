# 📚 Smart Study Assistant

Smart Study Assistant is an AI-powered learning application that allows students to upload multiple PDF study notes and interact with them using **Retrieval-Augmented Generation (RAG)**.

The application combines **LangChain, LangGraph, ChromaDB, Sentence Transformers, Ollama, FastAPI, and React** to provide context-aware question answering, source references, quizzes, flashcards, summaries, revision notes, calculator support, and conversational history.

---

## ✨ Features

- 📄 Upload multiple PDF study notes
- 🗑️ Remove individual PDFs from the knowledge base
- 🔄 Restore indexed PDFs after browser refresh
- 🔍 Ask questions from uploaded notes
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Source filename and page references
- 💬 Conversational history for follow-up questions
- 🔀 LangGraph-based intelligent query routing
- 🧮 Calculator tool
- 🧠 AI-generated quizzes
- 🗂️ AI-generated flashcards
- 📝 AI-generated summaries
- 📌 Key-point generation
- 📖 Revision-note generation
- 🧾 Markdown-rendered study notes
- 📊 Quiz score calculation
- 🤖 Local LLM using Ollama and Llama 3.2
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
- React Markdown

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

Uploading another PDF does not replace previously indexed documents.

Example:

```text
ChromaDB

├── python_notes.pdf
├── dbms_notes.pdf
└── operating_system.pdf
```
Each chunk contains metadata such as the PDF source and page information.
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

# 🔄 Persistent Document List

The frontend restores indexed documents whenever the application starts.

```text
Browser Refresh
      │
      ▼
React App
      │
      ▼
GET /documents
      │
      ▼
FastAPI
      │
      ▼
ChromaDB Metadata
      │
      ▼
Indexed PDFs
      │
      ▼
Uploaded Notes UI
```

This prevents the uploaded-PDF list from disappearing after a browser refresh.

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

The application can automatically generate multiple-choice quizzes from indexed notes.

Each question contains:

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

The frontend:

- displays one question at a time
- shows correct and incorrect answers
- provides explanations
- calculates the final score

Example:

```text
Quiz Completed

Score: 4 / 5

80%
```

---

# 🗂️ Flashcard Generation

The application generates revision flashcards from study notes.

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
An integer is a whole number without decimals.
```

Controls:

```text
Previous
Show Answer
Next
```

---

# 📝 Study Notes Generation

The application provides three AI-powered study modes.

## 📝 Summary

Creates a concise explanation of important study material.

## 📌 Key Points

Extracts important points for quick revision.

## 📖 Revision Notes

Creates structured exam-oriented revision notes.

The backend first retrieves relevant chunks from ChromaDB and then sends the retrieved context to the LLM.

The React frontend uses Markdown rendering so headings, lists, bold text, and inline code are displayed properly.

---

# 🔌 API Endpoints

## Home

```http
GET /
```

Example:

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

## Get Indexed Documents

```http
GET /documents
```

Example:

```json
{
  "documents": [
    "python_notes.pdf",
    "dbms_notes.pdf"
  ],
  "count": 2
}
```

The React frontend uses this endpoint to restore the uploaded-document list after a browser refresh.

---

## Ask Question

```http
POST /ask
```

Request:

```json
{
  "question": "What is int?",
  "history": []
}
```

Response:

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

Processing:

```text
1. Validate PDF
2. Check duplicates
3. Save PDF
4. Load pages
5. Split into chunks
6. Generate embeddings
7. Store vectors in ChromaDB
```

---

## Delete PDF

```http
DELETE /documents/{filename}
```

Example:

```http
DELETE /documents/python_notes.pdf
```

Deletes:

```text
ChromaDB vectors
        +
Stored PDF
```

---

## Generate Quiz

```http
POST /quiz
```

Request:

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

Request:

```json
{
  "topic": "Python data types",
  "count": 8
}
```

---

## Generate Study Notes

```http
POST /summary
```

Request:

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

The embedding model converts:

```text
PDF chunks
    +
User queries
```

into numerical vectors used for semantic similarity search.

---

# 🗃️ Vector Database

The application uses **ChromaDB**.

ChromaDB stores:

```text
Document chunk
Embedding
Metadata
Source filename
Page information
```

Persistent database location:

```text
backend/chroma_db/
```

This directory is excluded from Git.

---

# ⚙️ Installation

Clone the project:

```bash
git clone https://github.com/archita-garg02/StudyAssistant.git

cd StudyAssistant
```

---

# 🐍 Backend Setup

Go to:

```bash
cd backend
```

Install `uv` if needed:

```bash
pip install uv
```

Install project dependencies:

```bash
uv sync
```

---

# 🤖 Ollama Setup

Pull Llama 3.2:

```bash
ollama pull llama3.2
```

Check:

```bash
ollama list
```

Expected:

```text
NAME
llama3.2
```

---

# ▶️ Run Backend

```bash
cd ~/ResumeProjects/SmartStudyAssistant/backend

uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Health:

```text
http://localhost:8000/health
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd ~/ResumeProjects/SmartStudyAssistant/frontend-web

npm install
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🚀 Run the Complete Application

You need three services.

## Terminal 1 — Ollama

```bash
ollama serve
```

If Ollama is already running as a system service, you may not need this command.

---

## Terminal 2 — FastAPI

```bash
cd ~/ResumeProjects/SmartStudyAssistant/backend

uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

---

## Terminal 3 — React

```bash
cd ~/ResumeProjects/SmartStudyAssistant/frontend-web

npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🧪 How to Use

1. Start Ollama.
2. Start the FastAPI backend.
3. Start the React frontend.
4. Open `http://localhost:5173`.
5. Click `+` and upload a study PDF.
6. Ask questions from the uploaded notes.
7. Upload additional PDFs if required.
8. Use **🧠 Quiz Me** to generate questions.
9. Use **🗂️ Flashcards** for revision.
10. Use **📝 Summary** for concise notes.
11. Use **📌 Key Points** for quick revision.
12. Use **📖 Revision Notes** for exam preparation.
13. Click `×` to remove an indexed PDF.

---

# 📁 Important Files

## `backend/api.py`

Handles:

- FastAPI application
- PDF uploads
- document listing
- document deletion
- question answering
- quiz generation
- flashcard generation
- summary generation
- RAG initialization

---

## `backend/src/loader.py`

Loads PDF pages.

---

## `backend/src/chunking.py`

Splits PDF pages into text chunks.

---

## `backend/src/embeddings.py`

Generates Sentence Transformer embeddings.

---

## `backend/src/vectorstore.py`

Handles:

- ChromaDB persistence
- adding documents
- duplicate checking
- indexed-document listing
- document deletion

---

## `backend/src/retriever.py`

Performs semantic similarity search.

---

## `backend/src/graph.py`

Contains the LangGraph workflow and routing logic.

---

## `backend/src/tools/rag_tool.py`

Provides the retrieval tool used by LangGraph.

---

## `backend/src/tools/calculator_tool.py`

Provides calculator functionality.

---

## `frontend-web/src/App.jsx`

Handles:

- chat interface
- PDF upload
- PDF restoration after refresh
- multiple-document UI
- PDF deletion
- quiz controls
- flashcard controls
- summary controls
- Markdown rendering

---

## `frontend-web/src/components/QuizPanel.jsx`

Displays quizzes and calculates scores.

---

## `frontend-web/src/components/FlashcardPanel.jsx`

Displays interactive flashcards.

---

## `frontend-web/src/services/api.js`

Handles communication between React and FastAPI.

---

# 🔒 Git Ignore

```gitignore
# Python
__pycache__/
*.py[oc]
build/
dist/
wheels/
*.egg-info

# Virtual environment
.venv/

# Environment variables
.env

# ChromaDB
backend/chroma_db/

# Uploaded PDFs
backend/data/uploads/

# React dependencies
frontend-web/node_modules/

# React build
frontend-web/dist/

# IDE
.idea/
.vscode/
```

---

# ☁️ Deployment

The project is being prepared for deployment on an **Azure Ubuntu Virtual Machine**.

Planned architecture:

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

The Azure VM can host:

```text
React production build
FastAPI backend
Ollama
Llama 3.2
ChromaDB
Nginx
```

A public deployment URL can be added after deployment.

---

# 🔮 Future Improvements

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
- 🧠 Better follow-up query rewriting
- 🧪 Stronger duplicate-question prevention
- 📱 Further mobile UI optimization

---

# 🎯 Project Goal

Smart Study Assistant aims to make studying more interactive by allowing students to use their own learning material as the knowledge source for an AI assistant.

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

The application combines document retrieval, conversational AI, study tools, and a modern web interface into a single learning workflow.

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
