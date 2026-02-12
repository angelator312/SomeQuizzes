import OnotationQuiz from "../quizes/ONotation.mdx";
import Quiz2 from "../quizes/Quiz2.mdx";

const splitter = "!!!!!!!";

export function getID(a: string) {
  return a.split(" ").join(splitter);
}
export function getName(a: string) {
  return a.split(splitter).join(" ");
}

export const quizzes: { f: Function; title: string }[] = [
  { f: OnotationQuiz, title: "O Notaion" },
  { f: Quiz2, title: "Test" },
];
