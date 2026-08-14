export interface ApiErrorOptions {
    statuscode?: number;
    statusCode?: number;
    message: string;
    errorcode: string;
    details?: unknown;
    isOperational?: boolean;
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly statuscode: number;
    public readonly errorcode: string;
    public readonly details?: unknown;
    public readonly isOperational: boolean;

    constructor({
        statuscode,
        statusCode,
        message,
        errorcode,
        details,
        isOperational = true,
    }: ApiErrorOptions) {
        super(message);
        const resolvedStatus = statusCode ?? statuscode ?? 500;
        this.statusCode = resolvedStatus;
        this.statuscode = resolvedStatus;
        this.errorcode = errorcode;
        this.details = details;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}


export default ApiError