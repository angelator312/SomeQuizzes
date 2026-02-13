"use client"
import { Link, useRouter } from "waku";
import ThemeSwitcher from "./ThemeSwitcher";

export const Header = () => {
  const { path, query } = useRouter();

  const isAdmin = path?.includes("/admin");
  if (isAdmin) return;
  return (
    <header className="flex items-center gap-4 p-6 lg:fixed lg:left-0 lg:top-0">
      <h2 className="text-lg font-bold tracking-tight">
        <Link to="/">Quizzer</Link>
      </h2>
      <div className="fixed top-4 right-4">
        <div className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};
