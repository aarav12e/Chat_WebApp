import { v2 as cloudinary} from 'cloudinary';

import { config } from 'dotenv';

config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINAR_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINAR_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINAR_API_SECRET,
});

export default cloudinary;