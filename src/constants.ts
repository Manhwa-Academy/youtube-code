// constants.ts hoặc config.ts
export const DEFAULT_LIMIT = 5;

// Luôn lấy từ env, fallback localhost cho dev
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";