import React, { useEffect, useState } from "react";

function SubmissionsDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (e) {
      setError(e.message || "Could not fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-50">
          Results Dashboard
        </h2>
        <button
          onClick={fetchSubmissions}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 border border-slate-700"
        >
          Refresh
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        View all graded submissions across questions, including scores and
        timestamps.
      </p>

      {loading && (
        <p className="text-xs text-amber-300 mb-2 animate-pulse">
          Loading submissions...
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-xs text-left bg-slate-950/60">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-3 py-2 border-b border-slate-800">Student</th>
              <th className="px-3 py-2 border-b border-slate-800">
                Question ID
              </th>
              <th className="px-3 py-2 border-b border-slate-800">Score</th>
              <th className="px-3 py-2 border-b border-slate-800">Created</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No submissions yet. Once students submit answers, they will
                  appear here.
                </td>
              </tr>
            )}
            {submissions.map((s) => (
              <tr
                key={s.id}
                className="border-b border-slate-900/60 hover:bg-slate-900/60"
              >
                <td className="px-3 py-2 text-slate-100">
                  {s.student_name || <span className="text-slate-500">Anonymous</span>}
                </td>
                <td className="px-3 py-2 text-slate-300">{s.question_id}</td>
                <td className="px-3 py-2 text-emerald-300 font-semibold">
                  {s.score ?? "-"}
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {s.created_at
                    ? new Date(s.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubmissionsDashboard;

