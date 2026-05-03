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

import { analyzeError, applyAiFix } from "../services/ai.service.js";
import DeploymentLog from "../models/deploymentLog.model.js";

const detectEnvVariables = (projectPath) => {
    const envSet = new Set();

    const scanFile = (filePath) => {
        const content = fs.readFileSync(filePath, "utf-8");

        // match process.env.VAR_NAME
        const matches = content.match(/process\.env\.([A-Z0-9_]+)/g);

        if (matches) {
            matches.forEach(match => {
                const key = match.split(".")[2];
                envSet.add(key);
            });
        }
    };

    const walk = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);

            if (["node_modules", ".git", "dist", "build"].includes(file)) return;

            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith(".js") || file.endsWith(".ts")) {
                scanFile(fullPath);
            }
        });
    };

    walk(projectPath);

    return Array.from(envSet);
};

const detectProjectType = (projectPath) => {
    const packagePath = path.join(projectPath, "package.json");

    if (!fs.existsSync(packagePath)) return "static";

    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
    };

    const scripts = pkg.scripts || {};

    if (deps.next) return "next";

    if (deps.react) {
        if (scripts.build && scripts.build.includes("vite")) {
            return "vite-react";
        }
        return "react";
    }

    if (deps.vite) return "vite";

    if (deps.express || deps.koa || deps.fastify) return "node";

    if (scripts.start) return "node";

    return "unknown";
};

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

// Helper: Available port find karo (DB + OS check)
const findAvailablePort = async (min, max) => {
    const usedPorts = await Deployment.distinct("port", {
        status: { $in: ["running", "building"] }
    });

    for (let port = min; port <= max; port++) {
        if (!usedPorts.includes(port)) return port;
    }
    throw new Error("No available ports in range");
};

