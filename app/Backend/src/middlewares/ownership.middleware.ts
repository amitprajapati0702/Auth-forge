import type { Request,Response,NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { ErrorCodes } from "../utils/error-codes.js";
import httpStatus from "../utils/http-status.js";

export function requireOwnership(paramname = "id"){
    return (req:Request,res:Response,next:NextFunction) => {

        if(req.user?.userId !== req.params[paramname]){
            return next(
                new ApiError({
                    statuscode:httpStatus.FORBIDDEN,
                    message:"You can only update your own profile",
                    errorcode:ErrorCodes.AUTHORIZATION_ERROR,
                })
            )
        }
      
     next()

    }

}