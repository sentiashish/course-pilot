import { Moon, Sun } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-navbar">
      <div className="navbar-copy">
        <p className="navbar-subtitle">Welcome back</p>
        <div className="navbar-title-row">
          <h1 className="navbar-title">{user?.name || "Learner"}</h1>
          <span className="user-pill">CoursePilot</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="icon-btn"
          aria-label="Toggle theme"
          aria-pressed={darkMode}
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
