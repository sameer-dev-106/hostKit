import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import IORedis from "ioredis";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        // Socket connection
        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("subscribe:deployment", (deploymentId) => {
                socket.join(`deployment:${deploymentId}`);
                console.log(`Subscribed to deployment: ${deploymentId}`);
            });

            socket.on("unsubscribe:deployment", (deploymentId) => {
                socket.leave(`deployment:${deploymentId}`);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        // Redis Subscriber (Worker logs receive karo)
        const subscriber = new IORedis({
            host: process.env.REDIS_HOST || "redis",
            port: 6379,
        });

        await subscriber.subscribe("deployment-logs");

        subscriber.on("message", (_channel, message) => {
            try {
                const { deploymentId, log } = JSON.parse(message);
                // Us deployment ke room mein emit karo
                io.to(`deployment:${deploymentId}`).emit("deployment:log", {
                    deploymentId,
                    log,
                });
            } catch (err) {
                console.error("Redis message parse error:", err.message);
            }
        });

        subscriber.on("error", (err) => {
            console.error("Redis subscriber error:", err.message);
        });

        // Start Server
        httpServer.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();