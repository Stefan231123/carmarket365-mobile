// API configuration

// Production GraphQL endpoint (NestJS backend on Railway)
export const API_URL = __DEV__
  ? 'http://localhost:3002/graphql'       // Local dev backend
  : 'https://carmarket365-backend.up.railway.app/graphql'; // Production

// Cloudinary configuration (read-only — uploads go through backend)
export const CLOUDINARY_CLOUD_NAME = 'dqduao6rg';
export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;
