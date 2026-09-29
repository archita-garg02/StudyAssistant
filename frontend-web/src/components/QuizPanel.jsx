import { useState } from "react";

function QuizPanel({ quiz, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = quiz[currentQuestion];

  const handleAnswer = (index) => {
    if (answered) {
      return;
    }

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-panel">

          <button
            className="quiz-close"
            onClick={onClose}
          >
            ×
          </button>

          <div className="quiz-result">
            <div className="quiz-result-icon">
              🎉
            </div>

            <h2>Quiz Completed!</h2>

            <p>
              Your score
            </p>

            <div className="quiz-score">
              {score} / {quiz.length}
            </div>

            <div className="quiz-percentage">
              {Math.round(
                (score / quiz.length) * 100
              )}
              %
            </div>

            <button
              className="quiz-primary-button"
              onClick={onClose}
            >
              Back to Chat
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="quiz-overlay">

      <div className="quiz-panel">

        <button
          className="quiz-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="quiz-top">

          <span>
            Question {currentQuestion + 1}
            {" "}of{" "}
            {quiz.length}
          </span>

          <span>
            Score: {score}
          </span>

        </div>

        <div className="quiz-progress">

          <div
            className="quiz-progress-bar"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  quiz.length) *
                100
              }%`,
            }}
          />

        </div>

        <h2 className="quiz-question">
          {question.question}
        </h2>

        <div className="quiz-options">

          {question.options.map(
            (option, index) => {

              let className =
                "quiz-option";

              if (answered) {
                if (
                  index ===
                  question.correctAnswer
                ) {
                  className +=
                    " correct-option";
                } else if (
                  index ===
                  selectedAnswer
                ) {
                  className +=
                    " wrong-option";
                }
              }

              return (
                <button
                  key={index}
                  className={className}
                  onClick={() =>
                    handleAnswer(index)
                  }
                  disabled={answered}
                >
                  <span className="option-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}
                </button>
              );
            }
          )}

        </div>

        {answered && (

          <div className="quiz-feedback">

            <strong>
              {selectedAnswer ===
              question.correctAnswer
                ? "✅ Correct!"
                : "❌ Incorrect"}
            </strong>

            <p>
              {question.explanation}
            </p>

          </div>

        )}

        {answered && (

          <button
            className="quiz-primary-button"
            onClick={handleNext}
          >
            {currentQuestion + 1 ===
            quiz.length
              ? "Finish Quiz"
              : "Next Question"}
          </button>

        )}

      </div>

    </div>
  );
}

export default QuizPanel;