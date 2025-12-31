import { UserRole } from "@prisma/client";

export interface IUser {
    name: string;
    email: string;
    address?: string;
    password: string;
    phone?: string;
    role?: UserRole
}
export type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: "MALE" | "FEMALE";
};