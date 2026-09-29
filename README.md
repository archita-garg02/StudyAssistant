# 📚 Smart Study Assistant

Smart Study Assistant is an AI-powered learning application that allows students to upload their own PDF study notes and interact with them using Retrieval-Augmented Generation (RAG).

The application combines **LangChain, LangGraph, ChromaDB, Sentence Transformers, Ollama, FastAPI, and React** to provide question answering, source references, chat memory, quizzes, flashcards, and calculator support.

---

## ✨ Features

- 📄 Upload PDF study notes
- 🔍 Ask questions from uploaded notes
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Source filename and page references
- 💬 Conversational memory for follow-up questions
- 🔀 LangGraph-based intelligent routing
- 🧮 Calculator tool
- 🧠 AI-generated quizzes
- 🗂️ AI-generated flashcards
- 📊 Quiz score calculation
- 🤖 Local LLM using Ollama
- 🗃️ ChromaDB vector database
- ⚡ FastAPI backend
- ⚛️ React + Vite frontend

---

## 🧠 How It Works

```text
PDF Upload
    ↓
Load PDF
    ↓
Split PDF into chunks
    ↓
Generate embeddings
    ↓
Store embeddings in ChromaDB
    ↓
User asks a question
    ↓
LangGraph Router
    ↓
┌────────────┬──────────────┬─────────────┐
│    RAG     │  CALCULATOR  │   DIRECT    │
└────────────┴──────────────┴─────────────┘
    ↓
Retrieve relevant notes
    ↓
Send context to Ollama
    ↓
Generate final answer
    ↓
Return answer + source pages
```

---

## 🏗️ Project Architecture

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
└── README.md
```

---

# 🛠️ Tech Stack

## Backend

- Python
- FastAPI
- LangChain
- LangGraph
- Ollama
- ChromaDB
- Sentence Transformers
- PyPDF

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

---

# 📄 PDF Processing

When a user uploads a PDF, the backend processes it through the following pipeline:

```text
PDF
 ↓
PyPDFLoader
 ↓
RecursiveCharacterTextSplitter
 ↓
Sentence Transformer
 ↓
Vector Embeddings
 ↓
ChromaDB
```

The uploaded PDF becomes the application's active knowledge base.

When a new PDF is uploaded, the previous vector data is removed and replaced with the newly uploaded document.

---

# 🔍 Retrieval-Augmented Generation

Questions related to the uploaded notes are processed using RAG.

Example:

```text
User
 ↓
"What is an integer?"
 ↓
LangGraph Router
 ↓
RAG Route
 ↓
Convert question into embedding
 ↓
Search ChromaDB
 ↓
Retrieve relevant chunks
 ↓
Send context + question to Ollama
 ↓
Generate response
```

This allows the assistant to answer questions using information retrieved directly from the student's study notes.

---

# 🔀 LangGraph Routing

The project uses LangGraph to classify user questions.

There are currently three routes:

```text
RAG
CALCULATOR
DIRECT
```

## RAG

Used when the user asks something related to uploaded study notes.

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
The result is 200
```

---

## DIRECT

Used for general conversation that does not require the uploaded notes.

Example:

```text
Hello
```

---

# 💬 Chat Memory

The frontend sends previous conversation messages along with the latest user question.

This allows follow-up questions to make more sense.

Example:

```text
User:
What is an integer?

Assistant:
An integer is a whole number.

User:
Give me an example of it.

Assistant:
Examples include 5, 10, -3, and 0.
```

The previous conversation helps the model understand what words like:

```text
it
that
this concept
the second one
```

refer to.

---

# 📚 Source References

For RAG answers, the assistant can return information about the source chunks used for retrieval.

Example:

```text
Sources

📄 python_notes.pdf
Page 18

📄 python_notes.pdf
Page 19
```

This makes answers easier to verify against the original study notes.

---

# 🧠 Quiz Generation

Users can generate quizzes automatically from uploaded study notes.

The backend retrieves relevant information from the vector database and sends it to the LLM.

Each quiz question contains:

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

The frontend displays one question at a time.

After selecting an answer, the user can see:

```text
✅ Correct

or

❌ Incorrect
```

along with an explanation.

At the end of the quiz, the final score is displayed.

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

Users can move through cards using:

```text
Previous
Show Answer
Next
```

This feature is useful for quick revision.

---

# 🔌 API Endpoints

The FastAPI backend currently provides the following endpoints.

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

1. Saves the PDF
2. Loads its pages
3. Splits the document into chunks
4. Generates embeddings
5. Removes old vector records
6. Stores new embeddings in ChromaDB

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

Example response:

```json
{
  "topic": "Python data types",
  "count": 5,
  "quiz": [
    {
      "question": "Which data type stores whole numbers?",
      "options": [
        "float",
        "int",
        "str",
        "bool"
      ],
      "correctAnswer": 1,
      "explanation": "int is used to represent whole numbers."
    }
  ]
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

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/archita-garg02/StudyAssistant.git
```

Move into the project:

```bash
cd StudyAssistant
```

---

# 🐍 Backend Setup

Move to the backend:

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

Pull the model:

```bash
ollama pull llama3.2
```

