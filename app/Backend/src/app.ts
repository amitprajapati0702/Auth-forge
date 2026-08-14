import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { urlencoded } from "express";
import router from "./routes/index.js"
import helmet from "helmet";
import { env } from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import requestIdMiddleware from "./middlewares/request-id.middleware.js";
import requestLoggerMiddleware from "./middlewares/request-logger.middleware.js";
import type {Application} from "express"
import { globalRateLimit } from "./middlewares/rate.limit.middleware.js";

const app:Application = express()

// Middleware (Security)
app.use(helmet({crossOriginResourcePolicy:false}))
app.use(cors({
    origin:env.NODE_ENV === 'production' ? false :env.FRONTEND_URL,
    credentials:true
}))

app.use(compression())
app.use(cookieParser())
app.use(express.json({limit:"1mb"}))
app.use(express.urlencoded({extended:true ,limit:"1mb"}))
app.use(requestIdMiddleware)
app.use(globalRateLimit)
app.use(requestLoggerMiddleware)


// Routes
app.get("/api/v1" , (_req,res) => {
    res.json({
        success:true,
        message:"AuthForge Api is running",
    })
})

app.use("/api/v1" , router)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
