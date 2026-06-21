import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalLoadingBar from '../../src/components/GlobalLoadingBar';
import { ApiContext } from '../../src/context/ApiContext'; // Import the context itself
import { ReactNode } from 'react';

// A custom render function to provide a mock context value
const customRender = (ui: React.ReactElement, { providerProps, ...renderOptions }: { providerProps: { activeRequests: number } }) => {
    return render(
        <ApiContext.Provider value={{
            activeRequests: providerProps.activeRequests,
            incrementRequests: () => {},
            decrementRequests: () => {},
        }}>
            {ui}
        </ApiContext.Provider>,
        renderOptions
    );
};

describe('GlobalLoadingBar', () => {
    it('should not render when there are no active requests', () => {
        const providerProps = { activeRequests: 0 };
        customRender(<GlobalLoadingBar />, { providerProps });
        
        // The component returns null, so we query for something that wouldn't be there.
        // It doesn't have a specific role, so we can check for its container div.
        const loadingBarContainer = screen.queryByRole('generic', { name: /loading/i });
        expect(loadingBarContainer).not.toBeInTheDocument();
    });

    it('should render when there is at least one active request', () => {
        const providerProps = { activeRequests: 1 };
        customRender(<GlobalLoadingBar />, { providerProps });

        // The component is a div with a specific class structure when visible.
        // Let's add a data-testid to make it easier to find.
        const loadingBar = screen.getByTestId('global-loading-bar');
        expect(loadingBar).toBeInTheDocument();
    });
});
