
import { useState } from "react";
import type { QuizCategory, QuizQuestion } from "../types/quiz";

const QUESTIONS_PER_ROUND = 10;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createRound(category: QuizCategory): QuizQuestion[] {
  return shuffle(category.questions)
    .slice(0, Math.min(QUESTIONS_PER_ROUND, category.questions.length))
    .map((question) => ({
      ...question,
      options: shuffle(question.options),
    }));
}

type QuizGameProps = {
  category: QuizCategory;
};

export default function QuizGame({ category }: QuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    () => createRound(category),
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const isCorrect = selected === question.answer;

  function chooseAnswer(option: string) {
    if (selected !== null) return;

    setSelected(option);

    if (option === question.answer) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent((previous) => previous + 1);
    setSelected(null);
  }

  function restartQuiz() {
    setQuestions(createRound(category));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <section className="quiz">
      {finished ? (
        <div className="result">
          <p className="eyebrow">QUIZ COMPLETED</p>
          <h2>
            {score === questions.length
              ? "Perfect score!"
              : score >= 7
                ? "Excellent work!"
                : score >= 5
                  ? "Good game!"
                  : "Keep practising!"}
          </h2>

          <p className="score">
            {score} <span>/ {questions.length}</span>
          </p>

          <p className="result-text">
            You got {score} out of {questions.length} questions correct.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={restartQuiz}
          >
            Play again
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-top">
            <span className="quiz-label">
              {category.title.toUpperCase()}
            </span>
            <span className="question-count">
              {current + 1} of {questions.length}
            </span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={current + 1}
          >
            <div
              className="progress-fill"
              style={{
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <p className="question-label">QUESTION {current + 1}</p>
          <h2 className="question">{question.clue}</h2>
          <p className="instruction">Choose the correct answer.</p>

          <div className="options">
            {question.options.map((option, index) => {
              let stateClass = "";

              if (selected !== null && option === question.answer) {
                stateClass = "correct";
              } else if (selected === option) {
                stateClass = "incorrect";
              }

              return (
                <button
                  key={option}
                  type="button"
                  className={`option ${stateClass}`}
                  onClick={() => chooseAnswer(option)}
                  disabled={selected !== null}
                  aria-pressed={selected === option}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>

                  {selected !== null && option === question.answer && (
                    <span className="answer-mark" aria-label="Correct answer">
                      ✓
                    </span>
                  )}

                  {selected === option && !isCorrect && (
                    <span className="answer-mark" aria-label="Incorrect answer">
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div
              className={`feedback ${
                isCorrect ? "feedback-correct" : "feedback-incorrect"
              }`}
              role="status"
            >
              <strong>{isCorrect ? "Correct answer!" : "Not quite!"}</strong>
              <p>{question.fact}</p>
            </div>
          )}

          <div className="quiz-bottom">
            <span className="score-label">
              Score <strong>{score}</strong>
            </span>

            <button
              type="button"
              className="primary-button"
              onClick={nextQuestion}
              disabled={selected === null}
            >
              {current === questions.length - 1
                ? "See results"
                : "Next question"}
            </button>
          </div>
        </>
      )}

      <style>{`
        .quiz {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          padding: 30px;
          border: 1px solid #35353d;
          border-radius: 16px;
          background: #19191f;
          color: #f5f5f7;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
          font-size: 15px;
          -webkit-font-smoothing: antialiased;
        }

        .quiz *,
        .quiz *::before,
        .quiz *::after {
          box-sizing: border-box;
        }

        .quiz button { font: inherit; }

        .quiz button:focus-visible {
          outline: 3px solid #ffb16f;
          outline-offset: 3px;
        }

        .quiz-top, .quiz-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .quiz-label, .question-count, .question-label, .score-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
        }

        .quiz-label, .question-label { color: #ff9a50; }
        .question-count, .score-label { color: #b6b6c0; }

        .progress-track {
          height: 6px;
          margin-top: 18px;
          overflow: hidden;
          border-radius: 6px;
          background: #303039;
        }

        .progress-fill {
          height: 100%;
          border-radius: 6px;
          background: #ff8a35;
          transition: width 180ms ease;
        }

        .question-label { margin: 34px 0 12px; }

        .question {
          margin: 0;
          font-size: clamp(24px, 4vw, 32px);
          line-height: 1.35;
          letter-spacing: -0.7px;
          font-weight: 800;
        }

        .instruction {
          margin: 12px 0 22px;
          color: #b6b6c0;
          font-size: 15px;
          line-height: 1.6;
        }

        .options { display: grid; gap: 12px; }

        .option {
          display: flex;
          width: 100%;
          min-height: 56px;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border: 1px solid #41414a;
          border-radius: 10px;
          background: #202027;
          color: #f5f5f7;
          text-align: left;
          font-size: 15px !important;
          line-height: 1.5;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease;
        }

        .option:hover:not(:disabled) {
          border-color: #ff8a35;
          background: #29241f;
        }

        .option:disabled { cursor: default; }

        .option-letter {
          display: grid;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #50505a;
          border-radius: 8px;
          color: #d0d0d8;
          font-size: 13px;
          font-weight: 700;
        }

        .option-text { flex: 1; }

        .correct {
          border-color: #70c98a;
          background: #1c3024;
        }

        .correct .option-letter {
          border-color: #70c98a;
          color: #a8efbb;
        }

        .incorrect {
          border-color: #ed6868;
          background: #351f22;
        }

        .incorrect .option-letter {
          border-color: #ed6868;
          color: #ffaaaa;
        }

        .answer-mark {
          margin-left: auto;
          font-size: 18px;
          font-weight: 800;
        }

        .feedback {
          margin-top: 18px;
          padding: 16px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.7;
        }

        .feedback-correct { background: #1c3024; color: #a8efbb; }
        .feedback-incorrect { background: #351f22; color: #ffaaaa; }

        .feedback p {
          margin: 6px 0 0;
          color: #e3e3e8;
        }

        .quiz-bottom {
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid #35353d;
        }

        .score-label strong {
          margin-left: 7px;
          color: #fff;
          font-size: 17px;
        }

        .primary-button {
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          padding: 12px 22px;
          border: 0;
          border-radius: 9px;
          background: #ff8a35;
          color: #17130f;
          font-size: 14px !important;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .primary-button:hover:not(:disabled) { background: #ffa15b; }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .result {
          display: flex;
          min-height: 390px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .eyebrow {
          margin: 0;
          color: #ff9a50;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .result h2 {
          margin: 12px 0;
          font-size: 30px;
          letter-spacing: -0.7px;
        }

        .score {
          margin: 4px 0;
          color: #ff8a35;
          font-size: 56px;
          font-weight: 900;
          letter-spacing: -2px;
        }

        .score span { color: #a5a5af; font-size: 24px; }

        .result-text {
          margin: 8px 0 25px;
          color: #b6b6c0;
          font-size: 15px;
          line-height: 1.6;
        }

        @media (max-width: 500px) {
          .quiz { padding: 20px; }
          .quiz-label, .question-count { font-size: 11px; }
          .option { min-height: 54px; padding: 11px; }
          .primary-button { padding-right: 16px; padding-left: 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .quiz *, .quiz *::before, .quiz *::after {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
