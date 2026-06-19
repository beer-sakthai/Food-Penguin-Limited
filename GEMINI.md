# Project: Food Penguin Limited - Corporate Dashboard

This is a comprehensive, unified corporate dashboard for Food Penguin Limited. It's a modern web application designed for efficient restaurant and food-chain management.

## 🌟 Core Technologies

*   **Framework**: React 18 with TypeScript, built with Vite.
*   **Backend**: Node.js with Express, serving the frontend and providing a backend for AI integrations.
*   **Styling**: Tailwind CSS for a responsive, modern UI.
*   **AI Integration**: The backend heavily utilizes the Google Gemini API for various features, including strategic advice, image generation, and data analysis.
*   **Data Visualization**: `recharts` is used for creating interactive charts.
*   **Icons**: `lucide-react` for a consistent icon set.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   `npm` for package management.

### Environment Variables

The application uses the Gemini API for its AI features. You need to create a `.env` file in the root directory and add your API key:

```
GEMINI_API_KEY=your_api_key_here
```

You can get an API key from Google AI Studio.

### Key Scripts

*   **Development**: To run the application in development mode with hot-reloading:
    ```bash
    npm run dev
    ```
    This will start the server on `http://localhost:3000`.

*   **Building for Production**: To create a production-ready build:
    ```bash
    npm run build
    ```
    This command bundles the React frontend and the Express server into the `dist` directory.

*   **Running in Production**: To start the production server:
    ```bash
    npm run start
    ```

*   **Linting**: To perform a static type-check of the code:
    ```bash
    npm run lint
    ```

## 📂 Project Structure

*   `server.ts`: The Express server entry point. It handles API requests, particularly for the Gemini AI integrations, and serves the frontend application.
*   `src/App.tsx`: The main React component that orchestrates the entire frontend, including state management, navigation, and role-based access control.
*   `src/components/`: Contains the individual "tab" components, each representing a major feature of the dashboard (e.g., `SellTab.tsx`, `ProductionTab.tsx`).
*   `src/types.ts`: Centralized TypeScript interfaces for data structures used throughout the application.
*   `src/data.ts`: Provides initial data and state for the application.
*   `vite.config.ts`: Vite configuration file.
*   `package.json`: Defines project dependencies and scripts.

## 💡 Development Conventions

*   **State Management**: State is managed locally within `App.tsx` using `useState` and passed down to child components via props.
*   **Styling**: Utilize Tailwind CSS utility classes for styling. Global styles are in `src/index.css`.
*   **API**: The backend API routes are defined in `server.ts`. Frontend components interact with these endpoints for AI-powered features.
*   **Modularity**: The application is structured around feature-based tabs, making it easy to locate and work on specific areas of functionality.
