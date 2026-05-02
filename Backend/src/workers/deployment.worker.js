import { Worker } from "bullmq";
import IORedis from "ioredis";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();
import { config } from "../config/config.js";

import Deployment from "../models/deployment.model.js";
import Project from "../models/project.model.js";

const execAsync = promisify(exec);
const git = simpleGit();

// Mongo connect
await mongoose.connect(config.MONGO_URI);
console.log("✅ Worker Mongo connected");

// Redis connection (worker ke liye)
const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

// Separate Redis client for publishing logs
const publisher = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

// Helper: Available port dhundho
const findAvailablePort = (min, max, usedPorts) => {
    for (let port = min; port <= max; port++) {
        if (!usedPorts.includes(port)) return port;
    }
    throw new Error("No available ports in range");
};

// Helper: Log emit karo (DB + Redis publish)
const emitLog = async (deploymentId, message) => {
    const log = `[${new Date().toISOString()}] ${message}`;

    // DB mein save karo
    await Deployment.findByIdAndUpdate(deploymentId, {
        $push: { logs: log }
    });

    // Redis se frontend ko real-time bhejo
    await publisher.publish("deployment-logs", JSON.stringify({
        deploymentId: deploymentId.toString(),
        log
    }));

    console.log(log);
};

console.log("Worker started...");

new Worker(
    "deployment-queue",
    async (job) => {
        const { deploymentId } = job.data;
        console.log("Job received:", deploymentId);

        try {
            // Fetch Deployment + Project details
            const deployment = await Deployment.findById(deploymentId);
            if (!deployment) throw new Error("Deployment not found");

            const project = await Project.findById(deployment.projectId);
            if (!project) throw new Error("Project not found");

            await emitLog(deploymentId, "Deployment started");

            // Folder Setup
            const projectPath = path.join("deployments", deploymentId.toString());

            if (fs.existsSync(projectPath)) {
                fs.rmSync(projectPath, { recursive: true, force: true });
            }
            fs.mkdirSync(projectPath, { recursive: true });

            // Clone Repo
            await emitLog(deploymentId, `Cloning repo: ${project.repoUrl}`);
            await git.clone(project.repoUrl, projectPath);

            const projectGit = simpleGit(projectPath);
            await projectGit.checkout(project.branch || "main");
            await emitLog(deploymentId, `Repo cloned — branch: ${project.branch || "main"}`);

            // Detect Project Type
            const isNode = fs.existsSync(path.join(projectPath, "package.json"));
            if (!isNode) throw new Error("Unsupported project type — package.json not found");

            await emitLog(deploymentId, "Detected Node.js project");

            // Auto Dockerfile
            const dockerfilePath = path.join(projectPath, "Dockerfile");
            if (!fs.existsSync(dockerfilePath)) {
                await emitLog(deploymentId, "⚠️ No Dockerfile found — generating one automatically");

                fs.writeFileSync(
                    dockerfilePath,
                    `FROM node:20-alpine
                    WORKDIR /app
                    COPY package*.json ./
                    RUN npm install --production
                    COPY . .
                    EXPOSE 3000
                    CMD ["npm", "start"]`
                );
            } else {
                await emitLog(deploymentId, "✅ Dockerfile found");
            }

            // Update Status to Building
            await Deployment.findByIdAndUpdate(deploymentId, { status: "building" });
            await emitLog(deploymentId, "🔨 Building Docker image...");

            // Build Docker Image
            const { stdout: buildOut, stderr: buildErr } = await execAsync(
                `docker build -t project-${deploymentId} .`,
                { cwd: projectPath }
            );

            if (buildErr) await emitLog(deploymentId, `⚠️ Build warnings: ${buildErr}`);
            await emitLog(deploymentId, "✅ Docker image built successfully");

            // Port Selection 
            const usedPorts = await Deployment.distinct("port", { status: "running" });
            const port = findAvailablePort(4000, 5000, usedPorts);
            await emitLog(deploymentId, `🔌 Assigned port: ${port}`);

            // Env Vars
            const envEntries = Object.entries(project.envs?.toJSON?.() || project.envs || {});
            const envFlags = envEntries
                .map(([k, v]) => `-e ${k}="${v}"`)
                .join(" ");

            if (envEntries.length > 0) {
                await emitLog(deploymentId, `🔐 Injecting ${envEntries.length} environment variable(s)`);
            }

            // Run Container 
            await emitLog(deploymentId, "🐳 Starting container...");

            const containerName = `container-${deploymentId}`;
            await execAsync(
                `docker run -d -p ${port}:3000 ${envFlags} --name ${containerName} project-${deploymentId}`
            );

            // Save Success
            const deploymentUrl = `http://localhost:${port}`;

            await Deployment.findByIdAndUpdate(deploymentId, {
                status: "running",
                containerId: containerName,
                port,
                url: deploymentUrl,
            });

            await emitLog(deploymentId, `✅ Deployment successful!`);
            await emitLog(deploymentId, `🌐 Live at: ${deploymentUrl}`);

            console.log("DEPLOY DONE:", deploymentUrl);

        } catch (err) {
            console.log("DEPLOY FAILED:", err.message);

            await emitLog(deploymentId, `❌ Deployment failed: ${err.message}`);

            await Deployment.findByIdAndUpdate(deploymentId, {
                status: "failed",
            });
        }
    },
    { connection }
);