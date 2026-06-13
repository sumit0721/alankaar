import { useState } from "react";
import { Link } from "react-router-dom";
import { generateSkinRoutine } from "../services/aiService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";

const QUESTIONS = [
  {
    id: "skinType",
    question: "What is your skin or hair type?",
    options: [
      { value: "oily-skin", label: "Oily Skin", icon: "💧" },
      { value: "dry-skin", label: "Dry Skin", icon: "🌵" },
      { value: "combination-skin", label: "Combination Skin", icon: "☯️" },
      { value: "sensitive-skin", label: "Sensitive Skin", icon: "🌸" },
      { value: "normal-skin", label: "Normal Skin", icon: "✨" },
      { value: "damaged-hair", label: "Damaged / Dry Hair", icon: "💇" },
      { value: "oily-hair", label: "Oily Hair", icon: "🧴" },
    ],
  },
  {
    id: "mainConcern",
    question: "What is your main concern?",
    options: [
      { value: "acne-and-breakouts", label: "Acne & Breakouts", icon: "🔴" },
      { value: "dullness-and-glow", label: "Dullness & Glow", icon: "⭐" },
      { value: "dark-spots", label: "Dark Spots", icon: "🟤" },
      { value: "dryness-and-hydration", label: "Dryness & Hydration", icon: "💦" },
      { value: "anti-aging", label: "Anti-Aging", icon: "⏳" },
      { value: "hair-fall", label: "Hair Fall", icon: "🧬" },
      { value: "dandruff", label: "Dandruff", icon: "❄️" },
      { value: "grooming", label: "Beard & Grooming", icon: "🧔" },
    ],
  },
  {
    id: "budget",
    question: "What is your budget per product?",
    options: [
      { value: "under-500", label: "Under ₹500", icon: "💚" },
      { value: "500-1000", label: "₹500 – ₹1000", icon: "💛" },
      { value: "1000-plus", label: "Above ₹1000", icon: "💜" },
    ],
  },
  {
    id: "routinePreference",
    question: "How much time do you want to spend on your routine?",
    options: [
      { value: "minimal-2-steps", label: "Minimal — 2 steps max", icon: "⚡" },
      { value: "balanced-3-4-steps", label: "Balanced — 3 to 4 steps", icon: "🎯" },
      { value: "complete-5-plus-steps", label: "Complete — 5+ steps", icon: "🌟" },
    ],
  },
  {
    id: "ageGroup",
    question: "What is your age group?",
    options: [
      { value: "teens-13-19", label: "Teens (13–19)", icon: "🌱" },
      { value: "twenties-20-29", label: "20s", icon: "🌿" },
      { value: "thirties-30-39", label: "30s", icon: "🌳" },
      { value: "forties-plus-40", label: "40+", icon: "🍂" },
    ],
  },
];

function SkinQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [error, setError] = useState("");

  const currentQuestion = QUESTIONS[currentStep];
  const totalSteps = QUESTIONS.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleSelect = async (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last question answered — call API to generate routine
      setLoading(true);
      setError("");
      try {
        const response = await generateSkinRoutine(newAnswers);
        setRoutine(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to generate your routine right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setRoutine(null);
    setError("");
  };

  // Loading state
  if (loading) {
    return (
      <section className="section-block">
        <div className="container quiz-loading">
          <div className="quiz-loading-icon">✨</div>
          <h2>Building your personalised routine...</h2>
          <p>
            Aanya is analysing your answers and selecting the best ALANKAAR
            products for you.
          </p>
          <Loader />
        </div>
      </section>
    );
  }

  // Results state
  if (routine) {
    return (
      <section className="section-block">
        <div className="container">
          <div className="routine-result">
            <div className="routine-result-header">
              <span className="eyebrow">Your Personalised Routine</span>
              <h1>Your ALANKAAR Routine</h1>
              <p className="routine-summary">{routine.summary}</p>
            </div>

            <div className="routine-schedules">
              {/* Morning Routine */}
              {routine.morning?.length > 0 && (
                <div className="routine-schedule">
                  <h2 className="routine-schedule-title">☀️ Morning Routine</h2>
                  <div className="routine-steps">
                    {routine.morning.map((step) => (
                      <div key={step.step} className="routine-step">
                        <div className="routine-step-number">{step.step}</div>
                        <div className="routine-step-content">
                          <div className="routine-step-header">
                            <a href={`/products/${step.productId}`} className="routine-product-link">
                              {step.productName}
                            </a>
                            <span className="routine-step-price">
                              {formatCurrency(step.price)}
                            </span>
                          </div>
                          <span className="routine-step-category">
                            {step.category}
                          </span>
                          <p className="routine-step-instruction">
                            {step.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evening Routine */}
              {routine.evening?.length > 0 && (
                <div className="routine-schedule">
                  <h2 className="routine-schedule-title">🌙 Evening Routine</h2>
                  <div className="routine-steps">
                    {routine.evening.map((step) => (
                      <div key={step.step} className="routine-step">
                        <div className="routine-step-number">{step.step}</div>
                        <div className="routine-step-content">
                          <div className="routine-step-header">
                            <a href={`/products/${step.productId}`} className="routine-product-link">
                              {step.productName}
                            </a>
                            <span className="routine-step-price">
                              {formatCurrency(step.price)}
                            </span>
                          </div>
                          <span className="routine-step-category">
                            {step.category}
                          </span>
                          <p className="routine-step-instruction">
                            {step.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pro tip */}
            {routine.tip && (
              <div className="routine-tip">
                <span className="routine-tip-icon">💡</span>
                <div>
                  <strong>Pro Tip</strong>
                  <p>{routine.tip}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="routine-actions">
              <Link to="/products" className="primary-button">
                Shop These Products
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={handleRestart}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Quiz state
  return (
    <section className="section-block">
      <div className="container quiz-container">
        {/* Progress bar */}
        <div className="quiz-progress-bar" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={totalSteps}>
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="quiz-progress-label">
          {currentStep + 1} of {totalSteps}
        </p>

        {/* Question card */}
        <div className="quiz-question-card">
          <span className="eyebrow">Skin &amp; Beauty Quiz</span>
          <h2>{currentQuestion.question}</h2>

          <div className="quiz-options">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                id={`quiz-option-${option.value}`}
                className={`quiz-option ${answers[currentQuestion.id] === option.value ? "selected" : ""}`}
                onClick={() => handleSelect(currentQuestion.id, option.value)}
              >
                <span className="quiz-option-icon">{option.icon}</span>
                <span className="quiz-option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back button */}
        {currentStep > 0 && (
          <button
            type="button"
            id="quiz-back-btn"
            className="secondary-button quiz-back-btn"
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            ← Back
          </button>
        )}

        {error && <p className="status-message error-message">{error}</p>}
      </div>
    </section>
  );
}

export default SkinQuizPage;
