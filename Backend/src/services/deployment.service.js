import Deployment from "../models/deployment.model.js";
import Project from "../models/project.model.js";
import deploymentQueue from "../queue/deployment.queue.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Helper: Container stop + remove
const cleanupContainer = async (deployment) => {
    if (!deployment.containerId) return;
    try {
        await execAsync(`docker stop ${deployment.containerId}`);
        await execAsync(`docker rm ${deployment.containerId}`);
        await execAsync(`docker rmi project-${deployment._id} --force`);
        console.log(`Cleaned up container: ${deployment.containerId}`);
    } catch (err) {
        // Container already stopped/removed — ignore
        console.log("Cleanup warning:", err.message);
    }
};

// CREATE DEPLOYMENT
export const createDeployment = async (userId, projectId) => {
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    const deployment = await Deployment.create({
        userId,
        projectId,
        status: "pending",
    });

    await deploymentQueue.add("deploy-job", {
        deploymentId: deployment._id,
    });

    console.log("Adding job to queue:", deployment._id);
    return deployment;
};

// GET SINGLE DEPLOYMENT 
export const getDeploymentById = async (userId, deploymentId) => {
    const deployment = await Deployment.findOne({ _id: deploymentId, userId });

    if (!deployment) {
        const err = new Error("Deployment not found or unauthorized");
        err.status = 404;
        throw err;
    }

    return deployment;
};

// GET ALL DEPLOYMENTS FOR PROJECT
export const getDeploymentsByProject = async (userId, projectId) => {
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    const deployments = await Deployment.find({ projectId }).sort({ createdAt: -1 });
    return deployments;
};

// ADD LOG 
export const addLog = async (deploymentId, log) => {
    return await Deployment.findByIdAndUpdate(
        deploymentId,
        { $push: { logs: log } },
        { new: true }
    );
};

// UPDATE STATUS 
export const updateStatus = async (deploymentId, status) => {
    return await Deployment.findByIdAndUpdate(
        deploymentId,
        { status },
        { new: true }
    );
};

// STOP DEPLOYMENT (Container cleanup)
export const stopDeployment = async (userId, deploymentId) => {
    const deployment = await Deployment.findOne({ _id: deploymentId, userId });

    if (!deployment) {
        const err = new Error("Deployment not found or unauthorized");
        err.status = 404;
        throw err;
    }

    if (deployment.status !== "running") {
        const err = new Error("Deployment is not running");
        err.status = 400;
        throw err;
    }

    await cleanupContainer(deployment);

    return await Deployment.findByIdAndUpdate(
        deploymentId,
        { status: "stopped" },
        { new: true }
    );
};

// ROLLBACK
// Pichle successful deployment ko dobara run karta hai
export const rollbackDeployment = async (userId, projectId) => {
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    // Last 2 successful deployments dhundho
    const successfulDeployments = await Deployment.find({
        projectId,
        status: { $in: ["running", "success"] },
    }).sort({ createdAt: -1 }).limit(2);

    if (successfulDeployments.length < 2) {
        const err = new Error("No previous deployment found to rollback");
        err.status = 400;
        throw err;
    }

    // Current running deployment band karo
    const currentDeployment = successfulDeployments[0];
    await cleanupContainer(currentDeployment);
    await Deployment.findByIdAndUpdate(currentDeployment._id, { status: "stopped" });

    // Naya deployment trigger karo (fresh build — same code se)
    const newDeployment = await Deployment.create({
        userId,
        projectId,
        status: "pending",
    });

    await deploymentQueue.add("deploy-job", {
        deploymentId: newDeployment._id,
        // Pichle wale ka commitId pass karo agar chahiye
        rollbackFrom: currentDeployment._id,
    });

    return newDeployment;
};
