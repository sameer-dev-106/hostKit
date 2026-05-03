import { useCallback } from "react";
import { useDashboard } from "./useDashboard";
import { getResourceUsageApi, getInsightsApi } from "../services/dashboard.api";

export const useResources = () => {
    const {
        resourceUsage,
        insights,
        loading,
        error,
        setLoading,
        setError,
        updateResourceUsage,
        updateInsights,
    } = useDashboard();

    const fetchResourceUsage = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getResourceUsageApi();
            updateResourceUsage(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch resource usage";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, updateResourceUsage]);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInsightsApi();
            updateInsights(response.data || []);
            return response.data || [];
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch insights";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, updateInsights]);

    return {
        resourceUsage,
        insights,
        loading,
        error,
        fetchResourceUsage,
        fetchInsights,
    };
};