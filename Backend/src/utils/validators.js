const path = require("path");
const { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } = require("../config/constants");

const hasJpegSignature = (buffer) =>
  buffer?.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

const hasPngSignature = (buffer) =>
  buffer?.length >= 8 &&
  buffer[0] === 0x89 &&
  buffer[1] === 0x50 &&
  buffer[2] === 0x4e &&
  buffer[3] === 0x47 &&
  buffer[4] === 0x0d &&
  buffer[5] === 0x0a &&
  buffer[6] === 0x1a &&
  buffer[7] === 0x0a;

const hasBmpSignature = (buffer) =>
  buffer?.length >= 2 &&
  buffer[0] === 0x42 &&
  buffer[1] === 0x4d;

const hasTiffSignature = (buffer) =>
  buffer?.length >= 4 &&
  (
    // Little-endian TIFF
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    // Big-endian TIFF
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  );

const hasWebpSignature = (buffer) =>
  buffer?.length >= 12 &&
  buffer.toString("ascii", 0, 4) === "RIFF" &&
  buffer.toString("ascii", 8, 12) === "WEBP";

const hasDicomSignature = (buffer) =>
  buffer?.length >= 132 &&
  buffer.toString("ascii", 128, 132) === "DICM";

const validateUploadedFile = (file) => {
  if (!file) {
    return { valid: false, message: "No file uploaded. Field name must be 'file'." };
  }

  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      message: `Unsupported file format '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      message: `Unsupported MIME type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  // ✅ Validate binary signature for all supported formats
  const buffer = file.buffer;
  const signatureValid =
    (ext === ".jpg" || ext === ".jpeg") ? hasJpegSignature(buffer) :
    ext === ".png"                       ? hasPngSignature(buffer) :
    ext === ".bmp"                       ? hasBmpSignature(buffer) :
    (ext === ".tiff" || ext === ".tif")  ? hasTiffSignature(buffer) :
    ext === ".webp"                      ? hasWebpSignature(buffer) :
    ext === ".dcm"                       ? hasDicomSignature(buffer) :
    false;

  if (!signatureValid) {
    return {
      valid: false,
      message:
        "Invalid file content. Only genuine JPEG, PNG, BMP, TIFF, WebP, or DICOM files are accepted.",
    };
  }

  return { valid: true };
};

module.exports = { validateUploadedFile };