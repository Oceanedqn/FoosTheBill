export interface AuthResponse {
    accessToken?: string;
    id: string;
    email: string;
    error?: string;
    statusCode?: number;
}