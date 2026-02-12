"use client";
import { Link } from "waku";
import { Counter } from "../components/counter";
import Quiz from "../components/Quiz";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Example from "../quizes/ONotation.mdx";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you

/** @type {MDXComponents} */
const components = {
  Quiz,
};

export default function HomePage() {
  // const data = await getData();

  return (
    <div>
      <Example components={components} />
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
