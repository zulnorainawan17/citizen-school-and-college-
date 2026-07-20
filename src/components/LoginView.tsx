import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers,
  GraduationCap,
} from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (role: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent") => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const [selectedRole, setSelectedRole] = useState<
    "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent"
  >("Super Admin");

  const [emailInput, setEmailInput] = useState("admin@beaconhill.edu");
  const [usernameInput, setUsernameInput] = useState("admin_erp");
  const [passwordInput, setPasswordInput] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  // Captcha generation
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // Forgot password & OTP states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaInput("");
    setCaptchaError("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify Captcha
    const correctAnswer = captchaNum1 + captchaNum2;
    if (parseInt(captchaInput) !== correctAnswer) {
      setCaptchaError("Incorrect CAPTCHA solution. Please try again.");
      generateCaptcha();
      return;
    }

    // Role credentials guide auto-fills to save time but allows testing
    onLoginSuccess(selectedRole);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setOtpSent(true);
    setForgotMessage("An 6-digit OTP code has been dispatched to your address.");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === "123456" || otpInput.length === 6) {
      setForgotMessage("Credentials updated successfully. Please login with your new password.");
      setTimeout(() => {
        setShowForgotModal(false);
        setOtpSent(false);
        setForgotEmail("");
        setOtpInput("");
        setNewPassword("");
        setForgotMessage("");
      }, 2500);
    } else {
      setForgotMessage("Invalid OTP code. For test, you can enter '123456'.");
    }
  };

  // Helper helper to update login defaults when role changes
  const handleRoleChange = (role: typeof selectedRole) => {
    setSelectedRole(role);
    if (role === "Super Admin" || role === "Principal") {
      setEmailInput("admin@beaconhill.edu");
      setUsernameInput("admin_erp");
    } else if (role === "Teacher") {
      setEmailInput("kamran.malik@beaconhill.edu");
      setUsernameInput("tch_kamran");
    } else if (role === "Accountant") {
      setEmailInput("accountant@beaconhill.edu");
      setUsernameInput("acc_manager");
    } else if (role === "Student") {
      setEmailInput("m.rehman@email.com");
      setUsernameInput("stu_aisha");
    } else {
      setEmailInput("guardian@email.com");
      setUsernameInput("guardian_rehman");
    }
  };

  return (
    <div
      id="login-page-root"
      className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
        {/* Brand / Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            School ERP Login Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access secure records, online classes, and analytical tool suites.
          </p>
        </div>

        {/* Info Banner for Test Access */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-blue-800 leading-normal">
            <strong>Portal Demo Tip:</strong> Select your desired portal role below. Credentials are automatically
            filled for your testing convenience.
          </div>
        </div>

        <form className="mt-4 space-y-5" onSubmit={handleLoginSubmit}>
          {/* Role Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" /> Choose Portal Role
            </label>
            <select
              id="login-role-select"
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="Super Admin">Super Admin Portal</option>
              <option value="Principal">Principal Dashboard</option>
              <option value="Teacher">Teacher Panel</option>
              <option value="Accountant">Accountant Desk</option>
              <option value="Student">Student Portal</option>
              <option value="Parent">Parent Dashboard</option>
            </select>
          </div>

          {/* Login Type Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              id="login-tab-email"
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 text-center py-2 text-xs font-semibold border-b-2 transition ${
                loginMethod === "email"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Email Address
            </button>
            <button
              id="login-tab-username"
              type="button"
              onClick={() => setLoginMethod("username")}
              className={`flex-1 text-center py-2 text-xs font-semibold border-b-2 transition ${
                loginMethod === "username"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Username / ID No
            </button>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3.5">
            {loginMethod === "email" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="name@school.edu"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username or Enrollment ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="enrollment_or_id"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600">Password</label>
                <button
                  type="button"
                  id="forgot-pwd-trigger"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </div>

          {/* Interactive CAPTCHA Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Security Verification
              </span>
              <button
                type="button"
                id="refresh-captcha-btn"
                onClick={generateCaptcha}
                className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition"
                title="Generate another puzzle"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-200 border border-slate-300 font-mono font-bold tracking-widest text-slate-700 rounded-lg text-sm p-2 flex-1 text-center select-none shadow-xs">
                {captchaNum1} + {captchaNum2} = ?
              </div>
              <input
                id="login-captcha-input"
                type="number"
                required
                placeholder="Answer"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-24 text-center text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            {captchaError && <p className="text-[10px] text-red-600 font-semibold mt-1">{captchaError}</p>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me-checkbox"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me-checkbox" className="ml-2 block text-xs font-semibold text-slate-600">
                Remember credentials on this browser
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              id="login-submit-btn"
              className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl border border-blue-700 transition shadow-sm shadow-blue-500/20"
            >
              Verify Credentials & Login
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password / OTP Modal */}
      {showForgotModal && (
        <div
          id="forgot-modal-overlay"
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Password Reset Helper</h3>
              <button
                id="close-forgot-modal"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {forgotMessage && (
              <p className="bg-blue-50 text-blue-800 p-2.5 rounded-lg text-[10px] leading-normal font-semibold">
                {forgotMessage}
              </p>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered institutional email to obtain an OTP code.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@school.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full text-center tracking-widest text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">New Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg"
                >
                  Verify Code & Reset
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
