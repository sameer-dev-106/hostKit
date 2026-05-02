import express from "express";
import { getAllUsers, getAllProjects, getAllDeployments, getStats } from "../controllers/admin.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { get } from "mongoose";

const adminRoutes = express.Router();

// All routes in this file are protected and require admin authentication
adminRoutes.use(authUser, isAdmin);

/**
 * @route GET /api/admin/users
 * @desc Get all users (Admin only)
 * @access Private (Admin)
 */
adminRoutes.get("/users", getAllUsers);

/**
 * @route GET /api/admin/projects
 * @desc Get all projects (Admin only)
 * @access Private (Admin)
 */
adminRoutes.get("/projects", getAllProjects);

/**
 * @route GET /api/admin/deployments
 * @desc Get all deployments (Admin only)
 * @access Private (Admin)
 */
adminRoutes.get("/deployments", getAllDeployments);

/**
 * @route GET /api/admin/stats
 * @desc Get admin stats (Admin only)
 * @access Private (Admin)
 */
adminRoutes.get("/stats", getStats);

export default adminRoutes;