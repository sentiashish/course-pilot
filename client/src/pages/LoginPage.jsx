import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { validateEmail } from "../utils/validation";
import api from "../services/api";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Unable to login right now. Please try again.";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const from = location.state?.from?.pathname || "/dashboard";

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!validateEmail(value)) {
        error = "Enter a valid email address";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      }
    }
    return error;
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateField("email", value) }));
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField("password", value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateField("email", email) }));
    } else if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validateField("password", password) }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Signing in...");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.data);
      toast.dismiss(toastId);
      toast.success("Login successful!");
      navigate(from, { replace: true });
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
            <h1>Welcome back</h1>
          </div>
        </div>
        <p className="auth-subtitle">Login to continue your study plan and keep your progress in view.</p>

        <div className="auth-notes">
          <div>
            <strong>Track faster</strong>
            <p>Monitor playlists, pace, and completion at a glance.</p>
          </div>
          <div>
            <strong>Stay focused</strong>
            <p>Keep the next lesson, the total load, and your streak visible.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              onBlur={() => handleBlur("email")}
              className={touched.email && errors.email ? "error" : ""}
              required
              autoComplete="email"
            />
            {touched.email && errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              onBlur={() => handleBlur("password")}
              className={touched.password && errors.password ? "error" : ""}
              required
              autoComplete="current-password"
            />
            {touched.password && errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting || Object.values(errors).some((e) => e)}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          New here? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
