"use client";
import { Link } from "waku";
import { getID, quizzes } from "../quizes/all";

export default function HomePage() {
  // const data = await getData();

  return (
    <div>
      {quizzes.map((quiz) => {
        return (
          <Link to={encodeURI(`/${getID(quiz.title)}/`)}>
            {quiz.title}
          </Link>
        );
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
