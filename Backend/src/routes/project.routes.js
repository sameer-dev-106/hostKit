import express from "express";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const projectRoutes = express.Router();

// Protect all routes
projectRoutes.use(authUser);

// Create project
projectRoutes.post("/", projectController.createProject);

// Get all projects
projectRoutes.get("/", projectController.getUserProjects);

// Get single project
projectRoutes.get("/:id", projectController.getProjectById);

// Delete project
projectRoutes.delete("/:id", projectController.deleteProject);

export default projectRoutes;