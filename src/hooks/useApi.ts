import { useState, useCallback } from 'react';
import { useApiContext } from '../context/ApiContext';
import toast from 'react-hot-toast';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface ExecuteOptions {
    successMessage?: string;
    loadingMessage?: string;
}

/**
 * A generic custom hook to handle API calls, managing loading, error, and data states.
 * @template T The expected data type of the API response.
 * @template P The type of the parameters for the API call.
 */
export function useApi<T, P = any>() {
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
        options: ExecuteOptions = {},
    ) => {
        incrementRequests();
        setState({ data: null, loading: true, error: null });

        const promise = apiFunc(params);

        toast.promise(promise, {
            loading: options.loadingMessage || 'Processing...',
            success: (data) => {
                setState({ data, loading: false, error: null });
                decrementRequests();
                return options.successMessage || 'Operation successful!';
            },
            error: (err: any) => {
                const errorMessage = err.message || 'An unknown error occurred.';
                setState({ data: null, loading: false, error: errorMessage });
                decrementRequests();
                return errorMessage;
            },
        });

        // We still await the promise to ensure the calling component can chain actions if needed.
        await promise.catch(() => { /* Errors are handled by toast.promise */ });
    }, [incrementRequests, decrementRequests]);

    return { ...state, execute };
}