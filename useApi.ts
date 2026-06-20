import { useState, useCallback } from 'react';
import { useApiContext } from './context/ApiContext';
import toast from 'react-hot-toast';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface ExecuteOptions {
    successMessage?: string;
}

/**
 * A generic custom hook to handle API calls, managing loading, error, and data states.
 * @template T The expected data type of the API response.
 * @template P The type of the parameters for the API call.
 */
export function useApi<T, P>() {
    const { incrementRequests, decrementRequests } = useApiContext();
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    /**
     * Executes the API call.
     * @param apiFunc A function that takes parameters and returns a promise resolving to the API data.
     * @param params The parameters to pass to the API function.
     */
    const execute = useCallback(async (
        apiFunc: (params: P) => Promise<T>,
        params: P,
        options: ExecuteOptions = {}
    ) => {
        incrementRequests();
        setState({ data: null, loading: true, error: null });
        try {
            const responseData = await apiFunc(params);
            setState({ data: responseData, loading: false, error: null });
            toast.success(options.successMessage || 'Operation successful!');
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setState({ data: null, loading: false, error: errorMessage });
            toast.error(errorMessage);
        } finally {
            decrementRequests();
        }
    }, [incrementRequests, decrementRequests]);

    return { ...state, execute };
}