// Helper: Log emit karo (DB + Redis publish)
const emitLog = async (deploymentId, message) => {
    const log = `[${new Date().toISOString()}] ${message}`;

    // DB mein save karo
    await DeploymentLog.create({
        deploymentId,
        message: log
    });

    // Redis se publish karo (frontend subscribe karega)
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
        let missingEnvs = [];
        let project = null;
        console.log("Job received:", deploymentId);

        try {
            // Fetch Deployment + Project details
            const deployment = await Deployment.findById(deploymentId);
            if (!deployment) throw new Error("Deployment not found");

            project = await Project.findById(deployment.projectId);
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

            const projectType = detectProjectType(projectPath);
            await emitLog(deploymentId, `📦 Detected project type: ${projectType}`);

            const detectedEnvs = detectEnvVariables(projectPath);
            if (detectedEnvs.length > 0) {
                await emitLog(deploymentId, `Detected environment variables: ${detectedEnvs.join(", ")}`);
            } else {
                await emitLog(deploymentId, `No environment variables detected in code`);
            }

            const providedEnvs = Object.keys(project.envs || {});
            missingEnvs = detectedEnvs.filter(env => !providedEnvs.includes(env));

            if (missingEnvs.length > 0) {
                await emitLog(deploymentId, `⚠️ Missing environment variables: ${missingEnvs.join(", ")}`);
            } else {
                await emitLog(deploymentId, `All detected environment variables are provided`);
            }

            // Detect Project Type
            if (projectType === "unknown") {
                throw new Error("Unsupported project type");
            }

            // Auto Dockerfile
            const dockerfilePath = path.join(projectPath, "Dockerfile");
            if (!fs.existsSync(dockerfilePath)) {

                // STATIC PROJECT
                if (projectType === "static") {

                    const hasDist = fs.existsSync(path.join(projectPath, "dist"));
                    const hasBuild = fs.existsSync(path.join(projectPath, "build"));
                    const hasIndexHtml = fs.existsSync(path.join(projectPath, "index.html"));

                    await emitLog(deploymentId, "Static project detected");

                    if (hasDist) {
                        await emitLog(deploymentId, "Using dist folder");
                        const buildFolder = fs.existsSync(path.join(projectPath, "dist"))
                            ? "dist"
                            : "build";

                        fs.writeFileSync(dockerfilePath, `
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/${buildFolder} /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`);

                    } else if (hasBuild) {
                        await emitLog(deploymentId, "Using build folder");

                        fs.writeFileSync(dockerfilePath, `
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`);

                    } else if (hasIndexHtml) {
                        await emitLog(deploymentId, "Using root index.html");

                        fs.writeFileSync(dockerfilePath, `
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`);
                    } else {
                        throw new Error("No build output found (dist/build/index.html missing)");
                    }

                    // REACT / VITE PROJECT
                } else if (
                    projectType === "react" ||
                    projectType === "vite" ||
                    projectType === "vite-react"
                ) {

                    await emitLog(deploymentId, "React/Vite project detected, building project");

                    fs.writeFileSync(dockerfilePath, `
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`);
                    // NODE PROJECT
                } else {

                    await emitLog(deploymentId, "Generating Node Dockerfile");

                    fs.writeFileSync(dockerfilePath, `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`);
                }
            }

            // Update Status to Building
            await Deployment.findByIdAndUpdate(deploymentId, { status: "building" });
            await emitLog(deploymentId, "🔨 Building Docker image...");

            // Build Docker Image
            const imageName = `project-${deploymentId}-${Date.now()}`;
            const envEntries = Object.entries(project.envs?.toJSON?.() || project.envs || {});

            // build time
            const buildArgs = envEntries
                .map(([k, v]) => `--build-arg ${k}=${v}`)
                .join(" ");

            // runtime
            const envFlags = envEntries
                .map(([k, v]) => `-e ${k}="${v}"`)
                .join(" ");
            const { stdout: buildOut, stderr: buildErr } = await execAsync(
                `docker build ${buildArgs} -t ${imageName} .`,
                {
                    cwd: projectPath,
                    timeout: 5 * 60 * 1000
                }
            );

            if (buildErr) await emitLog(deploymentId, `⚠️ Build warnings: ${buildErr}`);
            await emitLog(deploymentId, "✅ Docker image built successfully");

            // Port Selection 
            const port = await findAvailablePort(4000, 9000);
            await emitLog(deploymentId, `🔌 Assigned port: ${port}`);

            if (envEntries.length > 0) {
                await emitLog(deploymentId, `🔐 Injecting ${envEntries.length} environment variable(s)`);
            }

            // Run Container 
            const containerName = `container-${deploymentId}`;
            const containerPort = projectType === "static" ? 80 : 3000;

            // Cleanup old container if exists (same deploymentId se pehle wala)
            await execAsync(`docker rm -f ${containerName}`).catch(() => { });

            // Run new container
            await emitLog(deploymentId, "🐳 Starting container...");

            await execAsync(
                `docker run -d \
                --memory="512m" \
                --cpus="0.5" \
                --restart unless-stopped \
                -p ${port}:${containerPort} \
                ${envFlags} \
                --name ${containerName} ${imageName}`,
                {
                    timeout: 60 * 1000
                }
            );
            // Save Success
            const deploymentUrl = `http://${process.env.SERVER_IP || 'localhost'}:${port}`;

            await Deployment.findByIdAndUpdate(deploymentId, {
                status: "running",
                containerId: containerName,
                port,
                url: deploymentUrl,
            });

            await emitLog(deploymentId, `✅ Deployment successful!`);
            await emitLog(deploymentId, `🌐 Live at: ${deploymentUrl}`);

            console.log("DEPLOY DONE:", deploymentUrl);

        }
        catch (err) {
            console.log("DEPLOY FAILED:", err.message);
            await emitLog(deploymentId, `❌ Deployment failed: ${err.message}`);

            try {
                //fetch logs from  deployment logs collection
                const logsData = await DeploymentLog.find({ deploymentId }).sort({ createdAt: -1 });
                const logs = logsData.slice(0, 50).map(l => l.message);

                if (!project) {
                    const deployment = await Deployment.findById(deploymentId);
                    if (deployment) {
                        project = await Project.findById(deployment.projectId);
                    }
                }

                // AI Analysis
                const aiResult = await analyzeError({
                    logs,
                    framework: project?.framework || "Node.js",
                    missingEnvs,
                });

                // Emit AI analysis to logs for frontend display
                await emitLog(deploymentId, `🤖 AI Error: ${aiResult.errorType}`);
                await emitLog(deploymentId, `💡 Reason: ${aiResult.explanation}`);
                await emitLog(deploymentId, `🔧 Fix: ${aiResult.fix}`);

                // AUTO-FIX BLOCK
                const deployment = await Deployment.findById(deploymentId);
                const retryCount = deployment?.retryCount || 0;

                if (aiResult.severity !== 'low' && retryCount < 2) {
                    await emitLog(deploymentId, `🤖 AI attempting auto-fix (attempt ${retryCount + 1}/2)...`);

                    const projectPath = path.join("deployments", deploymentId.toString());
                    const fixed = await applyAiFix(projectPath, aiResult);

                    if (fixed) {
                        await emitLog(deploymentId, `✅ Auto-fix applied — redeploying...`);

                        // retryCount badhao
                        await Deployment.findByIdAndUpdate(deploymentId, {
                            status: "pending",
                            $inc: { retryCount: 1 }
                        });

                        // Naya job queue karo
                        const { deploymentQueue } = await import("../queue/deployment.queue.js");
                        await deploymentQueue.add("deploy-job", {
                            deploymentId: deployment._id,
                            isRetry: true
                        });

                        return; // current job yahan khatam
                    } else {
                        await emitLog(deploymentId, `⚠️ Auto-fix could not be applied`);
                    }
                } else if (retryCount >= 2) {
                    await emitLog(deploymentId, `❌ Max auto-fix attempts reached`);
                }
                // END AUTO-FIX BLOCK

                // Save AI analysis to deployment record
                await Deployment.findByIdAndUpdate(deploymentId, {
                    status: "failed",
                    aiAnalysis: {
                        error: aiResult.errorType,
                        explanation: aiResult.explanation,
                        fix: aiResult.fix,
                        severity: aiResult.severity
                    }
                })

            } catch (aiErr) {
                console.log("AI analysis failed:", aiErr.message);
                await emitLog(deploymentId, `⚠️ AI analysis failed: ${aiErr.message}`);
                await Deployment.findByIdAndUpdate(deploymentId, { status: "failed" });
            }
        }
    },
    { connection }
);