import { useCallback } from "react";
import { useDashboard } from "./useDashboard";
import {
    getDeploymentsApi,
    createDeploymentApi,
    stopDeploymentApi,
    rollbackDeploymentApi,
} from "../services/dashboard.api";

export const useDeployments = () => {
    const { deployments, loading, error, setLoading, setError, updateDeployments, addDeployment, updateDeploymentStatus } = useDashboard();

    const fetchDeployments = useCallback(
        async (projectId) => {
            setLoading(true);
            setError(null);
            try {
                const response = await getDeploymentsApi(projectId);
                updateDeployments(response.data || []);
                return response.data || [];
            } catch (err) {
                const errorMessage = err.message || "Failed to fetch deployments";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, updateDeployments]
    );

    const createDeployment = useCallback(
        async (projectId) => {
            setLoading(true);
            setError(null);
            try {
                const response = await createDeploymentApi(projectId);
                const newDeployment = response.data;
                addDeployment(newDeployment);
                return newDeployment;
            } catch (err) {
                const errorMessage = err.message || "Failed to create deployment";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, addDeployment]
    );

    const stopDeployment = useCallback(
        async (deploymentId) => {
            setLoading(true);
            setError(null);
            try {
                const response = await stopDeploymentApi(deploymentId);
                updateDeploymentStatus(deploymentId, "stopped");
                return response;
            } catch (err) {
                const errorMessage = err.message || "Failed to stop deployment";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, updateDeploymentStatus]
    );

    const rollbackDeployment = useCallback(
        async (projectId) => {
            setLoading(true);
            setError(null);
            try {
                const response = await rollbackDeploymentApi(projectId);
                const newDeployment = response.data;
                addDeployment(newDeployment);
                return newDeployment;
            } catch (err) {
                const errorMessage = err.message || "Failed to rollback deployment";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, addDeployment]
    );

    return {
        deployments,
        loading,
        error,
        fetchDeployments,
        createDeployment,
        stopDeployment,
        rollbackDeployment,
    };
};
