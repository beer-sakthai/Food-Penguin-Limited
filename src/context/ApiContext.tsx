import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ApiContextType {
    activeRequests: number;
    incrementRequests: () => void;
    decrementRequests: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

/**
 * Provides a global state for tracking the number of active API requests.
 */
export const ApiProvider = ({ children }: { children: ReactNode }) => {
    const [activeRequests, setActiveRequests] = useState(0);

    const incrementRequests = useCallback(() => {
        setActiveRequests(prev => prev + 1);
    }, []);

    const decrementRequests = useCallback(() => {
        setActiveRequests(prev => Math.max(0, prev - 1));
    }, []);

    return (
        <ApiContext.Provider value={{ activeRequests, incrementRequests, decrementRequests }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApiContext = () => {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error('useApiContext must be used within an ApiProvider');
    }
    return context;
};