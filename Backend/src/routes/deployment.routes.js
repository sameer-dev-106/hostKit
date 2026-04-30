import express from "express";
import * as deploymentController from "../controllers/deployment.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const deploymentRoutes = express.Router();

/**
 * All routes in this file are protected and require authentication
 */
deploymentRoutes.use(authUser);

/**
 * @route POST /api/deploy/:projectId
 * @desc Trigger a new deployment for a project
 * @access Private
 */
deploymentRoutes.post("/:projectId", deploymentController.createDeployment);


/**
 * @route GET /api/deploy/:id
 * @desc Get a single deployment by ID
 * @access Private
 */
deploymentRoutes.get("/:id", deploymentController.getDeployment);

/**
 * @route GET /api/deploy/project/:projectId
 * @desc Get all deployments for a specific project
 * @access Private
 */
deploymentRoutes.get("/project/:projectId", deploymentController.getDeploymentsByProject);

export default deploymentRoutes;