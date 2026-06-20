import { useState, useCallback } from 'react';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * A generic custom hook to handle API calls, managing loading, error, and data states.
 * @template T The expected data type of the API response.
 * @template P The type of the parameters for the API call.
 */
export function useApi<T, P>() {
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
    const execute = useCallback(async (apiFunc: (params: P) => Promise<T>, params: P) => {
        setState({ data: null, loading: true, error: null });
        try {
            const responseData = await apiFunc(params);
            setState({ data: responseData, loading: false, error: null });
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setState({ data: null, loading: false, error: errorMessage });
        }
    }, []);

    return { ...state, execute };
}