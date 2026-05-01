import Deployment from "../models/deployment.model.js";
import Project from "../models/project.model.js";

import deploymentQueue from "../queue/deployment.queue.js";

// CREATE DEPLOYMENT
export const createDeployment = async (userId, projectId) => {
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
        const err = new Error("Project not found or unauthorized");
        err.status = 404;
        throw err;
    }

    // create deployment
    const deployment = await Deployment.create({
        userId,
        projectId,
        status: "pending",
    });

    // start deployment (async)
    await deploymentQueue.add("deploy-job", {
        deploymentId: deployment._id,
    });

    console.log("Adding job to queue:", deployment._id);

    return deployment;
};

// GET SINGLE DEPLOYMENT
export const getDeploymentById = async (userId, deploymentId) => {
    const deployment = await Deployment.findOne({
        _id: deploymentId,
        userId,
    });

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

    const deployments = await Deployment.find({ projectId }).sort({
        createdAt: -1,
    });

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