import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


  const uploadOnCloudinary=async(localfilepath)=>{
    try {
        if(!localfilepath){
            return null
        }

        //upload the file on cloudinary
        const response =await cloudinary.v2.uploader.upload(localfilepath,{
            resource_type:"auto",
        })
        //file has been uploaded successfully
        console.log("file has been uploaded successfully in cloudinary")
        console.log(response.url)
        return response


    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the local file as the upload failed
        console.log("File Upload failed in cloudinary "+error)
        return null
    }
  }
})();
