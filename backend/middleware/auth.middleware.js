import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ error: "Unauthorised User" });
        }

        // Check token blacklist in Redis (gracefully handle Redis errors)
        try {
            const isTokenBlacklisted = await redisClient.get(token);
            if (isTokenBlacklisted) {
                res.cookie('token','');
                return res.status(401).send({ error: "Token is blacklisted" });
            }
        } catch (redisError) {
            // If Redis is unavailable, continue without blacklist check
            // This allows the app to work even if Redis is down
            console.warn("Redis unavailable for token blacklist check, continuing anyway");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ error: "Invalid token" });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ error: "Token expired" });
        }
        res.status(401).send({ error: "Please Authenticate" });
    }
};