import * as projectService from "../services/project.service.js";

export const createProject = async (req, res) => {
    try {
        const userId = req.user.id;

        const project = await projectService.createProject(userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        const projects = await projectService.getUserProjects(userId);

        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: projects,
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;

        const project = await projectService.getProjectById(
            userId,
            projectId
        );

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;

        await projectService.deleteProject(userId, projectId);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};