interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

class CloudStorageService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo-cloud';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hr360_preset';
  }

  async uploadFile(file: File, folder: string = 'hr360'): Promise<UploadResult> {
    // For demo purposes, simulate successful upload without actual cloud storage
    if (!this.cloudName || this.cloudName === 'demo-cloud') {
      console.log('Demo mode: Simulating file upload');
      return {
        success: true,
        url: `https://demo-storage.com/${folder}/${file.name}`,
        publicId: `demo_${Date.now()}_${file.name}`,
      };
    }

    if (!this.cloudName) {
      console.warn('Cloudinary not configured');
      return { success: false, error: 'Cloud storage not configured' };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.cloudName) {
      return { success: false, error: 'Cloud storage not configured' };
    }

    try {
      // Note: Deletion requires server-side implementation with API secret
      // This is a placeholder for the frontend
      console.log('File deletion would be handled server-side:', publicId);
      return { success: true };
    } catch (error) {
      console.error('File deletion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed',
      };
    }
  }

  generateThumbnail(url: string, width: number = 300, height: number = 300): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    // Insert transformation parameters into Cloudinary URL
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
  }

  generateOptimizedUrl(url: string, quality: number = 80): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    return url.replace('/upload/', `/upload/q_${quality},f_auto/`);
  }
}

export const cloudStorage = new CloudStorageService();

// File validation utilities
export const validateFile = (file: File, options: {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}): { valid: boolean; error?: string } => {
  const { maxSize = 10, allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } = options;

  // Check file size
  if (file.size > maxSize * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSize}MB` };
  }

  // Check file type
  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
