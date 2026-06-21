/**
 * A generic utility function for making POST requests to the application's API.
 * It handles JSON stringification, headers, and standardized error handling.
 *
 * @template T The expected data type of the API response.
 * @param endpoint The API endpoint to call (e.g., '/api/gemini/summarize-sales').
 * @param body The request payload to be sent as JSON.
 * @returns A promise that resolves with the JSON response data.
 * @throws An error if the request fails or the server returns an error.
 */
export async function postApi<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
}

/**
 * Specifically for synchronizing core metrics from the data input tab.
 * @param branchId The ID of the branch to sync data for.
 * @param metrics The core metrics to update.
 * @returns A promise that resolves with a success message.
 */
export async function syncData(params: { branchId: string; metrics: any }): Promise<{ success: boolean }> {
    // For now, this will fail because the endpoint doesn't exist.
    // This allows us to test the error handling.
    // In a real implementation, you would create this endpoint in `server.ts`.
    return postApi<{ success: boolean }>('/api/sync-data', params);
}