import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ Axios configuration (VERY IMPORTANT)
axios.defaults.baseURL =
  process.env.NODE_ENV === "production"
    ? "https://e-commerce-production-0858.up.railway.app"
    : "http://localhost:5000";
axios.defaults.withCredentials = true;

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // redirect if already logged in
  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🚨 REQUIRED

    try {
      console.log("Submitting seller login...");

      const { data } = await axios.post("/api/seller/login", {
        email,
        password,
      });

      console.log("Response:", data);

      if (data.success) {
        setIsSeller(true);
        toast.success("Login successful");
        navigate("/seller");
      } else {
        toast.error(data.message || "Login failed", { icon: null });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed",
        { icon: null }
      );
      console.error(error);
    }
  };

  if (isSeller) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border bg-white"
      >
        <p className="text-2xl font-medium text-center">
          <span className="text-indigo-500">Seller</span> Login
        </p>

        <div>
          <p>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full p-2 mt-1 outline-indigo-500"
            required
          />
        </div>

        <div>
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full p-2 mt-1 outline-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-2 rounded-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SellerLogin;
