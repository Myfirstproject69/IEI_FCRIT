import axios from 'axios';

// Your Cloudinary details from previous steps
const CLOUDINARY_UPLOAD_PRESET = 'KRISHNA'; 
const CLOUDINARY_CLOUD_NAME = 'df0ixh7j2';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_API_URL, formData);
    return response.data.secure_url; // Returns the URL of the uploaded image
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};