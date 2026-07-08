"use server";

import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 encoded image to Cloudinary securely via Server Action.
 * @param {string} base64Image - The image data (e.g. "data:image/jpeg;base64,...")
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadImageToCloudinary(base64Image) {
  try {
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are not configured in the environment");
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "menumap", // Organizes uploads in a 'menumap' folder
    });

    return {
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload image");
  }
}
