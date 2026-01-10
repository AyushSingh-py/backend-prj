import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_KEY_SECRET
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : 'auto'
        })

        //file uploaded
        console.log("FILE IS UPLOADED ON CLOUDINARY",response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //it removes locally stored file as above operation got failed
        return null;
    }
}
export {uploadOnCloudinary}


