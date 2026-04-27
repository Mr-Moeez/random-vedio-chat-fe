import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    email: "",
    name: "",
    nickname: "",
    age: "",
    gender: "male",
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

  const submitSignup = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      await signup({
        ...form,
        age: Number(form.age),
      });

      navigate("/call");
    } catch {
      setError("Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-slate-950 dark:text-white flex items-center justify-center px-4 py-8">
      <form
        onSubmit={submitSignup}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
      >
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-slate-400 mb-6">Join and start meeting random people.</p>

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

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Nickname</span>
          <input
            name="nickname"
            value={form.nickname}
            onChange={updateField}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label>
            <span className="text-sm text-slate-300">Age</span>
            <input
              name="age"
              type="number"
              min="13"
              max="100"
              value={form.age}
              onChange={updateField}
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </label>

          <label>
            <span className="text-sm text-slate-300">Gender</span>
            <select
              name="gender"
              value={form.gender}
              onChange={updateField}
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="block mb-5">
          <span className="text-sm text-slate-300">Password</span>
          <input
            name="password"
            type="password"
            minLength={8}
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
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="mt-5 text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;