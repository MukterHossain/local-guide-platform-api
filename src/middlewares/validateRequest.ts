import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
       const parsed= await schema.parseAsync(req.body);
        req.body = parsed
        // await schema.parseAsync({
        //     body: req.body
        // })
        return next()

    } catch (err) {
        next(err);
    }
}

export default validateRequest;