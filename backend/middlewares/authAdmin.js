import jwt from "jsonwebtoken";

export const authAdmin = async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin (admin email set in env)
    if (decoded.email === process.env.ADMIN_EMAIL) {
      req.userId = decoded.id;
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden - Admin access required", success: false });
    }
  } catch (error) {
    console.error("Error in authAdmin middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
