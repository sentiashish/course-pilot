import { Moon, Sun } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-navbar">
      <div>
        <p className="navbar-subtitle">Welcome back</p>
        <h1 className="navbar-title">{user?.name || "Learner"}</h1>
      </div>
      <div className="navbar-actions">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="icon-btn"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" onClick={logout} className="btn btn-primary">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
