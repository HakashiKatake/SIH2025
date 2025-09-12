import { Request, Response, NextFunction } from 'express';
export declare const uploadSingleImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handleUploadError: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const validateImageUpload: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.d.ts.map