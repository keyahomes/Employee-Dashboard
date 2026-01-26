// src/pages/Login.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", empId: "", password: "" });
  const [message, setMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const sanitizeEmpid = (u) => {
    if (!u) return "";
    return u.toString().trim().replace(/\s+/g, "_");
  };

  const getSiteIdOrDefault = () => {
    const fromStorage = localStorage.getItem("siteId");
    return fromStorage;
  };

  // normalize helper for passwords and emails
  const normalizePwd = (s) =>
    (s || "")
      .toString()
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width/BOM
      .normalize("NFKC")
      .trim();

  const normalizeEmail = (s) => (s || "").toString().trim().toLowerCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const siteId = getSiteIdOrDefault();
      const empIdRaw = (form.empId || "").toString().trim();
      const passwordRawInput = (form.password || "").toString();
      const emailRawInput = (form.email || "").toString().trim();

      // Require all three fields
      if (!empIdRaw || !passwordRawInput || !emailRawInput || !siteId) {
        setMessage("All fields are required.");
        setLoading(false);
        return;
      }

      const sanitizedEmpId = sanitizeEmpid(empIdRaw);

      // 1) Check signedinuser exists first
      const signedRef = ref(db, `${siteId}/signedinuser/${sanitizedEmpId}`);
      const signedSnap = await get(signedRef);

      if (!signedSnap.exists()) {
        setMessage("You are not registered. Please signup first.");
        setLoading(false);
        return;
      }

      const signedData = signedSnap.val();

      // 2) Fetch authoritative user data from users path
      const usersRefChild = ref(db, `${siteId}/Users/${sanitizedEmpId}`);
      const usersSnap = await get(usersRefChild);

      if (!usersSnap.exists()) {
        setMessage("User record not found. Please contact admin.");
        setLoading(false);
        return;
      }

      const userData = usersSnap.val();

      // 3) Email must match /users/{unit}.Email (case-insensitive)
      const storedEmail = normalizeEmail(userData.Email_Id || userData.email || userData.EmailID || userData.Email || "");
      const enteredEmail = normalizeEmail(emailRawInput);

      if (!storedEmail || storedEmail !== enteredEmail) {
        setMessage("Email does not match records.");
        setLoading(false);
        return;
      }

      // 4) Password must match /signedinuser/{unit}.password
      const storedRawFromSigned = (signedData.password || "").toString();

      // normalize both
      const storedPassword = normalizePwd(storedRawFromSigned);
      const enteredPassword = normalizePwd(passwordRawInput);

      if (!storedPassword || storedPassword !== enteredPassword) {
        setMessage("Invalid password.");
        setLoading(false);
        return;
      }

      // Success: set local session flags
      localStorage.setItem("email", enteredEmail);
      localStorage.setItem("empId", empIdRaw);
      localStorage.setItem("siteId", siteId);
      localStorage.setItem(`isLoggedIn_${siteId}`, "true");

      setMessage("Login successful.");
      setLoading(false);

      // Navigate to project home
      switch (siteId) {
        case "OFFICE":
          navigate("/officehome");
          break;
        case "SALES":
          navigate("/saleshome");
          break;
        case "ENGINEERS":
          navigate("/engineershome");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Login failed.");
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setMessage("");
    if (!form.email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === "auth/user-not-found") setMessage("No user found with that email.");
      else setMessage("Failed to send reset email.");
    }
  };

  return (
    <div className="login-wrapper">
      <header className="login-header">
        <img src="https://keyahomes.co.in/forms/static/media/keya_homes_logo.ae8e4b7c7c37a705231c.webp" alt="Keya Homes Logo" className="login-logo" />
      </header>

      <main className="login-main">
        <form onSubmit={handleLogin} className="login-form-container">
          <h1 className="login-title">Login / Register</h1>

          <input 
            className="login-input" 
            name="empId" 
            placeholder="Employee Id" 
            value={form.empId} 
            onChange={handleChange} 
            required 
          />

          <input 
            className="login-input" 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />

          <input 
            className="login-input" 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />

          <div className="login-button-group"> 
            <button className="login-submit-button" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <button type="button" className="login-signup-button" onClick={() => navigate("/signup")}>
              Sign up
            </button>
          </div>

          <div className="login-forgot-section">
            <button type="button" onClick={handleForgot} className="login-forgot-button">
              Forgot password?
            </button>
          </div>

          {message && <p className="login-message">{message}</p>}
          {resetSent && <p className="login-success-message">Reset email sent.</p>}
        </form>
      </main>
    </div>
  );
}

export default Login;
