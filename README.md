# TaskFlow Pro Frontend

This is a modern React frontend application designed to integrate with a generic Task Management Backend API. It features JWT authentication, protected routes, and full CRUD capabilities for tasks.

## Setup Instructions

1.  **Install Dependencies**
    Ensure you have Node.js installed. Run the following command in the root directory:
    ```bash
    npm install
    ```

2.  **Configure Backend Connection**
    Open `constants.ts` and update the `API_BASE_URL` to point to your running backend server.
    ```typescript
    // constants.ts
    export const API_BASE_URL = 'http://localhost:5000/api'; // Update this if your backend runs on a different port/host
    ```

3.  **Run the Application**
    ```bash
    npm start
    ```

## API Requirements

This frontend expects a RESTful API with the following endpoints:

*   **POST** `/auth/register` - Body: `{ name, email, password }`, Response: `{ token, user: { id, name, email } }`
*   **POST** `/auth/login` - Body: `{ email, password }`, Response: `{ token, user: { id, name, email } }`
*   **GET** `/tasks` - Headers: `Authorization: Bearer <token>`, Response: `[ { id, title, description, isCompleted, ... } ]`
*   **POST** `/tasks` - Headers: `Authorization: Bearer <token>`, Body: `{ title, description, ... }`
*   **PUT** `/tasks/:id` - Headers: `Authorization: Bearer <token>`, Body: `{ ...updates }`
*   **DELETE** `/tasks/:id` - Headers: `Authorization: Bearer <token>`

## Tech Stack

*   React 18
*   TypeScript
*   Tailwind CSS
*   Recharts (Visualization)
*   Lucide React (Icons)
