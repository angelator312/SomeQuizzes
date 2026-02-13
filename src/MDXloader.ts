// Dynamically import all .mdx files from the quizes directory
const quizModules = import.meta.glob("./quizes/*.mdx", { eager: true });

const splitter = "!!!!!!!";

export function getID(a: string) {
  return a.split(" ").join(splitter);
}

export function getName(a: string) {
  return a.split(splitter).join(" ");
}

// Create the quizzes array by extracting the default export and inferring titles from filenames
export const quizzes: { f: Function; title: string }[] = Object.entries(quizModules).map(([filePath, module]) => {
  // Extract filename without extension and path to use as title
  const fileName = filePath.split('/').pop()?.replace('.mdx', '') || '';
  // Convert camelCase/pascalCase to title case for display
  const title = fileName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  return {
    f: module.default,
    title: title
  };
});
