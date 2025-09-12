import { Response } from 'express';
import { ApiResponse } from '../types';
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number) => Response;
export declare const sendError: (res: Response, code: string, message: string, statusCode?: number, details?: any) => Response;
export declare const createSuccessResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const createErrorResponse: (code: string, message: string, details?: any) => ApiResponse;
//# sourceMappingURL=response.d.ts.map