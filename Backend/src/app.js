import express from "express";


const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});


export default app;