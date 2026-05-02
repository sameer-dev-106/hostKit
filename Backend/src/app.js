import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as GitHubStrategy } from "passport-github2";
import { config } from "./config/config.js";

// Import routes and middlewares
import handleError from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Passport configuration
passport.use(new GitHubStrategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Routes
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// Auth Routes
app.use("/api/auth", authRouter);

// Project Routes 
app.use("/api/projects", projectRoutes);

// Deployment Routes
app.use("/api/deploy", deploymentRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(handleError);

export default app;