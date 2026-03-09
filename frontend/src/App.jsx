import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import SubmissionsDashboard from "./components/SubmissionsDashboard";

const navLinkBase =
  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div>
              <p className="font-semibold text-slate-100">
                Answer Valuation &amp; Grading
              </p>
              <p className="text-xs text-slate-400">
                Automated, transparent grading for teachers &amp; students
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink
              to="/teacher"
              className={({ isActive }) =>
                `${navLinkBase} ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/80"
                }`
              }
            >
              Teacher Portal
            </NavLink>
            <NavLink
              to="/student"
              className={({ isActive }) =>
                `${navLinkBase} ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/80"
                }`
              }
            >
              Student Portal
            </NavLink>
            <NavLink
              to="/submissions"
              className={({ isActive }) =>
                `${navLinkBase} ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/80"
                }`
              }
            >
              Results Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/submissions" element={<SubmissionsDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

