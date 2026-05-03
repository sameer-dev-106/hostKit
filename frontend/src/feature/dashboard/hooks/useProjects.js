import { useCallback } from "react";
import { useDashboard } from "./useDashboard";
import {
    getProjectsApi,
    createProjectApi,
    deleteProjectApi,
} from "../services/dashboard.api";

export const useProjects = () => {
    const { projects, loading, error, setLoading, setError, updateProjects, addProject, removeProject } = useDashboard();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProjectsApi();
            updateProjects(response.data || []);
            return response.data || [];
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch projects";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, updateProjects]);

    const createProject = useCallback(
        async (projectData) => {
            setLoading(true);
            setError(null);
            try {
                const response = await createProjectApi(projectData);
                const newProject = response.data;
                addProject(newProject);
                return newProject;
            } catch (err) {
                const errorMessage = err.message || "Failed to create project";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, addProject]
    );

    const deleteProject = useCallback(
        async (projectId) => {
            setLoading(true);
            setError(null);
            try {
                await deleteProjectApi(projectId);
                removeProject(projectId);
            } catch (err) {
                const errorMessage = err.message || "Failed to delete project";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, removeProject]
    );

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        deleteProject,
    };
};
