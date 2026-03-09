import React from "react";

function InsightPanel({ result }) {
  const {
    score,
    percentage,
    deduction_map = [],
    missing_points = [],
    strong_points = [],
    overall_feedback,
    question,
    student_answer
  } = result;

  const strongSentences = new Set(
    (strong_points || [])
      .flatMap((p) => p.split(/[.!?]/))
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const weakSentences = new Set(
    (missing_points || [])
      .flatMap((p) => p.split(/[.!?]/))
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const highlightAnswer = (text) => {
    const segments = text.split(/([.!?])/);
    const chunks = [];

    for (let i = 0; i < segments.length; i += 2) {
      const sentence = (segments[i] || "").trim();
      const punct = segments[i + 1] || "";
      if (!sentence) continue;

      const full = sentence + punct;
      let cls = "";
      if (strongSentences.has(sentence)) cls = "bg-emerald-500/15";
      else if (weakSentences.has(sentence)) cls = "bg-rose-500/10";

      chunks.push(
        <span key={i} className={cls ? `${cls} rounded-sm` : undefined}>
          {full + " "}
        </span>
      );
    }
    return chunks;
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
            Score
          </p>
          <p className="text-2xl font-semibold text-slate-50">
            {score.toFixed(2)}
            {question ? (
              <span className="text-sm text-slate-400">
                {" "}
                / {question.total_marks}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
            Percentage
          </p>
          <p className="text-2xl font-semibold text-emerald-400">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[11px] font-medium text-emerald-300 mb-1">
            Strong Points
          </p>
          {strong_points.length === 0 && (
            <p className="text-[11px] text-slate-500">
              No strong points identified yet.
            </p>
          )}
          <ul className="space-y-1.5">
            {strong_points.map((p, i) => (
              <li
                key={i}
                className="text-[11px] text-emerald-200/90 leading-snug"
              >
                • {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[11px] font-medium text-rose-300 mb-1">
            Missing / Weak Points
          </p>
          {missing_points.length === 0 && (
            <p className="text-[11px] text-slate-500">
              No missing points highlighted.
            </p>
          )}
          <ul className="space-y-1.5">
            {missing_points.map((p, i) => (
              <li
                key={i}
                className="text-[11px] text-rose-200/90 leading-snug"
              >
                • {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <p className="text-[11px] font-medium text-slate-200 mb-2">
          Deduction Map
        </p>
        {deduction_map.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No deductions recorded. You might have full marks!
          </p>
        )}
        <ul className="space-y-1.5">
          {deduction_map.map((d, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 text-[11px] text-slate-200"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-100">{d.category}</p>
                <p className="text-slate-400 leading-snug">{d.reason}</p>
              </div>
              <span className="shrink-0 text-rose-300 font-semibold">
                -{d.marks_deducted}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[11px] font-medium text-slate-200 mb-1">
            Model Answer (Teacher)
          </p>
          <div className="text-[11px] text-slate-300 leading-snug max-h-40 overflow-y-auto">
            {question?.model_answer || "Model answer will appear here."}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[11px] font-medium text-slate-200 mb-1">
            Your Answer (Highlighted)
          </p>
          <div className="text-[11px] text-slate-300 leading-snug max-h-40 overflow-y-auto">
            {highlightAnswer(student_answer || "")}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/40" /> Strong
              sentence
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-rose-500/40" /> Weak /
              missing sentence
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <p className="text-[11px] font-medium text-slate-200 mb-1">
          Overall Feedback
        </p>
        <p className="text-[11px] text-slate-300 leading-snug">
          {overall_feedback || "Detailed feedback from the AI examiner will appear here."}
        </p>
      </div>
    </div>
  );
}

export default InsightPanel;

