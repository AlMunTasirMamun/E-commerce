import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    req.userId = decoded.id; // Also set userId for compatibility
    next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

// Optional auth - doesn't require login but captures userId if available
export const optionalAuthUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    req.userId = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    req.userId = decoded.id;
    next();
  } catch (error) {
    req.userId = null;
    next();
  }
};

export default authUser;
