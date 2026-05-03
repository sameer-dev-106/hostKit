import { createContext, useState, useCallback } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeDeployments: 0,
        totalDeployments: 0,
        failedDeployments: 0,
    });
    const [resourceUsage, setResourceUsage] = useState({
        bandwidth: { used: 0, total: 10, unit: 'TB' },
        buildMinutes: { used: 0, total: 2000 },
        plan: { name: 'Starter', type: 'starter' },
    });
    const [insights, setInsights] = useState([]);

    const updateProjects = useCallback((newProjects) => {
        setProjects(newProjects);
        setStats((prev) => ({
            ...prev,
            totalProjects: newProjects.length,
        }));
    }, []);

    const updateDeployments = useCallback((newDeployments) => {
        setDeployments(newDeployments);
        const active = newDeployments.filter((d) => d.status === "running").length;
        const failed = newDeployments.filter((d) => d.status === "failed").length;
        setStats((prev) => ({
            ...prev,
            activeDeployments: active,
            totalDeployments: newDeployments.length,
            failedDeployments: failed,
        }));
    }, []);

    const addProject = useCallback((project) => {
        setProjects((prev) => [project, ...prev]);
        setStats((prev) => ({
            ...prev,
            totalProjects: prev.totalProjects + 1,
        }));
    }, []);

    const removeProject = useCallback((projectId) => {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        setStats((prev) => ({
            ...prev,
            totalProjects: Math.max(0, prev.totalProjects - 1),
        }));
    }, []);

    const addDeployment = useCallback((deployment) => {
        setDeployments((prev) => [deployment, ...prev]);
        if (deployment.status === "running") {
            setStats((prev) => ({
                ...prev,
                activeDeployments: prev.activeDeployments + 1,
                totalDeployments: prev.totalDeployments + 1,
            }));
        }
    }, []);

    const updateDeploymentStatus = useCallback((deploymentId, status) => {
        setDeployments((prev) =>
            prev.map((d) =>
                d._id === deploymentId ? { ...d, status } : d
            )
        );
        setDeployments((prev) => {
            const deployment = prev.find((d) => d._id === deploymentId);
            if (deployment && deployment.status !== status) {
                if (deployment.status === "running" && status !== "running") {
                    setStats((s) => ({
                        ...s,
                        activeDeployments: Math.max(0, s.activeDeployments - 1),
                    }));
                }
                if (status === "failed") {
                    setStats((s) => ({
                        ...s,
                        failedDeployments: s.failedDeployments + 1,
                    }));
                }
            }
            return prev;
        });
    }, []);

    const updateResourceUsage = useCallback((newUsage) => {
        setResourceUsage(newUsage);
    }, []);

    const updateInsights = useCallback((newInsights) => {
        setInsights(newInsights);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Compute unique regions across all projects
    const uniqueRegions = [...new Set(projects.map((p) => p.region).filter(Boolean))];

    const value = {
        // State
        projects,
        deployments,
        loading,
        error,
        selectedProject,
        stats,
        resourceUsage,
        insights,
        uniqueRegions,

        // Actions
        setLoading,
        setError,
        setSelectedProject,
        updateProjects,
        updateDeployments,
        addProject,
        removeProject,
        addDeployment,
        updateDeploymentStatus,
        updateResourceUsage,
        updateInsights,
        clearError,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};