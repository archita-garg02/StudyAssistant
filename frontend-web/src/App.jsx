import { useEffect, useRef, useState } from "react";
import "./App.css";

import {
  askQuestion,
  uploadPdf,
  generateQuiz,
  generateFlashcards,
} from "./services/api";

import QuizPanel from "./components/QuizPanel";
import FlashcardPanel from "./components/FlashcardPanel";


function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);


  // Quiz states
  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);


  // Flashcard states
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);


  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);


  // --------------------------------------------------
  // AUTO SCROLL
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, uploading]);


  // --------------------------------------------------
  // SEND QUESTION
  // --------------------------------------------------

  const handleSend = async () => {
    if (
      !question.trim() ||
      loading ||
      uploading ||
      quizLoading ||
      flashcardLoading
    ) {
      return;
    }


    const currentQuestion = question.trim();


    const history = messages
      .filter(
        (message) =>
          message.route !== "UPLOAD" &&
          message.route !== "ERROR"
      )
      .map((message) => ({
        role:
          message.role === "assistant"
            ? "assistant"
            : "user",

        content: message.text,
      }));


    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: currentQuestion,
    };


    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);


    setQuestion("");
    setLoading(true);


    try {
      const data = await askQuestion(
        currentQuestion,
        history
      );


      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: data.answer,
        route: data.route,
        sources: data.sources || [],
      };


      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

    } catch (error) {
      console.error(error);


      const errorMessage = {
        id: `${Date.now()}-error`,
        role: "assistant",

        text:
          "Unable to get a response. " +
          "Please make sure the backend is running.",

        route: "ERROR",
        sources: [],
      };


      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);

    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // ENTER KEY
  // --------------------------------------------------

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };


  // --------------------------------------------------
  // OPEN FILE PICKER
  // --------------------------------------------------

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };


  // --------------------------------------------------
  // PDF UPLOAD
  // --------------------------------------------------

  const handleFileChange = async (event) => {
    const file = event.target.files[0];


    if (!file) {
      return;
    }


    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a PDF file.");

      event.target.value = "";

      return;
    }


    setUploading(true);


    try {
      const data = await uploadPdf(file);


      setUploadedFile(
        data.filename
      );


      // New PDF = new knowledge base
      setMessages([]);


      // Remove old quiz
      setQuiz([]);
      setShowQuiz(false);


      // Remove old flashcards
      setFlashcards([]);
      setShowFlashcards(false);


      const uploadMessage = {
        id: `${Date.now()}-upload`,
        role: "assistant",

        text:
          `PDF uploaded successfully.\n\n` +
          `${data.filename}\n` +
          `${data.pages} pages • ` +
          `${data.chunks} chunks`,

        route: "UPLOAD",
        sources: [],
      };


      setMessages([
        uploadMessage
      ]);

    } catch (error) {
      console.error(error);


      const uploadError = {
        id: `${Date.now()}-upload-error`,
        role: "assistant",

        text:
          error.message ||
          "PDF upload failed.",

        route: "ERROR",
        sources: [],
      };


      setMessages((prev) => [
        ...prev,
        uploadError,
      ]);

    } finally {
      setUploading(false);


      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  // --------------------------------------------------
  // GENERATE QUIZ
  // --------------------------------------------------

  const handleGenerateQuiz = async () => {
    if (
      quizLoading ||
      flashcardLoading
    ) {
      return;
    }


    setQuizLoading(true);


    try {
      const data = await generateQuiz(
        "",
        5
      );


      setQuiz(
        data.quiz || []
      );


      setShowQuiz(true);

    } catch (error) {
      console.error(error);


      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-quiz-error`,
          role: "assistant",

          text:
            error.message ||
            "Unable to generate quiz.",

          route: "ERROR",
          sources: [],
        },
      ]);

    } finally {
      setQuizLoading(false);
    }
  };


  // --------------------------------------------------
  // GENERATE FLASHCARDS
  // --------------------------------------------------

  const handleGenerateFlashcards = async () => {
    if (
      flashcardLoading ||
      quizLoading
    ) {
      return;
    }


    setFlashcardLoading(true);


    try {
      const data = await generateFlashcards(
        "",
        8
      );


      setFlashcards(
        data.flashcards || []
      );


      setShowFlashcards(true);

    } catch (error) {
      console.error(error);


      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-flashcard-error`,
          role: "assistant",

          text:
            error.message ||
            "Unable to generate flashcards.",

          route: "ERROR",
          sources: [],
        },
      ]);

    } finally {
      setFlashcardLoading(false);
    }
  };


  // --------------------------------------------------
  // CLEAR CHAT
  // --------------------------------------------------

  const clearChat = () => {
    setMessages([]);
  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app">

      <div className="chat-container">


        {/* HEADER */}

        <header className="header">

          <div>

            <h1>
              📚 Smart Study Assistant
            </h1>


            <p className="subtitle">
              Upload your notes and ask questions
              using RAG and LangGraph.
            </p>

          </div>


          <div className="header-actions">

            {uploadedFile && (
              <>
                <button
                  className="quiz-button"

                  onClick={handleGenerateQuiz}

                  disabled={
                    quizLoading ||
                    flashcardLoading
                  }
                >
                  {quizLoading
                    ? "Generating..."
                    : "🧠 Quiz Me"}
                </button>


                <button
                  className="flashcard-button"

                  onClick={
                    handleGenerateFlashcards
                  }

                  disabled={
                    flashcardLoading ||
                    quizLoading
                  }
                >
                  {flashcardLoading
                    ? "Generating..."
                    : "🗂️ Flashcards"}
                </button>
              </>
            )}


            {messages.length > 0 && (
              <button
                className="clear-button"
                onClick={clearChat}
              >
                Clear Chat
              </button>
            )}

          </div>

        </header>



        {/* CHAT MESSAGES */}

        <main className="messages">


          {/* WELCOME SCREEN */}

          {messages.length === 0 &&
            !loading &&
            !uploading && (

              <div className="welcome">

                <div className="welcome-icon">
                  🎓
                </div>


                <h2>
                  How can I help you study?
                </h2>


                <p>
                  Upload your study notes using the
                  <strong> + </strong>
                  button and ask questions from them.
                </p>


                <div className="example-questions">

                  <button
                    onClick={() =>
                      setQuestion(
                        "What is int?"
                      )
                    }
                  >
                    What is int?
                  </button>


                  <button
                    onClick={() =>
                      setQuestion(
                        "Explain the main concept from my notes"
                      )
                    }
                  >
                    Explain a topic
                  </button>


                  <button
                    onClick={() =>
                      setQuestion(
                        "25 * 8"
                      )
                    }
                  >
                    Calculate 25 × 8
                  </button>

                </div>

              </div>

            )}



          {/* EXISTING MESSAGES */}

          {messages.map((message) => (

            <div
              key={message.id}

              className={`message-row ${
                message.role === "user"
                  ? "user-row"
                  : "assistant-row"
              }`}
            >

              <div
                className={`message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                <div className="message-label">

                  {message.role === "user"
                    ? "You"
                    : "Study Assistant"}

                </div>


                <div className="message-text">
                  {message.text}
                </div>


                {message.route && (
                  <div className="route">

                    Route:

                    <span>
                      {message.route}
                    </span>

                  </div>
                )}



                {/* SOURCES */}

                {message.sources &&
                  message.sources.length > 0 && (

                    <div className="sources-section">

                      <div className="sources-title">
                        Sources
                      </div>


                      {message.sources.map(
                        (source, index) => (

                          <div
                            key={
                              `${source.source}-${source.page}-${index}`
                            }

                            className="source-item"
                          >

                            <span className="source-icon">
                              📄
                            </span>


                            <span className="source-name">

                              {source.source
                                ?.split("/")
                                .pop() ||
                                "Unknown source"}

                            </span>


                            <span className="source-page">
                              Page {source.page}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  )}

              </div>

            </div>

          ))}



          {/* PDF PROCESSING */}

          {uploading && (

            <div className="message-row assistant-row">

              <div className="message assistant-message">

                <div className="message-label">
                  Study Assistant
                </div>


                <div className="uploading-text">
                  Processing your PDF
                </div>


                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>

          )}



          {/* AI THINKING */}

          {loading && (

            <div className="message-row assistant-row">

              <div className="message assistant-message">

                <div className="message-label">
                  Study Assistant
                </div>


                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>

          )}


          <div ref={messagesEndRef} />

        </main>



        {/* ACTIVE PDF */}

        {uploadedFile && (

          <div className="active-file">

            <span>
              📄
            </span>


            <div>

              <small>
                Active notes
              </small>

              <strong>
                {uploadedFile}
              </strong>

            </div>

          </div>

        )}



        {/* INPUT BAR */}

        <div className="input-area">


          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
          />


          {/* + BUTTON */}

          <button
            type="button"

            className="plus-button"

            onClick={handlePlusClick}

            disabled={
              uploading ||
              loading ||
              quizLoading ||
              flashcardLoading
            }

            title="Upload PDF"
            aria-label="Upload PDF"
          >

            {uploading
              ? "…"
              : "+"}

          </button>



          {/* QUESTION INPUT */}

          <textarea
            value={question}

            placeholder={
              uploading
                ? "Processing PDF..."
                : quizLoading
                  ? "Generating quiz..."
                  : flashcardLoading
                    ? "Generating flashcards..."
                    : "Ask your study assistant..."
            }

            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }

            onKeyDown={handleKeyDown}

            disabled={
              loading ||
              uploading ||
              quizLoading ||
              flashcardLoading
            }

            rows={1}
          />



          {/* SEND */}

          <button
            type="button"

            className="send-button"

            onClick={handleSend}

            disabled={
              !question.trim() ||
              loading ||
              uploading ||
              quizLoading ||
              flashcardLoading
            }
          >

            {loading
              ? "Thinking..."
              : "Send"}

          </button>

        </div>

      </div>



      {/* QUIZ MODAL */}

      {showQuiz && quiz.length > 0 && (

        <QuizPanel
          quiz={quiz}

          onClose={() =>
            setShowQuiz(false)
          }
        />

      )}



      {/* FLASHCARD MODAL */}

      {showFlashcards &&
        flashcards.length > 0 && (

          <FlashcardPanel
            flashcards={flashcards}

            onClose={() =>
              setShowFlashcards(false)
            }
          />

        )}

    </div>
  );
}


export default App;