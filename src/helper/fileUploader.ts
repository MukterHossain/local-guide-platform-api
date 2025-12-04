import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config';


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(process.cwd(), "/uploads"))
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// })
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "/uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage }) 

cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.api_secret
    });
    console.log("file uploader", cloudinary.config());

const uploadToCloudinary = async (file: Express.Multer.File | Express.Multer.File[]) => {
    if (Array.isArray(file)) {
        const urls: string[] = [];
        for (const f of file) {
            const result = await cloudinary.uploader.upload(f.path, {
                public_id: f.filename,
            });
            urls.push(result.secure_url);
        }
        return urls; // multiple URLs
    } else {
        const result = await cloudinary.uploader.upload(file.path, {
            public_id: file.filename,
        });
        return result.secure_url; // single URL
    }
};

export const fileUploader = {
    upload,
    uploadToCloudinary
}