"use client";
import { Link } from "waku";
import { Counter } from "../components/counter";
import Quiz from "../components/Quiz";
import Markdown, { Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import OnotationQuiz from "../quizes/ONotation.mdx";
import Quiz2 from "../quizes/Quiz2.mdx";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you
import React, { JSX, ReactNode } from "react";

const quizzes: { f: Function }[] = [
  { f: OnotationQuiz },
  { f: Quiz2 },
];
export default function HomePage() {
  // const data = await getData();

  return (
    <div>
      {quizzes.map((quiz) => {
        const Component = quiz.f as React.FC;
        return <Component components={{ Quiz }} />;
      })}
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
