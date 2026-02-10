import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Types for upload response
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  asset_id?: string;
  folder?: string;
}

// Upload file from buffer (useful for API routes)
export async function uploadToCloudinary(
  buffer: Buffer,
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    transformation?: object[];
  }
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || "uploads",
        public_id: options?.public_id,
        resource_type: options?.resource_type || "auto",
        transformation: options?.transformation,
        timeout: 60000, // 60 seconds timeout
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else if (result) {
          resolve(result as unknown as CloudinaryUploadResult);
        } else {
          reject(new Error("Upload failed: no result returned from Cloudinary"));
        }
      }
    );

    // Handle stream errors
    uploadStream.on("error", (error) => {
        console.error("Upload Stream Error:", error);
        reject(error);
    });

    uploadStream.end(buffer);
  });
}


// Upload from base64 string
export async function uploadBase64ToCloudinary(
  base64String: string,
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
  }
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(base64String, {
    folder: options?.folder || "uploads",
    public_id: options?.public_id,
    resource_type: options?.resource_type || "auto",
  });

  return result as unknown as CloudinaryUploadResult;
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

// Generate optimized URL for displaying images
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop || "fill",
        quality: options?.quality || "auto",
        fetch_format: options?.format || "auto",
      },
    ],
  });
}
