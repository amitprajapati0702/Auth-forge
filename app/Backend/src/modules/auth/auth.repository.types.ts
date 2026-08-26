export interface CreateUserData {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
}