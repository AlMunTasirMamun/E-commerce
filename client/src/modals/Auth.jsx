import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// Professional email regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};


const Auth = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  // Forgot password states
  const [forgotStep, setForgotStep] = useState(0); // 0: none, 1: email, 2: code
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { setShowUserLogin, setUser, axios, navigate } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check terms acceptance for registration
    if (state === "register" && !acceptTerms) {
      toast.error("Please accept the Terms of Service to continue");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate name for registration
    if (state === "register") {
      if (name.trim().length < 2) {
        toast.error("Name must be at least 2 characters");
        return;
      }
    }

    // Validate password
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const payload =
        state === "register"
          ? { name, email, password }
          : { email, password };
      const { data } = await axios.post(`/api/user/${state}`, payload);
      if (data.success) {
        toast.success(data.message || "Success");
        setUser(data.user);
        setShowUserLogin(false);
        setAcceptTerms(false); // Reset
        navigate("/");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Forgot password: Step 1 - send code
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmail(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const { data } = await axios.post("/api/user/forgot-password", { email: resetEmail });
      if (data.success) {
        toast.success("Reset code sent to your email");
        setForgotStep(2);
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Forgot password: Step 2 - verify code and reset
  const handleForgotReset = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword,
      });
      if (data.success) {
        toast.success("Password reset successful");
        setUser(data.user);
        setShowUserLogin(false);
        navigate("/");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      {/* Forgot Password Modal */}
      {forgotStep > 0 ? (
        <form
          onSubmit={forgotStep === 1 ? handleForgotEmail : handleForgotReset}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-80 sm:w-[352px] p-8 rounded-lg shadow-xl space-y-4"
        >
          <h2 className="text-2xl font-medium text-center">
            <span className="text-indigo-500">Forgot</span> Password
          </h2>
          {forgotStep === 1 && (
            <>
              <p>Email</p>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="border p-2 w-full mt-1"
                required
              />
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-2 rounded mt-4"
              >
                Send Code
              </button>
            </>
          )}
          {forgotStep === 2 && (
            <>
              <p>Enter Code (check your email)</p>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="border p-2 w-full mt-1"
                required
              />
              <p>New Password</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-2 w-full mt-1"
                required
              />
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-2 rounded mt-4"
              >
                Reset Password
              </button>
            </>
          )}
          <p className="text-sm mt-2">
            <span
              onClick={() => {
                setForgotStep(0);
                setResetEmail("");
                setResetCode("");
                setNewPassword("");
              }}
              className="text-indigo-500 cursor-pointer"
            >
              Back to Login
            </span>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-80 sm:w-[352px] p-8 rounded-lg shadow-xl space-y-4"
        >
          <h2 className="text-2xl font-medium text-center">
            <span className="text-indigo-500">User</span>{" "}
            {state === "login" ? "Login" : "Register"}
          </h2>

          {state === "register" && (
            <div>
              <p>Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full mt-1"
                required
              />
            </div>
          )}

          <div>
            <p>Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full mt-1"
              required
            />
          </div>

          <div>
            <p>Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full mt-1"
              required
            />
          </div>

          {state === "register" && (
            <div className="border border-indigo-200 bg-indigo-50 p-3 rounded-lg">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-indigo-600"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          )}

          <p className="text-sm">
            {state === "register" ? "Already have account?" : "Create an account?"}{" "}
            <span
              onClick={() => {
                setState(state === "register" ? "login" : "register");
                setAcceptTerms(false); // Reset when switching
              }}
              className="text-indigo-500 cursor-pointer"
            >
              click here
            </span>
          </p>

          {state === "login" && (
            <p className="text-sm mt-2">
              <span
                onClick={() => setForgotStep(1)}
                className="text-indigo-500 cursor-pointer"
              >
                Forgot Password?
              </span>
            </p>
          )}

          <button
            type="submit"
            disabled={state === "register" && !acceptTerms}
            className={`w-full py-2 rounded font-medium transition-colors ${
              state === "register" && !acceptTerms
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            {state === "register" ? "Create Account" : "Login"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Auth;
