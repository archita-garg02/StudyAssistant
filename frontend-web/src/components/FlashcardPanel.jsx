import { useState } from "react";

function FlashcardPanel({ flashcards, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="flashcard-overlay">

      <div className="flashcard-panel">

        <button
          className="flashcard-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="flashcard-top">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
        </div>

        <div
          className="flashcard"
          onClick={() => setShowAnswer(!showAnswer)}
        >

          {!showAnswer ? (
            <>
              <div className="flashcard-label">
                QUESTION
              </div>

              <h2>
                {currentCard.question}
              </h2>

              <p className="flashcard-hint">
                Click to reveal answer
              </p>
            </>
          ) : (
            <>
              <div className="flashcard-label">
                ANSWER
              </div>

              <p className="flashcard-answer">
                {currentCard.answer}
              </p>

              <p className="flashcard-hint">
                Click to show question
              </p>
            </>
          )}

        </div>

        <div className="flashcard-controls">

          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer
              ? "Show Question"
              : "Show Answer"}
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentIndex === flashcards.length - 1
            }
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}

export default FlashcardPanel;