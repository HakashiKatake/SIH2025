export interface JWTPayload {
    userId: string;
    phone?: string;
    email?: string;
    name: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}
/**
 * Generate JWT access token
 */
export declare const generateAccessToken: (payload: JWTPayload) => string;
/**
 * Generate JWT refresh token (longer expiry)
 */
export declare const generateRefreshToken: (payload: JWTPayload) => string;
/**
 * Generate both access and refresh tokens
 */
export declare const generateTokens: (payload: JWTPayload) => TokenResponse;
/**
 * Verify JWT token
 */
export declare const verifyToken: (token: string) => JWTPayload;
/**
 * Extract token from Authorization header
 */
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=jwt.d.ts.map