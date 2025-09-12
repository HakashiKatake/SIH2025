export interface GeoLocation {
    latitude: number;
    longitude: number;
    address?: string;
    state?: string;
    district?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
    path?: string;
}
export interface UserPayload {
    id: string;
    name: string;
    phone: string;
    preferredLanguage: string;
}
export interface DatabaseConfig {
    mongoUri: string;
    redisUrl: string;
}
export interface UserRegistration {
    name: string;
    phone: string;
    email?: string;
    password: string;
    location: GeoLocation;
    preferredLanguage: string;
    farmSize?: number;
    crops?: string[];
}
export interface LoginCredentials {
    phone: string;
    password: string;
}
//# sourceMappingURL=index.d.ts.map