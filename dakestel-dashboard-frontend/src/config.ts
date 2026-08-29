// Base URL for the backend API.
// Override per environment with VITE_API_URL (see .env.example).
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
