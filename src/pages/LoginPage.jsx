import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const submitLogin = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      await login(form);

      navigate("/call");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-slate-950 dark:text-white flex items-center justify-center px-4">
      <form
        onSubmit={submitLogin}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
      >
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-slate-400 mb-6">Login to start random video calling.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </label>

        <label className="block mb-5">
          <span className="text-sm text-slate-300">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-3 font-medium"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-5 text-sm text-slate-400 text-center">
          New here?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;