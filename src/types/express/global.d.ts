import * as express from "express";

// declare global {
//     namespace Express {
//         interface Request {
//             files?: Express.Multer.File[]; // multiple files
//             file?: Express.Multer.File;    // single file
//         }
//     }
// }
declare global {
  namespace Express {
    interface Request {
      files?: Multer.File[];
      file?: Multer.File;
    }
  }
}