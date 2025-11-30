import { User, UserRole } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";

const createUser = async (req:Request): Promise<User> =>{
    
 const hasshedPassword = await bcrypt.hash(req.body.password, 10);

    const result = await prisma.user.create({
        data: {
            email: req.body.email,
            password: hasshedPassword,
            name: req.body.name,
            phone: req.body.phone,
            role: req.body.role as UserRole || UserRole.USER,
        }
    })
    console.log("user", result)
    return result
}








export const UserService = {
    createUser
}