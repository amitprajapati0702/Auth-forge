import type { Request, Response, NextFunction, RequestHandler } from "express";
import ApiError from "../utils/ApiError.js";
import httpStatus from "../utils/http-status.js";
import { ErrorCodes } from "../utils/error-codes.js";

export function authorize(...allowedRoles: string[]): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const role = req.user?.role;

        if (!role) {
            return next(
                new ApiError({
                    statuscode: httpStatus.UNAUTHORIZED,
                    message: "Authentication required",
                    errorcode: ErrorCodes.AUTHORIZATION_ERROR,
                })
            );
        }

        if (!allowedRoles.includes(role)) {
            return next(
                new ApiError({
                    statuscode: httpStatus.FORBIDDEN,
                    message: "Insufficient permissions",
                    errorcode: ErrorCodes.AUTHORIZATION_ERROR,
                })
            );
        }

        next();
    };
}

export default authorize;
