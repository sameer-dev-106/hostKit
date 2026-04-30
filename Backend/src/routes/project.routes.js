import express from "express";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const projectRoutes = express.Router();

/**
 * All routes in this file are protected and require authentication
 */
projectRoutes.use(authUser);

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private
 */
projectRoutes.post("/", projectController.createProject);

/**
 * @route GET /api/projects
 * @desc Get all projects for the authenticated user
 * @access Private
 */
projectRoutes.get("/", projectController.getUserProjects);

/**
 * @route GET /api/projects/:id
 * @desc Get a single project by ID
 * @access Private
 */
projectRoutes.get("/:id", projectController.getProjectById);

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project by ID
 * @access Private
 */
projectRoutes.delete("/:id", projectController.deleteProject);

export default projectRoutes;