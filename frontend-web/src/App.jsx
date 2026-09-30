import { useEffect, useRef, useState } from "react";
import "./App.css";

import {
  askQuestion,
  uploadPdf,
  generateQuiz,
  generateFlashcards,
  generateSummary,
  deletePdf,
} from "./services/api";

import QuizPanel from "./components/QuizPanel";
import FlashcardPanel from "./components/FlashcardPanel";


function App() {
  // --------------------------------------------------
  // BASIC CHAT STATES
  // --------------------------------------------------

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);


  // --------------------------------------------------
  // PDF STATES
  // --------------------------------------------------

  const [uploading, setUploading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [deletingFile, setDeletingFile] = useState(null);


  // --------------------------------------------------
  // QUIZ STATES
  // --------------------------------------------------

  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);


  // --------------------------------------------------
  // FLASHCARD STATES
  // --------------------------------------------------

  const [flashcards, setFlashcards] = useState([]);

  const [flashcardLoading, setFlashcardLoading] =
    useState(false);

  const [showFlashcards, setShowFlashcards] =
    useState(false);


  // --------------------------------------------------
  // SUMMARY STATE
  // --------------------------------------------------

  const [summaryLoading, setSummaryLoading] =
    useState(false);


  // --------------------------------------------------
  // REFS
  // --------------------------------------------------

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);


  // --------------------------------------------------
  // AUTO SCROLL
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    loading,
    uploading,
    summaryLoading,
    quizLoading,
    flashcardLoading,
  ]);


  // --------------------------------------------------
  // SEND QUESTION
  // --------------------------------------------------

  const handleSend = async () => {
    if (
      !question.trim() ||
      loading ||
      uploading ||
      quizLoading ||
      flashcardLoading ||
      summaryLoading ||
      deletingFile
    ) {
      return;
    }


    const currentQuestion = question.trim();


    const history = messages
      .filter(
        (message) =>
          message.route !== "UPLOAD" &&
          message.route !== "ERROR" &&
          message.route !== "SUMMARY" &&
          message.route !== "DELETE"
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
          error.message ||
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


      // Add PDF to uploaded list
      setUploadedFiles((prev) => {
        if (prev.includes(data.filename)) {
          return prev;
        }

        return [
          ...prev,
          data.filename,
        ];
      });


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


      setMessages((prev) => [
        ...prev,
        uploadMessage,
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
  // DELETE PDF
  // --------------------------------------------------

  const handleDeletePdf = async (filename) => {
    if (
      deletingFile ||
      uploading ||
      loading ||
      quizLoading ||
      flashcardLoading ||
      summaryLoading
    ) {
      return;
    }


    const confirmed = window.confirm(
      `Remove "${filename}" from your study notes?`
    );


    if (!confirmed) {
      return;
    }


    setDeletingFile(filename);


    try {
      await deletePdf(filename);


      // Remove file from frontend list
      setUploadedFiles((prev) =>
        prev.filter(
          (file) => file !== filename
        )
      );


      // Remove old generated content
      setQuiz([]);
      setShowQuiz(false);

      setFlashcards([]);
      setShowFlashcards(false);


      const deleteMessage = {
        id: `${Date.now()}-delete`,
        role: "assistant",

        text:
          `Removed "${filename}" ` +
          `from the knowledge base.`,

        route: "DELETE",
        sources: [],
      };


      setMessages((prev) => [
        ...prev,
        deleteMessage,
      ]);

    } catch (error) {
      console.error(error);


      setMessages((prev) => [
        ...prev,

        {
          id: `${Date.now()}-delete-error`,
          role: "assistant",

          text:
            error.message ||
            "Unable to remove PDF.",

          route: "ERROR",
          sources: [],
        },
      ]);

    } finally {
      setDeletingFile(null);
    }
  };


  // --------------------------------------------------
  // GENERATE QUIZ
  // --------------------------------------------------

  const handleGenerateQuiz = async () => {
    if (
      quizLoading ||
      flashcardLoading ||
      summaryLoading ||
      uploading ||
      loading ||
      deletingFile
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
      quizLoading ||
      summaryLoading ||
      uploading ||
      loading ||
      deletingFile
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
  // GENERATE SUMMARY
  // --------------------------------------------------

  const handleGenerateSummary = async (mode) => {
    if (
      summaryLoading ||
      quizLoading ||
      flashcardLoading ||
      uploading ||
      loading ||
      deletingFile
    ) {
      return;
    }


    setSummaryLoading(true);


    try {
      const data = await generateSummary(
        "",
        mode
      );


      let title = "📝 Summary";


      if (mode === "keypoints") {
        title = "📌 Key Points";
      }


      if (mode === "revision") {
        title = "📖 Revision Notes";
      }


      const summaryMessage = {
        id: `${Date.now()}-summary`,
        role: "assistant",

        text:
          `${title}\n\n` +
          data.summary,

        route: "SUMMARY",
        sources: [],
      };


      setMessages((prev) => [
        ...prev,
        summaryMessage,
      ]);

    } catch (error) {
      console.error(error);


      setMessages((prev) => [
        ...prev,

        {
          id: `${Date.now()}-summary-error`,
          role: "assistant",

          text:
            error.message ||
            "Unable to generate summary.",

          route: "ERROR",
          sources: [],
        },
      ]);

    } finally {
      setSummaryLoading(false);
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

            {uploadedFiles.length > 0 && (
              <>

                {/* QUIZ */}

                <button
                  className="quiz-button"

                  onClick={handleGenerateQuiz}

                  disabled={
                    quizLoading ||
                    flashcardLoading ||
                    summaryLoading ||
                    uploading ||
                    loading ||
                    deletingFile
                  }
                >
                  {quizLoading
                    ? "Generating..."
                    : "🧠 Quiz Me"}
                </button>


                {/* FLASHCARDS */}

                <button
                  className="flashcard-button"

                  onClick={
                    handleGenerateFlashcards
                  }

                  disabled={
                    flashcardLoading ||
                    quizLoading ||
                    summaryLoading ||
                    uploading ||
                    loading ||
                    deletingFile
                  }
                >
                  {flashcardLoading
                    ? "Generating..."
                    : "🗂️ Flashcards"}
                </button>


                {/* SUMMARY */}

                <button
                  className="summary-button"

                  onClick={() =>
                    handleGenerateSummary(
                      "summary"
                    )
                  }

                  disabled={
                    summaryLoading ||
                    quizLoading ||
                    flashcardLoading ||
                    uploading ||
                    loading ||
                    deletingFile
                  }
                >
                  {summaryLoading
                    ? "Generating..."
                    : "📝 Summary"}
                </button>


                {/* KEY POINTS */}

                <button
                  className="summary-button"

                  onClick={() =>
                    handleGenerateSummary(
                      "keypoints"
                    )
                  }

                  disabled={
                    summaryLoading ||
                    quizLoading ||
                    flashcardLoading ||
                    uploading ||
                    loading ||
                    deletingFile
                  }
                >
                  📌 Key Points
                </button>


                {/* REVISION NOTES */}

                <button
                  className="summary-button"

                  onClick={() =>
                    handleGenerateSummary(
                      "revision"
                    )
                  }

                  disabled={
                    summaryLoading ||
                    quizLoading ||
                    flashcardLoading ||
                    uploading ||
                    loading ||
                    deletingFile
                  }
                >
                  📖 Revision Notes
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
                  Upload one or more study PDFs using the
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
                  Processing your PDF...
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



          {/* SUMMARY GENERATING */}

          {summaryLoading && (

            <div className="message-row assistant-row">

              <div className="message assistant-message">

                <div className="message-label">
                  Study Assistant
                </div>


                <div className="uploading-text">
                  Creating study notes...
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



        {/* MULTIPLE UPLOADED PDFS */}

        {uploadedFiles.length > 0 && (

          <div className="uploaded-files-section">

            <div className="uploaded-files-title">

              📚 Uploaded Notes

              <span className="uploaded-files-count">
                {uploadedFiles.length}
              </span>

            </div>


            <div className="uploaded-files-list">

              {uploadedFiles.map(
                (file, index) => (

                  <div
                    key={`${file}-${index}`}
                    className="uploaded-file-item"
                  >

                    <span className="uploaded-file-icon">
                      📄
                    </span>


                    <span className="uploaded-file-name">
                      {file}
                    </span>


                    <button
                      type="button"

                      className="remove-file-button"

                      onClick={() =>
                        handleDeletePdf(file)
                      }

                      disabled={
                        deletingFile === file ||
                        uploading ||
                        loading ||
                        quizLoading ||
                        flashcardLoading ||
                        summaryLoading
                      }

                      title={`Remove ${file}`}
                      aria-label={`Remove ${file}`}
                    >
                      {deletingFile === file
                        ? "..."
                        : "×"}
                    </button>

                  </div>

                )
              )}

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
              flashcardLoading ||
              summaryLoading ||
              deletingFile
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
                : deletingFile
                  ? "Removing PDF..."
                  : quizLoading
                    ? "Generating quiz..."
                    : flashcardLoading
                      ? "Generating flashcards..."
                      : summaryLoading
                        ? "Generating study notes..."
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
              flashcardLoading ||
              summaryLoading ||
              deletingFile
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
              flashcardLoading ||
              summaryLoading ||
              deletingFile
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