module.exports = {
  UPLOAD_FIELD_NAME: "file",
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_MIME_TYPES: [
    "application/dicom",
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
  ],
  ALLOWED_EXTENSIONS: [
    ".dcm",
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tiff",
    ".tif",
    ".webp",
  ],
  AI_PATHS: {
    health: "/api/v1/health",
    auth: {
      register: "/api/v1/auth/register",
      login: "/api/v1/auth/login",
      refresh: "/api/v1/auth/refresh",
      me: "/api/v1/auth/me",
    },
    predict: "/api/v1/predict",
    feedback: "/api/v1/feedback",
  },
};