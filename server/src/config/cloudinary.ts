import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { ApiError } from "../utils/ApiError";

export const getCloudinaryClient = () => {
  const credentials = [
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
  ];

  if (credentials.some((value) => !value)) {
    throw new ApiError(
      503,
      "Image uploads are unavailable. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};
