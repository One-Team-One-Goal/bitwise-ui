const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
    AUTH: {
        SIGNUP: `${API_BASE_URL}/auth/signup`,
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },
    CALCULATOR: {
        SIMPLIFY: `${API_BASE_URL}/calculator/simplify`,
        EVALUATE: `${API_BASE_URL}/calculator/evaluate`,
        TRUTH_TABLE: `${API_BASE_URL}/calculator/truth-table`,
    },
    LESSONS: {
        GET_LESSONS: `${API_BASE_URL}/lessons`,
        GET_LESSON_BY_ID: (lessonId: number) => `${API_BASE_URL}/lessons/${lessonId}`,
    },
    ASSESSMENT: {
        GET_ASSESSMENTS: `${API_BASE_URL}/assessment/`,
        GET_ATTEMPT_BY_ID: (attemptId: string | number) => `${API_BASE_URL}/assessment/attempt/${attemptId}`,
        SUBMIT_ATTEMPT: `${API_BASE_URL}/assessment/submit-attempt`,
        SUBMIT_PRACTICE: `${API_BASE_URL}/assessment/submit-practice`,
        SUBMIT_ADAPTIVE_PRACTICE: `${API_BASE_URL}/assessment/submit-adaptive-practice`,
        GET_STATISTICS_BY_USER: (userId: string | number) => `${API_BASE_URL}/assessment/statistics/${userId}`,
    },
    ADAPTIVE: {
        GET_ANALYTICS_BY_USER: (userId: string | number) => `${API_BASE_URL}/adaptive/analytics/${userId}`,
    },
    // ...
    // add here for more
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;