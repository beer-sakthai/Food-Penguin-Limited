import React from 'react';
import { useApiContext } from '../context/ApiContext';

/**
 * A global loading bar that appears at the top of the page whenever an API request is in progress.
 */
export default function GlobalLoadingBar() {
    const { activeRequests } = useApiContext();

    if (activeRequests === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden">
            <div className="relative h-full w-full">
                <div className="absolute h-full w-full bg-orange-500 animate-indeterminate" />
            </div>
        </div>
    );
}