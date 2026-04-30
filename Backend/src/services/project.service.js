import Project from "../models/project.model.js";

export const createProject = async (userId, data) => {
    try {
        const project = await Project.create({
            userId,
            ...data,
        });

        return project;
    } catch (error) {
        throw new Error("Error creating project");
    }
};

export const getUserProjects = async (userId) => {
    try {
        const projects = await Project.find({ userId }).sort({ createdAt: -1 });
        return projects;
    } catch (error) {
        throw new Error("Error fetching projects");
    }
};

export const getProjectById = async (userId, projectId) => {
    try {
        const project = await Project.findOne({
            _id: projectId,
            userId,
        });

        if (!project) {
            throw new Error("Project not found or unauthorized");
        }

        return project;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (userId, projectId) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: projectId,
            userId,
        });

        if (!project) {
            throw new Error("Project not found or unauthorized");
        }

        return project;
    } catch (error) {
        throw error;
    }
};