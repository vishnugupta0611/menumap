"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(formData) {
  console.log("Upload Action started...");
  console.log("Cloud Name available?", !!process.env.CLOUDINARY_CLOUD_NAME);
  
  const file = formData.get("file");
  if (!file) throw new Error("No file found in formData");

  console.log("File received:", file.name, file.size);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString("base64");
  const fileUri = `data:${file.type};base64,${base64Data}`;

  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      folder: "food-menu",
    });
    return { success: true, url: res.secure_url };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return { success: false, error: err.message || "Cloudinary upload failed" };
  }
}
