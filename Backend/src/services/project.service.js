import Project from "../models/project.model.js";

import axios from "axios";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const git = simpleGit();
const execAsync = promisify(exec);

/**
 * Verify if the provided GitHub repository URL is valid and accessible
 * @param {string} repoUrl - The GitHub repository URL to verify
 * @returns {Promise<{ exists: boolean, isPrivate: boolean, defaultBranch: string }>} - An object containing the verification result
 * @throws {Error} - Throws an error if the repository is invalid or inaccessible
 */
export const verifyGithubRepo = async (repoUrl) => {
    try {
        const cleanUrl = repoUrl.replace("https://github.com/", "");
        const apiUrl = `https://api.github.com/repos/${cleanUrl}`;

        const res = await axios.get(apiUrl);

        return {
            exists: true,
            isPrivate: res.data.private,
            defaultBranch: res.data.default_branch,
        };
    } catch (err) {
        throw new Error("Invalid or non-existing GitHub repo");
    }
};

/**
 * Create a new project by verifying the GitHub repository and deploying it
 * @param {string} userId - The ID of the user creating the project
 * @param {Object} data - The project data containing repoUrl, branch, and other details
 * @returns {Promise<Object>} - The created project object
 * @throws {Error} - Throws an error if project creation fails
 */
export const createProject = async (userId, data) => {
    try {
        // repo verify
        const repoInfo = await verifyGithubRepo(data.repoUrl);

        const project = await Project.create({
            userId,
            ...data,
            branch: data.branch || repoInfo.defaultBranch,
        });

        return project;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all projects for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - A list of projects for the user
 */
export const getUserProjects = async (userId) => {
    try {
        const projects = await Project.find({ userId }).sort({ createdAt: -1 });
        return projects;
    } catch (error) {
        throw new Error("Error fetching projects");
    }
};

/**
 * @route GET /api/projects/:id
 * @desc Get a single project by ID
 * @access Private
 */
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

/**
 * Delete a project by ID for a specific user
 * @param {string} userId - The ID of the user
 * @param {string} projectId - The ID of the project to delete
 * @returns {Promise<Object>} - The deleted project object
 * @throws {Error} - Throws an error if the project is not found or unauthorized
 */
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

