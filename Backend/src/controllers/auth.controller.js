import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { config } from "../config/config.js";
import redis from "../config/redis.js";

/**
 * @desc Handle Google authentication callback
 * @route GET /api/auth/google/callback
 * @access Public
 */
export const googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("http://localhost/login");
        }

        const { id, displayName, emails, photos } = req.user;

        const email = emails?.[0]?.value;
        const profilePic = photos?.[0]?.value;

        if (!email) {
            return res.redirect("http://localhost/login");
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                username: displayName,
                email,
                profilePic,
                googleId: id,
                verified: true
            });
        }

        const token = jwt.sign({
            id: user._id,
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });

        return res.redirect("http://localhost/");

    } catch (err) {
        console.error("Google Auth Error:", err);
        return res.redirect("http://localhost/login");
    }
}

/**
 * @desc Handle GitHub authentication callback
 * @route GET /api/auth/github/callback
 * @access Public
 */
export const githubCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("http://localhost/login");
        }

        const { id, username, emails, photos } = req.user;

        const email = emails?.[0]?.value;
        const profilePic = photos?.[0]?.value;

        if (!email) {
            return res.redirect("http://localhost/login?error=no_email")
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                username,
                email,
                profilePic,
                githubId: id,
                verified: true
            });
        }

        const token = jwt.sign({
            id: user._id,
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });

        return res.redirect("http://localhost/");

    } catch (err) {
        console.error("GitHub Auth Error:", err);
        return res.redirect("http://localhost/login");
    }
}

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
    const { username, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExist) {
        let message = "User already exists";

        const emailMatch = isUserAlreadyExist.email === email;
        const usernameMatch = isUserAlreadyExist.username === username;

        if (emailMatch && usernameMatch) {
            message += " with this email and username";
        } else if (emailMatch) {
            message += " with this email address";
        } else if (usernameMatch) {
            message += " with this username";
        }

        return res.status(409).json({
            message,
            success: false,
            err: message
        });
    }

    const user = await userModel.create({ username, email, password });

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, config.JWT_SECRET);

    await sendEmail({
        to: email,
        subject: "Verify your email - Hostkit",
        html: `
        <h2>Welcome to Hostkit 🚀</h2>
        <p>Hi ${username},</p>

        <p>Click below to verify your email:</p>

        <a href="${config.BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}">
            Verify Email
        </a>

        <p>If you didn't create this account, ignore this email.</p>
    `,
    });

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        });
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        });
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, config.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            });
        }

        user.verified = true

        await user.save();

        const html = `
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your account.</p>
            <a href="http://localhost:3000/login">Go to Login</a>
        `

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }
}

/**
 * @desc Logout user by blacklisting the token and clearing the cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({
                message: "Already logged out",
            });
        }

        // ⏱ expiry calculate
        const decoded = jwt.decode(token);
        const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

        if (expiryTime > 0) {
            await redis.set(`bl_${token}`, "true", "EX", expiryTime);
        }

        // 🍪 cookie remove
        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Logout failed",
        });
    }
};