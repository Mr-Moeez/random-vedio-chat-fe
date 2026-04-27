import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-3 py-2 transition dark:border-slate-700 dark:bg-slate-800"
    >
      <span
        className={`text-lg transition ${
          !isDark ? "text-yellow-500" : "text-slate-400"
        }`}
      >
        ☀️
      </span>

      <div className="relative h-6 w-12 rounded-full bg-slate-300 dark:bg-slate-700 transition">
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300
          ${isDark ? "translate-x-6" : "translate-x-1"}`}
        />
      </div>

      <span
        className={`text-lg transition ${
          isDark ? "text-purple-400" : "text-slate-400"
        }`}
      >
        🌙
      </span>
    </button>
  );
}

export default ThemeToggle;