import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark">CP</span>
            <div>
              <p className="auth-kicker">CoursePilot</p>
              <h1>Loading session...</h1>
            </div>
          </div>
          <p className="auth-subtitle">Restoring your study workspace and saved progress.</p>
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
