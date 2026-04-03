import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { validateEmail, validatePassword, validateName } from "../utils/validation";
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
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const passwordValidation = validatePassword(password);
  const passwordStrengthClass = passwordValidation.strength;

  const validateField = (fieldName, value) => {
    let error = "";
    if (fieldName === "name") {
      const validation = validateName(value);
      error = validation.message;
    } else if (fieldName === "email") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!validateEmail(value)) {
        error = "Enter a valid email address";
      }
    } else if (fieldName === "password") {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        error = validation.feedback;
      }
    }
    return error;
  };

  const handleNameChange = (value) => {
    setName(value);
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateField("name", value) }));
    }
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
    if (field === "name") {
      setErrors((prev) => ({ ...prev, name: validateField("name", name) }));
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateField("email", email) }));
    } else if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validateField("password", password) }));
    }
  };

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
              onChange={(event) => handleNameChange(event.target.value)}
              onBlur={() => handleBlur("name")}
              className={touched.name && errors.name ? "error" : ""}
              required
              minLength={2}
              autoComplete="name"
            />
            {touched.name && errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
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
            <div className="field-header">
              <label htmlFor="register-password">Password</label>
              {password && (
                <span className={`password-strength ${passwordStrengthClass}`}>
                  {passwordStrengthClass === "strong" && "Strong"}
                  {passwordStrengthClass === "good" && "Good"}
                  {passwordStrengthClass === "fair" && "Fair"}
                  {passwordStrengthClass === "weak" && "Weak"}
                </span>
              )}
            </div>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              onBlur={() => handleBlur("password")}
              className={touched.password && errors.password ? "error" : ""}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {password && !passwordValidation.isValid && touched.password && (
              <p className="field-error">{passwordValidation.feedback}</p>
            )}
            {password && passwordValidation.isValid && (
              <p className="field-hint">✓ {passwordValidation.feedback}</p>
            )}
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting || Object.values(errors).some((e) => e)}>
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
