import { Router } from "express";
import passport from "passport";

import { registerValidator, loginValidator } from "../validation/auth.validator.js";
import { register, login, getMe, verifyEmail, googleCallback, githubCallback, logout } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { config } from "../config/config.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, login);

/**
 * @route GET /api/auth/google
 * @desc Authenticate with Google
 * @access Public
 */
authRouter.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @route GET /api/auth/google/callback
 */

authRouter.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login"
    }),
    googleCallback,
);

/**
 * @route GET /api/auth/github
 * @desc Authenticate with GitHub
 * @access Public
 */
authRouter.get("/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

/**
 * @route GET /api/auth/github/callback
 */
authRouter.get("/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login"
    }),
    githubCallback
);

/**
 * @route GET /api/auth/me
 * @desc Get current logged in user's details
 * @access Private
 */
authRouter.get('/me', authUser, getMe);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get("/verify-email", verifyEmail);

/**
 * @route POST /api/auth/logout
 * @desc Logout user by blacklisting the token
 * @access Private
 */
authRouter.post("/logout", authUser, logout);

export default authRouter;