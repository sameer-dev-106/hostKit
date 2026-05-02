import * as projectService from "../services/project.service.js";

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private
 */
export const createProject = async (req, res, next) => {
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

/**
 * @route GET /api/projects
 * @desc Get all projects for the authenticated user
 * @access Private
 */
export const getUserProjects = async (req, res, next) => {
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

/**
 * @route GET /api/projects/:id
 * @desc Get a single project by ID
 * @access Private
 */
export const getProjectById = async (req, res, next) => {
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

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project by ID
 * @access Private
 */
export const deleteProject = async (req, res, next) => {
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