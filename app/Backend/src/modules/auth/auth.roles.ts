export const ROLES = {
    USER : "USER",
    ADMIN : "ADMIN",
    SUPER_ADMIN : "SUPER_ADMIN",
} as const


export type Roles = (typeof ROLES)[keyof typeof ROLES];