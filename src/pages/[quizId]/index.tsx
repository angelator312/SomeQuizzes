// "use client";
import React, { JSX, ReactNode } from "react";
import { getName, quizzes } from "../../quizes/all";
import { PageProps } from "waku/router";

export default function RenderPage({ quizId }: PageProps<"/[quizId]/render">) {
  // const data = await getData();
  const quizName = getName(quizId);
  const e = quizzes.find((e) => e.title == quizName);
  if (!e) return;
  const Component = e.f as React.FC;
  return (
    <Component
      // components={{
      //   Quiz: Quiz,
      //   QuizAnswer: Quiz.Answer,
      //   QuizExplanation: Quiz.Explanation,
      //   QuizQuestion: Quiz.Question,
      // }}
    />
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

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
