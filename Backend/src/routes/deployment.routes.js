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
 * @param {string} projectId - The ID of the project to deploy
 * @returns {Promise<Object>} - The deployment object created for the project
 * @throws {Error} - Throws an error if deployment creation fails
 * 
 * Note: This route will initiate a new deployment process for the specified project, which includes cloning the repository, building the Docker image, and starting the container. The response will contain the details of the created deployment.
 * 
 * Example Request:
 * POST /api/deploy/60f5a3c2b4d1c72f9c8e4b2
 * Headers: { Authorization: "Bearer <token>" }
 */
deploymentRoutes.post("/:projectId", deploymentController.createDeploymentController);

/**
 * @route GET /api/deploy/project/:projectId
 * @desc Get all deployments for a specific project
 * @access Private
 * @param {string} projectId - The ID of the project to fetch deployments for
 * @returns {Promise<Array>} - A list of deployments for the specified project
 * @throws {Error} - Throws an error if fetching deployments fails
 * 
 * Note: This route will return all deployments associated with the given project ID, allowing users to view the deployment history and status for that project.
 */
deploymentRoutes.get("/project/:projectId", deploymentController.getDeploymentsByProject);

/**
 * @route POST /api/deploy/stop/:deploymentId
 * @desc Stop a running deployment (container cleanup)
 * @access Private
 * @param {string} deploymentId - The ID of the deployment to stop
 * @returns {Promise<Object>} - A success message upon stopping the deployment
 * @throws {Error} - Throws an error if stopping the deployment fails
 * 
 * Note: This route will stop the Docker container associated with the deployment and update its status in the database.
 */
deploymentRoutes.post("/stop/:deploymentId", deploymentController.stopDeploymentController);

/**
 * @route POST /api/deploy/rollback/:projectId
 * @desc Rollback to previous deployment for a project
 * @access Private
 * @param {string} projectId - The ID of the project to rollback
 * @returns {Promise<Object>} - The new deployment object created from the rollback
 */
deploymentRoutes.post("/rollback/:projectId", deploymentController.rollbackController);

/**
 * @route GET /api/deploy/:id
 * @desc Get a single deployment by ID
 * @access Private
 * @param {string} id - The ID of the deployment to fetch
 * @returns {Promise<Object>} - The deployment object with the specified ID
 * @throws {Error} - Throws an error if the deployment is not found or unauthorized
 * 
 * Note: This route will return the details of a specific deployment, including its status, logs, and associated project information.
 */
deploymentRoutes.get("/:id", deploymentController.getDeployment);

export default deploymentRoutes;