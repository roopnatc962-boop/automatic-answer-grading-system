import React, { useEffect, useState } from "react";
import InsightPanel from "./InsightPanel";

function StudentPortal() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      setQuestions(data);
      if (data.length && !selectedQuestionId) {
        setSelectedQuestionId(String(data[0].id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-answer", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Failed to extract text from file");
      const data = await res.json();
      setAnswerText((prev) =>
        prev ? `${prev}\n\n${data.extracted_text}` : data.extracted_text
      );
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!selectedQuestionId) {
      setError("Please choose a question first.");
      return;
    }
    const question = questions.find(
      (q) => String(q.id) === String(selectedQuestionId)
    );
    if (!question) {
      setError("Selected question is not available.");
      return;
    }
    setGrading(true);
    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question_text,
          model_answer: question.model_answer,
          student_answer: answerText,
          marking_scheme: question.marking_scheme,
          total_marks: question.total_marks,
          student_name: studentName || null,
          question_id: question.id
        })
      });
      if (!res.ok) throw new Error("Grading failed. Please try again.");
      const data = await res.json();
      setResult({
        ...data,
        question,
        student_answer: answerText
      });
    } catch (e) {
      setError(e.message || "Failed to grade answer.");
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1.3fr,1.2fr] gap-6">
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">Student Portal</h2>
          {grading && (
            <span className="text-xs text-amber-300 animate-pulse">
              Grading in progress...
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Choose your question, type your answer, or upload a PDF/image. The AI
          will grade your response and show a transparent deduction map.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Name (optional)
              </label>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Question
              </label>
              <select
                value={selectedQuestionId}
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.total_marks} marks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedQuestionId && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 max-h-32 overflow-y-auto">
              {questions.find((q) => String(q.id) === String(selectedQuestionId))
                ?.question_text || "Question text will appear here"}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Answer
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={7}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Type your answer here, or upload a PDF/image below to extract text..."
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Upload PDF / Image
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleUpload}
                className="text-xs text-slate-300"
              />
              {uploading && (
                <p className="text-[11px] text-amber-300 mt-1 animate-pulse">
                  Extracting text with OCR...
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={grading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-medium text-white shadow-md shadow-brand-900/40 disabled:opacity-60"
            >
              Submit for Grading
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </section>

      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Grading Insights
        </h3>
        {!result && (
          <p className="text-xs text-slate-400">
            Submit your answer to see your score, percentage, deduction map, and
            detailed feedback here.
          </p>
        )}
        {result && <InsightPanel result={result} />}
      </section>
    </div>
  );
}

export default StudentPortal;

