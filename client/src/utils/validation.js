export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    strength: getPasswordStrength(password),
    feedback: getPasswordFeedback(password),
  };
};

const getPasswordStrength = (password) => {
  if (password.length === 0) return "none";
  if (password.length < 8) return "weak";
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (password.length >= 12) score++;
  
  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  if (score <= 3) return "good";
  return "strong";
};

const getPasswordFeedback = (password) => {
  if (password.length === 0) return "";
  if (password.length < 8) return `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`;
  return "Password is secure";
};

export const validatePlaylistUrl = (url) => {
  if (!url.trim()) return { isValid: false, message: "Playlist URL is required" };
  
  try {
    const parsed = new URL(url);
    const listId = parsed.searchParams.get("list");
    
    if (!listId) {
      return { isValid: false, message: "URL must contain a valid playlist ID" };
    }
    
    return { isValid: true, message: "" };
  } catch {
    return { isValid: false, message: "Enter a valid YouTube URL" };
  }
};

export const validateName = (name) => {
  const trimmed = name.trim();
  if (!trimmed) return { isValid: false, message: "Name is required" };
  if (trimmed.length < 2) return { isValid: false, message: "Name must be at least 2 characters" };
  if (trimmed.length > 50) return { isValid: false, message: "Name must be less than 50 characters" };
  return { isValid: true, message: "" };
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Enter a valid email address";
  }
  
  if (!password) {
    errors.password = "Password is required";
  }
  
  return errors;
};

export const validateRegisterForm = (name, email, password) => {
  const errors = {};
  
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Enter a valid email address";
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.feedback;
  }
  
  return errors;
};
