import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.cookie("jwt", "", { maxAge: 0 });
      res.cookie("token", "", { maxAge: 0 });
      return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};