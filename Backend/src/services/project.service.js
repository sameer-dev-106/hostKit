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
 * Deploy the project by cloning the repository, checking out the specified branch, installing dependencies, and building the project
 * @param {Object} project - The project object containing deployment details
 * @returns {Promise<boolean>} - Returns true if deployment is successful, false otherwise
 */
export const deployProject = async (project) => {
    try {
        const projectPath = path.join("deployments", project._id.toString());

        // clean folder
        if (fs.existsSync(projectPath)) {
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        fs.mkdirSync(projectPath, { recursive: true });

        project.status = "building";
        await project.save();

        console.log("Cloning repo...");

        await git.clone(project.repoUrl, projectPath);

        console.log("Clone done");

        const projectGit = simpleGit(projectPath);
        await projectGit.checkout(project.branch);

        console.log("Installing deps...");

        const { exec } = await import("child_process");

        exec(
            "npm install && npm run build",
            { cwd: projectPath },
            (err, stdout, stderr) => {
                if (err) {
                    console.log("BUILD ERROR:", stderr);

                    project.status = "failed";
                    project.save();
                    return;
                }

                console.log("BUILD SUCCESS:", stdout);

                project.status = "success";
                project.save();
            }
        );

        return true;
    } catch (error) {
        console.log("DEPLOY ERROR:", error);

        project.status = "failed";
        await project.save();

        return false; // throw mat kar, crash avoid
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

        // deploy start (sync)
        await deployProject(project);

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