Check installed models:

```bash
ollama list
```

You should see something similar to:

```text
NAME
llama3.2
```

---

# ▶️ Run Backend

From the backend directory:

```bash
uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

The backend will run at:

```text
http://localhost:8000
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
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

Start the Vite development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# 🚀 Running the Complete Project

You need three things running.

## 1. Ollama

Make sure the Ollama service and model are available.

```bash
ollama list
```

---

## 2. FastAPI Backend

```bash
cd backend

uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. React Frontend

Open another terminal:

```bash
cd frontend-web

npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🧪 How to Use

## Step 1

Open the application.

---

## Step 2

Click:

```text
+
```

and select a PDF containing your study notes.

---

## Step 3

Wait while the application processes the PDF.

Example:

```text
PDF uploaded successfully.

python_notes.pdf

142 pages • 201 chunks
```

---

## Step 4

Ask a question:

```text
What is int?
```

The assistant retrieves relevant content from the PDF and generates an answer.

---

## Step 5

Ask a follow-up:

```text
Give me an example of it.
```

The previous conversation is included as chat history.

---

## Step 6

Generate a quiz using:

```text
🧠 Quiz Me
```

---

## Step 7

Generate revision cards using:

```text
🗂️ Flashcards
```

---

# 🧠 Embedding Model

The project uses:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Embedding dimension:

```text
384
```

The embedding model converts both document chunks and user queries into numerical vectors.

These vectors are used to perform semantic similarity search.

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

During a query, ChromaDB finds the chunks that are semantically closest to the user's question.

---

# 🔄 Complete RAG Pipeline

```text
              PDF
               │
               ▼
          PyPDFLoader
               │
               ▼
          PDF Pages
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
               │
User Question ─┘
      │
      ▼
Question Embedding
      │
      ▼
Similarity Search
      │
      ▼
Relevant Chunks
      │
      ▼
     Ollama
      │
      ▼
Final RAG Answer
```

---

# 🔀 Complete Agent Flow

```text
                   User Question
                         │
                         ▼
                  LangGraph Router
                         │
              ┌──────────┼───────────┐
              │          │           │
              ▼          ▼           ▼
             RAG     CALCULATOR    DIRECT
              │          │           │
              ▼          ▼           ▼
          Retriever   Math Tool    Ollama
              │
              ▼
          ChromaDB
              │
              ▼
        Relevant Notes
              │
              ▼
           Ollama
              │
              ▼
           Answer
```

---

# 📁 Important Files

## `backend/api.py`

Contains:

- FastAPI application
- API endpoints
- PDF upload
- Quiz generation
- Flashcard generation
- RAG initialization

---

## `backend/src/loader.py`

Loads PDF documents.

---

## `backend/src/chunking.py`

Splits loaded PDF pages into smaller chunks.

---

## `backend/src/embeddings.py`

Generates embeddings using Sentence Transformers.

---

## `backend/src/vectorstore.py`

Handles ChromaDB storage.

---

## `backend/src/retriever.py`

Performs similarity search.

---

## `backend/src/graph.py`

Contains the LangGraph workflow and routing logic.

---

## `backend/src/tools/rag_tool.py`

Provides the RAG search tool.

---

## `backend/src/tools/calculator_tool.py`

Provides mathematical calculation functionality.

---

## `frontend-web/src/App.jsx`

Contains the main React interface and application state.

---

## `frontend-web/src/components/QuizPanel.jsx`

Displays generated quiz questions and calculates scores.

---

## `frontend-web/src/components/FlashcardPanel.jsx`

Displays generated study flashcards.

---

## `frontend-web/src/services/api.js`

Handles communication between React and FastAPI.

---

# 🔒 Git Ignore Recommendations

The following files and directories should not be committed:

```gitignore
.venv/
venv/

__pycache__/
*.pyc

.env

node_modules/
dist/

data/uploads/

chroma_db/
chroma/

.idea/
.vscode/

.DS_Store
```

---

# 🔮 Future Improvements

Planned improvements include:

- 📑 Multiple PDF support
- 📝 Automatic study summaries
- 📌 Key-point extraction
- 📖 Revision notes generation
- 🧠 Topic-specific quizzes
- 🗂️ Topic-specific flashcards
- 💾 Persistent LangGraph memory
- 💬 Chat history sidebar
- ⚡ Streaming AI responses
- 🌙 Dark mode
- 🔐 User authentication
- ☁️ Cloud deployment
- 📊 Student progress tracking
- 🎯 Personalized study recommendations

---

# 🎯 Project Goal

The goal of Smart Study Assistant is to make studying more interactive by allowing students to use their own learning material as the knowledge source for an AI assistant.

Instead of searching manually through long PDFs, students can:

```text
Ask
Learn
Revise
Practice
Quiz
```

from a single application.

---

# 👩‍💻 Author

**Archita Garg**

B.Tech Computer Science Engineering

GitHub:

```text
https://github.com/archita-garg02
```

Project Repository:

```text
https://github.com/archita-garg02/StudyAssistant
```

---

# ⭐ Support

If you find this project useful, consider giving the repository a star.

⭐ **Smart Study Assistant**
