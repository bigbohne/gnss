# 📚 Project Documentation

## 🌐 Key Technologies Stack

This project utilizes a modern JavaScript/TypeScript stack, centered around a high-performance runtime and a component-based UI framework.

**Runtime & Core Tools:**
*   **Language:** JavaScript / TypeScript
*   **Runtime Environment:** Bun (used for running development and production scripts)
*   **Build/Tooling:** PostCSS, PostCSS-preset-mantine (for styling and asset processing)

**Frontend Frameworks & Libraries:**
*   **UI Framework:** React (Core component library)
*   **UI Component Library:** Mantine (`@mantine/core`, `@mantine/hooks`)
*   **State Management:** Jotai (Atomic state management)
*   **Data Fetching:** TanStack Query (`@tanstack/react-query`)
*   **Styling:** CSS/PostCSS (via Mantine integration)

**Specialized & Utility Libraries:**
*   **Location/GNSS:** `ntrip-client`, `haversine-distance` (Suggests functionality related to GNSS data processing and geospatial calculations).
*   **Date & Time:** Luxon
*   **Networking:** Axios (HTTP client)
*   **Utilities:** `use-local-storage-state`, `lucide-react` (Icons)

## 📂 Main Modules and Components

The codebase structure suggests a typical frontend application organization.

**Primary Modules/Directories:**
*   **`/src`:** This is the main source code directory, indicated by the startup scripts (`bun --hot src/index.ts`). This module houses the primary application logic, components, and entry points.
*   **`/node_modules`:** Contains all project dependencies (not considered a source module, but vital for dependency management).
*   **`/dist`:** (Inferred) The output directory where compiled and minified production assets are placed, as referenced in the `build` script.

***

### Summary Table

| Category | Technology/Component | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Bun | JavaScript runtime, fast execution environment. |
| **Language** | TypeScript/JavaScript | Core programming language. |
| **UI Framework** | React, React-DOM | Building the user interface in a component-based manner. |
| **UI Components** | Mantine | Comprehensive set of pre-built, customizable UI components. |
| **State Management** | Jotai | Lightweight, atomic state management solution. |
| **Data Handling** | TanStack Query | Managing asynchronous data fetching and caching. |
| **Geospatial** | `ntrip-client`, `haversine-distance` | Handling GNSS data and calculating distances between coordinates. |
| **Date/Time** | Luxon | Robust library for parsing, manipulating, and formatting dates and times. |
| **Networking** | Axios | Making HTTP requests. |