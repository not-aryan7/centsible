import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: connect to Firebase in Sprint 2
    console.log("Register:", name, email, password);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
              placeholder="you@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#028090] text-white py-2 rounded-lg text-sm hover:bg-[#026f7d]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Have an account?{" "}
          <Link to="/login" className="text-[#028090]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}