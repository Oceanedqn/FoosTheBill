

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}
export interface AuthResponse {
    accessToken: string,
    id: string,
    email: string

}

