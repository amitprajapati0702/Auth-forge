import type { NextFunction,Request,Response } from "express";
import {createId} from "@paralleldrive/cuid2";



export function requestIdMiddleware(req : Request,res : Response,next : NextFunction) : void{
    const requestId = createId()
    
    req.requestId = requestId

    res.setHeader('X-Request-Id',requestId)
    next()

}

export default requestIdMiddleware