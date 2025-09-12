export declare class DatabaseError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const handleMongooseError: (error: any) => DatabaseError;
export declare const handleRedisError: (error: any) => DatabaseError;
//# sourceMappingURL=errors.d.ts.map