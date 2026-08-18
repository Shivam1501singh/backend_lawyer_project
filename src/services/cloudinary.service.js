import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder',
});

/**
 * Uploads a file buffer directly to Cloudinary.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} [publicId] - Optional predefined public ID (for overwrite).
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadBufferToCloudinary = (fileBuffer, publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: process.env.CLOUDINARY_FOLDER || 'advocates',
      resource_type: 'image',
    };
    
    if (publicId) {
      options.public_id = publicId.split('/').pop(); // strip folder prefix if present
      options.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary using public ID.
 * @param {string} publicId - Cloudinary public ID.
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error.message);
  }
};
