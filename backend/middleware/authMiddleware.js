import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "missing or invalid Authorization header" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";

    const payload = jwt.verify(token, secret);
    req.user = payload;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admin access required" });
};

