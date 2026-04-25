import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { getUser } from "./api/auth";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";

function App() {
  // Check if user is already logged in (token in localStorage)
  const [isAuthed, setIsAuthed] = useState(() => !!getUser());

  return (
    <>
      {isAuthed ? (
        <Home onLogout={() => setIsAuthed(false)} />
      ) : (
        <AuthPage onAuth={() => setIsAuthed(true)} />
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
