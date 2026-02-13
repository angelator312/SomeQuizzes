"use client";
import { Link } from "waku";
import { Counter } from "../components/counter";
import Quiz from "../components/Quiz";
import Markdown, { Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you
import React, { JSX, ReactNode, useState, useEffect } from "react";
import { quizzes } from "../MDXloader";

export default function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // const data = await getData();

  // Check URL hash on initial load to open specific quiz
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove '#' from hash
    if (hash) {
      // Find quiz index by title (decode the hash back to title)
      const decodedTitle = decodeURIComponent(hash.replace(/_/g, ' '));
      const quizIndex = quizzes.findIndex(quiz => quiz.title.toLowerCase() === decodedTitle.toLowerCase());

      if (quizIndex !== -1) {
        setSelectedIndex(quizIndex);
      }
    }
  }, []);

  const selectedQuiz = selectedIndex !== null ? quizzes[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8 text-slate-900">Quizzes</h1>

        {!selectedQuiz ? (
          <div className="grid gap-3">
            <p className="text-slate-600 mb-4">Select a quiz to begin:</p>
            {quizzes.map((quiz, index) => (
              <button
                key={index}
                onClick={() => {
                  // Update URL hash when quiz is selected
                  window.location.hash = quiz.title.toLowerCase().replace(/\s+/g, '_');
                  setSelectedIndex(index);
                }}
                className="w-full p-4 text-left bg-white rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <h2 className="text-xl font-semibold text-slate-900">{quiz.title}</h2>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                // Clear URL hash when going back to quiz selection
                window.location.hash = '';
                setSelectedIndex(null);
              }}
              className="mb-6 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
            >
              ← Back to quiz selection
            </button>
            {(() => {
              const Component = selectedQuiz.f as React.FC;
              return <Component components={{ Quiz }} />;
            })()}
          </div>
        )}
      </div>
      {/*<title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>*/}
      {/*<Counter />*/}
      {/*<Link to="/about" className="mt-4 inline-block underline">
        About page
      </Link>*/}
    </div>
  );
}

// const getData = async () => {
//   const data = {
//     title: "Waku",
//     headline: "Waku",
//     body: "Hello world!",
//   };

//   return data;
// };

// export const getConfig = async () => {
//   return {
//     render: "static",
//   } as const;
// };
