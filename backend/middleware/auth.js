const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "Auth is not configured" });
  }

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = protect;
