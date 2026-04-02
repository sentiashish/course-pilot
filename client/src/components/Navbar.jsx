import { Moon, Sun } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          {user?.name || "Learner"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
