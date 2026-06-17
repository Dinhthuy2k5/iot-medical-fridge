const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  console.warn('Missing EXPO_PUBLIC_API_BASE_URL. Create mobile-app/.env.local from .env.example for Expo Go.');
}

export const API_BASE = apiBaseUrl ?? 'http://localhost:8080/api/v1';