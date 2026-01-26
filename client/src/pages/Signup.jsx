// src/pages/Signup.jsx
import { useState } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", empId: "", mobile: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sanitizeEmpId = (u) => {
    if (!u) return "";
    return u.toString().trim().replace(/\s+/g, "_");
  };

  const getSiteIdOrDefault = () => {
    const fromStorage = localStorage.getItem("siteId");
    return fromStorage;
  };

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const siteId = getSiteIdOrDefault();
      const sanitizedEmpId = sanitizeEmpId(form.empId || "");

      if (!form.empId || !form.password || !form.email) {
        setMessage("Please fill all the fields.");
        setLoading(false);
        return;
      }

      // 1) Check signedinuser first (your requirement)
      const signedPath = `${siteId}/signedinuser/${sanitizedEmpId}`;
      const signedRef = ref(db, signedPath);
      const signedSnap = await get(signedRef);

      console.log("DEBUG: signup checking signedinuser path:", signedPath, "exists:", signedSnap.exists());

      if (signedSnap.exists()) {
        setMessage("You are already signed in.");
        setLoading(false);
        return;
      }

      // 2) If not signedinuser, check users path
      const usersPath = `${siteId}/Users/${sanitizedEmpId}`;
      const usersRefChild = ref(db, usersPath);
      const usersSnap = await get(usersRefChild);

      console.log("DEBUG: signup checking users path:", usersPath, "exists:", usersSnap.exists());

      if (!usersSnap.exists()) {
        // user not present in canonical users -> do not allow signup
        setMessage("Unit not found in users. Please contact admin.");
        setLoading(false);
        return;
      }

      // 3) Create signedinuser record (only)
      const payload = {
        email: (form.email || "").toString().trim(),
        Emp_Id: form.empId,
        empId: form.empId,
        name: form.name || "",
        mobile: form.mobile || "",
        password: (form.password || "").toString().trim(),
        createdAt: new Date().toISOString(),
      };

      await set(signedRef, payload);

      // Success
      setMessage("Signup successful");
      setLoading(false);
      // set local session flags
      localStorage.setItem("siteId", siteId);
      localStorage.setItem("empId", form.empId);
      localStorage.setItem(`isLoggedIn_${siteId}`, "true");
      // navigate to login or dashboard as you prefer
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setMessage(err.message || "Signup failed.");
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <header className="signup-header">
        <img
          src="https://keyahomes.co.in/forms/static/media/keya_homes_logo.ae8e4b7c7c37a705231c.webp"
          alt="Keya Homes Logo"
          className="signup-logo"
        />
      </header>

      <main className="signup-main">
        <form onSubmit={handleSubmit} className="signup-form-container">
          <h1 className="signup-title">Sign Up</h1>

          <input className="signup-input" name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input className="signup-input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input className="signup-input" name="empId" placeholder="Employee Id" value={form.empId} onChange={handleChange} />
          <input className="signup-input" name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} />
          <input className="signup-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

          <button className="signup-submit-button" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div className="signup-login-section">
            <span className="signup-login-text">Already signed in? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="signup-login-button"
            >
              Login
            </button>
          </div>

          {message && <p className="signup-message">{message}</p>}
        </form>
      </main>
    </div>
  );
}

export default SignUp;
