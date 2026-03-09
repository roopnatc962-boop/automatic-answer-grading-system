import React, { useEffect, useState } from "react";

const initialQuestion = {
  title: "",
  question_text: "",
  model_answer: "",
  marking_scheme:
    "- Award marks for each correctly explained key concept.\n- Allow partial credit where the student shows understanding but lacks terminology.\n- Deduct marks for incorrect facts, missing reasoning, and poor structure.",
  total_marks: 10
};

function TeacherPortal() {
  const [question, setQuestion] = useState(initialQuestion);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...question,
          total_marks: Number(question.total_marks) || 10
        })
      });
      if (!res.ok) throw new Error("Failed to create question");
      setQuestion(initialQuestion);
      setSuccess("Question saved successfully.");
      await fetchQuestions();
    } catch (e) {
      setError(e.message || "Failed to save question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr,1.4fr] gap-6">
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">Create Question</h2>
          {loading && (
            <span className="text-xs text-amber-300 animate-pulse">
              Saving...
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Define the reference question, model answer, and marking scheme. Students
          will submit against these questions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              name="title"
              value={question.title}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Photosynthesis - short descriptive answer"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Question
            </label>
            <textarea
              name="question_text"
              value={question.question_text}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Explain the process of photosynthesis in 200–300 words."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Model / Reference Answer
            </label>
            <textarea
              name="model_answer"
              value={question.model_answer}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Provide a high-quality reference answer..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Marking Scheme
            </label>
            <textarea
              name="marking_scheme"
              value={question.marking_scheme}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Include key concepts, weighting, and how partial credit should be
              handled.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                name="total_marks"
                value={question.total_marks}
                onChange={handleChange}
                min={1}
                className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-medium text-white shadow-md shadow-brand-900/40 disabled:opacity-60"
            >
              Save Question
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-3 py-2">
            {success}
          </p>
        )}
      </section>

      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Existing Questions
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Students will select from these questions in the student portal.
        </p>
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {questions.length === 0 && (
            <p className="text-xs text-slate-500">
              No questions yet. Create one on the left to get started.
            </p>
          )}
          {questions.map((q) => (
            <article
              key={q.id}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-slate-100 truncate">
                  {q.title}
                </h4>
                <span className="text-[10px] text-slate-400 border border-slate-700 rounded-full px-2 py-0.5">
                  {q.total_marks} marks
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {q.question_text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TeacherPortal;

