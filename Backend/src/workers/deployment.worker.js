import { Worker } from "bullmq";
import IORedis from "ioredis";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import mongoose from "mongoose";
import { config } from "dotenv";

import Deployment from "../models/deployment.model.js";
import Project from "../models/project.model.js";

const execAsync = promisify(exec);
const git = simpleGit();

// Mongo connect
await mongoose.connect(config.MONGO_URI);
console.log("✅ Worker Mongo connected");

// Redis connection
const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

console.log("Worker started...");

new Worker(
    "deployment-queue",
    async (job) => {
        const { deploymentId } = job.data;

        console.log("Job received:", deploymentId);

        try {
            // 🔹 Fetch DB
            const deployment = await Deployment.findById(deploymentId);
            if (!deployment) throw new Error("Deployment not found");

            const project = await Project.findById(deployment.projectId);
            if (!project) throw new Error("Project not found");

            console.log("Deployment + Project fetched");

            const projectPath = path.join("deployments", deploymentId.toString());

            // 🔹 Clean folder
            if (fs.existsSync(projectPath)) {
                fs.rmSync(projectPath, { recursive: true, force: true });
            }

            fs.mkdirSync(projectPath, { recursive: true });

            // 🔹 Clone repo
            console.log("Cloning repo...");
            await git.clone(project.repoUrl, projectPath);

            const projectGit = simpleGit(projectPath);
            await projectGit.checkout(project.branch || "main");

            console.log("Repo cloned");

            // DETECT PROJECT TYPE
            const isNode = fs.existsSync(path.join(projectPath, "package.json"));

            if (!isNode) {
                throw new Error("Unsupported project type");
            }

            console.log("Detected Node project");

            // AUTO DOCKERFILE
            const dockerfilePath = path.join(projectPath, "Dockerfile");

            if (!fs.existsSync(dockerfilePath)) {
                console.log("⚠️ No Dockerfile → creating one...");

                fs.writeFileSync(
                    dockerfilePath,
                    `
                        FROM node:20
                        WORKDIR /app
                        COPY package*.json ./
                        RUN npm install
                        COPY . .
                        EXPOSE 3000
                        CMD ["npm", "start"]
                    `
                );
            }

            // Update status
            deployment.status = "building";
            deployment.logs.push("Cloned repo");
            await deployment.save();

            // BUILD DOCKER IMAGE
            console.log("🐳 Building Docker image...");
            await execAsync(`docker build -t project-${deploymentId} .`, {
                cwd: projectPath,
            });

            // RUN CONTAINER
            const port = 3000 + Math.floor(Math.random() * 1000);

            console.log("Running container...");
            await execAsync(
                `docker run -d -p ${port}:3000 project-${deploymentId}`
            );

            // Save success
            deployment.status = "running";
            deployment.logs.push(`Deployed on port ${port}`);
            deployment.url = `http://localhost:${port}`;

            await deployment.save();

            console.log("DEPLOY DONE:", deployment.url);
        } catch (err) {
            console.log("DEPLOY FAILED:", err.message);

            const deployment = await Deployment.findById(deploymentId);
            if (deployment) {
                deployment.status = "failed";
                deployment.logs.push(err.message);
                await deployment.save();
            }
        }
    },
    { connection }
);