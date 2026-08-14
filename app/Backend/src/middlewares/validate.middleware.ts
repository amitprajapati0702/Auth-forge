import type { NextFunction ,Request,Response } from "express";
import type { ZodTypeAny } from "zod";

import ApiError from "../utils/ApiError.js";
import httpStatus from "../utils/http-status.js";
import { ErrorCodes } from "../utils/error-codes.js";



export function validate(schema:ZodTypeAny){
    return (req:Request,res:Response,next:NextFunction):void =>{
        const result = schema.safeParse(req.body);

        if(!result.success){
            return next(
                 new ApiError({
                    statuscode: httpStatus.BAD_REQUEST,
                    message: "Validation failed.",
                    errorcode: ErrorCodes.VALIDATION_ERROR,
                    details: result.error.flatten(),
                    isOperational: true
                }),
            )
        }

        req.validatedBody = result.data;
        next();
    };

}