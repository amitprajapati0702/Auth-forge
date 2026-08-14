import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { ErrorCodes } from "../utils/error-codes.js";


export async function authorize(...allowedroles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const role = req.user?.role

        if (!role) {
            return next(
                new ApiError({
                    statuscode: 401,
                    message: "Unauthorized",
                    errorcode: ErrorCodes.AUTHORIZATION_ERROR,
                })
            )
        }

        if (!allowedroles.includes(role)) {
            return next(
                new ApiError({
                    statuscode: 403,
                    message: "Insufficient Permissions",
                    errorcode: ErrorCodes.AUTHORIZATION_ERROR,
                })
            )
        }

        next()
    }

}
