import * as deploymentService from "../services/deployment.service.js";

/**
 * @route POST /api/deploy/:projectId
 * @desc Trigger a new deployment for a project
 * @access Private
 */
export const createDeploymentController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { projectId } = req.params;

        const deployment = await deploymentService.createDeployment(userId, projectId);

        res.status(201).json({
            success: true,
            message: "Deployment started",
            data: deployment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/deploy/:id
 * @desc Get a single deployment by ID
 * @access Private
 */
export const getDeployment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deployment = await deploymentService.getDeploymentById(
            userId,
            id
        );

        res.status(200).json({
            success: true,
            message: "Deployment fetched successfully",
            data: deployment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/deploy/project/:projectId
 * @desc Get all deployments for a specific project
 * @access Private
 */
export const getDeploymentsByProject = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { projectId } = req.params;

        const deployments =
            await deploymentService.getDeploymentsByProject(
                userId,
                projectId
            );

        res.status(200).json({
            success: true,
            message: "Deployments fetched successfully",
            data: deployments,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route POST /api/deploy/stop/:deploymentId
 * @desc Stop a running deployment
 * @access Private
 */
export const stopDeploymentController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { deploymentId } = req.params;
        const deployment = await deploymentService.stopDeployment(userId, deploymentId);
        res.status(200).json({ success: true, message: "Deployment stopped", data: deployment });
    } catch (error) {
        next(error);
    }
};

/**
 * @route POST /api/deploy/rollback/:projectId
 * @desc Rollback to previous deployment for a project
 * @access Private
 */
export const rollbackController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { projectId } = req.params;
        const deployment = await deploymentService.rollbackDeployment(userId, projectId);
        res.status(201).json({ success: true, message: "Rollback started", data: deployment });
    } catch (error) {
        next(error);
    }
};