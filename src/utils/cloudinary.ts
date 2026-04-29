import fs from "fs";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ApiError } from "./apiError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = async (
  localFilePath: string | undefined,
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;
    // upload to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //! file has been uploaded successfully
    // console.log("file has been uploaded successfully", response.url);
    // console.log("CLOUDINARY RESPONSE: ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    console.log(err);
    fs.unlinkSync(localFilePath!); //! remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (
  oldUrl: string,
  publicId: string,
): Promise<void> => {
  try {
    if (!(oldUrl || publicId))
      throw new ApiError(404, "oldUrl or publicId required");

    await cloudinary.uploader.destroy(publicId, {
      resource_type: `${oldUrl.includes("image") ? "image" : "video"}`,
    });
  } catch (error: any) {
    console.error("Error while deleting asset from Cloudinary:", error);
    throw new ApiError(500, error?.message || "Server error");
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
