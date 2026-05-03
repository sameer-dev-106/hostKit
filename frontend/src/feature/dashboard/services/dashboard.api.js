import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
});

// Projects API
export async function getProjectsApi() {
    try {
        const response = await API.get("/projects");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch projects" };
    }
}

export async function getProjectByIdApi(projectId) {
    try {
        const response = await API.get(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch project" };
    }
}

export async function createProjectApi(projectData) {
    try {
        const response = await API.post("/projects", projectData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create project" };
    }
}

export async function deleteProjectApi(projectId) {
    try {
        const response = await API.delete(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete project" };
    }
}

// Deployments API
export async function getDeploymentsApi(projectId) {
    try {
        const response = await API.get(`/deploy/project/${projectId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch deployments" };
    }
}

export async function getDeploymentByIdApi(deploymentId) {
    try {
        const response = await API.get(`/deploy/${deploymentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch deployment" };
    }
}

export async function createDeploymentApi(projectId) {
    try {
        const response = await API.post(`/deploy/${projectId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create deployment" };
    }
}

export async function stopDeploymentApi(deploymentId) {
    try {
        const response = await API.post(`/deploy/stop/${deploymentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to stop deployment" };
    }
}

export async function rollbackDeploymentApi(projectId) {
    try {
        const response = await API.post(`/deploy/rollback/${projectId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to rollback deployment" };
    }
}

// Resource Usage API
export async function getResourceUsageApi() {
    try {
        const response = await API.get("/resources/usage");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch resource usage" };
    }
}

// AI Insights API
export async function getInsightsApi() {
    try {
        const response = await API.get("/insights");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch insights" };
    }
}