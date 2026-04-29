import express from "express";
// Import routes and middlewares
import handleError from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";

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

// Routes
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// Auth Routes
app.use("/api/auth", authRouter);

// Error handling middleware
app.use(handleError);

export default app;