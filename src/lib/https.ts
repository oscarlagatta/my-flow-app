// src/lib/http.ts
import { createClient } from './api/client/client.gen';

// Create and configure the client instance
export const client = createClient({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});
