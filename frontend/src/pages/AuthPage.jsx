import { useState } from "react";
import { login, register, saveToken } from "../api/auth";

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const data = await register(normalizedUsername, password);
        saveToken(data.token);
      } else {
        const data = await login(normalizedUsername, password);
        saveToken(data.token);
      }
      onAuth(); // tell App to re-check auth
    } catch (err) {
      setError(err?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left panel — branding */}
      <div className="hidden md:flex w-64 min-w-64 flex-col justify-between border-r-2 border-gray-200 bg-gray-50 p-8">
        <div>
          <h1 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            My Notes
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            A quiet place to capture your thoughts, ideas, and tasks.
          </p>
        </div>
        <p className="text-xs text-gray-300">Keep your notes organised.</p>
      </div>

      {/* Right panel — form */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm px-8">
          {/* Tab switcher */}
          <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden mb-8">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${
                  mode === "login"
                    ? "bg-white text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${
                  mode === "register"
                    ? "bg-white text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Register
            </button>
          </div>

          {/* Fields */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-500 mb-4 px-1">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-colors"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
