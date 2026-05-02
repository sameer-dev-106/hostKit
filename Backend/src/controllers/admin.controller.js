import Deployment from "../models/deployment.model.js";
import Project from "../models/project.model.js";
import userModel from "../models/user.model.js";

/**
 * @route GET /api/admin/users
 * @desc Get all users (Admin only)
 * @access Private (Admin)
 */
export async function getAllUsers(req, res, next) {
    try {
        const users = await userModel.find().select("-password");
        res.json({ success: true, data: users });
    } catch (err) { next(err); }
}

/**
 * @route GET /api/admin/projects
 * @desc Get all projects (Admin only)
 * @access Private (Admin)
 */
export async function getAllProjects(req, res, next) {
    try {
        const projects = await Project.find().populate("userId", "username email");
        res.json({ success: true, data: projects });
    } catch (err) { next(err); }
}

/**
 * @route GET /api/admin/deployments
 * @desc Get all deployments (Admin only)
 * @access Private (Admin)
 */
export async function getAllDeployments(req, res, next) {
    try {
        const deployments = await Deployment.find()
            .populate("userId", "username email")
            .populate("projectId", "name")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deployments });
    } catch (err) { next(err); }
}

/**
 * @route GET /api/admin/stats
 * @desc Get admin stats (Admin only)
 * @access Private (Admin)
 */
export async function getStats(req, res, next) {
    try {
        const [totalUsers, totalProjects, totalDeployments, runningDeployments] = await Promise.all([
            userModel.countDocuments(),
            Project.countDocuments(),
            Deployment.countDocuments(),
            Deployment.countDocuments({ status: "running" }),
        ]);
        res.json({
            success: true,
            data: { totalUsers, totalProjects, totalDeployments, runningDeployments }
        });
    } catch (err) { next(err); }
};
