import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import redis from "../config/redis.js";

export const authUser = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const isBlacklisted = await redis.get(`bl_${token}`);

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Session expired, please login again",
            });
        }
        
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        req.user = user;
        req.token = token;

        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: "Unauthorized" })
    }
}
