import React from "react";

const CustomQuestionsSection = ({
  questions,
  answers,
  onChange,
  fieldErrors,
}) => {
  if (!questions?.length) return null;

  const setAnswer = (id, value) => {
    onChange({ ...answers, [id]: value });
  };

  return (
    <div className="form-section">
      <h3>Additional Questions</h3>
      {questions
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((q) => (
          <div key={q.id} className="form-group mb-4">
            <label>
              {q.label}
              {q.required ? " *" : ""}
            </label>
            {q.type === "textarea" ? (
              <textarea
                rows={3}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={fieldErrors[`custom_${q.id}`] ? "input-error" : ""}
              />
            ) : q.type === "dropdown" ? (
              <select
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={fieldErrors[`custom_${q.id}`] ? "input-error" : ""}
              >
                <option value="">Select...</option>
                {(q.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : q.type === "radio" ? (
              <div className="space-y-2 mt-2">
                {(q.options || []).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="radio"
                      name={`custom_${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : q.type === "checkbox" ? (
              <label className="flex items-center gap-2 mt-2 text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={answers[q.id] === true || answers[q.id] === "true"}
                  onChange={(e) => setAnswer(q.id, e.target.checked)}
                />
                Yes
              </label>
            ) : (
              <input
                type={q.type === "number" ? "number" : q.type === "date" ? "date" : "text"}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={fieldErrors[`custom_${q.id}`] ? "input-error" : ""}
              />
            )}
            {fieldErrors[`custom_${q.id}`] && (
              <span className="field-error">{fieldErrors[`custom_${q.id}`]}</span>
            )}
          </div>
        ))}
    </div>
  );
};

export default CustomQuestionsSection;
