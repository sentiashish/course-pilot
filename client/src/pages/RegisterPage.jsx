import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import api from "../services/api";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Unable to sign up right now. Please try again.";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Creating account...");

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      login(response.data.data);
      toast.dismiss(toastId);
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (nextError) {
      toast.dismiss(toastId);
      toast.error(getErrorMessage(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">CP</span>
          <div>
            <p className="auth-kicker">CoursePilot</p>
            <h1>Create account</h1>
          </div>
        </div>
        <p className="auth-subtitle">Start tracking your course playlists with a cleaner, faster dashboard.</p>

        <div className="auth-notes">
          <div>
            <strong>Build a plan</strong>
            <p>Import a playlist, set your study pace, and follow the next best step.</p>
          </div>
          <div>
            <strong>Keep momentum</strong>
            <p>Watch completion, pace, and prediction signals update in real time.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
