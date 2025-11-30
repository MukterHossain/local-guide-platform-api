import { UserRole } from "@prisma/client";

export interface IUser {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole
}