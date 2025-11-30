import { Request, Response } from "express";
import { UserService } from "./user.service";


const createUser = (async (req:Request, res:Response) =>{
    const result = await UserService.createUser(req)
    console.log("result", result);

    
})


export const UserController = {
    createUser
}