export interface RegisterInput{
    fullName:string;
    email:string;
    password:string;
}

export interface VerifyOtpInput{
    email:string;
    otp:string;
}

export interface LoginInput{
    email:string;
    password:string;
}


export interface PendingRegistration{
    fullname:string;
    email:string;
    passwordHash:string;
    otpHash:string;
    attempts:number;
    createdAt:string;
}


